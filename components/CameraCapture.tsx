import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { MotionStatus } from '../types';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

const MOTION_THRESHOLD = 30; // Pixel difference threshold
const STABILITY_REQUIRED_MS = 2000; // Time to hold still
const CHECK_INTERVAL_MS = 100;

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For motion detection analysis
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [motionStatus, setMotionStatus] = useState<MotionStatus>(MotionStatus.MOVING);
  const [stabilityDuration, setStabilityDuration] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const previousFrameData = useRef<Uint8ClampedArray | null>(null);
  const stabilityStartRef = useRef<number | null>(null);

  // Initialize Camera
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Unable to access camera. Please check permissions.");
        onCancel();
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCancel]);

  // Motion Detection Loop
  useEffect(() => {
    if (!stream || !videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const detectMotion = () => {
      if (!videoRef.current || !canvasRef.current || !ctx) return;

      const width = 64; // Low res for performance
      const height = 48;
      
      if (canvasRef.current.width !== width) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }

      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      if (previousFrameData.current) {
        let diff = 0;
        const prev = previousFrameData.current;
        // Simple pixel difference
        for (let i = 0; i < data.length; i += 4) {
          diff += Math.abs(data[i] - prev[i]); // R
          diff += Math.abs(data[i + 1] - prev[i + 1]); // G
          diff += Math.abs(data[i + 2] - prev[i + 2]); // B
        }
        
        const avgDiff = diff / (width * height * 3);
        
        // Logic for status
        if (avgDiff > MOTION_THRESHOLD) {
          setMotionStatus(MotionStatus.MOVING);
          stabilityStartRef.current = null;
          setStabilityDuration(0);
          setCountdown(null);
        } else {
          setMotionStatus(MotionStatus.STABLE);
          if (!stabilityStartRef.current) {
            stabilityStartRef.current = Date.now();
          }
          
          const duration = Date.now() - stabilityStartRef.current;
          setStabilityDuration(duration);

          if (duration > STABILITY_REQUIRED_MS && countdown === null) {
            triggerAutoCaptureCountDown();
          }
        }
      }

      previousFrameData.current = new Uint8ClampedArray(data);
    };

    const intervalId = setInterval(detectMotion, CHECK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [stream, countdown]);

  const triggerAutoCaptureCountDown = useCallback(() => {
    if (countdown !== null) return;
    setCountdown(3);
  }, [countdown]);

  // Handle Countdown
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      captureImage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const captureImage = () => {
    if (!videoRef.current) return;
    
    // Create high-res capture
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = videoRef.current.videoWidth;
    captureCanvas.height = videoRef.current.videoHeight;
    const ctx = captureCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
    }
  };

  const getStatusMessage = () => {
    if (countdown !== null) return `Capturing in ${countdown}...`;
    if (motionStatus === MotionStatus.MOVING) return "Please stand still";
    const percent = Math.min(100, (stabilityDuration / STABILITY_REQUIRED_MS) * 100);
    return percent < 100 ? `Hold steady... ${Math.floor(percent)}%` : "Ready";
  };

  const getStatusColor = () => {
    if (countdown !== null) return "text-cyan-400 border-cyan-400 bg-cyan-950/80";
    if (motionStatus === MotionStatus.MOVING) return "text-red-400 border-red-400 bg-red-950/80";
    return "text-green-400 border-green-400 bg-green-950/80";
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-black">
      {/* Video Feed */}
      <div className="relative flex-1 overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute min-w-full min-h-full object-cover" 
          style={{ transform: 'scaleX(-1)' }} // Mirror effect
        />
        
        {/* AR Overlay Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
             <div className="border-r border-b border-cyan-500/50 relative">
                 <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
             </div>
             <div className="border-r border-b border-cyan-500/50"></div>
             <div className="border-b border-cyan-500/50 relative">
                 <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
             </div>
             <div className="border-r border-b border-cyan-500/50"></div>
             <div className="border-r border-b border-cyan-500/50 flex items-center justify-center">
                 <div className="w-12 h-12 rounded-full border border-cyan-400/50 flex items-center justify-center">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                 </div>
             </div>
             <div className="border-b border-cyan-500/50"></div>
             <div className="border-r border-cyan-500/50 relative">
                 <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
             </div>
             <div className="border-r border-cyan-500/50"></div>
             <div className="relative">
                 <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
             </div>
          </div>
        </div>

        {/* Scanning Animation Line */}
        {motionStatus === MotionStatus.STABLE && (
          <div className="absolute inset-0 pointer-events-none ar-scan-line"></div>
        )}

        {/* Hidden Canvas for Motion Analysis */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Central HUD / Message */}
        <div className={`absolute top-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full border backdrop-blur-md transition-all duration-300 flex items-center gap-3 ${getStatusColor()}`}>
            {motionStatus === MotionStatus.MOVING ? (
                <AlertCircle className="w-5 h-5 animate-pulse" />
            ) : (
                <CheckCircle2 className="w-5 h-5" />
            )}
            <span className="font-mono font-bold tracking-wider uppercase text-sm">
                {getStatusMessage()}
            </span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 p-6 flex justify-between items-center z-10">
        <button 
          onClick={onCancel}
          className="text-white bg-slate-800 p-4 rounded-full hover:bg-slate-700 transition"
        >
          Cancel
        </button>
        
        <button 
          onClick={captureImage}
          className="relative group"
        >
          <div className="absolute inset-0 bg-cyan-500 rounded-full blur opacity-40 group-hover:opacity-60 transition"></div>
          <div className="relative bg-white text-slate-900 p-5 rounded-full hover:scale-105 transition active:scale-95">
             <Camera className="w-8 h-8" />
          </div>
        </button>

        <button 
          onClick={() => setMotionStatus(MotionStatus.MOVING)} // Reset sim
          className="text-white bg-slate-800 p-4 rounded-full hover:bg-slate-700 transition"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};