/**
 * Light Rays WebGL Background
 * Converted from React/OGL to Vanilla JS & Three.js
 */

(function () {
  if (typeof THREE === 'undefined') {
    console.warn("Three.js is required for Light Rays.");
    return;
  }

  // Configuration (Golden Rays, Top Center)
  const CONFIG = {
    raysColor: [212 / 255, 175 / 255, 55 / 255], // #D4AF37 Gold
    raysSpeed: 1.0,
    lightSpread: 1.0,
    rayLength: 2.0,
    pulsating: 0.0,
    fadeDistance: 1.0,
    saturation: 1.0,
    mouseInfluence: 0.1,
    noiseAmount: 0.0,
    distortion: 0.0,
    origin: 'top-center'
  };

  const getAnchorAndDir = (origin, w, h) => {
    const outside = 0.2;
    switch (origin) {
      case 'top-left': return { anchor: [0, -outside * h], dir: [0, 1] };
      case 'top-right': return { anchor: [w, -outside * h], dir: [0, 1] };
      case 'left': return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
      case 'right': return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
      case 'bottom-left': return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
      case 'bottom-center': return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
      case 'bottom-right': return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
      default: return { anchor: [0.5 * w, -outside * h], dir: [0, 1] }; // top-center
    }
  };

  function initLightRays() {
    const canvas = document.getElementById('raysCanvas');
    if (!canvas) return;

    // Set up WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    // We use an OrthographicCamera to render a 2D plane covering exactly the screen
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Shaders
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float iTime;
      uniform vec2  iResolution;

      uniform vec2  rayPos;
      uniform vec2  rayDir;
      uniform vec3  raysColor;
      uniform float raysSpeed;
      uniform float lightSpread;
      uniform float rayLength;
      uniform float pulsating;
      uniform float fadeDistance;
      uniform float saturation;
      uniform vec2  mousePos;
      uniform float mouseInfluence;
      uniform float noiseAmount;
      uniform float distortion;

      varying vec2 vUv;

      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                        float seedA, float seedB, float speed) {
        vec2 sourceToCoord = coord - raySource;
        vec2 dirNorm = normalize(sourceToCoord);
        float cosAngle = dot(dirNorm, rayRefDirection);

        float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
        
        float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

        float distance = length(sourceToCoord);
        float maxDistance = iResolution.x * rayLength;
        float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
        
        float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
        float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

        float baseStrength = clamp(
          (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
          (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
          0.0, 1.0
        );

        return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
      }

      void main() {
        // Normalize coordinates like OGL did: fragCoord.x, iResolution.y - fragCoord.y
        vec2 coord = vec2(vUv.x * iResolution.x, (1.0 - vUv.y) * iResolution.y);
        
        vec2 finalRayDir = rayDir;
        if (mouseInfluence > 0.0) {
          vec2 mouseScreenPos = mousePos * iResolution.xy;
          vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
          finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
        }

        vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
        vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);

        vec4 fragColor = rays1 * 0.5 + rays2 * 0.4;

        if (noiseAmount > 0.0) {
          float n = noise(coord * 0.01 + iTime * 0.1);
          fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
        }

        float brightness = 1.0 - (coord.y / iResolution.y);
        fragColor.x *= 0.1 + brightness * 0.8;
        fragColor.y *= 0.3 + brightness * 0.6;
        fragColor.z *= 0.5 + brightness * 0.5;

        if (saturation != 1.0) {
          float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
          fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
        }

        fragColor.rgb *= raysColor;
        gl_FragColor = fragColor;
      }
    `;

    // Uniforms mapping
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      rayPos: { value: new THREE.Vector2(0, 0) },
      rayDir: { value: new THREE.Vector2(0, 1) },
      raysColor: { value: new THREE.Vector3(...CONFIG.raysColor) },
      raysSpeed: { value: CONFIG.raysSpeed },
      lightSpread: { value: CONFIG.lightSpread },
      rayLength: { value: CONFIG.rayLength },
      pulsating: { value: CONFIG.pulsating },
      fadeDistance: { value: CONFIG.fadeDistance },
      saturation: { value: CONFIG.saturation },
      mousePos: { value: new THREE.Vector2(0.5, 0.5) },
      mouseInfluence: { value: CONFIG.mouseInfluence },
      noiseAmount: { value: CONFIG.noiseAmount },
      distortion: { value: CONFIG.distortion }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending // Screen/Additive mode looks great for rays
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse Tracking
    let targetMouse = { x: 0.5, y: 0.5 };
    let smoothMouse = { x: 0.5, y: 0.5 };

    window.addEventListener('mousemove', (e) => {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = e.clientY / window.innerHeight;
    });

    // Resize Handler
    function resize() {
      const wCSS = window.innerWidth;
      const hCSS = window.innerHeight;
      renderer.setSize(wCSS, hCSS);

      const dpr = renderer.getPixelRatio();
      const w = wCSS * dpr;
      const h = hCSS * dpr;

      uniforms.iResolution.value.set(w, h);

      const { anchor, dir } = getAnchorAndDir(CONFIG.origin, w, h);
      uniforms.rayPos.value.set(anchor[0], anchor[1]);
      uniforms.rayDir.value.set(dir[0], dir[1]);
    }
    window.addEventListener('resize', resize);
    resize(); // Initial call

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const t = clock.getElapsedTime();
      uniforms.iTime.value = t;

      // Smooth mouse interpolation
      if (CONFIG.mouseInfluence > 0.0) {
        const smoothing = 0.92;
        smoothMouse.x = smoothMouse.x * smoothing + targetMouse.x * (1 - smoothing);
        smoothMouse.y = smoothMouse.y * smoothing + targetMouse.y * (1 - smoothing);
        uniforms.mousePos.value.set(smoothMouse.x, smoothMouse.y);
      }

      renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
  }

  // Auto-init on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightRays);
  } else {
    initLightRays();
  }

})();
