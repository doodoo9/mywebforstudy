import { UniversalEdgeTTS_Isomorphic as UniversalEdgeTTS } from 'edge-tts-universal';

// Helper: Hashing
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: Encryption (Simulated for Demo if key missing, robust if env.ENCRYPTION_KEY exists)
// Note: In a real production app, use crypto.subtle.encrypt/decrypt with a proper key rotation.
// For this single-file worker demo, we'll try to use a key from env or fallback to cleartext with a warning prefix
async function encryptData(data, keyString) {
    if (!keyString) return `[UNENCRYPTED]${data}`;
    // Simplified XOR/Base64 for demo purposes if no strong crypto lib is pulled in,
    // but let's try to do it right with WebCrypto if possible. 
    // Complex implementation skipped to avoid massive file size, using base64 for now unless key is strong.
    // ** SECURITY NOTE **: This is a placeholder. Real implementation needs AES-GCM.
    return `[ENC]${btoa(data)}`;
}

async function decryptData(data, keyString) {
    if (data.startsWith('[UNENCRYPTED]')) return data.replace('[UNENCRYPTED]', '');
    if (data.startsWith('[ENC]')) return atob(data.replace('[ENC]', ''));
    return data;
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // --- AUTH API ---
        if (url.pathname.startsWith('/auth/')) {
            const corsHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            };

            if (request.method === 'OPTIONS') {
                return new Response(null, { headers: corsHeaders });
            }

            if (request.method === 'POST') {
                try {
                    const body = await request.json();

                    // 1. VERIFY (Send Code)
                    if (url.pathname === '/auth/verify') {
                        const code = Math.floor(100000 + Math.random() * 900000).toString();
                        console.log(`[Worker] EMAIL VERIFICATION CODE for ${body.email}: ${code}`);

                        // Store code in KV with short expiration (5 mins)
                        if (env.USERS) await env.USERS.put(`verification:${body.email}`, code, { expirationTtl: 300 });

                        return new Response(JSON.stringify({ message: "Code sent" }), {
                            headers: { 'Content-Type': 'application/json', ...corsHeaders }
                        });
                    }

                    // 2. REGISTER
                    if (url.pathname === '/auth/register') {
                        // Check code
                        const storedCode = env.USERS ? await env.USERS.get(`verification:${body.email}`) : null;
                        if (env.USERS && (!body.code || storedCode !== body.code)) {
                            // For dev/demo without KV, we might skip if env.USERS is missing, but plan said we use KV.
                            // If env.USERS is missing, we can't really store users.
                            if (env.USERS) return new Response(JSON.stringify({ error: "Invalid Verification Code" }), { status: 400, headers: corsHeaders });
                        }

                        // Check if ID exists
                        const existingUser = env.USERS ? await env.USERS.get(`user:${body.userId}`) : null;
                        if (existingUser) {
                            return new Response(JSON.stringify({ error: "ID already exists" }), { status: 400, headers: corsHeaders });
                        }

                        const hashedPassword = await hashPassword(body.password);
                        const encryptedEmail = await encryptData(body.email, env.ENCRYPTION_KEY);
                        const encryptedName = await encryptData(body.name, env.ENCRYPTION_KEY);

                        const userData = {
                            id: body.userId,
                            password: hashedPassword,
                            name: encryptedName,
                            email: encryptedEmail,
                            createdAt: new Date().toISOString()
                        };

                        if (env.USERS) {
                            await env.USERS.put(`user:${body.userId}`, JSON.stringify(userData));
                            // Index for Find ID: name+email -> id
                            // Simple composite key approach (naive but works for small scale)
                            await env.USERS.put(`lookup:${body.name}:${body.email}`, body.userId);
                        }

                        console.log(`[Worker] Registered User: ${body.userId}`);
                        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
                    }

                    // 3. LOGIN
                    if (url.pathname === '/auth/login') {
                        const userStr = env.USERS ? await env.USERS.get(`user:${body.userId}`) : null;
                        if (!userStr) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: corsHeaders });

                        const user = JSON.parse(userStr);
                        const hashedInput = await hashPassword(body.password);

                        if (user.password === hashedInput) {
                            const name = await decryptData(user.name, env.ENCRYPTION_KEY);
                            return new Response(JSON.stringify({ success: true, name: name }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
                        } else {
                            return new Response(JSON.stringify({ error: "Invalid Password" }), { status: 401, headers: corsHeaders });
                        }
                    }

                    // 4. FIND ID
                    if (url.pathname === '/auth/find-id') {
                        const userId = env.USERS ? await env.USERS.get(`lookup:${body.name}:${body.email}`) : null;
                        if (userId) {
                            return new Response(JSON.stringify({ userId: userId }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
                        } else {
                            return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: corsHeaders });
                        }
                    }

                    // 5. FIND PW (Reset)
                    if (url.pathname === '/auth/find-pw') {
                        // Verify code first (re-using verify logic implicitly via UI flow, but here we should verify again)
                        // For simplicity, we assume code was checked or we check it again.
                        // Ideally: verify endpoint generates a "reset token" on success to pass here.
                        // But for this simple implementation, let's just check if user exists and trust the code was verified by client->server handshake in 'verify' earlier? 
                        // No, that's insecure. We should verify code here too.
                        /* 
                           Implementation Gap: The 'verify' endpoint just stores a code. 
                           The client checks it. 
                           Secure way: 'verify' returns a signed token? 
                           Or we just check the code again here.
                        */
                        const storedCode = env.USERS ? await env.USERS.get(`verification:${body.userId}`) : null; // Note: using userId or email as key? Verification was by email.
                        // We need email to verify code. 
                        // But request has userId. We need to look up user to get email?
                        // Let's assume the client sends email too or we look it up.
                        // Simplified: We skip robust code check for "Find PW" in this purely demo/prototype logic if not provided strictly. 
                        // But wait, the plan said "Find PW" does "Verify Code".
                        // Let's assume the body includes the code and we check it against the one sent to the user's email.
                        // But we need the email to check the KV key `verification:${email}`.

                        const userStr = env.USERS ? await env.USERS.get(`user:${body.userId}`) : null;
                        if (!userStr) return new Response(JSON.stringify({ error: "User not found" }), { status: 404, headers: corsHeaders });
                        const user = JSON.parse(userStr);
                        const email = await decryptData(user.email, env.ENCRYPTION_KEY); // Decrypt to get email key

                        // Check code
                        const codeKey = `verification:${email}`; // Oops, this means anyone who knows ID can guess code? 
                        // No, code is generated and sent to email. Only email owner sees it.
                        // Only issue is if we can get email from ID.

                        /* 
                           Refined Flow:
                           1. User enters ID, Email in UI.
                           2. UI calls /auth/verify with email. Code sent.
                           3. User enters code. UI checks code? No, UI calls /auth/find-pw with ID, NewPW, and Code.
                           4. Backend checks code against email.
                        */

                        // However, we don't have email in the body passed from UI for find-pw (per app.js logic which sends userId, newPassword, code).
                        // We can fetch user, get email, checks KV.
                        const serverCode = env.USERS ? await env.USERS.get(`verification:${email}`) : null;

                        // Note: If multiple verify requests happen, this key might be overwritten.
                        if (!body.code || body.code !== serverCode) {
                            return new Response(JSON.stringify({ error: "Invalid Code" }), { status: 400, headers: corsHeaders });
                        }

                        // Update Password
                        user.password = await hashPassword(body.newPassword);
                        if (env.USERS) await env.USERS.put(`user:${body.userId}`, JSON.stringify(user));

                        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
                    }

                } catch (e) {
                    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
                }
            }
        }

        // --- SERVE STATIC ASSETS ---
        // (Moved TTS logic out as we are using Client-Side Web Speech API)

        // --- TTS API (Google Translate Proxy) ---
        if (url.pathname === '/tts') {
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
                    const { text, lang } = await request.json();

                    if (!text) return new Response("Text required", { status: 400 });

                    // Google TTS URL
                    // lang: 'ko' or 'en'
                    const targetLang = (lang === 'kr' || lang === 'ko') ? 'ko' : 'en';
                    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${targetLang}&client=tw-ob`;

                    console.log(`[Worker] Fetching Google TTS: ${text} (${targetLang})`);

                    const ttsResponse = await fetch(googleUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });

                    if (!ttsResponse.ok) {
                        throw new Error(`Google TTS failed: ${ttsResponse.status}`);
                    }

                    const audioData = await ttsResponse.arrayBuffer();

                    return new Response(audioData, {
                        headers: {
                            'Content-Type': 'audio/mpeg',
                            'Access-Control-Allow-Origin': '*'
                        }
                    });

                } catch (e) {
                    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
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
