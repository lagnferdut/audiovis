import React from 'react';
import { MicIcon, SystemAudioIcon } from './Icons';
import type { AudioSourceType } from '../hooks/useAudioAnalyzer';

interface AudioSourceSelectorProps {
  onSelect: (sourceType: AudioSourceType) => void;
  onClose: () => void;
}

export const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({ onSelect, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Wybierz źródło dźwięku</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => onSelect('mic')}
            className="w-full flex items-center text-left p-6 bg-gray-700/50 hover:bg-purple-500/20 border border-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <MicIcon className="w-10 h-10 mr-5 text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Mikrofon</h3>
              <p className="text-sm text-gray-400">Przechwytuj dźwięk z podłączonego mikrofonu.</p>
            </div>
          </button>
          
          <button
            onClick={() => onSelect('system')}
            className="w-full flex items-center text-left p-6 bg-gray-700/50 hover:bg-pink-500/20 border border-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <SystemAudioIcon className="w-10 h-10 mr-5 text-pink-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Dźwięk z Komputera (Słuchawki/Głośniki)</h3>
              <p className="text-sm text-gray-400">Wizualizuj dźwięk, który słyszysz (np. z YouTube, Spotify, gier). Przeglądarka poprosi o udostępnienie karty lub ekranu w celu przechwycenia dźwięku.</p>
            </div>
          </button>
        </div>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
            }
        `}</style>
      </div>
    </div>
  );
};
