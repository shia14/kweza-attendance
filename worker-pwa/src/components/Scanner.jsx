import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const Scanner = ({ onScan, onCancel }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    const qrConfig = { 
      fps: 20, 
      formatsToSupport: [0], // 0 is QR_CODE
      experimentalFeatures: { useBarCodeDetectorIfSupported: true }
    };

    html5QrCode.start(
      { facingMode: "environment" }, 
      qrConfig,
      (decodedText) => {
        // Success - Stop and notify immediately
        html5QrCode.stop().then(() => {
          onScan(decodedText);
        }).catch(() => {
          onScan(decodedText);
        });
      },
      () => {} // error handler ignored
    ).catch(err => {
      const errStr = String(err);
      if (errStr.includes("NotAllowedError") || errStr.includes("Permission denied")) {
        alert("Camera Permission Denied: Please go to your browser settings and allow camera access for this site.");
      } else {
        alert("Scan Error: Could not initialize camera. (Check if another app is using it)");
      }
      onCancel();
    });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Cleanup stop failed", err));
      }
    };
  }, [onScan]);

  return (
    <div className="scanner-modal animate-fade-in">
      <div className="scanner-container">
        <div className="scanner-header">
           <h3>Scanning QR Code</h3>
           <p>Align the code within the frame</p>
        </div>
        <div id="qr-reader" style={{ width: '100%', borderRadius: '24px', overflow: 'hidden' }}></div>
        <button className="cancel-btn" onClick={onCancel}>CANCEL SCAN</button>
      </div>
      <style>{`
        .scanner-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .scanner-container {
          width: 100%;
          max-width: 400px;
          background: white;
          padding: 24px;
          border-radius: 32px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .scanner-header {
           margin-bottom: 20px;
        }
        .scanner-header h3 {
           font-size: 1.2rem;
           font-weight: 800;
           color: #1a202c;
           margin-bottom: 4px;
        }
        .scanner-header p {
           font-size: 0.9rem;
           color: #718096;
        }
        #qr-reader {
          background: #000;
          border: none !important;
        }
        #qr-reader video {
            border-radius: 16px;
            object-fit: cover !important;
        }
        .cancel-btn {
          margin-top: 24px;
          width: 100%;
          padding: 16px;
          background: #fee2e2;
          color: #991b1b;
          border-radius: 16px;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.5px;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
