import React from 'react';
import { GeneratedImage } from '../types';
import { Download, Clock } from 'lucide-react';

interface HistoryProps {
  images: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
}

export const History: React.FC<HistoryProps> = ({ images, onSelect }) => {
  if (images.length === 0) return null;

  return (
    <div className="w-full mt-6">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 px-1 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Recent Creations
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img) => (
          <div 
            key={img.id} 
            onClick={() => onSelect(img)}
            className="group relative aspect-square bg-surfaceHighlight rounded-lg overflow-hidden cursor-pointer border border-surfaceHighlight hover:border-gray-600 transition-all"
          >
            <img 
              src={img.url} 
              alt={img.prompt} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
               <span className="text-[10px] text-white line-clamp-2">{img.prompt}</span>
               <span className="text-[9px] text-gray-300 font-mono mt-1">{img.size} • {img.aspectRatio}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};