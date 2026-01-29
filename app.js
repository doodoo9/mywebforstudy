import { AudioManager } from './audio-manager.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { create3DPlane, createFlatMapPlane, loadPlaneModel } from './visual-assets.js';

// ... (existing imports and constants)

const AIRPORTS = [
    { name: "Seoul (ICN)", lat: 37.4602, lng: 126.4407, code: "ICN", fullNameKr: "인천국제공항", fullNameEn: "Incheon International Airport" },
    { name: "New York (JFK)", lat: 40.6413, lng: -73.7781, code: "JFK", fullNameKr: "존 에프 케네디 국제공항", fullNameEn: "John F. Kennedy International Airport" },
    { name: "London (LHR)", lat: 51.4700, lng: -0.4543, code: "LHR", fullNameKr: "히드로 공항", fullNameEn: "Heathrow Airport" },
    { name: "Paris (CDG)", lat: 49.0097, lng: 2.5479, code: "CDG", fullNameKr: "샤를 드 골 공항", fullNameEn: "Charles de Gaulle Airport" },
    { name: "Tokyo (NRT)", lat: 35.7767, lng: 140.3864, code: "NRT", fullNameKr: "나리타 국제공항", fullNameEn: "Narita International Airport" },
    { name: "Dubai (DXB)", lat: 25.2532, lng: 55.3657, code: "DXB", fullNameKr: "두바이 국제공항", fullNameEn: "Dubai International Airport" },
    { name: "Sydney (SYD)", lat: -33.9399, lng: 151.1753, code: "SYD", fullNameKr: "시드니 공항", fullNameEn: "Sydney Airport" },
    { name: "San Francisco (SFO)", lat: 37.6213, lng: -122.3790, code: "SFO", fullNameKr: "샌프란시스코 국제공항", fullNameEn: "San Francisco International Airport" },
    { name: "Los Angeles (LAX)", lat: 33.9416, lng: -118.4085, code: "LAX", fullNameKr: "로스앤젤레스 국제공항", fullNameEn: "Los Angeles International Airport" },
    { name: "Hong Kong (HKG)", lat: 22.3080, lng: 113.9185, code: "HKG", fullNameKr: "홍콩 국제공항", fullNameEn: "Hong Kong International Airport" },
    { name: "Singapore (SIN)", lat: 1.3644, lng: 103.9915, code: "SIN", fullNameKr: "싱가포르 창이 공항", fullNameEn: "Singapore Changi Airport" },
    { name: "Bangkok (BKK)", lat: 13.6900, lng: 100.7501, code: "BKK", fullNameKr: "수완나품 공항", fullNameEn: "Suvarnabhumi Airport" },
    { name: "Frankfurt (FRA)", lat: 50.0379, lng: 8.5622, code: "FRA", fullNameKr: "프랑크푸르트 공항", fullNameEn: "Frankfurt Airport" },
    { name: "Amsterdam (AMS)", lat: 52.3105, lng: 4.7683, code: "AMS", fullNameKr: "암스테르담 스키폴 공항", fullNameEn: "Amsterdam Airport Schiphol" },
    { name: "Toronto (YYZ)", lat: 43.6777, lng: -79.6248, code: "YYZ", fullNameKr: "토론토 피어슨 국제공항", fullNameEn: "Toronto Pearson International Airport" },
    { name: "Vancouver (YVR)", lat: 49.1967, lng: -123.1761, code: "YVR", fullNameKr: "밴쿠버 국제공항", fullNameEn: "Vancouver International Airport" }
];

document.addEventListener('DOMContentLoaded', () => {
    console.log("App Started: DOMContentLoaded");

    // --- UI Elements ---
    const ui = {
        modal: document.getElementById('start-modal'),
        initBtn: document.getElementById('btn-init-app'),
        takeoffBtn: document.getElementById('btn-takeoff'),
        abortBtn: document.getElementById('btn-abort'),
        timerDisplay: document.getElementById('flight-timer'),
        message: document.getElementById('flight-message'),
        panelSetup: document.getElementById('panel-setup'),
        panelFlight: document.getElementById('panel-flight'),
        originCode: document.getElementById('origin-code'),
        destCode: document.getElementById('dest-code'),
        langToggle: document.getElementById('lang-toggle'),
        realFlightInfo: document.getElementById('real-flight-info'),
        realTimeDisplay: document.getElementById('real-time-display'),
        langSelectBtns: document.querySelectorAll('.lang-select-btn'),
        enterAppArea: document.getElementById('enter-app-area'),
        modalTitle: document.getElementById('modal-title'),
        modalDesc: document.getElementById('modal-desc'),

        viewToggle: document.getElementById('view-toggle'),
        viewToggleSetup: document.getElementById('view-toggle-setup'),
        viewToggleFlight: document.getElementById('view-toggle-flight'),
        btnFollowSetup: document.getElementById('btn-follow-setup'),
        btnFollowFlight: document.getElementById('btn-follow-flight'),
        themeToggle: document.getElementById('theme-toggle'),
        btnFocus: document.getElementById('btn-focus'),
        integratedControls: document.getElementById('integrated-controls'),
        mapView: document.getElementById('map-view'),
        cesiumContainer: document.getElementById('cesiumContainer'),
        loadingScreen: document.getElementById('loading-screen'),
        loadingBar: document.getElementById('loading-bar'),
        loadingText: document.getElementById('loading-text'),
        languageSelection: document.getElementById('lang-selection'), // Added for explicit reference

        // Menu & Modals
        menuBtn: document.getElementById('menu-btn'),
        menuDrawer: document.getElementById('menu-drawer'),
        menuOverlay: document.getElementById('menu-overlay'),
        menuCloseBtn: document.getElementById('menu-close-btn'),
        menuAbout: document.getElementById('menu-about'),
        menuChanges: document.getElementById('menu-changes'),
        drawerLangToggle: document.getElementById('drawer-lang-toggle'),
        modalAbout: document.getElementById('modal-about'),
        modalChanges: document.getElementById('modal-changes'),
        changelogContent: document.getElementById('changelog-content'),
        aboutContent: document.getElementById('about-content'),
        toastContainer: document.getElementById('toast-container'),
        menuChanges: document.getElementById('menu-changes'),
        menuNotices: document.getElementById('menu-notices'),
        menuLogin: document.getElementById('menu-login'),
        drawerLangToggle: document.getElementById('drawer-lang-toggle'),
        modalAbout: document.getElementById('modal-about'),
        modalChanges: document.getElementById('modal-changes'),
        modalNotices: document.getElementById('modal-notices'),
        modalAuthLogin: document.getElementById('modal-auth-login'),
        modalAuthRegister: document.getElementById('modal-auth-register'),
        modalAuthFindId: document.getElementById('modal-auth-find-id'),
        modalAuthFindPw: document.getElementById('modal-auth-find-pw'),
        changelogContent: document.getElementById('changelog-content'),
        aboutContent: document.getElementById('about-content'),
        noticeContent: document.getElementById('notice-content'),
        toastContainer: document.getElementById('toast-container'),
        timerDisplay: document.querySelector('.timer-display')
    };


    // --- State & Constants ---
    let selectedOrigin = null;
    let selectedDest = null;
    let isFlying = false;
    let flightTimer = null;
    let secondsRemaining = 0;
    let flightDurationSeconds = 0;
    let currentLang = 'kr';
    let viewMode = 'globe'; // 'globe' or 'map'
    let map = null;
    let mapLayers = {};
    let currentMapTheme = 'satellite';
    let mapPathLine = null;
    let leafletMarkers = []; // Store Leaflet markers for sync
    let earthTextures = {}; // To store loaded textures
    let glbPlaneModel = null; // Store loaded GLB model template
    let isFollowingPlane = false;
    const FLIGHT_SPEED_KPH = 1500;

    // --- Translations ---
    const translations = {
        kr: {
            status_ready: "비행 준비 완료",
            setup_title: "나만의 비행 계획",
            setup_desc: "지구본에서 <strong>출발지</strong>와 <strong>도착지</strong>를 선택하세요.",
            label_from: "출발",
            label_to: "도착",
            btn_takeoff: "비행 시작",
            msg_cruising: "순항 고도 진입 중",
            msg_takingoff: "이륙 중...",
            btn_abort: "비행 중단",
            msg_arriving: "착륙 준비 중...",
            alert_divert: "비행을 중단하고 회항하시겠습니까?",
            alert_complete: "비행이 종료되었습니다! 목적지: ",
            status_flying: "비행 중 ✈",
            modal_title: "비행 시작",
            modal_desc: "최상의 경험을 위해 오디오를 허용해주세요.",
            btn_enter: "비행기 탑승",
            label_est_time: "예상 비행 시간",
            menu_about: "소개",
            menu_changes: "변경 기록",
            menu_notices: "공지사항",
            menu_login: "로그인/회원가입",
            about_desc: "skyfocus.cloud는 공부하는 동안 여행하는 기분을 느낄 수 있는 시뮬레이션 서비스입니다.",
            menu_notices: "공지사항",
            menu_login: "로그인/회원가입",
            about_desc: "skyfocus.cloud는 공부하는 동안 여행하는 기분을 느낄 수 있는 시뮬레이션 서비스입니다.",
            msg_following: "비행기를 따라갑니다",
            msg_follow_stop: "추적을 중지합니다",
            auth_login_title: "로그인",
            auth_id: "아이디",
            auth_pw: "비밀번호",
            auth_name: "이름",
            auth_email: "이메일",
            auth_btn_login: "로그인",
            auth_link_signup: "회원가입",
            auth_link_find_id: "아이디 찾기",
            auth_link_find_pw: "비밀번호 찾기",
            auth_reg_title: "회원가입",
            auth_btn_verify: "인증코드 발송",
            auth_btn_check: "확인",
            auth_code: "인증코드",
            auth_pw_confirm: "비밀번호 확인",
            auth_btn_create: "계정 생성",
            auth_find_id_title: "아이디 찾기",
            auth_find_pw_title: "비밀번호 재설정",
            auth_btn_reset_request: "재설정 코드 발송",
            auth_new_pw: "새 비밀번호",
            auth_btn_change_pw: "비밀번호 변경",
            ph_id: "아이디를 입력하세요",
            ph_pw: "비밀번호를 입력하세요",
            ph_name: "이름을 입력하세요",
            ph_email: "이메일을 입력하세요",
            ph_code: "인증코드 입력"
        },
        en: {
            status_ready: "Ready for Takeoff",
            setup_title: "Plan Your Flight",
            setup_desc: "Select your <strong>Departure</strong> and <strong>Destination</strong> airports on the globe.",
            label_from: "FROM",
            label_to: "TO",
            btn_takeoff: "Start Flight",
            msg_cruising: "Cruising Altitude",
            msg_takingoff: "Taking Off...",
            btn_abort: "Abort Flight",
            msg_arriving: "Arriving...",
            alert_divert: "Are you sure you want to divert the flight?",
            alert_complete: "Flight Complete! Welcome to ",
            status_flying: "En Route ✈",
            modal_title: "Welcome Aboard",
            modal_desc: "For the best experience, please enable audio.",
            btn_enter: "Enter Cockpit",
            label_est_time: "Estimated Flight Time",
            menu_about: "About",
            menu_changes: "Changes",
            menu_notices: "Notices",
            menu_login: "Login / Sign Up",
            about_desc: "skyfocus.cloud is a simulation service that lets you feel like you're traveling while studying.",
            msg_following: "Following the plane",
            msg_follow_stop: "Tracking disabled",
            auth_login_title: "Login",
            auth_id: "ID",
            auth_pw: "Password",
            auth_name: "Name",
            auth_email: "Email",
            auth_btn_login: "Login",
            auth_link_signup: "Sign Up",
            auth_link_find_id: "Forgot ID?",
            auth_link_find_pw: "Forgot Password?",
            auth_reg_title: "Sign Up",
            auth_btn_verify: "Verify Email",
            auth_btn_check: "Check",
            auth_code: "Verification Code",
            auth_pw_confirm: "Confirm Password",
            auth_btn_create: "Create Account",
            auth_find_id_title: "Find ID",
            auth_find_pw_title: "Reset Password",
            auth_btn_reset_request: "Send Reset Code",
            auth_new_pw: "New Password",
            auth_btn_change_pw: "Change Password",
            ph_id: "Enter ID",
            ph_pw: "Enter Password",
            ph_name: "Enter Name",
            ph_email: "Enter Email",
            ph_code: "Enter Code"
        }
    };

    // --- Audio Manager ---
    let audio = null;
    try {
        if (typeof AudioManager !== 'undefined') {
            audio = new AudioManager();
            console.log("Audio Manager Instantiated");
        } else {
            console.warn("AudioManager class not found.");
        }
    } catch (e) { console.error("Audio Manager Error", e); }

    // TTS Skip Controls
    if (audio) {
        if (ui.realFlightInfo) {
            ui.realFlightInfo.style.cursor = 'pointer';
            ui.realFlightInfo.title = "클릭하여 음성 안내 건너뛰기";
            ui.realFlightInfo.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
                audio.stopSpeech();
            });
        }
        if (ui.timerDisplay) {
            ui.timerDisplay.style.cursor = 'pointer';
            ui.timerDisplay.title = "클릭하여 음성 안내 건너뛰기";
            ui.timerDisplay.addEventListener('click', () => audio.stopSpeech());
        }
    }

    // --- Voice Logic ---


    // --- Initialization & Listeners ---
    // Initial language UI update is now handled after loading
    // updateLanguageUI(); // Moved to finishLoading

    function setupEventListeners() {
        if (ui.initBtn) {
            ui.initBtn.addEventListener('click', () => {
                if (audio) audio.init();
                // Attempt generic visual transition
                if (ui.modal) {
                    ui.modal.style.opacity = '0';
                    setTimeout(() => {
                        ui.modal.style.display = 'none';
                    }, 500);
                }
            });
        }

        if (ui.takeoffBtn) ui.takeoffBtn.addEventListener('click', startFlight);
        if (ui.abortBtn) ui.abortBtn.addEventListener('click', abortFlight);

        if (ui.langSelectBtns) {
            ui.langSelectBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const lang = btn.dataset.lang;
                    currentLang = lang;
                    updateLanguageUI();

                    // Visual Toggle
                    const langSelection = document.getElementById('lang-selection');
                    if (langSelection) langSelection.style.display = 'none';

                    if (ui.enterAppArea) {
                        ui.enterAppArea.style.display = 'block';
                        ui.enterAppArea.classList.remove('hidden');
                    }
                });
            });
        }

        // --- Menu & Drawer Logic ---
        if (ui.menuBtn) ui.menuBtn.addEventListener('click', () => toggleMenu(true));
        if (ui.menuCloseBtn) ui.menuCloseBtn.addEventListener('click', () => toggleMenu(false));
        if (ui.menuOverlay) ui.menuOverlay.addEventListener('click', () => toggleMenu(false));

        // Menu Items
        if (ui.menuAbout) {
            ui.menuAbout.addEventListener('click', () => {
                const aboutFile = currentLang === 'kr' ? 'about_kr.txt' : 'about_en.txt';
                fetch(aboutFile)
                    .then(response => response.text())
                    .then(text => {
                        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
                        ui.aboutContent.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
                    })
                    .catch(err => {
                        ui.aboutContent.innerText = "Failed to load about info.";
                        console.error(err);
                    });

                ui.modalAbout.classList.remove('hidden');
                toggleMenu(false);
            });
        }

        if (ui.menuChanges) {
            ui.menuChanges.addEventListener('click', () => {
                // Fetch Changelog
                fetch('changelog.txt')
                    .then(response => response.text())
                    .then(text => {
                        ui.changelogContent.innerHTML = textParser(text);
                    })
                    .catch(err => {
                        ui.changelogContent.innerText = "Failed to load changelog.";
                        console.error(err);
                    });

                ui.modalChanges.classList.remove('hidden');
                toggleMenu(false);
            });
        }

        if (ui.menuNotices) {
            ui.menuNotices.addEventListener('click', () => {
                fetch('notices.txt')
                    .then(res => res.text())
                    .then(text => {
                        ui.noticeContent.innerHTML = parseNotices(text);
                        // Accordion Logic
                        document.querySelectorAll('.notice-title').forEach(title => {
                            title.addEventListener('click', () => {
                                title.parentElement.classList.toggle('active');
                            });
                        });
                    })
                    .catch(err => {
                        ui.noticeContent.innerText = "Failed to load notices.";
                    });

                ui.modalNotices.classList.remove('hidden');
                toggleMenu(false);
            });
        }

        // --- AUTH MENU LISTENER ---
        if (ui.menuLogin) {
            ui.menuLogin.addEventListener('click', () => {
                ui.modalAuthLogin.classList.remove('hidden');
                toggleMenu(false);
            });
        }

        // --- AUTH MODAL NAVIGATION ---
        const openAuthModal = (modalId) => {
            // Close all auth modals first
            [ui.modalAuthLogin, ui.modalAuthRegister, ui.modalAuthFindId, ui.modalAuthFindPw].forEach(m => {
                if (m) m.classList.add('hidden');
            });
            const target = document.getElementById(modalId);
            if (target) target.classList.remove('hidden');
        };

        if (document.getElementById('link-to-register')) {
            document.getElementById('link-to-register').addEventListener('click', () => openAuthModal('modal-auth-register'));
        }
        if (document.getElementById('link-find-id')) {
            document.getElementById('link-find-id').addEventListener('click', () => openAuthModal('modal-auth-find-id'));
        }
        if (document.getElementById('link-find-pw')) {
            document.getElementById('link-find-pw').addEventListener('click', () => openAuthModal('modal-auth-find-pw'));
        }

        // --- AUTH SUBMISSION --
        setupAuthListeners();

        // Modal Closing
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal-overlay').classList.add('hidden');
            });
        });

        // Drawer Lang Toggle
        if (ui.drawerLangToggle) {
            ui.drawerLangToggle.querySelectorAll('.lang-opt').forEach(opt => {
                opt.addEventListener('click', () => {
                    const lang = opt.dataset.lang;
                    currentLang = lang;
                    updateLanguageUI();

                    // Update active state visuals
                    ui.drawerLangToggle.querySelectorAll('.lang-opt').forEach(o => o.classList.remove('active'));
                    opt.classList.add('active');
                });
            });
        }


        if (ui.viewToggle) ui.viewToggle.addEventListener('click', toggleViewMode);
        if (ui.viewToggleSetup) ui.viewToggleSetup.addEventListener('click', toggleViewMode);
        if (ui.viewToggleFlight) ui.viewToggleFlight.addEventListener('click', toggleViewMode);

        if (ui.btnFollowSetup) ui.btnFollowSetup.addEventListener('click', toggleFollowPlane);
        if (ui.btnFollowFlight) ui.btnFollowFlight.addEventListener('click', toggleFollowPlane);

        // --- Global Key & Click Listeners ---
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (audio) audio.stopSpeech();
            }
        });

        if (ui.message) {
            ui.message.style.cursor = 'pointer';
            ui.message.addEventListener('click', () => {
                if (audio) audio.stopSpeech();
            });
        }

        if (ui.themeToggle) {
            ui.themeToggle.addEventListener('click', () => {
                currentMapTheme = currentMapTheme === 'satellite' ? 'street' : 'satellite';
                if (currentMapTheme === 'satellite') {
                    map.removeLayer(mapLayers.street);
                    mapLayers.satellite.addTo(map);
                    if (earth && earthTextures.satellite) earth.material.map = earthTextures.satellite;
                } else {
                    map.removeLayer(mapLayers.satellite);
                    mapLayers.street.addTo(map);
                    if (earth && earthTextures.street) earth.material.map = earthTextures.street;
                }
                if (earth) earth.material.needsUpdate = true;
            });
        }

        if (ui.btnFocus) {
            ui.btnFocus.addEventListener('click', () => {
                if (!isFlying) return;

                if (viewMode === 'map' && map && planeSprite) {
                    const lat = planeSprite.userData.currentLatLng.lat;
                    const lng = planeSprite.userData.currentLatLng.lng;
                    map.flyTo([lat, lng], 8, { duration: 1.5 });
                } else if (viewMode === 'globe' && scene && planeSprite) {
                    // Focus on globe plane
                    // Orbit controls target update
                    if (controls) {
                        const pos = planeSprite.position.clone();
                        // Smooth transition would be ideal, for now snap target
                        // controls.target.copy(pos.clone().normalize().multiplyScalar(EARTH_RADIUS * 0.8)); // Look slightly below

                        // Rotate camera to look at plane from above/behind?
                        // Simpler: Just ensure plane is in view.
                        // Actually, let's rotate the controls to look at the plane index.

                        // Simple approach: Center globe on plane
                        const earthPos = latLonToVector3(planeSprite.userData.currentLatLng.lat, planeSprite.userData.currentLatLng.lng, 35);
                        camera.position.copy(earthPos);
                        camera.lookAt(0, 0, 0);
                        controls.update();
                    }
                }
            });
        }

        window.addEventListener('resize', () => {
            if (typeof world !== 'undefined' && world) {
                world.width(window.innerWidth);
                world.height(window.innerHeight);
            }
        });
    }

    function textParser(text) {
        const lines = text.split('\n');
        let html = '<ul class="changelog-list">';
        lines.forEach(line => {
            if (line.trim() === '') return;
            // Check for date pattern YYYY-MM-DD
            if (line.match(/^\d{4}-\d{2}-\d{2}/)) {
                if (html !== '<ul class="changelog-list">') html += '</ul><ul class="changelog-list">'; // Close previous list if exists
                html += `<span class="changelog-date">${line}</span>`;
            } else if (line.startsWith('-')) {
                html += `<li>${line.substring(1).trim()}</li>`;
            } else {
                html += `<li>${line}</li>`;
            }
        });
        html += '</ul>';
        return html;
    }

    function parseNotices(text) {
        // Regex to split by tags, capturing the tag itself
        const regex = /(<제목>|<고정>)/;
        const parts = text.split(regex);

        let notices = [];
        let currentTag = null;

        // parts array will look like: ["before text", "<고정>", " title\nbody...", "<제목>", " title\nbody..."]
        parts.forEach(part => {
            if (!part.trim() && !['<제목>', '<고정>'].includes(part)) return;

            if (part === '<제목>' || part === '<고정>') {
                currentTag = part;
            } else if (currentTag) {
                // This 'part' is the content for the currentTag
                // e.g., " Title \n Body..."
                const firstLineEnd = part.indexOf('\n');
                let title = "";
                let body = "";

                if (firstLineEnd === -1) {
                    title = part.trim();
                } else {
                    title = part.substring(0, firstLineEnd).trim();
                    body = part.substring(firstLineEnd).trim().replace(/\n/g, '<br>');
                }

                if (title) {
                    notices.push({
                        title,
                        body,
                        isPinned: currentTag === '<고정>'
                    });
                }
                currentTag = null; // Reset
            }
        });

        // Sort: Pinned first
        notices.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });

        // Render
        let html = '<div class="notice-list">';
        notices.forEach(notice => {
            const pinIcon = notice.isPinned ? '<i class="fa-solid fa-thumbtack" style="margin-right:8px; color:var(--primary);"></i> ' : '';
            const activeClass = notice.isPinned ? 'pinned' : '';
            const titleStyle = notice.isPinned ? 'font-weight:900;' : '';

            html += `
            <div class="notice-item ${activeClass}">
                <div class="notice-title" style="${titleStyle}">
                    <span>${pinIcon}${notice.title}</span>
                </div>
                <div class="notice-content">${notice.body}</div>
            </div>
        `;
        });

        html += '</div>';
        return html;
    }

    function toggleMenu(open) {
        if (open) {
            ui.menuDrawer.classList.remove('hidden');
            ui.menuOverlay.classList.remove('hidden');
        } else {
            ui.menuDrawer.classList.add('hidden');
            ui.menuOverlay.classList.add('hidden');
        }
    }

    // --- Follow Plane Logic ---
    function showToast(message) {
        if (!ui.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fa-solid fa-location-dot"></i> <span>${message}</span>`;
        ui.toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function toggleFollowPlane() {
        isFollowingPlane = !isFollowingPlane;

        const btns = [ui.btnFollowSetup, ui.btnFollowFlight];
        btns.forEach(btn => {
            if (btn) {
                if (isFollowingPlane) btn.classList.add('active');
                else btn.classList.remove('active');
            }
        });

        if (isFollowingPlane) {
            showToast(t('msg_following'));
            // Disable interactions but allow zoom
            if (controls) {
                controls.enableRotate = false;
                controls.enablePan = false;
            }
            if (map) {
                map.dragging.disable();
                map.keyboard.disable();
            }
        } else {
            showToast(t('msg_follow_stop'));
            // Enable interactions
            if (controls) {
                controls.enableRotate = true;
                controls.enablePan = true;
                controls.target.set(0, 0, 0);
            }
            if (map) {
                map.dragging.enable();
                map.keyboard.enable();
            }
        }
    }

    function toggleViewMode() {
        viewMode = viewMode === 'globe' ? 'map' : 'globe';

        const iconSetup = ui.viewToggleSetup ? ui.viewToggleSetup.querySelector('i') : null;
        const iconFlight = ui.viewToggleFlight ? ui.viewToggleFlight.querySelector('i') : null;

        if (viewMode === 'map') {
            // --- MAP MODE ---
            ui.mapView.style.opacity = '1';
            ui.mapView.style.zIndex = '5';
            ui.mapView.style.pointerEvents = 'auto';

            // Three.js Overlay Mode
            ui.cesiumContainer.style.opacity = '1';
            ui.cesiumContainer.style.zIndex = '6'; // Layer on top of map
            ui.cesiumContainer.style.pointerEvents = 'none'; // Clicks pass to map

            if (globeGroup) globeGroup.visible = false;
            if (scene) scene.background = null; // Transparent

            if (iconSetup) iconSetup.className = 'fa-solid fa-earth-americas';
            if (iconFlight) iconFlight.className = 'fa-solid fa-earth-americas';
            if (ui.viewToggleSetup) ui.viewToggleSetup.title = "지구본 보기";
            if (ui.viewToggleFlight) ui.viewToggleFlight.title = "지구본 보기";

            if (controls) controls.enabled = false;

            if (map) {
                setTimeout(() => {
                    map.invalidateSize();
                    if (isFlying && planeSprite && planeSprite.userData.currentLatLng) {
                        map.setView([planeSprite.userData.currentLatLng.lat, planeSprite.userData.currentLatLng.lng], map.getZoom(), { animate: false });
                    } else if (selectedOrigin) {
                        map.setView([selectedOrigin.lat, selectedOrigin.lng], 5);
                    }
                }, 50);

                if (isFollowingPlane) {
                    map.dragging.disable();
                    map.keyboard.disable();
                } else {
                    map.dragging.enable();
                    map.keyboard.enable();
                }

                if (ui.themeToggle) ui.themeToggle.style.display = 'flex';
            }
        } else {
            // --- GLOBE MODE ---
            ui.mapView.style.opacity = '0';
            ui.mapView.style.zIndex = '1';
            ui.mapView.style.pointerEvents = 'none';

            ui.cesiumContainer.style.opacity = '1';
            ui.cesiumContainer.style.zIndex = '5';
            ui.cesiumContainer.style.pointerEvents = 'auto'; // Receive globe interactions

            if (globeGroup) globeGroup.visible = true;
            if (scene) scene.background = new THREE.Color(0x000000);

            if (iconSetup) iconSetup.className = 'fa-solid fa-map';
            if (iconFlight) iconFlight.className = 'fa-solid fa-map';
            if (ui.viewToggleSetup) ui.viewToggleSetup.title = "지도 보기";
            if (ui.viewToggleFlight) ui.viewToggleFlight.title = "지도 보기";

            if (ui.themeToggle) ui.themeToggle.style.display = 'none';

            if (controls) {
                controls.enabled = true;
                if (isFollowingPlane) {
                    controls.enableRotate = false;
                    controls.enablePan = false;
                } else {
                    controls.enableRotate = true;
                    controls.enablePan = true;
                }

                if (map) {
                    const center = map.getCenter();
                    const targetPos = latLonToVector3(center.lat, center.lng, EARTH_RADIUS);
                    camera.position.copy(targetPos.clone().normalize().multiplyScalar(35));
                    camera.lookAt(0, 0, 0);
                    if (!isFollowingPlane) controls.target.set(0, 0, 0);
                    controls.update();
                }
            }
        }
    }

    function updateMapPlanePos() {
        if (viewMode === 'map' && planeSprite && map) {
            const point = map.latLngToContainerPoint([planeSprite.userData.currentLatLng.lat, planeSprite.userData.currentLatLng.lng]);
            const x = point.x - window.innerWidth / 2;
            const y = -(point.y - window.innerHeight / 2);
            planeSprite.position.set(x, y, 0);

            // Re-calculate bearing for sprite rotation if needed,
            // but the main loop handles it. This ensures "stickiness" during drag.
        }
    }

    // --- Helper for Plane Icon ---
    function createPlaneCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.font = '900 90px "Font Awesome 6 Free"'; // Needs 900 for Solid icons
        ctx.fillStyle = '#00d4ff'; // Cyan plane
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\uf072', 50, 50); // fa-plane (solid) unicode
        return canvas;
    }

    // --- Three.js Globe Setup ---
    let scene, camera, mapCamera, renderer, controls;
    let globeGroup; // Group for Earth, Stars, Markers, Trails
    let earth, starField;
    let airportMarkers = [];
    let flightLine, planeSprite;
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    const EARTH_RADIUS = 10;

    function initGlobe() {
        // --- Flat Map Init ---
        // ... (Leaflet init matches existing)
        if (typeof L !== 'undefined') {
            map = L.map('map-view', {
                zoomControl: true,
                attributionControl: false,
                zoomAnimation: true,
                dragging: true,
                scrollWheelZoom: true,
                worldCopyJump: false,
                maxBounds: [[-90, -180], [90, 180]]
            }).setView([37.5, 127], 3);

            mapLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19,
                noWrap: true,
                bounds: [[-90, -180], [90, 180]],
                detectRetina: true,
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri'
            });

            mapLayers.street = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
                subdomains: 'abcd',
                noWrap: true,
                bounds: [[-90, -180], [90, 180]],
                detectRetina: true,
                maxZoom: 19
            });

            mapLayers.satellite.addTo(map);

            // Update plane position whenever map moves/zooms
            map.on('move zoom viewreset', () => {
                updateMapPlanePos();
            });

            // Auto Toggle Map -> Globe on Zoom Out
            map.on('zoomend', () => {
                if (viewMode === 'map' && map.getZoom() < 2.5) { // Lowered threshold for wider view
                    toggleViewMode();
                }
            });

            // Add Airport Markers to Flat Map
            AIRPORTS.forEach(airport => {
                const marker = L.circleMarker([airport.lat, airport.lng], {
                    radius: 8,
                    fillColor: "#ffff00",
                    color: "#000",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);

                marker.bindTooltip(airport.code, { permanent: false, direction: 'top' });
                marker.on('click', (e) => {
                    // Prevent map click if needed, though handleAirportClick is safe
                    handleAirportClick(airport, null, marker);
                });
                leafletMarkers.push({ data: airport, marker: marker });
            });
        }

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Globe Group
        globeGroup = new THREE.Group();
        scene.add(globeGroup);

        // Cameras
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 35;

        // Map Camera (Orthographic for 1:1 pixel mapping)
        const aspect = window.innerWidth / window.innerHeight;
        mapCamera = new THREE.OrthographicCamera(
            -window.innerWidth / 2, window.innerWidth / 2,
            window.innerHeight / 2, -window.innerHeight / 2,
            0.1, 1000
        );
        mapCamera.position.z = 500; // Put camera high up

        // Renderer
        const container = document.getElementById('cesiumContainer');
        container.innerHTML = '';
        renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            precision: 'mediump'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        container.appendChild(renderer.domElement);

        // Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.minDistance = 10.5; // Allow zooming very close to surface
        controls.maxDistance = 60;
        controls.autoRotate = false;
        controls.autoRotateSpeed = 0.5;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight); // Keep global

        const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 128, 128);
        const textureLoader = new THREE.TextureLoader();

        // Load GLB Model
        loadPlaneModel().then(model => {
            glbPlaneModel = model;
            console.log("GLB Plane Model Loaded Successfully");
        }).catch(err => {
            console.error("Failed to load GLB model, using placeholder instead", err);
        });

        // Load high-res textures with filtering improvements
        const loadTexture = (url) => {
            return textureLoader.load(url, (tex) => {
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.magFilter = THREE.LinearFilter;
                tex.generateMipmaps = true;
                tex.needsUpdate = true;
                if (earth) earth.material.needsUpdate = true;
            });
        };

        earthTextures.satellite = loadTexture('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
        earthTextures.street = loadTexture('https://unpkg.com/three-globe/example/img/earth-day.jpg');

        const earthMat = new THREE.MeshPhongMaterial({
            map: earthTextures.satellite,
            shininess: 15,
            specular: new THREE.Color(0x333333),
            color: 0xffffff
        });
        earth = new THREE.Mesh(earthGeo, earthMat);
        globeGroup.add(earth);

        // 2. Stars
        const starGeo = new THREE.BufferGeometry();
        const starCount = 5000;
        const starPos = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        // ... (Star gen logic is same, omitting for brevity in thought but including in code)
        for (let i = 0; i < starCount; i++) {
            const r = 40 + Math.random() * 100;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPos[i * 3 + 2] = r * Math.cos(phi);

            // ... (Color logic)
            const starType = Math.random();
            if (starType > 0.9) {
                starColors[i * 3] = 0.5; starColors[i * 3 + 1] = 0.5; starColors[i * 3 + 2] = 1.0;
            } else if (starType > 0.7) {
                starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 0.5;
            } else {
                starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0;
            }
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        starField = new THREE.Points(starGeo, starMat);
        globeGroup.add(starField);

        // 3. Airports
        const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });

        AIRPORTS.forEach(airport => {
            const marker = new THREE.Mesh(markerGeo, markerMat.clone());
            const pos = latLonToVector3(airport.lat, airport.lng, EARTH_RADIUS);
            marker.position.set(pos.x, pos.y, pos.z);
            marker.userData = { isAirport: true, data: airport };
            globeGroup.add(marker);
            airportMarkers.push(marker);
        });

        // Event Listeners
        window.addEventListener('resize', onWindowResize, false);
        renderer.domElement.addEventListener('click', onMouseClick, false);

        // animate(); // Called after loading simulation
    }

    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));
        return new THREE.Vector3(x, y, z);
    }

    function vector3ToLatLon(vec) {
        const norm = vec.clone().normalize();
        const phi = Math.acos(norm.y);
        const theta = Math.atan2(norm.z, -norm.x);
        const lat = 90 - (phi * 180 / Math.PI);
        let lon = (theta * 180 / Math.PI) - 180;
        // Wrap lon
        while (lon <= -180) lon += 360;
        while (lon > 180) lon -= 360;
        return { lat, lng: lon };
    }

    function vector3ToContinuousLatLon(vec, prevLng) {
        const coords = vector3ToLatLon(vec);
        let lon = coords.lng;
        if (prevLng !== undefined) {
            while (lon - prevLng > 180) lon -= 360;
            while (lon - prevLng < -180) lon += 360;
        }
        return { lat: coords.lat, lng: lon };
    }

    function performDynamicScaling() {
        if (!camera) return;

        // --- Map Mode Logic ---
        if (viewMode === 'map') {
            if (planeSprite) {
                // In Orthographic 1:1 pixel mode, we need a larger scale.
                // Original model is around 0.1 units. Scale 80-100 makes it ~10-20 pixels.
                planeSprite.scale.setScalar(80.0);
            }
            return;
        }

        // --- Globe Mode Logic ---
        const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        // More precision in scaling for deep zoom
        let scaleFactor = Math.max(0.05, (dist - 10) * 0.05);
        scaleFactor = Math.min(2.0, Math.max(0.05, scaleFactor));

        // Scale Markers
        airportMarkers.forEach(marker => {
            marker.scale.setScalar(scaleFactor);
        });

        // Scale Plane
        if (planeSprite) {
            // Consistent base scaling logic to prevent disassembly
            const planeBase = 1.0; // Increased from 0.5 to make it visible on globe
            const scaleFactor = dist / 35.0;
            // The GLB model wrapper is already 2 units long, so we adjust accordingly
            planeSprite.scale.setScalar(planeBase * scaleFactor);
        }
    }

    function onWindowResize() {
        if (!camera || !renderer) return;

        // Update Perspective Camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Update Orthographic Camera (Map Mode)
        if (mapCamera) {
            mapCamera.left = -window.innerWidth / 2;
            mapCamera.right = window.innerWidth / 2;
            mapCamera.top = window.innerHeight / 2;
            mapCamera.bottom = -window.innerHeight / 2;
            mapCamera.updateProjectionMatrix();
        }

        renderer.setSize(window.innerWidth, window.innerHeight);
    }


    function onMouseClick(event) {
        if (isFlying) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);

        for (let i = 0; i < intersects.length; i++) {
            const obj = intersects[i].object;
            if (obj.userData && obj.userData.isAirport) {
                handleAirportClick(obj.userData.data, obj);
                break;
            }
        }
    }

    function updateMarkerColors() {
        // Sync 3D markers
        airportMarkers.forEach(m => {
            const data = m.userData.data;
            if (selectedOrigin && data === selectedOrigin) m.material.color.setHex(0x00ffff);
            else if (selectedDest && data === selectedDest) m.material.color.setHex(0xf72585);
            else m.material.color.setHex(0xffff00);
        });

        // Sync Leaflet markers
        leafletMarkers.forEach(item => {
            const data = item.data;
            const marker = item.marker;
            if (selectedOrigin && data === selectedOrigin) {
                marker.setStyle({ fillColor: '#00ffff', color: '#fff' });
            } else if (selectedDest && data === selectedDest) {
                marker.setStyle({ fillColor: '#f72585', color: '#fff' });
            } else {
                marker.setStyle({ fillColor: '#ffff00', color: '#000' });
            }
        });
    }

    function handleAirportClick(airport, meshObj, leafMarker) {
        if (isFlying) return;

        if (!selectedOrigin) {
            selectedOrigin = airport;
            ui.originCode.textContent = airport.code;
            ui.originCode.style.color = '#ffff00';
            updateMarkerColors();
        }
        else if (!selectedDest && airport !== selectedOrigin) {
            selectedDest = airport;
            ui.destCode.textContent = airport.code;
            ui.destCode.style.color = '#f72585';
            updateMarkerColors();

            // Draw Curve
            const startPos = latLonToVector3(selectedOrigin.lat, selectedOrigin.lng, EARTH_RADIUS);
            const endPos = latLonToVector3(selectedDest.lat, selectedDest.lng, EARTH_RADIUS);

            // Control points for Arc
            const distance = startPos.distanceTo(endPos);
            const mid = startPos.clone().add(endPos).multiplyScalar(0.5).normalize().multiplyScalar(EARTH_RADIUS + distance * 0.5);

            const curve = new THREE.QuadraticBezierCurve3(startPos, mid, endPos);
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0x00d4ff, linewidth: 2 });
            flightLine = new THREE.Line(geometry, material);
            scene.add(flightLine);

            // Add Flat Map Pathway (Curved Great Circle with Splitting)
            if (map) {
                if (mapPathLine) map.removeLayer(mapPathLine);

                const segments = [[]];
                let currentSegment = segments[0];
                let lastLng = selectedOrigin.lng;
                const pathDetail = curve.getPoints(100);

                pathDetail.forEach(p => {
                    const ll = vector3ToContinuousLatLon(p, lastLng);

                    let displayLng = ll.lng;
                    while (displayLng > 180) displayLng -= 360;
                    while (displayLng <= -180) displayLng += 360;

                    if (currentSegment.length > 0) {
                        const prevDisplayLng = currentSegment[currentSegment.length - 1][1];
                        if (Math.abs(displayLng - prevDisplayLng) > 180) {
                            currentSegment = [];
                            segments.push(currentSegment);
                        }
                    }

                    currentSegment.push([ll.lat, displayLng]);
                    lastLng = ll.lng;
                });

                mapPathLine = L.featureGroup();
                segments.forEach(seg => {
                    if (seg.length > 1) {
                        L.polyline(seg, {
                            color: '#00d4ff',
                            weight: 3,
                            opacity: 0.6,
                            dashArray: '10, 10'
                        }).addTo(mapPathLine);
                    }
                });
                mapPathLine.addTo(map);
            }

            const dist = getDistanceFromLatLonInKm(selectedOrigin.lat, selectedOrigin.lng, selectedDest.lat, selectedDest.lng);
            const durationSecs = (dist / FLIGHT_SPEED_KPH) * 3600;
            flightDurationSeconds = Math.round(durationSecs);
            ui.realTimeDisplay.textContent = formatTime(flightDurationSeconds);
            ui.takeoffBtn.disabled = false;
        }
        else {
            if (airport !== selectedOrigin && airport !== selectedDest) {
                resetApp();
                updateMarkerColors();
            }
        }
    }

    // --- 3D Plane Helper ---
    // --- 3D Plane Helper ---
    // --- 3D Plane Helper (Block Style) ---


    // --- Start Flight Logic ---
    function startFlight() {
        if (!selectedOrigin || !selectedDest) return;
        isFlying = true;
        controls.autoRotate = false;

        ui.panelSetup.classList.add('hidden');
        ui.panelFlight.classList.remove('hidden');
        if (ui.modal) ui.modal.style.display = 'none';

        // Add class for mobile layout adjustment
        document.querySelector('.ui-overlay').classList.add('panel-active');

        // Show View Toggle
        if (ui.viewToggle) ui.viewToggle.style.display = 'flex'; // Flex for centering icon
        if (ui.integratedControls) ui.integratedControls.classList.remove('hidden');

        // Add Plane Model
        if (glbPlaneModel) {
            planeSprite = glbPlaneModel.clone();
            // Cache propeller references within the clone
            const props = [];
            planeSprite.traverse(n => {
                if (n.name === "propeller") props.push(n);
            });
            planeSprite.userData = {
                currentLatLng: { lat: selectedOrigin.lat, lng: selectedOrigin.lng },
                props: props
            };
        } else {
            planeSprite = create3DPlane();
        }
        scene.add(planeSprite);

        // --- Parallel Execution ---
        // 1. Audio Announcement
        // 1. Audio Announcement & Start Flight on Complete
        if (audio) {
            audio.announceTakeoff(selectedDest, (text) => {
                ui.message.textContent = text;
            }, () => {
                // Secondary msg after voice ends/skips
                if (isFlying) {
                    ui.message.textContent = t('msg_takingoff');
                    audio.startEngineSound();
                    startTimer();
                }
            });
        } else {
            // No audio, start immediately
            ui.message.textContent = t('msg_takingoff');
            startTimer();
        }
    }

    function startTimer() {
        const startTime = Date.now();
        const durationMs = flightDurationSeconds * 1000;
        ui.message.textContent = t('status_flying');

        // Curve calculation
        const startPos = latLonToVector3(selectedOrigin.lat, selectedOrigin.lng, EARTH_RADIUS);
        const endPos = latLonToVector3(selectedDest.lat, selectedDest.lng, EARTH_RADIUS);
        const distance = startPos.distanceTo(endPos);
        // Slightly higher arc to prevent clipping (+ 0.5 offset)
        const mid = startPos.clone().add(endPos).multiplyScalar(0.5).normalize().multiplyScalar(EARTH_RADIUS + distance * 0.5 + 0.5);
        const curve = new THREE.QuadraticBezierCurve3(startPos, mid, endPos);

        function animateFlight() {
            if (!isFlying) return;
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / durationMs);

            secondsRemaining = Math.ceil(Math.max(0, durationMs - elapsed) / 1000);
            ui.timerDisplay.textContent = formatTime(secondsRemaining);

            // 1. Globe View Logic (3D Plane)
            if (planeSprite) {
                // P: Current Point
                const point = curve.getPoint(progress);

                // Offset visual position significantly to ensure it's ABOVE the line/ground
                const normal = point.clone().normalize();
                const visualPosition = point.clone().add(normal.multiplyScalar(0.3));

                planeSprite.position.copy(visualPosition);

                // T: Target Point (slightly ahead) for orientation
                const lookAtProgress = Math.min(1, progress + 0.01);
                const targetPoint = curve.getPoint(lookAtProgress);
                const targetNormal = targetPoint.clone().normalize();
                const targetVisual = targetPoint.clone().add(targetNormal.multiplyScalar(0.3));

                // Correct Orientation: Belly to Earth
                planeSprite.up.copy(normal);
                planeSprite.lookAt(targetVisual);
                planeSprite.rotateY(Math.PI); // Fix: Flip 180 degrees to face forward on Globe

                // Rotate Propellers
                if (planeSprite.userData.props) {
                    planeSprite.userData.props.forEach(p => {
                        p.rotation.z += 0.8; // High speed spin on Z axis
                    });
                } else if (planeSprite.userData.propeller) {
                    planeSprite.userData.propeller.rotation.z -= 0.5; // Old block model fallback
                }
            }

            // 2. Flat Map Sync Logic
            if (viewMode === 'map' && map) {
                // Use the 3D curve for accurate coordinates on map
                const p3d = curve.getPoint(progress);
                const prevL = planeSprite.userData.currentLatLng ? planeSprite.userData.currentLatLng.lng : selectedOrigin.lng;
                const ll = vector3ToContinuousLatLon(p3d, prevL);

                const curLat = ll.lat;
                let curLng = ll.lng;

                // Normalize longitude for single map view [-180, 180]
                while (curLng > 180) curLng -= 360;
                while (curLng <= -180) curLng += 360;

                planeSprite.userData.currentLatLng = { lat: curLat, lng: curLng };

                if (planeSprite) {
                    const point = map.latLngToContainerPoint([curLat, curLng]);
                    const x = point.x - window.innerWidth / 2;
                    const y = -(point.y - window.innerHeight / 2);
                    planeSprite.position.set(x, y, 0); // At Z=0, well within camera range (Z=500 to -500)
                    planeSprite.up.set(0, 0, 1);

                    // Tangential Bearing
                    // Calculate a point slightly ahead in the path to determine tangent angle
                    const nextProgress = Math.min(progress + 0.005, 1.0);
                    const nextPosData = getIntermediatePoint(selectedOrigin.lat, selectedOrigin.lng, selectedDest.lat, selectedDest.lng, nextProgress);

                    const p1 = map.latLngToContainerPoint([curLat, curLng]);
                    const p2 = map.latLngToContainerPoint([nextPosData.lat, nextPosData.lng]);

                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;

                    // Angle in radians from X axis (East)
                    let angle = Math.atan2(dy, dx);

                    // Convert to bearing for CSS/Three rotation?
                    // Three.js plane default orientation:
                    // If plane model points +X, angle is correct?
                    // Let's assume plane points Up (+Y) or something.
                    // Usually we need -angle + offset.

                    // Let's try:
                    // map angle: 0 is Right (East), PI/2 is Down (South).
                    // We want rotation to match this.

                    // --- Improved 3D Angle on Flat Map ---
                    const rotationQ = new THREE.Quaternion();
                    // Rotate around Z. In map space (2D), standard rotation.
                    // If plane points "Up" (North) by default:
                    // We need to subtract PI/2 from standard math angle?
                    // Actually, let's look at previous code: `Math.atan2(dx, -dy)` suggests Up is 0.
                    // `Math.atan2(dy, dx)`: Right is 0.

                    // If we use standard Math.atan2(dy, dx), that is angle from East Counter-Clockwise? No, screen Y is down.
                    // Screen Coords: +X Right, +Y Down.
                    // Math.atan2(dy, dx) -> 0 = Right, PI/2 = Down.
                    // This matches perfectly with "Angle from X axis".

                    // If our plane model points "Up" (Y axis) by default -> We need to Add PI/2 to align "Up" to "Right" then rotate?
                    // Or subtract.

                    // Current plane points "Right" or "Up"?
                    // In `visual-assets.js` usually planes make to point to +X or -Z or something.
                    // If it's the sprite, it depends on the texture. Assuming texture points Up.
                    // Then for 0 angle (Right), we need -90 deg rotation?

                    // Let's rely on standard bearing formula relation.
                    // Previous: `Math.atan2(dx, -dy)` -> Angle from Up (Y) axis, Clockwise.
                    // New: `angle = Math.atan2(dy, dx)` (Screen space).

                    // We simply set Z rotation to `-(angle - Math.PI/2)`? Or just `-angle`.
                    // Let's try matching the screen angle directly, observing coordinate system.
                    // Three.js Z rotation is CCW. Screen Y is Down (so angles are "inverted" visually relative to cartesian?)

                    // Fix Direction: The plane was rotated 180 degrees.
                    // ThreeJS Z rotation is CCW.
                    // User reported backwards, so adding Math.PI to flip it.
                    rotationQ.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -angle + Math.PI / 2 + Math.PI);

                    const tiltQ = new THREE.Quaternion();
                    // Adjust tilt to be more consistent with globe orientation (belly to scene)
                    tiltQ.setFromEuler(new THREE.Euler(Math.PI / 3, 0, 0));

                    planeSprite.quaternion.copy(rotationQ.multiply(tiltQ));

                    // Rotate Propellers
                    if (planeSprite.userData.props) {
                        planeSprite.userData.props.forEach(p => {
                            p.rotation.z += 0.8; // Spin around Z axis (standard for propellers)
                        });
                    } else if (planeSprite.userData.propeller) {
                        planeSprite.userData.propeller.rotation.z -= 0.5;
                    }
                }
            }

            // Loop
            if (progress < 1) {
                requestAnimationFrame(animateFlight);
            } else {
                endFlight();
            }
        }
        animateFlight();
    }

    function animate() {
        requestAnimationFrame(animate);

        performDynamicScaling();

        // --- Auto Map Toggle Logic ---
        if (viewMode === 'globe' && controls) {
            const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
            // Threshold: If zoomed in very close (dist < 11.5)
            if (dist < 11.5) {
                const targetPos = vector3ToLatLon(camera.position);
                toggleViewMode();
                if (map) {
                    map.setView([targetPos.lat, targetPos.lng], 7);
                }
            }

            // --- Follow Mode Target Update ---
            if (isFollowingPlane) {
                if (planeSprite) {
                    // Globe Mode
                    controls.target.copy(planeSprite.position);
                }
            }
        }

        // --- Map Follow Mode ---
        if (viewMode === 'map' && isFollowingPlane && map && planeSprite && planeSprite.userData.currentLatLng) {
            map.setView([planeSprite.userData.currentLatLng.lat, planeSprite.userData.currentLatLng.lng], map.getZoom(), { animate: false });
        }

        if (controls) controls.update();
        if (renderer) {
            const activeCamera = viewMode === 'map' ? mapCamera : camera;
            if (activeCamera) renderer.render(scene, activeCamera);
        }
    }

    // Auto-init handled in init() call below

    function endFlight() {
        ui.message.textContent = t('msg_arriving');
        if (audio) {
            audio.stopEngineSound();
            audio.announceLandingWithDest(selectedDest, (text) => {
                ui.message.textContent = text;
            });
        }

        isFlying = false;
        setTimeout(() => {
            alert(t('alert_complete') + selectedDest.name);
            resetApp();
        }, 8000);
    }

    function abortFlight() {
        if (confirm(t('alert_divert'))) {
            isFlying = false;
            if (audio) audio.stopEngineSound();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            resetApp();
        }
    }

    function resetApp() {
        isFlying = false;
        selectedOrigin = null;
        selectedDest = null;
        ui.originCode.textContent = "--";
        ui.destCode.textContent = "--";
        ui.originCode.style.color = '';
        ui.destCode.style.color = '';
        ui.takeoffBtn.disabled = true;
        ui.panelSetup.classList.remove('hidden');

        ui.panelFlight.classList.add('hidden');
        if (ui.integratedControls) ui.integratedControls.classList.add('hidden');

        // Remove mobile layout active class
        const overlay = document.querySelector('.ui-overlay');
        if (overlay) overlay.classList.remove('panel-active');

        // Reset Marker Colors
        updateMarkerColors();

        // Remove 3D flight lines
        if (flightLine) {
            scene.remove(flightLine);
            if (flightLine.geometry) flightLine.geometry.dispose();
            if (flightLine.material) flightLine.material.dispose();
            flightLine = null;
        }

        // Remove Map flight lines
        if (mapPathLine && map) {
            map.removeLayer(mapPathLine);
            mapPathLine = null;
        }

        // Remove 3D Plane
        if (planeSprite) {
            scene.remove(planeSprite);
            // If it's a GLB model, we don't necessarily want to dispose the template, 
            // but we can cleanup the instance if needed. For simplicity, just remove from scene.
            planeSprite = null;
        }

        if (controls) {
            controls.autoRotate = false;
        }
    }

    // --- Helpers ---
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    }

    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function deg2rad(deg) { return deg * (Math.PI / 180); }
    function rad2deg(rad) { return rad * (180 / Math.PI); }

    function getIntermediatePoint(lat1, lng1, lat2, lng2, f) {
        lat1 = deg2rad(lat1); lng1 = deg2rad(lng1);
        lat2 = deg2rad(lat2); lng2 = deg2rad(lng2);

        const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng1 - lng2) / 2), 2)));
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
        const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);
        const lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
        const lng = Math.atan2(y, x);

        return { lat: rad2deg(lat), lng: rad2deg(lng) };
    }

    function t(key) { return translations[currentLang][key] || key; }

    function updateLanguageUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) {
                if (el.tagName === 'P' && key === 'setup_desc') {
                    el.innerHTML = translations[currentLang][key];
                } else {
                    el.textContent = translations[currentLang][key];
                }
            }
        });

        // Placeholder Localization
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const key = el.getAttribute('data-i18n-ph');
            if (translations[currentLang][key]) {
                el.placeholder = translations[currentLang][key];
            }
        });

        if (ui.modalTitle) ui.modalTitle.textContent = t('modal_title');
        if (ui.modalDesc) ui.modalDesc.textContent = t('modal_desc');
        if (ui.initBtn) ui.initBtn.textContent = t('btn_enter');
    }
    const loadStatus = {
        model: false,
        textures: false,
        mapTiles: false,
        progress: 0
    };

    function updateLoadingProgress() {
        // Simple weighted progress
        let targetProgress = 0;
        if (loadStatus.model) targetProgress += 30;
        if (loadStatus.textures) targetProgress += 30;
        if (loadStatus.mapTiles) targetProgress += 40;

        // Smoothly increment current progress towards target
        const currentP = parseFloat(ui.loadingBar.style.width) || 0;
        if (currentP < targetProgress) {
            ui.loadingBar.style.width = `${targetProgress}%`;
        }

        if (loadStatus.model && loadStatus.textures && loadStatus.mapTiles) {
            ui.loadingBar.style.width = '100%';
            setTimeout(finishLoading, 600);
        }
    }

    function initGlobe() {
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onLoad = () => {
            loadStatus.textures = true;
            updateLoadingProgress();
        };

        // --- Flat Map Init ---
        if (typeof L !== 'undefined') {
            map = L.map('map-view', {
                zoomControl: true,
                attributionControl: false,
                zoomAnimation: true,
                dragging: true,
                scrollWheelZoom: true,
                worldCopyJump: false,
                maxBounds: [[-90, -180], [90, 180]]
            }).setView([37.5, 127], 4); // Start slightly zoomed for better tile pre-fetch

            mapLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19,
                noWrap: true,
                bounds: [[-90, -180], [90, 180]]
            });

            mapLayers.street = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                noWrap: true,
                bounds: [[-90, -180], [90, 180]]
            });

            // Track Leaflet tile loading
            let tilesLoaded = 0;
            let totalTiles = 0;
            const checkTiles = () => {
                if (tilesLoaded >= totalTiles && totalTiles > 0) {
                    loadStatus.mapTiles = true;
                    updateLoadingProgress();
                    mapLayers.satellite.off('tileload', onTileLoad);
                    mapLayers.satellite.off('tileloadstart', onTileStart);
                }
            };

            const onTileStart = () => { totalTiles++; };
            const onTileLoad = () => { tilesLoaded++; checkTiles(); };

            mapLayers.satellite.on('tileloadstart', onTileStart);
            mapLayers.satellite.on('tileload', onTileLoad);

            mapLayers.satellite.addTo(map);

            // Safety timeout for tiles
            setTimeout(() => {
                if (!loadStatus.mapTiles) {
                    console.warn("Map tiles loading timed out, proceeding anyway");
                    loadStatus.mapTiles = true;
                    updateLoadingProgress();
                }
            }, 5000);

            map.on('move zoom viewreset', () => updateMapPlanePos());
            map.on('zoomend', () => {
                if (viewMode === 'map' && map.getZoom() < 2.5) toggleViewMode();
            });

            AIRPORTS.forEach(airport => {
                const marker = L.circleMarker([airport.lat, airport.lng], {
                    radius: 8, fillColor: "#ffff00", color: "#000", weight: 2, opacity: 1, fillOpacity: 0.8
                }).addTo(map);
                marker.bindTooltip(airport.code, { permanent: false, direction: 'top' });
                marker.on('click', () => handleAirportClick(airport, null, marker));
                leafletMarkers.push({ data: airport, marker: marker });
            });
        }

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        globeGroup = new THREE.Group();
        scene.add(globeGroup);

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 35;

        mapCamera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 0.1, 1000);
        mapCamera.position.z = 500;

        const container = document.getElementById('cesiumContainer');
        container.innerHTML = '';
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance', precision: 'mediump' });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.minDistance = 10.5;
        controls.maxDistance = 60;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 128, 128);
        const textureLoader = new THREE.TextureLoader(loadingManager);

        loadPlaneModel().then(model => {
            glbPlaneModel = model;
            loadStatus.model = true;
            updateLoadingProgress();
        }).catch(() => {
            loadStatus.model = true;
            updateLoadingProgress();
        });

        const loadTexture = (url) => {
            return textureLoader.load(url, (tex) => {
                tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.generateMipmaps = true;
                if (earth) earth.material.needsUpdate = true;
            });
        };

        earthTextures.satellite = loadTexture('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
        earthTextures.street = loadTexture('https://unpkg.com/three-globe/example/img/earth-day.jpg');

        earth = new THREE.Mesh(earthGeo, new THREE.MeshPhongMaterial({ map: earthTextures.satellite, shininess: 15, specular: new THREE.Color(0x333333) }));
        globeGroup.add(earth);

        const starGeo = new THREE.BufferGeometry();
        const starCount = 5000;
        const starPos = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 40 + Math.random() * 100;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPos[i * 3 + 2] = r * Math.cos(phi);
            starColors[i * 3] = 1; starColors[i * 3 + 1] = 1; starColors[i * 3 + 2] = 1;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        starField = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.3, vertexColors: true, transparent: true, opacity: 0.8 }));
        globeGroup.add(starField);

        const markerGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        AIRPORTS.forEach(airport => {
            const marker = new THREE.Mesh(markerGeo, markerMat.clone());
            const pos = latLonToVector3(airport.lat, airport.lng, EARTH_RADIUS);
            marker.position.set(pos.x, pos.y, pos.z);
            marker.userData = { isAirport: true, data: airport };
            globeGroup.add(marker);
            airportMarkers.push(marker);
        });

        window.addEventListener('resize', onWindowResize, false);
        renderer.domElement.addEventListener('click', onMouseClick, false);
    }

    function finishLoading() {
        if (ui.loadingScreen) {
            ui.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                ui.loadingScreen.style.display = 'none';
                if (ui.modal) {
                    ui.modal.style.display = 'flex';
                    ui.modal.classList.remove('hidden');
                }
            }, 600);
        }
        setupEventListeners();
        updateLanguageUI();
    }

    // --- Kickoff ---
    initGlobe();
    animate();
    // --- AUTH LOGIC ---
    function setupAuthListeners() {
        // --- LOGIN ---
        document.getElementById('btn-login-submit')?.addEventListener('click', async () => {
            const id = document.getElementById('login-id').value;
            const pw = document.getElementById('login-pw').value;
            if (!id || !pw) return showToast("Please enter ID and Password");

            try {
                const res = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: id, password: pw })
                });
                const data = await res.json();
                if (res.ok) {
                    showToast(`Welcome back, ${data.name}!`);
                    ui.modalAuthLogin.classList.add('hidden');
                    // Store token or state if needed (not fully spec'd, assuming sessionless or handled by user)
                    // For now just UI feedback
                } else {
                    showToast("Login Failed: " + (data.error || "Unknown"));
                }
            } catch (e) {
                showToast("Login Error: " + e.message);
            }
        });

        // --- REGISTER ---
        let regCode = null; // Verified client-side for now or just UI flow
        // Step 1: Verify Email
        document.getElementById('btn-reg-verify-email')?.addEventListener('click', async () => {
            const email = document.getElementById('reg-email').value;
            if (!email) return showToast("Enter email");

            try {
                const res = await fetch('/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, type: 'register' })
                });
                const data = await res.json();
                if (res.ok) {
                    showToast("Verification code sent to console (simulated)");
                    document.getElementById('reg-verification-area').classList.remove('hidden');
                } else {
                    showToast("Error: " + data.error);
                }
            } catch (e) { showToast("Error: " + e.message); }
        });

        // Step 1b: Confirm Code
        document.getElementById('btn-reg-check-code')?.addEventListener('click', () => {
            const code = document.getElementById('reg-code').value;
            // In a real app we'd verify with server again or just trust the next step includes it
            if (code) {
                showToast("Verified!");
                document.getElementById('register-step-1').classList.add('hidden');
                document.getElementById('register-step-2').classList.remove('hidden');
                regCode = code;
            }
        });

        // Step 2: Finalize
        document.getElementById('btn-reg-submit')?.addEventListener('click', async () => {
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const id = document.getElementById('reg-id').value;
            const pw = document.getElementById('reg-pw').value;
            const pw2 = document.getElementById('reg-pw-confirm').value;

            if (pw !== pw2) return showToast("Passwords do not match");

            try {
                const res = await fetch('/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: id,
                        password: pw,
                        name: name,
                        email: email,
                        code: regCode
                    })
                });
                const data = await res.json();
                if (res.ok) {
                    showToast("Account Created! Please Login.");
                    openAuthModal('modal-auth-login');
                } else {
                    showToast("Register Failed: " + data.error);
                }
            } catch (e) { showToast("Error: " + e.message); }
        });

        // --- FIND ID ---
        document.getElementById('btn-find-id-submit')?.addEventListener('click', async () => {
            const name = document.getElementById('find-id-name').value;
            const email = document.getElementById('find-id-email').value;

            try {
                const res = await fetch('/auth/find-id', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email })
                });
                const data = await res.json();
                if (res.ok) {
                    document.getElementById('find-id-result').classList.remove('hidden');
                    document.getElementById('found-id-display').innerText = data.userId;
                } else {
                    showToast("Not Found: " + data.error);
                }
            } catch (e) { showToast("Error: " + e.message); }
        });

        // --- FIND PW ---
        let resetCode = null;
        document.getElementById('btn-reset-request')?.addEventListener('click', async () => {
            const id = document.getElementById('reset-id').value;
            const email = document.getElementById('reset-email').value;

            try {
                const res = await fetch('/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: id, email, type: 'reset' })
                });
                if (res.ok) {
                    showToast("Code sent to console");
                    document.getElementById('reset-step-1').classList.add('hidden');
                    document.getElementById('reset-step-2').classList.remove('hidden');
                } else {
                    showToast("Error");
                }
            } catch (e) { showToast(e.message); }
        });

        document.getElementById('btn-reset-check-code')?.addEventListener('click', () => {
            const code = document.getElementById('reset-code').value;
            if (code) {
                resetCode = code;
                document.getElementById('reset-step-2').classList.add('hidden');
                document.getElementById('reset-step-3').classList.remove('hidden');
            }
        });

        document.getElementById('btn-reset-submit')?.addEventListener('click', async () => {
            const newPw = document.getElementById('reset-new-pw').value;
            const id = document.getElementById('reset-id').value;

            try {
                const res = await fetch('/auth/find-pw', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: id, newPassword: newPw, code: resetCode })
                });
                if (res.ok) {
                    showToast("Password Reset! Please Login.");
                    openAuthModal('modal-auth-login');
                } else {
                    showToast("Failed");
                }
            } catch (e) { showToast(e.message); }
        });
    }
});
