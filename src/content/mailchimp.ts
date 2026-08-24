/*
 * Where the mailing list lives. Mailchimp retired the post-json JSONP
 * endpoint for this audience (it answers 404), so the only supported route
 * from the browser is a plain form post to the action below.
 */
export const MAILCHIMP_ACTION = 'https://hoohacks.us17.list-manage.com/subscribe/post';
export const MAILCHIMP_AUDIENCE = { u: '8db3fa0f566f9edea113259df', id: 'b74b5fd33d' };
export const MAILCHIMP_SINK = 'mailchimp-sink';
