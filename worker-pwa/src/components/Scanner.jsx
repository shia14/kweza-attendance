import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

// ---------------------------------------------------------------------------
// Audio beep — created inside user-gesture context so iOS allows it
// ---------------------------------------------------------------------------
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    // Two-tone rising beep (feels like success)
    osc.frequency.setValueAtTime(880,  ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (_) {}
}

// ---------------------------------------------------------------------------
// Detect which decode strategy to use — BarcodeDetector is hardware-accelerated
// and supported on Safari 17+, Chrome, Edge. Falls back to jsQR.
// ---------------------------------------------------------------------------
async function checkBarcodeDetector() {
  if (!('BarcodeDetector' in window)) return false;
  try {
    const formats = await window.BarcodeDetector.getSupportedFormats();
    return formats.includes('qr_code');
  } catch (_) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main Scanner component
// ---------------------------------------------------------------------------
const Scanner = ({ onScan, onCancel }) => {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const streamRef = useRef(null);
  const doneRef   = useRef(false);
  const onScanRef = useRef(onScan);

  const [status, setStatus] = useState('scanning'); // 'scanning' | 'success'

  useEffect(() => { onScanRef.current = onScan; }, [onScan]);

  useEffect(() => {
    let stopped = false;

    async function start() {
      try {
        // Request low-res camera — fewer pixels = faster decode
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width:  { ideal: 640, max: 720 },
            height: { ideal: 480, max: 540 },
            frameRate: { ideal: 30, min: 15 },
          },
          audio: false,
        });

        if (stopped) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        const video = videoRef.current;
        video.srcObject = stream;
        // Both needed for Safari iOS
        video.setAttribute('playsinline', 'true');
        video.setAttribute('muted', 'true');
        video.muted = true;
        await video.play();

        // Wait for video to have actual dimensions
        await new Promise(resolve => {
          if (video.videoWidth > 0) { resolve(); return; }
          video.addEventListener('loadedmetadata', resolve, { once: true });
        });

        // Pick decode strategy
        const useNative = await checkBarcodeDetector();
        if (useNative) {
          runNativeLoop();
        } else {
          runJsQRLoop();
        }
      } catch (err) {
        if (stopped) return;
        const msg = String(err);
        if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
          alert('Camera Permission Denied.\nGo to browser Settings → Site Settings → Camera and allow access.');
        } else if (msg.includes('NotFoundError')) {
          alert('No camera found on this device.');
        } else {
          alert('Camera error: ' + msg);
        }
        onCancel();
      }
    }

    // -----------------------------------------------------------------------
    // Strategy A: BarcodeDetector (hardware-accelerated — fastest path)
    // Runs directly on the video element, no canvas needed.
    // -----------------------------------------------------------------------
    async function runNativeLoop() {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const video = videoRef.current;

      async function loop() {
        if (stopped || doneRef.current) return;
        try {
          const results = await detector.detect(video);
          if (results.length > 0 && results[0].rawValue) {
            handleFound(results[0].rawValue);
            return;
          }
        } catch (_) {}
        // ~16ms delay keeps it at ~60fps without burning the CPU
        rafRef.current = requestAnimationFrame(loop);
      }
      loop();
    }

    // -----------------------------------------------------------------------
    // Strategy B: jsQR + canvas (fallback for older Safari / Firefox)
    // -----------------------------------------------------------------------
    function runJsQRLoop() {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      const ctx    = canvas.getContext('2d', { willReadFrequently: true });

      function loop() {
        if (stopped || doneRef.current) return;
        const { videoWidth: w, videoHeight: h } = video;
        if (w && h) {
          canvas.width  = w;
          canvas.height = h;
          ctx.drawImage(video, 0, 0, w, h);
          const img  = ctx.getImageData(0, 0, w, h);
          const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
          if (code && code.data) {
            handleFound(code.data);
            return;
          }
        }
        rafRef.current = requestAnimationFrame(loop);
      }
      loop();
    }

    // -----------------------------------------------------------------------
    // Common success handler
    // -----------------------------------------------------------------------
    function handleFound(value) {
      if (doneRef.current) return;
      doneRef.current = true;
      playBeep();
      setStatus('success');
      // Show success screen briefly, then fire callback
      setTimeout(() => {
        stopAll();
        onScanRef.current(value);
      }, 1400);
    }

    function stopAll() {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    }

    start();

    return () => {
      stopped = true;
      doneRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="scanner-modal">
      <div className={`scanner-card ${status === 'success' ? 'success' : ''}`}>

        {status === 'scanning' ? (
          <>
            <div className="scanner-top">
              <h3>Scan QR Code</h3>
              <p>Point at the Kweza attendance code</p>
            </div>

            <div className="viewfinder">
              <video
                ref={videoRef}
                className="scanner-video"
                playsInline
                muted
                autoPlay
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Corner brackets */}
              <span className="c tl" />
              <span className="c tr" />
              <span className="c bl" />
              <span className="c br" />

              {/* Animated scan line */}
              <div className="scan-line" />
            </div>

            <button className="cancel-btn" onClick={onCancel}>CANCEL</button>
          </>
        ) : (
          /* Success screen */
          <div className="success-screen">
            <div className="success-ring">
              <svg viewBox="0 0 52 52" className="checkmark">
                <circle cx="26" cy="26" r="25" fill="none" />
                <path fill="none" d="M14 27 l8 8 l16-16" />
              </svg>
            </div>
            <h2>Scan Successful!</h2>
            <p>Recording your attendance…</p>
          </div>
        )}
      </div>

      <style>{`
        .scanner-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.88);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .scanner-card {
          width: 100%;
          max-width: 360px;
          background: #111827;
          padding: 24px;
          border-radius: 28px;
          text-align: center;
          box-shadow: 0 24px 64px rgba(0,0,0,0.7);
          transition: background 0.2s;
        }
        .scanner-card.success {
          background: #052e16;
        }
        .scanner-top h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #f1f5f9;
          margin-bottom: 4px;
        }
        .scanner-top p {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 16px;
        }
        /* ---------- viewfinder ---------- */
        .viewfinder {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 18px;
          overflow: hidden;
          background: #000;
        }
        .scanner-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* Corner brackets */
        .c {
          position: absolute;
          width: 26px;
          height: 26px;
          border: 3px solid #60a5fa;
          border-radius: 0;
        }
        .tl { top:10px;    left:10px;    border-right: none; border-bottom: none; border-radius: 5px 0 0 0; }
        .tr { top:10px;    right:10px;   border-left:  none; border-bottom: none; border-radius: 0 5px 0 0; }
        .bl { bottom:10px; left:10px;    border-right: none; border-top:   none; border-radius: 0 0 0 5px; }
        .br { bottom:10px; right:10px;   border-left:  none; border-top:   none; border-radius: 0 0 5px 0; }
        /* Sweep line */
        .scan-line {
          position: absolute;
          left: 10px; right: 10px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #3b82f6 40%, #93c5fd, #3b82f6 60%, transparent);
          box-shadow: 0 0 8px #3b82f6;
          border-radius: 2px;
          animation: sweep 1.4s ease-in-out infinite;
        }
        @keyframes sweep {
          0%   { top: 10px; }
          50%  { top: calc(100% - 12px); }
          100% { top: 10px; }
        }
        /* ---------- cancel ---------- */
        .cancel-btn {
          margin-top: 18px;
          width: 100%;
          padding: 14px;
          background: rgba(239,68,68,0.12);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 14px;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.5px;
          transition: background 0.15s;
          cursor: pointer;
        }
        .cancel-btn:active { background: rgba(239,68,68,0.28); }

        /* ---------- success screen ---------- */
        .success-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px 0;
        }
        .success-ring {
          width: 90px;
          height: 90px;
        }
        .checkmark {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: block;
          stroke: #22c55e;
          stroke-width: 3;
          stroke-miterlimit: 10;
          animation: scaleIn 0.3s ease-out forwards;
        }
        .checkmark circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 3;
          animation: circleDraw 0.5s ease-out forwards;
        }
        .checkmark path {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: checkDraw 0.35s 0.45s ease-out forwards;
        }
        @keyframes circleDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes checkDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        .success-screen h2 {
          font-size: 1.4rem;
          font-weight: 900;
          color: #22c55e;
          margin: 0;
        }
        .success-screen p {
          font-size: 0.85rem;
          color: #4ade80;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
