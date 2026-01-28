import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import planeModelUrl from './B200_LARC_AIR_0824.glb?url';

// --- 3D Plane Helper (Block Style) ---
export function create3DPlane() {
    const group = new THREE.Group();

    const colors = {
        body: 0xffffff,
        cockpit: 0x3b82f6,
        wing: 0xe5e7eb,
        red: 0xef4444,
        dark: 0x374151
    };

    // 1. Body
    const bodyGeo = new THREE.BoxGeometry(0.4, 0.4, 1.8);
    const bodyMat = new THREE.MeshBasicMaterial({ color: colors.body });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // 2. Cockpit
    const cockpitGeo = new THREE.BoxGeometry(0.3, 0.2, 0.5);
    const cockpitMat = new THREE.MeshBasicMaterial({ color: colors.cockpit });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 0.3, 0.3); // Top is at 0.2 + 0.1 = 0.3
    group.add(cockpit);

    // 3. Wings
    const wingGeo = new THREE.BoxGeometry(2.4, 0.04, 0.5); // 4px thickness
    const wingMat = new THREE.MeshBasicMaterial({ color: colors.wing });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0.15, 0.2); // Just below top surface (0.2)
    group.add(wings);

    // 4. Vertical Tail
    const vTailGeo = new THREE.BoxGeometry(0.04, 0.5, 0.4); // 4px thickness
    const vTailMat = new THREE.MeshBasicMaterial({ color: colors.red });
    const vTail = new THREE.Mesh(vTailGeo, vTailMat);
    vTail.position.set(0, 0.45, -0.7); // Backwards
    group.add(vTail);

    // 5. Horizontal Tail
    const hTailGeo = new THREE.BoxGeometry(0.8, 0.04, 0.3); // 4px thickness
    const hTailMat = new THREE.MeshBasicMaterial({ color: colors.red });
    const hTail = new THREE.Mesh(hTailGeo, hTailMat);
    hTail.position.set(0, 0.18, -0.7); // On the tail (near top 0.2)
    group.add(hTail);

    // 6. Propeller Group
    const propGroup = new THREE.Group();
    propGroup.position.set(0, 0, 0.95); // Spinner center point (95px)
    group.add(propGroup);
    group.userData.propeller = propGroup;

    // Spinner
    const spinGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1); // 10px box
    const spinMat = new THREE.MeshBasicMaterial({ color: colors.dark });
    const spinner = new THREE.Mesh(spinGeo, spinMat);
    propGroup.add(spinner);

    // Blades (at 100px, which is +0.05 from Spinner)
    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(0, 0, 0.05); // Offset from Spinner (0.95 + 0.05 = 1.0)
    propGroup.add(bladeGroup);
    group.userData.propeller = bladeGroup; // Direct spin for blades

    const bladeGeo1 = new THREE.BoxGeometry(1.0, 0.08, 0.02); // 100px span, 8px width
    const bladeMat = new THREE.MeshBasicMaterial({ color: colors.dark });
    const blade1 = new THREE.Mesh(bladeGeo1, bladeMat);
    bladeGroup.add(blade1);

    const bladeGeo2 = new THREE.BoxGeometry(0.08, 1.0, 0.02);
    const blade2 = new THREE.Mesh(bladeGeo2, bladeMat);
    bladeGroup.add(blade2);

    // Scale Adjustment
    group.scale.set(0.1, 0.1, 0.1); // Reduced initial scale to avoid "explosion"

    return group;
}

/**
 * Loads the external GLB model and returns a Promise
 */
export function loadPlaneModel() {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        loader.load(
            planeModelUrl,
            (gltf) => {
                const model = gltf.scene;

                // --- Normalize Model ---
                // 1. Center the model (if needed)
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                // 2. Adjust Orientation
                const wrapper = new THREE.Group();
                wrapper.add(model);

                // Rotate 180 degrees so the nose points to +Z (forward)
                model.rotation.y = Math.PI;

                // Scale it to a standard unit size (approx 1.0 - 2.0 range)
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2.0 / maxDim; // Normalize to roughly 2 units long
                model.scale.setScalar(scale);

                // User data for propellers if they exist in GLB
                model.traverse((node) => {
                    if (node.isMesh && (node.name.toLowerCase().includes('prop') || node.name.toLowerCase().includes('fan'))) {
                        node.name = "propeller"; // Standardize name for finding after clone
                    }
                });

                resolve(wrapper);
            },
            undefined,
            (error) => {
                console.error('Error loading GLB model:', error);
                reject(error);
            }
        );
    });
}

// --- Cloud Layer Helper ---
export function createCloudLayer(radius) {
    // Create a slightly larger sphere for clouds
    const cloudGeo = new THREE.SphereGeometry(radius * 1.01, 64, 64);

    // Simple procedural cloud texture using noise or transparency
    // Since we don't have an asset, let's use a semi-transparent material 
    // with a noise-like opacity map functionality if possible, 
    // or just a simple wireframe/noise shader. 
    // For simplicity and nice look without assets: 
    // Use a high-segment sphere with a custom material or just a simple transparent texture if available.
    // Let's use a known cloud texture URL if possible, or create a canvas texture.

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Draw simple noise clouds
    ctx.fillStyle = '#00000000'; // Transparent
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < 300; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const r = Math.random() * 40 + 10;
        ctx.globalAlpha = Math.random() * 0.3 + 0.1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    const cloudMat = new THREE.MeshPhongMaterial({ // Use Phong for better lighting reaction
        map: texture,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });

    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    return clouds;
}

// --- Trail System Helper ---
export function createTrailSystem(maxParticles = 200) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const opacities = new Float32Array(maxParticles);

    // Initialize out of view
    for (let i = 0; i < maxParticles * 3; i++) positions[i] = 0;
    for (let i = 0; i < maxParticles; i++) opacities[i] = 0;

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        transparent: true,
        opacity: 1.0,
        map: (() => {
            const canvas = document.createElement('canvas');
            canvas.width = 32; canvas.height = 32;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255,255,255,1)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);
            return new THREE.CanvasTexture(canvas);
        })(),
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    points.userData = {
        positions: positions,
        opacities: opacities,
        count: 0,
        nextIndex: 0
    };
    return points;
}

// --- Flat Map Helper ---
export function createFlatMapPlane(width = 40, height = 20) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const textureLoader = new THREE.TextureLoader();

    // Use a high-quality Equirectangular Earth map
    // Alternative: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
    const texture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg');
    // Using Night texture to match the theme, or Day texture for contrast?
    // User liked the "Real" look. Let's stick to the Night texture used on Globe for consistency, 
    // OR use a standard map style if they want "Map". 
    // Let's use the Night texture referenced in app.js for consistency.

    // Fix texture wrapping/orientation if needed
    // PlaneGeometry UVs are usually 0,0 to 1,1.
    // Earth textures are usually equirectangular (-180 to 180).
    // So X: 0..1 corresponds to -180..180 Longitude.
    // Y: 0..1 corresponds to 90..-90 Latitude (Top Down).

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(geometry, material);
    // Orient flat on XZ plane
    plane.rotation.x = -Math.PI / 2;

    return plane;
}
