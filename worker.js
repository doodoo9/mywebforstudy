import { UniversalEdgeTTS } from 'edge-tts-universal';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // API Endpoint for TTS
        if (url.pathname === '/tts' && request.method === 'POST') {
            try {
                const { text, voice } = await request.json();

                if (!text) {
                    return new Response('Text is required', { status: 400 });
                }

                console.log(`[Worker] TTS request for: ${text.substring(0, 50)}...`);
                const tts = new UniversalEdgeTTS(text, voice || 'en-US-AriaNeural');
                const result = await tts.synthesize();

                return new Response(result.audio, {
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } catch (error) {
                console.error('[Worker] TTS Error:', error);
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Serve Static Assets
        // When using 'assets' in wrangler.jsonc, 'env.ASSETS' allows manual fetching
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }

        return new Response('Not Found', { status: 404 });
    }
};
