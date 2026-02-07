import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, X, Camera } from 'lucide-react';
import Button from './Button';
import { useLanguage } from '../contexts/LanguageContext';

interface CameraCaptureProps {
  onCaptureComplete: (photos: { front?: string }) => void;
  onSkip: () => void;
  onClose?: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCaptureComplete, onSkip, onClose }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // CRITICAL: Stop camera stream completely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setIsVideoReady(false);
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream first
      stopCamera();
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      });
      
      streamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsVideoReady(true);
        };
      }
      setPermissionError(false);
    } catch (err) {
      console.error("Camera error:", err);
      setPermissionError(true);
    }
  }, [stopCamera]);

  // Initialize camera on mount, cleanup on unmount
  useEffect(() => {
    startCamera();
    
    // CRITICAL: Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c! - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      takePhoto();
      setCountdown(null);
    }
  }, [countdown]);

  const startCountdown = () => {
    setCountdown(5);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    const MAX_WIDTH = 800;
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const scale = Math.min(1, MAX_WIDTH / videoWidth);
    
    const width = videoWidth * scale;
    const height = videoHeight * scale;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // Mirror the capture to match the user preview
    context.translate(width, 0);
    context.scale(-1, 1);
    
    context.drawImage(videoRef.current, 0, 0, width, height);
    
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
    setCapturedImage(dataUrl);
    
    // CRITICAL: Stop camera stream after capture
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Start new stream for retake
    startCamera();
  };

  const confirmPhoto = () => {
    // Stream already stopped after capture
    onCaptureComplete({ front: capturedImage! });
  };

  const handleClose = () => {
    // CRITICAL: Stop camera when closing modal
    stopCamera();
    if (onClose) {
      onClose();
    } else {
      onSkip();
    }
  };

  const handleSkip = () => {
    // CRITICAL: Stop camera when skipping
    stopCamera();
    onSkip();
  };

  if (permissionError) {
    return (
      <div className="fixed inset-0 bg-charcoal/90 flex items-center justify-center p-6 z-50">
        <div className="bg-cream p-8 rounded-lg max-w-sm text-center border border-sand shadow-elegant">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-gold" />
          </div>
          <h3 className="font-display text-xl text-charcoal mb-2">{t('cameraError')}</h3>
          <p className="text-body-secondary mb-6">
            Please enable camera access in your browser settings.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              {t('back')}
            </Button>
            <Button variant="primary" onClick={startCamera} className="flex-1">
              {t('tryAgain')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal/95 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button 
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center text-cream/80 hover:text-cream transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-cream font-body font-medium">{t('cameraTitle')}</h2>
        <button 
          onClick={handleSkip}
          className="text-cream/60 hover:text-cream text-sm font-body transition-colors"
        >
          {t('skip')}
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden bg-charcoal">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-charcoal/50">
                  <span className="text-7xl font-display text-cream animate-pulse">{countdown}</span>
                </div>
              )}
              {/* Face guide overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-8 border-2 border-cream/30 rounded-full" />
              </div>
            </>
          ) : (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Privacy Note */}
      <p className="text-cream/50 text-xs text-center px-4 mb-4 font-body">
        {t('privacyNote')}
      </p>

      {/* Controls */}
      <div className="p-4 pb-8">
        <canvas ref={canvasRef} className="hidden" />
        
        {!capturedImage ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-cream/70 text-sm font-body">{t('cameraHint')}</p>
            <button
              onClick={startCountdown}
              disabled={!isVideoReady || countdown !== null}
              className="w-20 h-20 rounded-full bg-cream flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
            >
              <Camera className="w-8 h-8 text-charcoal" />
            </button>
          </div>
        ) : (
          <div className="flex gap-4 max-w-sm mx-auto">
            <Button 
              variant="secondary" 
              onClick={handleRetake}
              className="flex-1 bg-cream/10 border-cream/30 text-cream hover:bg-cream/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('retake')}
            </Button>
            <Button 
              variant="primary" 
              onClick={confirmPhoto}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('confirm')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
