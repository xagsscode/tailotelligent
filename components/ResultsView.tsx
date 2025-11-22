import React, { useState } from 'react';
import { BodyMeasurements } from '../types';
import { Save, Share2, ArrowLeft, Ruler } from 'lucide-react';

interface ResultsViewProps {
  data: BodyMeasurements;
  onSave: (name: string) => void;
  onBack: () => void;
  imageSrc: string;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ data, onSave, onBack, imageSrc }) => {
  const [name, setName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const MeasurementRow = ({ label, value, unit }: { label: string, value: number, unit: string }) => (
    <div className="flex justify-between items-center py-3 border-b border-slate-700 last:border-0">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="text-xl font-bold text-white font-mono">
        {value} <span className="text-sm text-slate-500 ml-1">{unit}</span>
      </span>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-y-auto">
      {/* Header */}
      <div className="p-4 bg-slate-800 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <button onClick={onBack} className="text-slate-300 hover:text-white flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h2 className="text-lg font-bold text-white">Analysis Complete</h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="p-6 max-w-md mx-auto w-full flex-1">
        {/* Visual Reference */}
        <div className="relative mb-8 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
           <img src={imageSrc} alt="Measured Subject" className="w-full h-64 object-cover opacity-60" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
           <div className="absolute bottom-4 left-4 right-4">
               <div className="flex items-center gap-2 text-cyan-400 mb-1">
                   <Ruler className="w-4 h-4" />
                   <span className="text-xs font-bold uppercase tracking-widest">AI Estimation</span>
               </div>
               <h3 className="text-2xl font-bold text-white">Body Metrics</h3>
           </div>
        </div>

        {/* Data Cards */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg mb-6">
          <div className="space-y-1">
            <MeasurementRow label="Height (Est.)" value={data.heightEstimate} unit={data.unit} />
            <MeasurementRow label="Neck" value={data.neck} unit={data.unit} />
            <MeasurementRow label="Shoulders" value={data.shoulders} unit={data.unit} />
            <MeasurementRow label="Chest" value={data.chest} unit={data.unit} />
            <MeasurementRow label="Waist" value={data.waist} unit={data.unit} />
            <MeasurementRow label="Hips" value={data.hips} unit={data.unit} />
            <MeasurementRow label="Sleeve" value={data.sleeve} unit={data.unit} />
            <MeasurementRow label="Inseam" value={data.inseam} unit={data.unit} />
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-500 text-center mb-8 px-4">
          *Measurements are estimated using computer vision. For professional tailoring, please verify with a physical tape measure.
        </p>

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            onClick={() => setShowSaveDialog(true)}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <Save className="w-5 h-5" />
            Save Profile
          </button>
          <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Save Profile</h3>
            <input
              type="text"
              placeholder="Enter customer name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg mb-4 focus:ring-2 focus:ring-cyan-500 outline-none"
              autoFocus
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                    if(name.trim()) {
                        onSave(name);
                        setShowSaveDialog(false);
                    }
                }}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};