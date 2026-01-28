import { UniversalEdgeTTS_Isomorphic as UniversalEdgeTTS } from 'edge-tts-universal';

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // API Endpoint for TTS
        if (url.pathname === '/tts') {
            // CORS Preflight
            if (request.method === 'OPTIONS') {
                return new Response(null, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    }
                });
            }

            if (request.method === 'POST') {
                try {
                    const { text, voice } = await request.json();

                    if (!text) {
                        return new Response(JSON.stringify({ error: 'Text is required' }), {
                            status: 400,
                            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                        });
                    }

                    console.log(`[Worker] Generating TTS: ${text.substring(0, 30)}...`);
                    const tts = new UniversalEdgeTTS(text, voice || 'ko-KR-SunHiNeural');
                    const result = await tts.synthesize();

                    if (!result || !result.audio) {
                        throw new Error("Failed to generate audio data");
                    }

                    const audioData = await result.audio.arrayBuffer();

                    return new Response(audioData, {
                        headers: {
                            'Content-Type': 'audio/mpeg',
                            'Access-Control-Allow-Origin': '*',
                            'Cache-Control': 'public, max-age=3600'
                        }
                    });
                } catch (error) {
                    console.error('[Worker] TTS Error:', error.message);
                    return new Response(JSON.stringify({
                        error: error.message,
                        details: "Edge TTS generation failed in Worker environment"
                    }), {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                }
            }
        }

        // Serve Static Assets
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }

        return new Response('Not Found', { status: 404 });
    }
};
