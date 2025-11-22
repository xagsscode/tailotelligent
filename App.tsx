import React, { useState, useEffect } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { ResultsView } from './components/ResultsView';
import { AppState, BodyMeasurements, MeasurementRecord } from './types';
import { analyzeBodyMeasurements } from './services/geminiService';
import { Scissors, User, History, Ruler, Sparkles, Plus, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.HOME);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);
  const [savedRecords, setSavedRecords] = useState<MeasurementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load history from local storage
  useEffect(() => {
    const stored = localStorage.getItem('tailotelligent_records');
    if (stored) {
      setSavedRecords(JSON.parse(stored));
    }
  }, []);

  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setCurrentState(AppState.PROCESSING);
    setIsLoading(true);

    try {
      const results = await analyzeBodyMeasurements(imageData);
      setMeasurements(results);
      setCurrentState(AppState.RESULTS);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
      setCurrentState(AppState.HOME);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (name: string) => {
    if (!measurements) return;
    const newRecord: MeasurementRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      measurements: measurements,
      name: name
    };
    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);
    localStorage.setItem('tailotelligent_records', JSON.stringify(updated));
    setCurrentState(AppState.HISTORY);
  };

  // --- Render Views ---

  // 1. Home Screen
  if (currentState === AppState.HOME) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <header className="p-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Scissors className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TailoTelligent</h1>
          </div>
          <button 
            onClick={() => setCurrentState(AppState.HISTORY)}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
          >
            <History className="w-5 h-5 text-slate-300" />
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
          <div className="mb-8 relative">
            <div className="w-48 h-48 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 relative">
               <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping opacity-20"></div>
               <User className="w-24 h-24 text-slate-600" />
               
               {/* Decorative AR Elements */}
               <div className="absolute -top-4 -right-4 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-xl">
                 <Ruler className="w-5 h-5 text-cyan-400" />
               </div>
               <div className="absolute -bottom-2 -left-2 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-xl">
                 <Sparkles className="w-5 h-5 text-indigo-400" />
               </div>
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Smart Body<br />Measurement
          </h2>
          <p className="text-slate-400 mb-10 max-w-xs mx-auto text-lg">
            Stand in front of the camera. Let AI precision tailor your perfect fit using Augmented Reality.
          </p>

          <button 
            onClick={() => setCurrentState(AppState.CAMERA)}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(8,145,178,0.5)] hover:shadow-[0_0_30px_rgba(8,145,178,0.7)]"
          >
            <Plus className="w-6 h-6" />
            <span>Start Measurement</span>
          </button>
        </main>
      </div>
    );
  }

  // 2. Camera Screen
  if (currentState === AppState.CAMERA) {
    return (
      <CameraCapture 
        onCapture={handleCapture} 
        onCancel={() => setCurrentState(AppState.HOME)} 
      />
    );
  }

  // 3. Processing Screen
  if (currentState === AppState.PROCESSING) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="relative mb-8">
           <div className="w-24 h-24 border-4 border-slate-800 rounded-full"></div>
           <div className="absolute inset-0 border-t-4 border-cyan-500 rounded-full animate-spin"></div>
           <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-cyan-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Anatomy</h2>
        <p className="text-slate-400 text-center max-w-xs animate-pulse">
          AI is calculating body dimensions based on visual markers...
        </p>
      </div>
    );
  }

  // 4. Results Screen
  if (currentState === AppState.RESULTS && measurements && capturedImage) {
    return (
      <ResultsView 
        data={measurements} 
        imageSrc={capturedImage}
        onSave={handleSave}
        onBack={() => setCurrentState(AppState.HOME)}
      />
    );
  }

  // 5. History Screen
  if (currentState === AppState.HISTORY) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        <header className="p-4 bg-slate-800 flex items-center gap-4 sticky top-0 z-10 shadow-md">
           <button onClick={() => setCurrentState(AppState.HOME)} className="p-2 hover:bg-slate-700 rounded-full">
             <ArrowLeft className="w-6 h-6" />
           </button>
           <h1 className="text-xl font-bold">Saved Profiles</h1>
        </header>
        <div className="p-4 space-y-4">
          {savedRecords.length === 0 ? (
            <div className="text-center text-slate-500 mt-20">
              <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No saved measurements yet.</p>
            </div>
          ) : (
            savedRecords.map(record => (
              <div key={record.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-white">{record.name}</h3>
                    <p className="text-xs text-slate-500">{record.date}</p>
                  </div>
                  <div className="bg-cyan-900/50 text-cyan-400 text-xs px-2 py-1 rounded">
                    {record.measurements.unit}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                   <div className="flex justify-between text-slate-400">
                      <span>Chest:</span> <span className="text-white">{record.measurements.chest}</span>
                   </div>
                   <div className="flex justify-between text-slate-400">
                      <span>Waist:</span> <span className="text-white">{record.measurements.waist}</span>
                   </div>
                   <div className="flex justify-between text-slate-400">
                      <span>Inseam:</span> <span className="text-white">{record.measurements.inseam}</span>
                   </div>
                   <div className="flex justify-between text-slate-400">
                      <span>Shoulder:</span> <span className="text-white">{record.measurements.shoulders}</span>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return null;
};

// Simple ArrowLeft icon component locally for History view since lucide is imported at top
const ArrowLeft = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
);

export default App;