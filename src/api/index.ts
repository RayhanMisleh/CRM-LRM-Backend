import serverless from 'serverless-http';

import app from '../app';

// base serverless handler
const baseHandler = serverless(app);

// wrapped handler to add lightweight per-invocation logging for diagnostics
// (logs will appear in Vercel invocation logs). Keep the wrapper thin so it
// doesn't add noticeable overhead.
const handler = (event: unknown, context: unknown) => {
	try {
		// Best-effort metadata extraction for logs
		// event may differ depending on platform; avoid strict typings
		const now = new Date().toISOString();
		// @ts-ignore
		const path = (event && (event.path || event.rawUrl || event.url)) ?? null;
		// eslint-disable-next-line no-console
		console.log('[vercel-handler] invoked', { now, path });
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('[vercel-handler] log error', err);
	}

	// forward to the serverless-http handler
	// preserve returned promise / callback behavior
	// @ts-ignore
	return baseHandler(event, context);
};

export { handler };
export default handler;
