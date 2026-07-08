/* ===========================================================
   THE LANDS BETWEEN — WebGL Galaxy Background Wrapper
   Vanilla JS implementation replicating the React Bits Galaxy.
   Features:
     - Spiral galaxy geometry (2 arms, core to arm tip)
     - Soft golden/amber/white faint particles (high contrast)
     - Twinkling stars (random phase sine wave scaling)
     - Smooth mouse repulsion/elastic return
     - Window resizing & device pixel ratio support
   =========================================================== */

(function () {
  'use strict';

  const canvas = document.getElementById('galaxyCanvas');
  if (!canvas || !window.THREE) return;

  // Configuration options (Subtle, faint, high dark contrast)
  const options = {
    density: 2200,            // Number of star particles
    starSpeed: 0.06,          // Speed of orbital movement
    rotationSpeed: 0.04,      // Automatic galaxy rotation speed
    twinkleIntensity: 0.25,   // Flicker amount (0 = none, 1 = max)
    hueShift: 32,             // Warm gold/amber base color (in degrees)
    saturation: 0.5,          // Color saturation (0 = grey, 1 = colorful)
    mouseInteraction: true,
    mouseRepulsion: true,
    repulsionStrength: 1.8,   // Cursor push force
    repulsionRadius: 160,     // Repulsion radius in pixels
  };

  let renderer, scene, camera;
  let starGeometry, starMaterial, starPoints;
  let positions, originalPositions, velocities, colors, twinklePhases;
  
  // Mouse state
  const mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999 };

  function init() {
    // 1. Setup Three.js render context
    scene = new THREE.Scene();
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Orthographic camera for flat 2D background depth
    camera = new THREE.OrthographicCamera(
      width / -2, width / 2,
      height / 2, height / -2,
      1, 1000
    );
    camera.position.z = 100;

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Generate Galaxy Particles
    generateGalaxy(width, height);

    // 3. Bind Events
    window.addEventListener('resize', onWindowResize);
    if (options.mouseInteraction) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseleave', onMouseLeave);
    }

    animate();
  }

  function generateGalaxy(width, height) {
    const count = options.density;
    
    // Geometry attributes
    positions = new Float32Array(count * 3);
    originalPositions = new Float32Array(count * 3);
    velocities = new Float32Array(count);
    colors = new Float32Array(count * 3);
    twinklePhases = new Float32Array(count);

    const radiusLimit = Math.min(width, height) * 0.45;
    const numArms = 2;

    for (let i = 0; i < count; i++) {
      // Spiral math
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 2.2) * radiusLimit; // core concentration
      const armIndex = i % numArms;
      const angle = (armIndex / numArms) * Math.PI * 2 + (r / radiusLimit) * 3.5;

      // Random dispersion
      const spreadX = (Math.random() - 0.5) * (38 + r * 0.12);
      const spreadY = (Math.random() - 0.5) * (38 + r * 0.12);

      const x = Math.cos(angle) * r + spreadX;
      const y = Math.sin(angle) * r + spreadY;
      const z = 0; // Flat background

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      originalPositions[i3] = x;
      originalPositions[i3 + 1] = y;
      originalPositions[i3 + 2] = z;

      // Speed relative to distance (Keplerian-ish rotation)
      velocities[i] = (0.2 + (1 - r / radiusLimit) * 0.8) * options.starSpeed;

      // Twinkle phase offset
      twinklePhases[i] = Math.random() * Math.PI * 2;

      // Star Color (Golden Core to Warm Amber edges)
      const colorRatio = r / radiusLimit;
      const h = (options.hueShift + colorRatio * 15) / 360;
      const s = options.saturation;
      
      // Core is bright golden white, tips are faint amber/reddish
      const l = 0.5 + (1 - colorRatio) * 0.45; 
      const color = new THREE.Color().setHSL(h, s, l);

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom shader material for beautiful circular particles with soft edges and twinkling opacity mapping
    starMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        time: { value: 0 },
        twinkleIntensity: { value: options.twinkleIntensity }
      },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Softly scale size based on distance from core (implied by color brightness)
          gl_PointSize = (1.5 + color.r * 1.5) * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float time;
        uniform float twinkleIntensity;
        
        void main() {
          // Circular particle shape
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          // Soft gradient falloff
          float strength = 1.0 - (dist * 2.0);
          strength = pow(strength, 1.5);

          // Twinkle effect modulation
          float t = time * 2.5;
          float flicker = 1.0 - (sin(t) * 0.5 + 0.5) * twinkleIntensity;

          // Extremely faint base opacity for subtle atmospheric effect
          gl_FragColor = vec4(vColor, strength * 0.38 * flicker);
        }
      `
    });

    starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);
  }

  function animate(ts) {
    requestAnimationFrame(animate);

    const time = ts ? ts * 0.001 : 0;
    starMaterial.uniforms.time.value = time;

    // Automatic galaxy rotation
    starPoints.rotation.z = time * options.rotationSpeed * 0.05;

    // Particle update loop (Rotational movement & Mouse Repulsion)
    const posAttr = starGeometry.getAttribute('position');
    const posArray = posAttr.array;
    const count = options.density;

    // Convert mouse screen coordinates to Orthographic Camera world coordinates
    let mx = -9999;
    let my = -9999;
    
    // Smooth mouse coordinates
    if (mouse.targetX !== -9999) {
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;
      mx = mouse.x;
      my = mouse.y;
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // 1. Calculate Orbit Rotation
      let x = originalPositions[i3];
      let y = originalPositions[i3 + 1];
      
      const speed = velocities[i];
      const cosVal = Math.cos(speed * 0.03);
      const sinVal = Math.sin(speed * 0.03);
      
      // Update original coordinates orbitally
      const newX = x * cosVal - y * sinVal;
      const newY = x * sinVal + y * cosVal;
      
      originalPositions[i3] = newX;
      originalPositions[i3 + 1] = newY;

      // 2. Mouse Repulsion Calculation
      let finalX = newX;
      let finalY = newY;

      if (options.mouseRepulsion && mx !== -9999) {
        const dx = finalX - mx;
        const dy = finalY - my;
        const distSq = dx * dx + dy * dy;
        const rSq = options.repulsionRadius * options.repulsionRadius;

        if (distSq < rSq) {
          const dist = Math.sqrt(distSq);
          const force = (1.0 - dist / options.repulsionRadius) * options.repulsionStrength;
          
          // Repel offset
          finalX += (dx / (dist || 1)) * force * 15;
          finalY += (dy / (dist || 1)) * force * 15;
        }
      }

      // Smoothly update current position towards target position
      posArray[i3] += (finalX - posArray[i3]) * 0.12;
      posArray[i3 + 1] += (finalY - posArray[i3 + 1]) * 0.12;
    }

    posAttr.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function onMouseMove(e) {
    // Map screen mouse pos to orthographic dimensions centered at (0, 0)
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    mouse.targetX = clientX - rect.width / 2;
    mouse.targetY = -(clientY - rect.height / 2); // invert Y for WebGL coords
  }

  function onMouseLeave() {
    mouse.targetX = -9999;
    mouse.targetY = -9999;
  }

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.left = width / -2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = height / -2;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  }

  init();

})();
