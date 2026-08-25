/* --------------------------------------------------------------------------
 * Hero field simulation.
 *
 * Everything the field does, with nothing about how it is drawn. Two renderers
 * consume this: a shader that reads the row state as a texture, and a canvas
 * 2D fallback that reads it directly. Keeping the simulation in one place is
 * what stops the two paths drifting into two different-feeling fields.
 *
 * All state is per row, and every distance the simulation cares about is in
 * CSS px, converted to rows through the grid pitch the renderer chose. The
 * shader path runs a finer grid than the fallback, and a tear has to look the
 * same physical thickness on both.
 * ------------------------------------------------------------------------ */

/** Share of grid cells that are lit. */
export const DENSITY = 0.1;
/** Ceiling on how far a dragged row may light the cleared centre. */
export const LIFT_CEILING = 0.55;
/** Ceiling on how far any row may slip. Also the encoding range for the GPU. */
export const MAX_SLIP = 32;

/** Thickness of a spontaneous tear, in CSS px. */
const BAND_PX = 15;
/** How far either side of the pointer, in px, the drag reaches. */
const REACH = 76;
/**
 * Pointer speed, in px per ms, that counts as a full strength drag. 0.4 is
 * 400px/sec, an ordinary deliberate mouse movement rather than a flick: the
 * field has to answer the way you actually move, not only when you swipe at
 * it. Below this the response is eased rather than linear, so even a slow
 * pass leaves a visible mark.
 */
const FULL_SPEED = 0.4;
/** Ignore anything slower than this, in px per ms, as hand tremor. */
const MIN_SPEED = 0.012;
/**
 * How long a row is dragged for, in ms, per unit of pointer speed. Speed
 * times this is a distance, so the pull is the same whether the simulation is
 * running at 30 or 60fps.
 */
const PULL_MS = 23;
/** Time constant, in ms, for smoothing pointer speed and engagement. */
const SMOOTH_MS = 45;
const ENGAGE_MS = 190;

/** The rate every decay constant below is quoted at. */
const BASE_MS = 33;

/** Exponential decay, expressed per BASE_MS, applied over `dt`. */
const decay = (perFrame: number, dt: number): number =>
  Math.pow(perFrame, dt / BASE_MS);

/** Approach 1 with a time constant, independent of frame rate. */
const approach = (tau: number, dt: number): number => 1 - Math.exp(-dt / tau);

/**
 * The field is drawn on a fixed grid, so a row is identified by its index and
 * its seed. Re-rolling a row is a matter of handing it a new seed.
 */
export interface FieldState {
  rows: number;
  /** Grid pitch in CSS px, chosen by the renderer. */
  pitch: number;
  /** Horizontal displacement per row, in CSS px, within +/- MAX_SLIP. */
  slip: Float32Array;
  /** Channel separation per row, 0 to 1. */
  split: Float32Array;
  /** How far a row may light through the cleared centre, 0 to 1. */
  lift: Float32Array;
  /** Per row cell seed, 0 to 1. */
  seed: Float32Array;
  /**
   * How far the hero has left the viewport, 0 to 1. The field does not simply
   * get clipped away as you scroll: it loses its hold on the way out.
   */
  exit: number;
}

export function createState(rows: number, pitch: number): FieldState {
  const seed = new Float32Array(rows);
  for (let y = 0; y < rows; y += 1) seed[y] = Math.random();
  return {
    rows,
    pitch,
    slip: new Float32Array(rows),
    split: new Float32Array(rows),
    lift: new Float32Array(rows),
    seed,
    exit: 0,
  };
}

/** Hands every row a new seed, so the whole texture changes at once. */
export function reseed(state: FieldState): void {
  for (let y = 0; y < state.rows; y += 1) state.seed[y] = Math.random();
}

/** Pointer input in client coordinates, resolved against the canvas per frame. */
export interface Pointer {
  clientX: number;
  clientY: number;
  /** Client x at the previous painted frame, so travel is per frame. */
  previousX: number;
  inside: boolean;
  /**
   * Smoothed horizontal speed in px per ms, signed. Smoothed rather than raw
   * so the band does not flicker between frames where the mouse happened to
   * report no movement, and so it carries a little momentum when you stop.
   */
  speed: number;
  /** Smoothed 0 to 1: how much the field is currently being handled. */
  engagement: number;
}

export function createPointer(): Pointer {
  return {
    clientX: 0,
    clientY: 0,
    previousX: 0,
    inside: false,
    speed: 0,
    engagement: 0,
  };
}

/**
 * Rows within reach of the pointer get pulled along with it, by an amount
 * proportional to how fast it is travelling and how close the row is to it.
 * Speed is what disturbs the field, not presence: a cursor resting on it does
 * nothing at all, because something that lights up merely because the mouse is
 * near it is the exact effect this page is avoiding.
 *
 * Every write is a floor rather than an assignment, so a drag never cancels a
 * tear already running on the same row.
 */
function applyDrag(
  state: FieldState,
  pointer: Pointer,
  rect: DOMRect,
  dt: number,
): void {
  const within =
    pointer.inside &&
    pointer.clientX >= rect.left &&
    pointer.clientX <= rect.right &&
    pointer.clientY >= rect.top &&
    pointer.clientY <= rect.bottom;

  pointer.engagement +=
    ((within ? 1 : 0) - pointer.engagement) * approach(ENGAGE_MS, dt);

  const instant = within ? (pointer.clientX - pointer.previousX) / dt : 0;
  pointer.previousX = pointer.clientX;
  pointer.speed += (instant - pointer.speed) * approach(SMOOTH_MS, dt);

  if (!within) return;
  if (Math.abs(pointer.speed) < MIN_SPEED) return;

  /*
   * Eased rather than linear: a slow pass should still leave a mark, while a
   * flick still tops out. Squaring the input would do the opposite, which is
   * how this read as unresponsive to anything short of a swipe.
   */
  const tilt = Math.sqrt(Math.min(1, Math.abs(pointer.speed) / FULL_SPEED));

  const centre = (pointer.clientY - rect.top) / state.pitch;
  const span = REACH / state.pitch;
  const from = Math.max(0, Math.floor(centre - span));
  const to = Math.min(state.rows, Math.ceil(centre + span));

  for (let y = from; y < to; y += 1) {
    // Squared so the band has a strong centre and soft shoulders, which is
    // what makes it read as one displaced strip rather than a smear.
    const near = 1 - Math.min(1, Math.abs(y - centre) / span);
    const pull = Math.max(
      -MAX_SLIP,
      Math.min(MAX_SLIP, pointer.speed * PULL_MS * near * near),
    );
    if (Math.abs(pull) > Math.abs(state.slip[y])) state.slip[y] = pull;
    state.split[y] = Math.max(state.split[y], tilt * near * 0.75);
    state.lift[y] = Math.max(state.lift[y], tilt * near);
  }
}

/**
 * One simulation step over `dt` milliseconds. Decay first, then whatever is
 * being done to the field this frame.
 *
 * Everything here is expressed in real time rather than in frames, so the
 * shader path can run at 60fps for the sake of the drag while the fallback
 * stays at 30fps for the sake of the main thread, and the two still tear at
 * the same rate and settle over the same number of milliseconds.
 *
 * `exit` is how far the hero has scrolled away. The field gets less stable as
 * it leaves rather than simply sliding out of view: more tears, deeper bands,
 * wider channel separation. It is the one place on the page where motion is
 * allowed to build instead of settle, because it is on its way out and the
 * reader is already looking somewhere else.
 */
export function step(
  state: FieldState,
  pointer: Pointer,
  rect: DOMRect,
  dt: number,
): void {
  const { rows, slip, split, lift, seed, pitch } = state;

  const slipDecay = decay(0.74, dt);
  const splitDecay = decay(0.8, dt);
  const liftDecay = decay(0.72, dt);

  for (let y = 0; y < rows; y += 1) {
    slip[y] *= slipDecay;
    split[y] *= splitDecay;
    lift[y] *= liftDecay;
  }

  applyDrag(state, pointer, rect, dt);

  const unrest = state.exit * state.exit;
  const band = Math.max(1, Math.round(BAND_PX / pitch));

  /*
   * Probabilities are quoted per BASE_MS and converted, so a field running at
   * 60fps tears exactly as often per second as one running at 30.
   */
  const per = (chance: number): number =>
    1 - Math.pow(1 - chance, dt / BASE_MS);

  // A band tears every second or so, then settles back. Handling the field
  // makes it less stable, and so does scrolling away from it.
  if (Math.random() < per(0.04 + pointer.engagement * 0.05 + unrest * 0.5)) {
    const start = Math.floor(Math.random() * rows);
    const depth = band + Math.floor(Math.random() * band * (1 + unrest * 4));
    const offset = (Math.random() * 2 - 1) * (18 + unrest * 26);
    const clamped = Math.max(-MAX_SLIP, Math.min(MAX_SLIP, offset));
    for (let y = start; y < Math.min(rows, start + depth); y += 1) {
      slip[y] = clamped;
      split[y] = Math.min(1, 0.6 + Math.random() * 0.4 + unrest * 0.5);
    }
  }

  // Every so often a band re-rolls, so the field is never quite the same
  // texture twice.
  if (Math.random() < per(0.02 + unrest * 0.25)) {
    const start = Math.floor(Math.random() * rows);
    for (let y = start; y < Math.min(rows, start + band); y += 1) {
      seed[y] = Math.random();
    }
  }
}
