const SERVER_URL = "/tts";

class CustomEdgeTTS {
    constructor(text, voice) {
        this.text = text;
        this.voice = voice;
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
                    voice: this.voice
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const audioBlob = await response.blob();
            return { audio: audioBlob };

        } catch (err) {
            console.error("Python TTS Server Error:", err);
            throw err;
        }
    }
}

// Std Script format (No Modules)
class AudioManager {
    constructor() {
        console.log("AudioManager: Initializing...");
        this.ctx = null;
        this.masterGain = null;
        this.engineGain = null;
        this.voice = window.speechSynthesis;
        this.noiseNode = null;
        this.lang = 'kr';
        this.selectedVoiceKr = 'ko-KR-SunHiNeural';
        this.selectedVoiceEn = 'en-US-AriaNeural';
        this.isVoiceLoaded = false;
        this.currentAudio = null; // Track current Audio element
        this.currentUtterance = null; // Track current speech synthesis

        // Using CustomEdgeTTS for better reliability
        this.edgeTtsSupported = true;
        console.log("AudioManager: CustomEdgeTTS ready");

        // Try to pre-load voices
        if (this.voice) {
            this.voice.onvoiceschanged = () => {
                const voices = this.voice.getVoices();
                if (voices.length > 0) {
                    this.isVoiceLoaded = true;
                    console.log(`[AudioManager] ${voices.length} voices loaded.`);
                }
            };
            // Trigger initial load check
            this.voice.getVoices();
        }
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

    async speak(text, lang, callback) {
        // Safe callback wrapper to ensure it runs exactly once
        let callbackCalled = false;
        const safeCallback = () => {
            if (!callbackCalled && callback) {
                callbackCalled = true;
                callback();
            }
        };

        // Safety timeout: if audio hangs for 30s, force callback to proceed
        setTimeout(safeCallback, 30000);

        // HYPER-STRICT: Ensure text is a primitive string
        let speakText = String(text || "").trim();
        if (speakText.length === 0) {
            safeCallback();
            return;
        }

        console.log(`[AudioManager] Speaking (${lang}): "${speakText}"`);

        // Use CustomEdgeTTS for reliability
        if (this.edgeTtsSupported) {
            try {
                const voice = lang === 'kr' ? this.selectedVoiceKr : this.selectedVoiceEn;
                const tts = new CustomEdgeTTS(speakText, voice);

                const synthesisPromise = tts.synthesize();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("EdgeTTS Timeout")), 20000)
                );

                const result = await Promise.race([synthesisPromise, timeoutPromise]);
                const audioBlob = result?.audio;

                if (audioBlob) {
                    const url = URL.createObjectURL(audioBlob);
                    const audio = new Audio(url);
                    this.currentAudio = audio;

                    return new Promise((resolve) => {
                        audio.onended = () => {
                            URL.revokeObjectURL(url);
                            this.currentAudio = null;
                            safeCallback();
                            resolve();
                        };
                        audio.onerror = () => {
                            URL.revokeObjectURL(url);
                            this.currentAudio = null;
                            this.speakFallback(speakText, lang, safeCallback);
                            resolve();
                        };
                        audio.play().catch(e => {
                            console.error("[AudioManager] Audio play failed:", e);
                            this.currentAudio = null;
                            this.speakFallback(speakText, lang, safeCallback);
                            resolve();
                        });
                    });
                }
            } catch (e) {
                console.warn("[AudioManager] CustomEdgeTTS failed or timed out, using fallback.", e);
            }
        }

        this.speakFallback(speakText, lang, safeCallback);
    }

    speakFallback(text, lang, callback) {
        if (!this.voice) {
            if (callback) callback();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;

        const setVoiceAndSpeak = () => {
            const voices = this.voice.getVoices();
            let voiceMatch = null;

            if (lang === 'kr') {
                utterance.lang = 'ko-KR';
                // Try to find a voice that matches our selected preference first
                voiceMatch = voices.find(v => v.name.includes(this.selectedVoiceKr.split('-').pop())) ||
                    voices.find(v => v.lang.includes('ko') && (v.name.includes('Neural') || v.name.includes('Google'))) ||
                    voices.find(v => v.lang.includes('ko'));
            } else {
                utterance.lang = 'en-US';
                voiceMatch = voices.find(v => v.name.includes(this.selectedVoiceEn.split('-').pop())) ||
                    voices.find(v => v.lang.includes('en') && (v.name.includes('Neural') || v.name.includes('Google'))) ||
                    voices.find(v => v.lang.includes('en'));
            }

            if (voiceMatch) utterance.voice = voiceMatch;

            this.currentUtterance = utterance;
            utterance.onend = () => {
                this.currentUtterance = null;
                if (callback) callback();
            };
            utterance.onerror = () => {
                this.currentUtterance = null;
                if (callback) callback();
            };

            this.voice.cancel();
            this.voice.speak(utterance);
        };

        if (this.voice.getVoices().length === 0) {
            this.voice.onvoiceschanged = () => {
                setVoiceAndSpeak();
                this.voice.onvoiceschanged = null;
            };
        } else {
            setVoiceAndSpeak();
        }
    }

    announceTakeoff(airport, onTextDisplay, onComplete) {
        const scripts = this.getTakeoffScripts(airport);

        this.playChime(() => {
            if (this.lang === 'kr') {
                if (onTextDisplay) onTextDisplay(scripts.kr);
                this.speak(scripts.kr, 'kr', () => {
                    setTimeout(() => {
                        if (onTextDisplay) onTextDisplay(scripts.en);
                        this.speak(scripts.en, 'en', onComplete);
                    }, 500);
                });
            } else {
                if (onTextDisplay) onTextDisplay(scripts.en);
                this.speak(scripts.en, 'en', onComplete);
            }
        });
    }

    announceLandingWithDest(airport, onTextDisplay, onComplete) {
        const scripts = this.getLandingScripts(airport);

        this.playChime(() => {
            if (this.lang === 'kr') {
                if (onTextDisplay) onTextDisplay(scripts.kr);
                this.speak(scripts.kr, 'kr', () => {
                    setTimeout(() => {
                        if (onTextDisplay) onTextDisplay(scripts.en);
                        this.speak(scripts.en, 'en', onComplete);
                    }, 500);
                });
            } else {
                if (onTextDisplay) onTextDisplay(scripts.en);
                this.speak(scripts.en, 'en', onComplete);
            }
        });
    }

    stopSpeech() {
        console.log("[AudioManager] Stopping speech...");
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            if (this.currentAudio.onended) this.currentAudio.onended();
            this.currentAudio = null;
        }
        if (this.voice && this.voice.speaking) {
            this.voice.cancel();
            if (this.currentUtterance && this.currentUtterance.onend) {
                this.currentUtterance.onend();
            }
            this.currentUtterance = null;
        }
    }
}

// Explicit Global Export & Named Export for ESM
export { AudioManager };
window.AudioManager = AudioManager;
