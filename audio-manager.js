const SERVER_URL = "/tts";

class CustomGoogleTTS {
    constructor(text, lang) {
        this.text = text;
        this.lang = lang;
    }

    async synthesize() {
        try {
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: this.text,
                    lang: this.lang
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const audioBlob = await response.blob();
            return { audio: audioBlob };

        } catch (err) {
            console.error("TTS Server Error:", err);
            throw err;
        }
    }
}

class AudioManager {
    constructor() {
        console.log("AudioManager: Initializing...");
        this.ctx = null;
        this.masterGain = null;
        this.engineGain = null;
        this.noiseNode = null;
        this.lang = 'kr';
        this.currentAudio = null; // Track current Audio element
    }

    setLanguage(lang) {
        this.lang = lang;
    }

    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!this.ctx) {
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);

            this.engineGain = this.ctx.createGain();
            this.engineGain.gain.value = 0;
            this.engineGain.connect(this.masterGain);
            console.log("AudioManager: AudioContext started");
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    startEngineSound() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (this.noiseNode) return;

        try {
            const bufferSize = 2 * this.ctx.sampleRate;
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (white * 0.5) * 0.11; // Simple noise
            }

            this.noiseNode = this.ctx.createBufferSource();
            this.noiseNode.buffer = noiseBuffer;
            this.noiseNode.loop = true;

            const lpFilter = this.ctx.createBiquadFilter();
            lpFilter.type = 'lowpass';
            lpFilter.frequency.setValueAtTime(400, this.ctx.currentTime);

            this.noiseNode.connect(lpFilter);
            lpFilter.connect(this.engineGain);

            this.noiseNode.start();
            this.engineGain.gain.setTargetAtTime(2.4, this.ctx.currentTime, 2);
        } catch (e) {
            console.error("Engine sound error:", e);
        }
    }

    stopEngineSound() {
        if (this.engineGain && this.ctx) {
            this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 1);
            setTimeout(() => {
                if (this.noiseNode) {
                    try { this.noiseNode.stop(); } catch (e) { }
                    this.noiseNode = null;
                }
            }, 1500);
        }
    }

    playChime(callback) {
        if (!this.ctx) this.init();

        // Ensure context is running (sometimes browsers suspend it)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
                this._playChimeInternal(callback);
            });
        } else {
            this._playChimeInternal(callback);
        }
    }

    _playChimeInternal(callback) {
        try {
            console.log("Playing Chime (Ding-Dong)...");
            const now = this.ctx.currentTime;

            const playNote = (freq, startTime, duration) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

                osc.connect(gain);
                gain.connect(this.masterGain);

                osc.start(startTime);
                osc.stop(startTime + duration);
            };

            // "Ding" - High note (C5 around 523Hz)
            playNote(523.25, now, 1.2);

            // "Dong" - Low note (G4 around 392Hz) after 0.5s
            playNote(392.00, now + 0.5, 1.5);

            setTimeout(() => {
                if (callback) callback();
            }, 1800); // Wait for the whole sequence to finish
        } catch (e) {
            console.error("Chime error:", e);
            if (callback) callback();
        }
    }

    // --- Script Generation Helpers ---
    getTakeoffScripts(airport) {
        const nameKr = airport?.fullNameKr || airport?.name || "목적지";
        const nameEn = airport?.fullNameEn || airport?.name || "destination";
        return {
            kr: `손님 여러분, 우리 비행기는 ${nameKr}행 입니다. 이륙하겠습니다. 안전 벨트를 확인해 주세요.`,
            en: `Ladies and gentlemen, we are now taking off for ${nameEn}. Please fasten your seatbelt.`
        };
    }

    getLandingScripts(airport) {
        const nameKr = airport?.fullNameKr || airport?.name || "목적지";
        const nameEn = airport?.fullNameEn || airport?.name || "destination";
        return {
            kr: `${nameKr}에 도착했습니다. 편안한 여행 되셨기를 바랍니다. 감사합니다.`,
            en: `We have arrived at ${nameEn}. Thank you for flying with us.`
        };
    }

    announceTakeoff(airport, onTextDisplay, onComplete) {
        const scripts = this.getTakeoffScripts(airport);

        this.playChime(() => {
            // Screen Text: Follows app language setting
            const displayText = (this.lang === 'kr') ? scripts.kr : scripts.en;
            if (onTextDisplay) onTextDisplay(displayText);

            // Audio: ALWAYS English (Simulation Standard)
            this.speak(scripts.en, 'en', onComplete);
        });
    }

    announceLandingWithDest(airport, onTextDisplay, onComplete) {
        const scripts = this.getLandingScripts(airport);

        this.playChime(() => {
            const displayText = (this.lang === 'kr') ? scripts.kr : scripts.en;
            if (onTextDisplay) onTextDisplay(displayText);
            this.speak(scripts.en, 'en', onComplete);
        });
    }

    async speak(text, lang, callback) {
        // Safe callback wrapper
        let callbackCalled = false;
        const safeCallback = () => {
            if (this.currentCallback === safeCallback) {
                this.currentCallback = null;
            }
            if (!callbackCalled && callback) {
                callbackCalled = true;
                callback();
            }
        };

        this.currentCallback = safeCallback;

        let speakText = String(text || "").trim();
        if (speakText.length === 0) {
            safeCallback();
            return;
        }

        console.log(`[AudioManager] Speaking (${lang}): "${speakText}"`);

        // Stop previous audio
        this.stopSpeech();

        // Use CustomGoogleTTS via Worker Proxy
        try {
            const tts = new CustomGoogleTTS(speakText, lang);
            const result = await tts.synthesize();

            if (result.audio) {
                const blobUrl = URL.createObjectURL(result.audio);
                const audio = new Audio(blobUrl);
                this.currentAudio = audio;

                audio.onended = () => {
                    URL.revokeObjectURL(blobUrl);
                    this.currentAudio = null;
                    safeCallback();
                };

                audio.onerror = (e) => {
                    console.error("Audio Playback Error:", e);
                    safeCallback();
                };

                audio.play().catch(e => {
                    console.warn("Autoplay blocked or failed:", e);
                    safeCallback();
                });
            } else {
                throw new Error("No audio returned");
            }
        } catch (e) {
            console.error("TTS Failed:", e);
            // Fallback? User said NO native. So we just stay silent or maybe minimal alert?
            // "기본 tts는 쓰면 안돼고" -> Do not use basic TTS.
            // We just fail gracefully.
            safeCallback();
        }
    }

    stopSpeech() {
        console.log("[AudioManager] Stopping speech...");
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }

        // Trigger callback to ensure flow continues (e.g. Flight starts on Skip)
        if (this.currentCallback) {
            const cb = this.currentCallback;
            this.currentCallback = null;
            cb();
        }
    }
}

export { AudioManager };
window.AudioManager = AudioManager;
