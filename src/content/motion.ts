/*
 * The site's one deceleration curve. It is the same shape as --ease-glide in
 * globals.css: CSS transitions and JS springs are meant to read as one hand,
 * so change them together.
 */
export const EASE = [0.22, 0.61, 0.36, 1] as const;
