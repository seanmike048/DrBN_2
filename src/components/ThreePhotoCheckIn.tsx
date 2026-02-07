import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Button from './Button';
import { PhotoCaptureState } from '../types/database';

interface ThreePhotoCheckInProps {
  onComplete: (photos: PhotoCaptureState) => void;
  onClose: () => void;
}

type PhotoAngle = 'front' | 'left_profile' | 'right_profile';

interface PhotoStep {
  angle: PhotoAngle;
  titleKey: string;
  instructionKey: string;
  icon: 'front' | 'left' | 'right';
}

const ThreePhotoCheckIn: React.FC<ThreePhotoCheckInProps> = ({ onComplete, onClose }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [photos, setPhotos] = useState<PhotoCaptureState>({});
  const [cameraMode, setCameraMode] = useState<'selfie' | 'rear'>('rear');
  const [flashAssist, setFlashAssist] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [permissionError, setPermissionError] = useState(false);
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([]);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photoSteps: PhotoStep[] = [
    { angle: 'front', titleKey: 'frontPhoto', instructionKey: 'frontPhotoInstructions', icon: 'front' },
    { angle: 'left_profile', titleKey: 'leftProfilePhoto', instructionKey: 'leftProfileInstructions', icon: 'left' },
    { angle: 'right_profile', titleKey: 'rightProfilePhoto', instructionKey: 'rightProfileInstructions', icon: 'right' },
  ];

  const currentPhotoStep = photoSteps[currentStep];

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

  // Start camera with selected mode
  const startCamera = useCallback(async () => {
    try {
      stopCamera();

      const facingMode = cameraMode === 'selfie' ? 'user' : { exact: 'environment' };

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
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
      console.error('Camera error:', err);
      setPermissionError(true);
    }
  }, [cameraMode, stopCamera]);

  // Initialize camera on mount, cleanup on unmount
  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Cleanup on step change
  useEffect(() => {
    stopCamera();
    setQualityWarnings([]);
  }, [currentStep, stopCamera]);

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

  // Basic quality check (heuristics)
  const checkPhotoQuality = (dataUrl: string): string[] => {
    const warnings: string[] = [];

    // Create temporary image to analyze
    const img = new Image();
    img.src = dataUrl;

    // Check brightness (very simple heuristic)
    // In production, you'd use more sophisticated analysis
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (ctx && img.width > 0) {
      tempCanvas.width = 100;
      tempCanvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;

      let brightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        brightness += avg;
      }
      brightness = brightness / (100 * 100);

      if (brightness < 50) {
        warnings.push('tooD ark');
      }
    }

    return warnings;
  };

  const startCountdown = () => {
    setCountdown(5);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    const MAX_WIDTH = 1200;
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const scale = Math.min(1, MAX_WIDTH / videoWidth);

    const width = videoWidth * scale;
    const height = videoHeight * scale;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    // Mirror for selfie mode
    if (cameraMode === 'selfie') {
      context.translate(width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(videoRef.current, 0, 0, width, height);

    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);

    // Check quality
    const warnings = checkPhotoQuality(dataUrl);
    setQualityWarnings(warnings);

    // Save photo
    const angle = currentPhotoStep.angle;
    setPhotos(prev => ({ ...prev, [angle]: dataUrl }));

    // Stop camera after capture
    stopCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const warnings = checkPhotoQuality(dataUrl);
      setQualityWarnings(warnings);

      const angle = currentPhotoStep.angle;
      setPhotos(prev => ({ ...prev, [angle]: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    const angle = currentPhotoStep.angle;
    setPhotos(prev => ({ ...prev, [angle]: undefined }));
    setQualityWarnings([]);
    startCamera();
  };

  const handleNext = () => {
    if (currentStep < photoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      startCamera();
    } else {
      // All photos captured
      stopCamera();
      onComplete(photos);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      startCamera();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const currentPhoto = photos[currentPhotoStep.angle];
  const canProceed = !!currentPhoto;

  if (permissionError) {
    return (
      <div className="fixed inset-0 bg-charcoal/95 flex items-center justify-center p-6 z-50">
        <div className="bg-cream p-8 rounded-2xl max-w-sm text-center border border-sand/30 shadow-elegant">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-gold" />
          </div>
          <h3 className="font-display text-xl text-charcoal mb-2">Camera Access Required</h3>
          <p className="text-body-secondary mb-6">
            Please enable camera access in your browser settings to continue.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose} className="flex-1">
              Back
            </Button>
            <Button variant="primary" onClick={startCamera} className="flex-1">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal/95 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cream/10">
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-cream font-body font-medium text-sm">
            {t(currentPhotoStep.titleKey)}
          </h2>
          <p className="text-cream/50 text-xs mt-0.5">
            Photo {currentStep + 1} of {photoSteps.length}
          </p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progress */}
      <div className="px-4 pt-2 pb-4">
        <div className="h-1 bg-cream/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${((currentStep + 1) / photoSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Camera Controls (when not captured) */}
      {!currentPhoto && (
        <div className="px-4 pb-4 flex flex-wrap gap-2 sm:gap-4 justify-center">
          <div className="flex items-center gap-2 bg-cream/10 rounded-lg px-3 py-2">
            <label className="text-cream/70 text-xs sm:text-sm font-body cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={cameraMode === 'rear'}
                onChange={(e) => setCameraMode(e.target.checked ? 'rear' : 'selfie')}
                className="w-4 h-4"
              />
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Rear Camera (Recommended)</span>
              <span className="sm:hidden">Rear Cam</span>
            </label>
          </div>
          <button
            onClick={() => setFlashAssist(!flashAssist)}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-body transition-colors ${
              flashAssist ? 'bg-gold text-charcoal' : 'bg-cream/10 text-cream/70'
            }`}
          >
            Flash
          </button>
        </div>
      )}

      {/* Camera View / Photo Preview */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 relative min-h-0">
        {flashAssist && !currentPhoto && (
          <div className="absolute inset-0 bg-white opacity-90 pointer-events-none" />
        )}

        <div className="relative w-full max-w-md max-h-full aspect-[3/4] rounded-2xl overflow-hidden bg-charcoal shadow-2xl">
          {!currentPhoto ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraMode === 'selfie' ? 'scale-x-[-1]' : ''}`}
              />
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-charcoal/50 backdrop-blur-sm">
                  <span className="text-8xl font-display text-cream animate-pulse">{countdown}</span>
                </div>
              )}
              {/* Guidance overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="text-cream/80 text-center px-4 mb-4">
                  <p className="text-sm font-body">{t(currentPhotoStep.instructionKey)}</p>
                </div>
                {currentPhotoStep.icon === 'front' && (
                  <div className="w-48 h-64 border-2 border-cream/30 rounded-full" />
                )}
                {currentPhotoStep.icon === 'left' && (
                  <div className="w-48 h-64 border-2 border-cream/30 rounded-[40%_60%_60%_40%/50%]" />
                )}
                {currentPhotoStep.icon === 'right' && (
                  <div className="w-48 h-64 border-2 border-cream/30 rounded-[60%_40%_40%_60%/50%]" />
                )}
              </div>
            </>
          ) : (
            <>
              <img
                src={currentPhoto}
                alt={`${currentPhotoStep.angle} view`}
                className="w-full h-full object-cover"
              />
              {qualityWarnings.length > 0 && (
                <div className="absolute top-4 left-4 right-4 bg-amber-500/90 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <div className="text-white text-sm">
                      <p className="font-medium mb-1">Quality Warning</p>
                      <ul className="text-xs opacity-90 list-disc list-inside">
                        {qualityWarnings.map((warning, i) => (
                          <li key={i}>{t(warning)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Privacy Note */}
      <p className="text-cream/40 text-xs text-center px-4 mb-4 font-body">
        Used only for analysis. Private & secure. Nothing is posted.
      </p>

      {/* Controls */}
      <div className="p-4 pb-8 border-t border-cream/10">
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {!currentPhoto ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4 w-full max-w-sm">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-cream/10 border-cream/30 text-cream hover:bg-cream/20"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <button
                onClick={startCountdown}
                disabled={!isVideoReady || countdown !== null}
                className="w-20 h-20 rounded-full bg-cream flex items-center justify-center shadow-lg hover:scale-105 transition-transform disabled:opacity-50 flex-shrink-0"
              >
                <Camera className="w-8 h-8 text-charcoal" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 max-w-sm mx-auto">
            {currentStep > 0 && (
              <Button
                variant="secondary"
                onClick={handleBack}
                className="bg-cream/10 border-cream/30 text-cream hover:bg-cream/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleRetake}
              className="flex-1 bg-cream/10 border-cream/30 text-cream hover:bg-cream/20"
            >
              Retake
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1"
            >
              {currentStep < photoSteps.length - 1 ? 'Next' : 'Complete'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreePhotoCheckIn;
