<script>
  import { onMount } from 'svelte';

  // ⬇️ Point this to your asset path. (You can also pass it in from the parent.)
  export let logoSrc = '/images/glowing-eye.png';
  export let logoScale = 0.20;   // fraction of min(viewport) used for logo width
  export let logoMargin = 55;    // CSS px from the top/left corner (Fibonacci number)

  let canvas;

  onMount(() => {
    const ctx = canvas.getContext('2d', { alpha: false });

    // ==== PERF KNOBS ====
    const DPR_CAP = 1.25;
    const FPS_TARGET = 24;
    const FRAME_DELAY = 1000 / FPS_TARGET;
    const STOP_STEP = 0.025;     // ≈40 color stops
    const QUANTUM = 1 / 60;
    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let cssW, cssH, dpr, width, height;
    let animId, lastNow = 0, t = 0, running = true;

    // --- logo state ---
    const img = new Image();
    img.src = logoSrc;
    let imgLoaded = false;
    let drawW = 0, drawH = 0;    // logo draw size in *CSS* px
    let cx = 0, cy = 0;          // ripple center in *device* px

    img.onload = () => {
      imgLoaded = true;
      layout(); // compute sizes/center now that we know intrinsic ratio
    };

    function sizeCanvas() {
      cssW = innerWidth;
      cssH = innerHeight;
      dpr  = Math.min(devicePixelRatio || 1, DPR_CAP);
      width  = canvas.width  = Math.max(1, Math.round(cssW * dpr));
      height = canvas.height = Math.max(1, Math.round(cssH * dpr));
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
      layout();
    }

    function layout() {
      // logo width relative to viewport, keep aspect ratio
      const targetW = Math.round(Math.min(cssW, cssH) * logoScale);
      if (imgLoaded && img.width > 0) {
        const ratio = img.height / img.width;
        drawW = targetW;
        drawH = Math.round(targetW * ratio);
      } else {
        drawW = drawH = targetW; // fallback square until image loads
      }

      // logo in upper-left at logoMargin; ripple center = center of that image
      const left = logoMargin;
      const top  = logoMargin;

      cx = Math.round((left + drawW / 2) * dpr);
      cy = Math.round((top  + drawH / 2) * dpr);
    }

    addEventListener('resize', sizeCanvas, { passive: true });
    document.addEventListener('visibilitychange', () => {
      running = (document.visibilityState === 'visible');
      if (running && !animId) animId = requestAnimationFrame(draw);
    });

    sizeCanvas();

    // ====== Tokens → RGB arrays (once) ======
    function cssVarRGB(name){
      return getComputedStyle(document.documentElement)
        .getPropertyValue(name).trim().split(/\s+/).map(Number);
    }
    const GREENS = [
      cssVarRGB('--deep-green'),
      cssVarRGB('--earth-green'),
      cssVarRGB('--forest-green'),
      cssVarRGB('--sage-green'),
      cssVarRGB('--light-sage')
    ];
    const GOLD = cssVarRGB('--primary-gold');
    const BLACK = [0,0,0];

    // ====== tiny math utils (zero alloc) ======
    const STOP_MIN = 1e-6, STOP_MAX = 1 - 1e-6;
    function safeStop(grad, s, r,g,b) {
      const clamped = s < STOP_MIN ? STOP_MIN : (s > STOP_MAX ? STOP_MAX : s);
      grad.addColorStop(clamped, `rgb(${r|0},${g|0},${b|0})`);
    }
    function mix(a,b,t,out){ out[0]=a[0]+(b[0]-a[0])*t; out[1]=a[1]+(b[1]-a[1])*t; out[2]=a[2]+(b[2]-a[2])*t; return out; }
    function lerpPalette(palette,u,out){
      const n = palette.length;
      const x = (u % 1 + 1) % 1;
      const p = x * n;
      const i = (p | 0) % n;
      const j = (i + 1) % n;
      const f = p - (p | 0);
      return mix(palette[i], palette[j], f, out);
    }

    // ====== ripple params ======
    const WAVES = 1.5;          // double the wavelength (half the wave count)
    const OMEGA = 1.2;          // outward phase speed
    const AMPL  = 0.4;          // high brightness modulation for clear visibility
    const EDGE_FALLOFF = 0.6;   // minimal edge darkening
    const COLOR_SWAY = 0.15;    // more color variation
    const tmp = [0,0,0];

    function renderFrame(timeSeconds) {
      // radial gradient centered on the logo
      const maxR = Math.hypot(width, height) * 0.85; // reach across canvas
      const k = 2 * Math.PI * WAVES;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);

      for (let s = 0; s < 1; s += STOP_STEP) {
        const phase = k * s - OMEGA * timeSeconds;

        // Diminish wave amplitude as distance increases
        const distanceAttenuation = 1 - s;  // 1 at center, 0 at edge
        const wave  = Math.sin(phase) * distanceAttenuation;  // -1..1, diminishing outward

        // Add gold stripe at wave crest (wave ≈ distanceAttenuation)
        const crestThreshold = 0.85 * distanceAttenuation;  // threshold scales with distance
        let col;
        if (wave > crestThreshold && distanceAttenuation > 0.1) {
          // Blend from green to gold at the crest
          const goldAmount = (wave - crestThreshold) / (distanceAttenuation - crestThreshold);
          const u = Math.min(1, Math.max(0, 0.5 + 0.5 * wave + s * COLOR_SWAY));
          const greenCol = lerpPalette(GREENS, u, tmp);
          col = [
            greenCol[0] + (GOLD[0] - greenCol[0]) * goldAmount,
            greenCol[1] + (GOLD[1] - greenCol[1]) * goldAmount,
            greenCol[2] + (GOLD[2] - greenCol[2]) * goldAmount
          ];
        } else {
          const u = Math.min(1, Math.max(0, 0.5 + 0.5 * wave + s * COLOR_SWAY));
          col = lerpPalette(GREENS, u, tmp);
        }

        const atten  = Math.pow(1 - s, EDGE_FALLOFF);
        const bright = 1.0 + AMPL * wave;                   // Full brightness base (100%)
        const mul    = bright * (0.95 + 0.05 * atten);      // Almost no darkening

        // Use colors directly without black blending
        let r = col[0] * mul, g = col[1] * mul, b = col[2] * mul;

        safeStop(grad, s, r, g, b);
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw radial gradient (black center to transparent) behind logo but over sinusoid
      const vignette = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.5);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 1)');      // solid black at center
      vignette.addColorStop(0.22, 'rgba(0, 0, 0, 1)');   // solid black until 22%
      vignette.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');  // fading
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0)');      // transparent at edges
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // draw logo on top (upper-left), crisp at DPR
      if (imgLoaded) {
        const left = Math.round(logoMargin * dpr);
        const top  = Math.round(logoMargin * dpr);
        const w = Math.round(drawW * dpr);
        const h = Math.round(drawH * dpr);

        // optional soft glow behind logo (very subtle)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255, 215, 100, 0.06)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, w*0.7, h*0.7, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();

        ctx.drawImage(img, left, top, w, h);
      }
    }

    function draw(nowMs) {
      if (!running) { animId = null; return; }
      if (nowMs - lastNow < FRAME_DELAY) { animId = requestAnimationFrame(draw); return; }
      const dt = Math.min((nowMs - lastNow) / 1000, 0.05) || (FRAME_DELAY/1000);
      lastNow = nowMs;

      t = Math.round((t + dt) / QUANTUM) * QUANTUM;

      if (REDUCED) renderFrame(0);
      else renderFrame(t);

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      removeEventListener('resize', sizeCanvas);
      if (animId) cancelAnimationFrame(animId);
    };
  });
</script>

<canvas bind:this={canvas} class="gradient-canvas"></canvas>

<style>
  .gradient-canvas{
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -10;            /* Behind content */
    pointer-events: none;
    opacity: 1;              /* Full visibility */
    background: rgb(0,0,0);  /* true black base */
    image-rendering: optimizeQuality;
  }
</style>