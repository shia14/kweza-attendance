import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

// Tiny beep using Web Audio API — no file needed
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

const Scanner = ({ onScan, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const onScanRef = useRef(onScan);
  const doneRef = useRef(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => { onScanRef.current = onScan; }, [onScan]);

  useEffect(() => {
    let stopped = false;

    async function startCamera() {
      try {
        // Low resolution = far fewer pixels to decode = dramatically faster
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width:  { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
            frameRate: { ideal: 30 },
          }
        });

        if (stopped) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;

        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // Required for iOS
        await video.play();

        tick();
      } catch (err) {
        const msg = String(err);
        if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
          alert('Camera Permission Denied: Allow camera access in browser settings.');
        } else {
          alert('Could not open camera: ' + msg);
        }
        onCancel();
      }
    }

    function tick() {
      if (stopped || doneRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const { videoWidth: w, videoHeight: h } = video;
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imageData.data, w, h, {
        inversionAttempts: 'dontInvert', // Skip inversion — faster on normal QR codes
      });

      if (code && code.data) {
        doneRef.current = true;
        playBeep();
        setFlash(true);
        // Brief flash then fire callback
        setTimeout(() => {
          stopAll();
          onScanRef.current(code.data);
        }, 180);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    function stopAll() {
      stopped = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    }

    startCamera();

    return () => {
      stopped = true;
      doneRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="scanner-modal animate-fade-in">
      <div className={`scanner-container ${flash ? 'flash' : ''}`}>
        <div className="scanner-header">
          <h3>Scanning QR Code</h3>
          <p>Point camera at the Kweza QR code</p>
        </div>

        <div className="viewfinder-wrap">
          <video
            ref={videoRef}
            className="scanner-video"
            playsInline
            muted
            autoPlay
          />
          {/* Hidden canvas used for pixel decoding — never shown */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="corner top-left" />
          <div className="corner top-right" />
          <div className="corner bottom-left" />
          <div className="corner bottom-right" />
          <div className="scan-line" />
        </div>

        <button className="cancel-btn" onClick={onCancel}>CANCEL</button>
      </div>

      <style>{`
        .scanner-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .scanner-container {
          width: 100%;
          max-width: 380px;
          background: #1a202c;
          padding: 24px;
          border-radius: 32px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          transition: background 0.15s;
        }
        .scanner-container.flash {
          background: #22c55e;
        }
        .scanner-header {
          margin-bottom: 16px;
        }
        .scanner-header h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 4px;
        }
        .scanner-header p {
          font-size: 0.82rem;
          color: #94a3b8;
        }
        .viewfinder-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 20px;
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
        .corner {
          position: absolute;
          width: 28px;
          height: 28px;
          border-color: #3b82f6;
          border-style: solid;
          border-width: 0;
        }
        .top-left    { top: 12px; left: 12px;  border-top-width: 4px; border-left-width:  4px; border-radius: 6px 0 0 0; }
        .top-right   { top: 12px; right: 12px; border-top-width: 4px; border-right-width: 4px; border-radius: 0 6px 0 0; }
        .bottom-left { bottom: 12px; left: 12px;  border-bottom-width: 4px; border-left-width:  4px; border-radius: 0 0 0 6px; }
        .bottom-right{ bottom: 12px; right: 12px; border-bottom-width: 4px; border-right-width: 4px; border-radius: 0 0 6px 0; }
        /* Animated scan line */
        .scan-line {
          position: absolute;
          left: 12px; right: 12px; height: 2px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          animation: scanMove 1.6s ease-in-out infinite;
          border-radius: 2px;
        }
        @keyframes scanMove {
          0%   { top: 12px;   opacity: 1; }
          50%  { top: calc(100% - 14px); opacity: 1; }
          100% { top: 12px;   opacity: 1; }
        }
        .cancel-btn {
          margin-top: 20px;
          width: 100%;
          padding: 15px;
          background: rgba(239,68,68,0.15);
          color: #f87171;
          border-radius: 16px;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.5px;
          border: 1px solid rgba(239,68,68,0.3);
          transition: background 0.2s;
        }
        .cancel-btn:active {
          background: rgba(239,68,68,0.3);
        }
      `}</style>
    </div>
  );
};

export default Scanner;
