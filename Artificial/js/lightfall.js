/**
 * Lightfall WebGL Background
 * Converted from React/OGL to Vanilla JS & Three.js
 */

window.initLightfall = function (containerId) {
  if (typeof THREE === 'undefined') {
    console.warn("Three.js is required for Lightfall.");
    return;
  }

  const container = document.getElementById(containerId);
  if (!container) return;

  // Cleanup any existing instance
  if (window._lightfallInstance) {
    window.destroyLightfall();
  }

  // Golden / Fiery "Ember" Colors for the Covenant
  const CONFIG = {
    colors: ['#FFE175', '#D4AF37', '#FF7A00', '#FF3B00'], // Bright gold to deep ember
    backgroundColor: '#050403', // Extremely dark warm void
    speed: 0.5,
    streakCount: 2,
    streakWidth: 1.2,
    streakLength: 1,
    glow: 0.8,
    density: 0.3,
    twinkle: 1.0,
    zoom: 2,
    backgroundGlow: 0.2,
    opacity: 1.0,
    mouseInteraction: true,
    mouseStrength: 0.1, // Reduced from 0.5
    mouseRadius: 0.4,   // Reduced from 1
    mouseDampening: 0.15
  };

  const hexToRGB = hex => {
    const c = hex.replace('#', '').padEnd(6, '0');
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    return new THREE.Vector3(r, g, b);
  };

  const prepColors = input => {
    const arr = [];
    const avg = new THREE.Vector3(0, 0, 0);
    for (let i = 0; i < 8; i++) {
      const c = hexToRGB(input[Math.min(i, input.length - 1)]);
      arr.push(c);
      if (i < input.length) {
        avg.add(c);
      }
    }
    avg.divideScalar(input.length);
    return { arr, count: input.length, avg };
  };

  const { arr, count, avg } = prepColors(CONFIG.colors);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3  iResolution;
    uniform vec2  iMouse;
    uniform float iTime;

    uniform vec3  uColor0;
    uniform vec3  uColor1;
    uniform vec3  uColor2;
    uniform vec3  uColor3;
    uniform vec3  uColor4;
    uniform vec3  uColor5;
    uniform vec3  uColor6;
    uniform vec3  uColor7;
    uniform int   uColorCount;

    uniform vec3  uBgColor;
    uniform vec3  uMouseColor;
    uniform float uSpeed;
    uniform int   uStreakCount;
    uniform float uStreakWidth;
    uniform float uStreakLength;
    uniform float uGlow;
    uniform float uDensity;
    uniform float uTwinkle;
    uniform float uZoom;
    uniform float uBgGlow;
    uniform float uOpacity;
    uniform float uMouseEnabled;
    uniform float uMouseStrength;
    uniform float uMouseRadius;

    varying vec2 vUv;

    vec3 palette(float h) {
      int count = uColorCount;
      if (count < 1) count = 1;
      int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
      if (idx <= 0) return uColor0;
      if (idx == 1) return uColor1;
      if (idx == 2) return uColor2;
      if (idx == 3) return uColor3;
      if (idx == 4) return uColor4;
      if (idx == 5) return uColor5;
      if (idx == 6) return uColor6;
      return uColor7;
    }

    vec3 tanhv(vec3 x) {
      vec3 e = exp(-2.0 * x);
      return (1.0 - e) / (1.0 + e);
    }

    vec2 sceneC(vec2 frag, vec2 r) {
      vec2 P = (frag + frag - r) / r.x;
      float z = 0.0;
      float d = 1e3;
      vec4 O = vec4(0.0);
      for (int k = 0; k < 39; k++) {
        if (d <= 1e-4) break;
        O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
        d = 1.0 - sqrt(length(O * O));
        z += d;
      }
      return vec2(O.x, atan(O.z, O.y));
    }

    void main() {
      // Re-map vUv to gl_FragCoord equivalent
      vec2 C = vUv * iResolution.xy;
      
      vec2 r = iResolution.xy;
      vec2 uv0 = (C + C - r) / r.x;
      float T = 0.1 * iTime * uSpeed + 9.0;
      float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
      vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

      vec2 c0 = sceneC(C, r);
      vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
      vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
      vec2 dCx = cdx - c0;
      vec2 dCy = cdy - c0;
      dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
      dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
      vec2 fw = abs(dCx) + abs(dCy);
      C = c0;

      vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
      vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

      float mGlow = 0.0;
      if (uMouseEnabled > 0.5) {
        vec2 mN = (iMouse + iMouse - r) / r.x;
        float md = length(uv0 - mN);
        mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
        O.rgb += uMouseColor * mGlow * 0.25;
      }

      float zr = 5e-4 * uStreakWidth;
      vec2 rr = vec2(max(length(fw), 1e-5));
      float tail = 19.0 / max(uStreakLength, 0.05);

      for (int m = 0; m < 16; m++) {
        if (m >= uStreakCount) break;
        float jf = float(m) + 1.0;
        float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
        vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
        Pp -= floor(Pp / Y + 0.5) * Y;
        float h = fract(8663.0 * ic);
        vec3 col = palette(h);
        float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
        weight *= (1.0 + mGlow * 2.0);
        vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
        vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
        O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
        C.x += Y.x / 8.0;
      }

      vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
      gl_FragColor = vec4(colr, uOpacity);
    }
  `;

  const uniforms = {
    iResolution: { value: new THREE.Vector3(1, 1, 1) },
    iMouse: { value: new THREE.Vector2(0, 0) },
    iTime: { value: 0 },
    uColor0: { value: arr[0] },
    uColor1: { value: arr[1] },
    uColor2: { value: arr[2] },
    uColor3: { value: arr[3] },
    uColor4: { value: arr[4] },
    uColor5: { value: arr[5] },
    uColor6: { value: arr[6] },
    uColor7: { value: arr[7] },
    uColorCount: { value: count },
    uBgColor: { value: hexToRGB(CONFIG.backgroundColor) },
    uMouseColor: { value: avg },
    uSpeed: { value: CONFIG.speed },
    uStreakCount: { value: Math.max(1, Math.min(16, Math.round(CONFIG.streakCount))) },
    uStreakWidth: { value: CONFIG.streakWidth },
    uStreakLength: { value: CONFIG.streakLength },
    uGlow: { value: CONFIG.glow },
    uDensity: { value: CONFIG.density },
    uTwinkle: { value: CONFIG.twinkle },
    uZoom: { value: CONFIG.zoom },
    uBgGlow: { value: CONFIG.backgroundGlow },
    uOpacity: { value: CONFIG.opacity },
    uMouseEnabled: { value: CONFIG.mouseInteraction ? 1.0 : 0.0 },
    uMouseStrength: { value: CONFIG.mouseStrength },
    uMouseRadius: { value: CONFIG.mouseRadius }
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let mouseTarget = [0, 0];
  let lastTime = 0;
  let rafId;

  function resize() {
    const rect = container.getBoundingClientRect();
    renderer.setSize(rect.width, rect.height);
    const dpr = renderer.getPixelRatio();
    uniforms.iResolution.value.set(rect.width * dpr, rect.height * dpr, 1);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  function onPointerMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    const dpr = renderer.getPixelRatio();
    const x = (e.clientX - rect.left) * dpr;
    const y = (rect.height - (e.clientY - rect.top)) * dpr;
    mouseTarget = [x, y];
    if (CONFIG.mouseDampening <= 0) {
      uniforms.iMouse.value.set(x, y);
    }
  }

  if (CONFIG.mouseInteraction) {
    renderer.domElement.addEventListener('pointermove', onPointerMove);
  }

  const clock = new THREE.Clock();

  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    uniforms.iTime.value = t;

    if (CONFIG.mouseDampening > 0) {
      const dt = t - lastTime;
      lastTime = t;
      const tau = Math.max(1e-4, CONFIG.mouseDampening);
      let factor = 1 - Math.exp(-dt / tau);
      if (factor > 1) factor = 1;

      const curX = uniforms.iMouse.value.x;
      const curY = uniforms.iMouse.value.y;
      uniforms.iMouse.value.set(
        curX + (mouseTarget[0] - curX) * factor,
        curY + (mouseTarget[1] - curY) * factor
      );
    } else {
      lastTime = t;
    }

    renderer.render(scene, camera);
  }

  animate();

  window._lightfallInstance = {
    destroy: () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (CONFIG.mouseInteraction) {
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
      }
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      window._lightfallInstance = null;
    }
  };
};

window.destroyLightfall = function () {
  if (window._lightfallInstance) {
    window._lightfallInstance.destroy();
  }
};
