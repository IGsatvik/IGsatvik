/* ================================================================
   NEXUS — main.js
   Three.js scene, GSAP ScrollTrigger camera path,
   loading sequence, contact form, and CSS particle spawner.
   
   Depends on (loaded via CDN in index.html):
     · THREE  (three.js r134)
     · gsap   (GSAP 3.12.5)
     · ScrollTrigger (GSAP plugin)
================================================================ */

/* ============================================================
   1. RENDERER + SCENE + CAMERA
============================================================ */
const canvas   = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x050510, 1);
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();
scene.fog   = new THREE.FogExp2(0x050510, 0.022);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 2, 18);
camera.lookAt(0, 0, 0);

/* ============================================================
   2. LIGHTING
============================================================ */
scene.add(new THREE.AmbientLight(0x0a0a2a, 4));

// Cyan point light — orbits the scene
const ptA = new THREE.PointLight(0x00f5ff, 8, 100);
ptA.position.set(0, 10, 10);
scene.add(ptA);

// Purple point light
const ptB = new THREE.PointLight(0xa855f7, 5, 100);
ptB.position.set(-15, -5, -10);
scene.add(ptB);

// Pink point light
const ptC = new THREE.PointLight(0xf472b6, 4, 80);
ptC.position.set(15, 5, -20);
scene.add(ptC);

// Static directional light for clarity
const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

/* ============================================================
   3. CENTRAL CRYSTAL CLUSTER
============================================================ */
const crystalGroup = new THREE.Group();
scene.add(crystalGroup);

// Main octahedron
const mainGeo    = new THREE.OctahedronGeometry(2.5, 1);
const mainMat    = new THREE.MeshPhongMaterial({
  color:       0x00f5ff,
  emissive:    0x003344,
  specular:    0xffffff,
  shininess:   200,
  transparent: true,
  opacity:     0.82,
});
const mainCrystal = new THREE.Mesh(mainGeo, mainMat);
crystalGroup.add(mainCrystal);

// Wire overlay on main crystal
const wireMat = new THREE.MeshBasicMaterial({
  color:       0x00f5ff,
  wireframe:   true,
  transparent: true,
  opacity:     0.14,
});
crystalGroup.add(new THREE.Mesh(mainGeo, wireMat));

// Inner pulsing core sphere
const innerGeo    = new THREE.SphereGeometry(1.2, 32, 32);
const innerMat    = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.3 });
const innerSphere = new THREE.Mesh(innerGeo, innerMat);
crystalGroup.add(innerSphere);

// ── Orbiting Rings ──
function makeRing(radius, tube, color, rotX, rotY) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 6, 64),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 })
  );
  mesh.rotation.x = rotX;
  mesh.rotation.y = rotY;
  return mesh;
}
const ring1 = makeRing(3.6, 0.022, 0x00f5ff, Math.PI * 0.3, 0);
const ring2 = makeRing(4.3, 0.016, 0xa855f7, Math.PI * 0.7, Math.PI * 0.2);
const ring3 = makeRing(3.9, 0.012, 0xf472b6, Math.PI * 0.5, Math.PI * 0.5);
crystalGroup.add(ring1, ring2, ring3);

/* ============================================================
   4. SATELLITE CRYSTALS (12 scattered objects)
============================================================ */
const satelliteGroup = new THREE.Group();
scene.add(satelliteGroup);

/**
 * @typedef {{ p: number[], s: number, c: number, e: number }} SatData
 * p = [x,y,z]  s = scale  c = color  e = emissive
 */
const satelliteData = [
  { p: [ 6,  1,  -2], s: 0.9, c: 0xa855f7, e: 0x2d0050 },
  { p: [-5, -1,  -3], s: 1.2, c: 0x00f5ff, e: 0x003344 },
  { p: [ 3, -3,   4], s: 0.7, c: 0xf472b6, e: 0x500038 },
  { p: [-4,  3,   2], s: 1.0, c: 0x3b82f6, e: 0x001050 },
  { p: [ 7, -2,  -8], s: 1.5, c: 0xa855f7, e: 0x2d0050 },
  { p: [-8,  1,  -6], s: 1.1, c: 0x00f5ff, e: 0x003344 },
  { p: [ 2,  5, -10], s: 0.8, c: 0xf472b6, e: 0x500038 },
  { p: [-3, -4, -12], s: 1.3, c: 0x3b82f6, e: 0x001050 },
  { p: [10,  0, -15], s: 1.6, c: 0x00f5ff, e: 0x003344 },
  { p: [-10, 3, -18], s: 1.0, c: 0xa855f7, e: 0x2d0050 },
  { p: [ 1, -6, -20], s: 0.9, c: 0xf472b6, e: 0x500038 },
  { p: [-5,  6, -22], s: 1.4, c: 0x3b82f6, e: 0x001050 },
];

const satellites = [];

satelliteData.forEach((d, i) => {
  // Alternate geometry types for visual variety
  const geo = i % 3 === 0 ? new THREE.OctahedronGeometry(d.s, 0)
            : i % 3 === 1 ? new THREE.TetrahedronGeometry(d.s, 0)
                          : new THREE.IcosahedronGeometry(d.s * 0.8, 0);

  const mat  = new THREE.MeshPhongMaterial({
    color: d.c, emissive: d.e,
    specular: 0xffffff, shininess: 150,
    transparent: true, opacity: 0.8,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...d.p);
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

  // Wire overlay
  mesh.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    color: d.c, wireframe: true, transparent: true, opacity: 0.18,
  })));

  satelliteGroup.add(mesh);
  satellites.push(mesh);
});

/* ============================================================
   5. BACKGROUND WIREFRAME OBJECTS
============================================================ */
const bgGroup = new THREE.Group();
scene.add(bgGroup);

const bgColors = [0x00f5ff22, 0xa855f722, 0xf472b622, 0x3b82f622];

for (let i = 0; i < 35; i++) {
  const size = 0.2 + Math.random() * 0.55;
  const geo  = new THREE.IcosahedronGeometry(size, 0);
  const mat  = new THREE.MeshBasicMaterial({
    color: bgColors[i % 4], wireframe: true, transparent: true, opacity: 0.35,
  });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(
    (Math.random() - 0.5) * 50,
    (Math.random() - 0.5) * 25,
    -8 - Math.random() * 45
  );
  m.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0);
  bgGroup.add(m);
}

/* ============================================================
   6. PARTICLE STAR FIELDS
============================================================ */
/**
 * Creates a Points mesh with randomly scattered vertices.
 * @param {number} count   Number of particles
 * @param {number} spread  Bounding cube half-size
 * @param {number} color   Hex color
 * @param {number} size    Particle size (world units)
 */
function makeParticles(count, spread, color, size) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({
    color, size, transparent: true, opacity: 0.7, sizeAttenuation: true,
  }));
}

const starsA = makeParticles(900,  90,  0xffffff, 0.06); // white foreground
const starsB = makeParticles(2000, 220, 0xa5f3fc, 0.04); // cyan distant
const starsC = makeParticles(400,  60,  0xe879f9, 0.09); // pink accent
scene.add(starsA, starsB, starsC);

/* ============================================================
   7. GRID FLOOR
============================================================ */
const grid = new THREE.GridHelper(100, 30, 0x00f5ff11, 0x00f5ff11);
grid.position.y = -9;
scene.add(grid);

/* ============================================================
   8. CAMERA WAYPOINTS
   5 cinematic stops the camera travels through on scroll.
   Each has a position (pos) and a look-at target (tgt).
============================================================ */
const waypoints = [
  { pos: new THREE.Vector3( 0,  2,  18), tgt: new THREE.Vector3( 0,  0,   0) }, // 0 Hero
  { pos: new THREE.Vector3(-8,  3,   8), tgt: new THREE.Vector3( 0,  0,   0) }, // 1 About
  { pos: new THREE.Vector3(10, -2,   2), tgt: new THREE.Vector3( 0,  1,  -5) }, // 2 Features
  { pos: new THREE.Vector3(-2,  8,  -5), tgt: new THREE.Vector3( 0,  0, -15) }, // 3 Data
  { pos: new THREE.Vector3( 0, -1, -20), tgt: new THREE.Vector3( 0,  2, -30) }, // 4 Contact
];

/* ============================================================
   9. GSAP + SCROLLTRIGGER — Camera Path Animation
============================================================ */
gsap.registerPlugin(ScrollTrigger);

// Plain objects used as GSAP tween targets (avoids direct THREE mutation)
const camPos = { x: waypoints[0].pos.x, y: waypoints[0].pos.y, z: waypoints[0].pos.z };
const camTgt = { x: waypoints[0].tgt.x, y: waypoints[0].tgt.y, z: waypoints[0].tgt.z };

/** Syncs the Three.js camera from the plain camPos / camTgt proxies. */
function applyCamera() {
  camera.position.set(camPos.x, camPos.y, camPos.z);
  camera.lookAt(camTgt.x, camTgt.y, camTgt.z);
}

// Build master timeline — one "chapter" per waypoint transition
const masterTl = gsap.timeline({
  scrollTrigger: {
    trigger: '#scroll-container',
    start:   'top top',
    end:     'bottom bottom',
    scrub:   1.8,
    onUpdate(self) {
      // Update top progress bar
      document.getElementById('progress-bar').style.width = (self.progress * 100) + '%';

      // Highlight the matching chapter dot
      const activeChapter = Math.min(
        Math.floor(self.progress * waypoints.length),
        waypoints.length - 1
      );
      document.querySelectorAll('.chapter-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === activeChapter);
      });
    },
  },
});

for (let i = 1; i < waypoints.length; i++) {
  const wp = waypoints[i];
  // Camera position tween
  masterTl.to(camPos, {
    x: wp.pos.x, y: wp.pos.y, z: wp.pos.z,
    ease: 'power2.inOut', duration: 1,
    onUpdate: applyCamera,
  }, i - 1);
  // Look-at target tween (runs in parallel)
  masterTl.to(camTgt, {
    x: wp.tgt.x, y: wp.tgt.y, z: wp.tgt.z,
    ease: 'power2.inOut', duration: 1,
  }, i - 1);
}

/* ============================================================
   10. PANEL SCROLL REVEALS
============================================================ */
const sectionEls = document.querySelectorAll('[data-section]');

['panel-1', 'panel-2', 'panel-3', 'panel-4'].forEach((id, i) => {
  const el = document.getElementById(id);
  ScrollTrigger.create({
    trigger:     sectionEls[i + 1],
    start:       'top 60%',
    end:         'bottom 40%',
    onEnter:     () => gsap.to(el, { opacity: 1, y: 0,   duration: 0.9, ease: 'power3.out' }),
    onLeave:     () => gsap.to(el, { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in'  }),
    onEnterBack: () => gsap.to(el, { opacity: 1, y: 0,   duration: 0.9, ease: 'power3.out' }),
    onLeaveBack: () => gsap.to(el, { opacity: 0, y: 40,  duration: 0.5, ease: 'power2.in'  }),
  });
});

// Hero title — fades up and out as the user starts scrolling
ScrollTrigger.create({
  trigger: '#scroll-container',
  start:   'top top',
  end:     '15% top',
  scrub:   true,
  onUpdate(self) {
    const el = document.getElementById('hero-title');
    el.style.opacity   = Math.max(0, 1 - self.progress * 1.5);
    el.style.transform = `translate(-50%, calc(-50% - ${self.progress * 70}px))`;
  },
});

// Scroll hint — hide once user begins scrolling
ScrollTrigger.create({
  trigger:     '#scroll-container',
  start:       '5% top',
  onEnter:     () => document.getElementById('scroll-hint').classList.add('hidden'),
  onLeaveBack: () => document.getElementById('scroll-hint').classList.remove('hidden'),
});

/* ============================================================
   11. NAV — Scroll to Section
   Called by onclick attributes in index.html
============================================================ */
function scrollToSection(index) {
  const totalScroll = document.getElementById('scroll-container').scrollHeight - window.innerHeight;
  const targetY     = (index / (waypoints.length - 1)) * totalScroll;
  window.scrollTo({ top: targetY, behavior: 'smooth' });
}

// Expose to global scope (needed for inline onclick in HTML)
window.scrollToSection = scrollToSection;

/* ============================================================
   12. ANIMATION LOOP
============================================================ */
const clock = new THREE.Clock();

(function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // ── Central crystal slow rotation ──
  crystalGroup.rotation.y = t * 0.14;
  crystalGroup.rotation.x = Math.sin(t * 0.1) * 0.14;

  // ── Rings spin at different rates ──
  ring1.rotation.z =  t * 0.30;
  ring2.rotation.z = -t * 0.22;
  ring3.rotation.x =  t * 0.26;

  // ── Inner sphere pulse ──
  const pulse = 0.9 + Math.sin(t * 2.6) * 0.1;
  innerSphere.scale.setScalar(pulse);
  innerMat.opacity = 0.18 + Math.sin(t * 2.6) * 0.15;

  // ── Satellite crystals: spin + gentle vertical float ──
  satellites.forEach((mesh, i) => {
    mesh.rotation.x += 0.003 + i * 0.0004;
    mesh.rotation.y += 0.004 + i * 0.0003;
    mesh.position.y += Math.sin(t * 0.5 + i * 1.3) * 0.003;
  });

  // ── Background wireframes slow spin ──
  bgGroup.children.forEach((mesh, i) => {
    mesh.rotation.x += 0.001;
    mesh.rotation.y += 0.002 + i * 0.0001;
  });

  // ── Star fields gentle drift ──
  starsA.rotation.y =  t * 0.005;
  starsB.rotation.y = -t * 0.003;
  starsC.rotation.x =  t * 0.004;

  // ── Lights orbit around origin ──
  ptA.position.x = Math.sin(t * 0.28) * 14;
  ptA.position.z = Math.cos(t * 0.28) * 14;
  ptB.position.x = Math.cos(t * 0.35) * 11;
  ptB.position.z = Math.sin(t * 0.35) * 11;

  renderer.render(scene, camera);
})();

/* ============================================================
   13. WINDOW RESIZE
============================================================ */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/* ============================================================
   14. LOADING SEQUENCE
============================================================ */
const loadingMessages = [
  'INITIALIZING SCENE',
  'BUILDING CRYSTAL NODES',
  'CALIBRATING CAMERA PATH',
  'SYNCHRONIZING SCROLL',
  'LAUNCHING NEXUS',
];

let loadProgress = 0;

const loadBar    = document.getElementById('loading-bar');
const loadText   = document.getElementById('loading-text');
const loadScreen = document.getElementById('loading-screen');
const heroTitle  = document.getElementById('hero-title');

const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 20 + 4;
  if (loadProgress > 100) loadProgress = 100;

  loadBar.style.width  = loadProgress + '%';
  loadText.textContent = loadingMessages[
    Math.min(Math.floor((loadProgress / 100) * loadingMessages.length), loadingMessages.length - 1)
  ];

  if (loadProgress >= 100) {
    clearInterval(loadInterval);

    setTimeout(() => {
      gsap.to(loadScreen, {
        opacity:  0,
        duration: 0.8,
        ease:     'power2.inOut',
        onComplete() {
          loadScreen.style.display = 'none';

          // Reveal hero title with staggered entrance
          gsap.to(heroTitle, { opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.15 });
          gsap.from(heroTitle.querySelector('.hero-main'), { y: 50, duration: 1.3, ease: 'power3.out', delay: 0.15 });
          gsap.from(heroTitle.querySelector('.hero-sub'),  { y: 25, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.45 });
        },
      });
    }, 350);
  }
}, 110);

/* ============================================================
   15. CONTACT FORM SUBMIT HANDLER
   Called by onclick attribute in index.html
============================================================ */
function handleContactSubmit(btn) {
  btn.innerHTML    = '✓&nbsp;&nbsp;Signal Transmitted';
  btn.style.borderColor = '#00f5ff';
  btn.style.boxShadow   = '0 0 20px rgba(0,245,255,0.3)';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML         = 'Transmit Signal <span class="cta-arrow">→</span>';
    btn.style.borderColor = '';
    btn.style.boxShadow   = '';
    btn.disabled          = false;
  }, 3000);
}

// Expose to global scope
window.handleContactSubmit = handleContactSubmit;

/* ============================================================
   16. CSS FLOATING PARTICLES
   Spawns glowing DOM dots that float upward for ambience.
============================================================ */
const particleColors = ['#00f5ff', '#a855f7', '#f472b6', '#3b82f6'];

function spawnCSSParticle() {
  const el  = document.createElement('div');
  el.className = 'css-particle';

  const size     = 2 + Math.random() * 4;
  const color    = particleColors[Math.floor(Math.random() * particleColors.length)];
  const duration = 7 + Math.random() * 8;
  const drift    = (Math.random() - 0.5) * 140;

  el.style.cssText = `
    width:            ${size}px;
    height:           ${size}px;
    background:       ${color};
    left:             ${Math.random() * 100}vw;
    bottom:           0;
    box-shadow:       0 0 ${size * 2}px ${color};
    --drift:          ${drift}px;
    animation-duration: ${duration}s;
    animation-delay:  ${Math.random() * 2}s;
  `;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), (duration + 3) * 1000);
}

setInterval(spawnCSSParticle, 650);
