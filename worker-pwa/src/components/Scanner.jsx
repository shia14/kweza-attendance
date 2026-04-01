import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Scanner = ({ onScan, onCancel }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        showTorchButtonIfSupported: true,
      },
      false
    );

    function onScanSuccess(decodedText, decodedResult) {
      scanner.clear();
      onScan(decodedText);
    }

    function onScanFailure(error) {
      // quietly log errors or ignore
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(err => console.log("Failed to clear scanner", err));
    };
  }, []);

  return (
    <div className="scanner-modal animate-fade-in">
      <div className="scanner-container">
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
          background: rgba(0, 0, 0, 0.85);
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
          padding: 20px;
          border-radius: 32px;
          text-align: center;
        }
        .cancel-btn {
          margin-top: 20px;
          width: 100%;
          padding: 16px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
        }
        #qr-reader__dashboard {
            padding: 10px;
        }
        #qr-reader__camera_selection {
            padding: 8px;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        #qr-reader__status_span {
            font-size: 13px !important;
            margin-bottom: 5px !important;
        }
      `}</style>
    </div>
  );
};

export default Scanner;
