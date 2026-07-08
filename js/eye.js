/* ===========================================================
   THE LANDS BETWEEN — WebGL Evil Eye Background
   Vanilla JS raw WebGL implementation replicating the React/OGL Evil Eye.
   Features:
     - Pure WebGL 1.0 context setup with zero dependencies
     - Custom procedural fractal noise texture generator
     - Gold theme color (#d4af37) matching the site aesthetic
     - Zoomed-in scale (uScale = 1.3) for an imposing look
     - Smooth mouse-tracking pupil offset
     - Responsive canvas resizing
   =========================================================== */

(function () {
  'use strict';

  const canvas = document.getElementById('eyeCanvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) {
    console.error("WebGL not supported in this browser.");
    return;
  }

  // Set transparent WebGL background
  gl.clearColor(0, 0, 0, 0);

  // Configuration options (matching the theme color and larger scale)
  const config = {
    eyeColor: '#d4af37',      // Lands Between signature gold
    backgroundColor: '#070605', // Deep space-void black
    scale: 0.7,               // Smaller, subtle background presence
    intensity: 0.6,           // Dimmed so text stays readable
    pupilSize: 0.6,
    irisWidth: 0.25,
    glowIntensity: 0.15,      // Faint ambient glow
    noiseScale: 1.0,
    pupilFollow: 2.0,
    flameSpeed: 1.0
  };

  // Convert Hex color string to normalized Vec3
  function hexToVec3(hex) {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255
    ];
  }

  // --- 1. PROCEDURAL NOISE GENERATION ---
  function generateNoiseTexture(size = 256) {
    const data = new Uint8Array(size * size * 4);

    function hash(x, y, s) {
      let n = x * 374761393 + y * 668265263 + s * 1274126177;
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    }

    function noise(px, py, freq, seed) {
      const fx = (px / size) * freq;
      const fy = (py / size) * freq;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const tx = fx - ix;
      const ty = fy - iy;
      const w = freq | 0;
      const v00 = hash(((ix % w) + w) % w, ((iy % w) + w) % w, seed);
      const v10 = hash((((ix + 1) % w) + w) % w, ((iy % w) + w) % w, seed);
      const v01 = hash(((ix % w) + w) % w, (((iy + 1) % w) + w) % w, seed);
      const v11 = hash((((ix + 1) % w) + w) % w, (((iy + 1) % w) + w) % w, seed);
      return v00 * (1 - tx) * (1 - ty) + v10 * tx * (1 - ty) + v01 * (1 - tx) * ty + v11 * tx * ty;
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let v = 0;
        let amp = 0.4;
        let totalAmp = 0;
        for (let o = 0; o < 8; o++) {
          const f = 32 * (1 << o);
          v += amp * noise(x, y, f, o * 31);
          totalAmp += amp;
          amp *= 0.65;
        }
        v /= totalAmp;
        v = (v - 0.5) * 2.2 + 0.5;
        v = Math.max(0, Math.min(1, v));
        const val = Math.round(v * 255);
        const i = (y * size + x) * 4;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 255;
      }
    }
    return data;
  }

  // --- 2. SHADER CODES ---
  const vertexShaderSrc = `
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSrc = `
    precision highp float;

    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uResolution;
    uniform sampler2D uNoiseTexture;
    uniform float uPupilSize;
    uniform float uIrisWidth;
    uniform float uGlowIntensity;
    uniform float uIntensity;
    uniform float uScale;
    uniform float uNoiseScale;
    uniform vec2 uMouse;
    uniform float uPupilFollow;
    uniform float uFlameSpeed;
    uniform vec3 uEyeColor;
    uniform vec3 uBgColor;

    void main() {
      // Coordinate space normalized centered at (0,0)
      vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution.xy) / uResolution.y;
      uv /= uScale;
      float ft = uTime * uFlameSpeed;

      float polarRadius = length(uv) * 2.0;
      float polarAngle = (2.0 * atan(uv.x, uv.y)) / 6.28 * 0.3;
      vec2 polarUv = vec2(polarRadius, polarAngle);

      vec4 noiseA = texture2D(uNoiseTexture, polarUv * vec2(0.2, 7.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));
      vec4 noiseB = texture2D(uNoiseTexture, polarUv * vec2(0.3, 4.0) * uNoiseScale + vec2(-ft * 0.2, 0.0));
      vec4 noiseC = texture2D(uNoiseTexture, polarUv * vec2(0.1, 5.0) * uNoiseScale + vec2(-ft * 0.1, 0.0));

      float distanceMask = 1.0 - length(uv);

      // Inner ring
      float innerRing = clamp(-1.0 * ((distanceMask - 0.7) / uIrisWidth), 0.0, 1.0);
      innerRing = (innerRing * distanceMask - 0.2) / 0.28;
      innerRing += noiseA.r - 0.5;
      innerRing *= 1.3;
      innerRing = clamp(innerRing, 0.0, 1.0);

      float outerRing = clamp(-1.0 * ((distanceMask - 0.5) / 0.2), 0.0, 1.0);
      outerRing = (outerRing * distanceMask - 0.1) / 0.38;
      outerRing += noiseC.r - 0.5;
      outerRing *= 1.3;
      outerRing = clamp(outerRing, 0.0, 1.0);

      innerRing += outerRing;

      // Inner eye flames
      float innerEye = distanceMask - 0.1 * 2.0;
      innerEye *= noiseB.r * 2.0;

      // Pupil with smooth cursor tracking
      vec2 pupilOffset = uMouse * uPupilFollow * 0.12;
      vec2 pupilUv = uv - pupilOffset;
      float pupil = 1.0 - length(pupilUv * vec2(9.0, 2.3));
      pupil *= uPupilSize;
      pupil = clamp(pupil, 0.0, 1.0);
      pupil /= 0.35;

      // Outer eye geometry
      float outerEyeGlow = 1.0 - length(uv * vec2(0.5, 1.5));
      outerEyeGlow = clamp(outerEyeGlow + 0.5, 0.0, 1.0);
      outerEyeGlow += noiseC.r - 0.5;
      float outerBgGlow = outerEyeGlow;
      outerEyeGlow = pow(outerEyeGlow, 2.0);
      outerEyeGlow += distanceMask;
      outerEyeGlow *= uGlowIntensity;
      outerEyeGlow = clamp(outerEyeGlow, 0.0, 1.0);
      outerEyeGlow *= pow(1.0 - distanceMask, 2.0) * 2.5;

      // Outer eye ambient background glow
      outerBgGlow += distanceMask;
      outerBgGlow = pow(outerBgGlow, 0.5);
      outerBgGlow *= 0.15;

      vec3 color = uEyeColor * uIntensity * clamp(max(innerRing + innerEye, outerEyeGlow + outerBgGlow) - pupil, 0.0, 3.0);
      color += uBgColor;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // --- 3. WEBGL SETUP UTILS ---
  function compileShader(src, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compiling error: " + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
  const fs = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("WebGL program link error: " + gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // --- 4. GEOMETRY BUFFERS ---
  // A single large triangle covering the normalized device coordinates:
  // Coordinates: (-1, -1), (3, -1), (-1, 3)
  // UV: (0, 0), (2, 0), (0, 2)
  const vertices = new Float32Array([
    -1.0, -1.0, 0.0, 0.0,
    3.0, -1.0, 2.0, 0.0,
    -1.0, 3.0, 0.0, 2.0
  ]);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const positionLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 16, 0);

  const uvLoc = gl.getAttribLocation(program, 'uv');
  gl.enableVertexAttribArray(uvLoc);
  gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8);

  // --- 5. PROCEDURAL TEXTURE LOADING ---
  const noiseSize = 256;
  const noiseData = generateNoiseTexture(noiseSize);
  const noiseTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, noiseTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, noiseSize, noiseSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, noiseData);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // --- 6. UNIFORM LOCATIONS ---
  const uniforms = {
    uTime: gl.getUniformLocation(program, 'uTime'),
    uResolution: gl.getUniformLocation(program, 'uResolution'),
    uNoiseTexture: gl.getUniformLocation(program, 'uNoiseTexture'),
    uPupilSize: gl.getUniformLocation(program, 'uPupilSize'),
    uIrisWidth: gl.getUniformLocation(program, 'uIrisWidth'),
    uGlowIntensity: gl.getUniformLocation(program, 'uGlowIntensity'),
    uIntensity: gl.getUniformLocation(program, 'uIntensity'),
    uScale: gl.getUniformLocation(program, 'uScale'),
    uNoiseScale: gl.getUniformLocation(program, 'uNoiseScale'),
    uMouse: gl.getUniformLocation(program, 'uMouse'),
    uPupilFollow: gl.getUniformLocation(program, 'uPupilFollow'),
    uFlameSpeed: gl.getUniformLocation(program, 'uFlameSpeed'),
    uEyeColor: gl.getUniformLocation(program, 'uEyeColor'),
    uBgColor: gl.getUniformLocation(program, 'uBgColor')
  };

  // Set static uniforms
  gl.uniform1i(uniforms.uNoiseTexture, 0);
  gl.uniform1f(uniforms.uPupilSize, config.pupilSize);
  gl.uniform1f(uniforms.uIrisWidth, config.irisWidth);
  gl.uniform1f(uniforms.uGlowIntensity, config.glowIntensity);
  gl.uniform1f(uniforms.uIntensity, config.intensity);
  gl.uniform1f(uniforms.uScale, config.scale);
  gl.uniform1f(uniforms.uNoiseScale, config.noiseScale);
  gl.uniform1f(uniforms.uPupilFollow, config.pupilFollow);
  gl.uniform1f(uniforms.uFlameSpeed, config.flameSpeed);
  gl.uniform3fv(uniforms.uEyeColor, hexToVec3(config.eyeColor));
  gl.uniform3fv(uniforms.uBgColor, hexToVec3(config.backgroundColor));

  // --- 7. MOUSE & INTERACTION STATE ---
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function onMouseLeave() {
    mouse.targetX = 0;
    mouse.targetY = 0;
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseleave', onMouseLeave);

  // --- 8. RESIZE LOGIC ---
  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform3f(uniforms.uResolution, canvas.width, canvas.height, canvas.width / canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  // --- 9. DRAW LOOP ---
  function draw(time) {
    requestAnimationFrame(draw);

    // Smooth mouse coordinates interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    gl.uniform2f(uniforms.uMouse, mouse.x, mouse.y);
    gl.uniform1f(uniforms.uTime, time * 0.001);

    // Draw the full-screen triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  requestAnimationFrame(draw);

})();
