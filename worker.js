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
                    console.error('[Worker] Edge TTS Error:', error.message);

                    // --- Secondary Fallback: Google Translate TTS ---
                    // This is much more reliable in Cloudflare environments although slightly lower quality
                    try {
                        console.log(`[Worker] Attempting Google TTS fallback...`);
                        const lang = (voice && voice.startsWith('ko')) ? 'ko' : 'en';
                        const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

                        const googleResponse = await fetch(googleTtsUrl, {
                            headers: {
                                'Referer': 'http://translate.google.com/',
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                            }
                        });

                        if (googleResponse.ok) {
                            const audioData = await googleResponse.arrayBuffer();
                            return new Response(audioData, {
                                headers: {
                                    'Content-Type': 'audio/mpeg',
                                    'Access-Control-Allow-Origin': '*',
                                    'X-TTS-Provider': 'Google'
                                }
                            });
                        }
                    } catch (fallbackError) {
                        console.error('[Worker] Google TTS Fallback failed:', fallbackError.message);
                    }

                    return new Response(JSON.stringify({
                        error: error.message,
                        details: "Edge TTS failed and Google fallback also failed."
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
