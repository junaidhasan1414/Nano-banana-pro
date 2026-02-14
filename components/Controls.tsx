import React from 'react';
import { AspectRatio, ImageSize } from '../types';
import { Settings2, Monitor, Smartphone, Square, Layout, Image as ImageIcon } from 'lucide-react';

interface ControlsProps {
  size: ImageSize;
  setSize: (s: ImageSize) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (r: AspectRatio) => void;
  disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ size, setSize, aspectRatio, setAspectRatio, disabled }) => {
  
  const ratios = [
    { value: AspectRatio.Square, icon: Square, label: "1:1" },
    { value: AspectRatio.Portrait, icon: Smartphone, label: "9:16" },
    { value: AspectRatio.Landscape, icon: Monitor, label: "16:9" },
    { value: AspectRatio.StandardPortrait, icon: Layout, label: "3:4" },
    { value: AspectRatio.StandardLandscape, icon: ImageIcon, label: "4:3" },
  ];

  return (
    <div className="flex flex-col gap-4 w-full bg-surface p-4 rounded-xl border border-surfaceHighlight shadow-lg">
      {/* Size Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Settings2 className="w-3 h-3" /> Image Resolution
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(ImageSize).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              disabled={disabled}
              className={`
                py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200
                ${size === s 
                  ? 'bg-primary text-white shadow-md shadow-primary/30 ring-1 ring-primary/50' 
                  : 'bg-surfaceHighlight text-gray-400 hover:bg-surfaceHighlight/80 hover:text-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aspect Ratio</label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {ratios.map((r) => (
            <button
              key={r.value}
              onClick={() => setAspectRatio(r.value)}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] gap-1 transition-all duration-200
                ${aspectRatio === r.value
                  ? 'bg-surfaceHighlight border-2 border-primary text-white'
                  : 'bg-surfaceHighlight border-2 border-transparent text-gray-500 hover:text-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <r.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{r.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};