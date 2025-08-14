import React, { useState } from 'react';
import { MicIcon, SystemAudioIcon } from './Icons';
import type { AudioSourceType } from '../hooks/useAudioAnalyzer';

interface AudioSourceSelectorProps {
  onSelect: (sourceType: AudioSourceType) => void;
  onClose: () => void;
}

export const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({ onSelect, onClose }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSystemSelect = () => {
    onSelect('system');
  };

  const renderInitialSelection = () => (
    <>
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
          onClick={() => setShowInstructions(true)}
          className="w-full flex items-center text-left p-6 bg-gray-700/50 hover:bg-pink-500/20 border border-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <SystemAudioIcon className="w-10 h-10 mr-5 text-pink-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Dźwięk z Komputera (Słuchawki/Głośniki)</h3>
            <p className="text-sm text-gray-400">Wizualizuj dźwięk, który słyszysz (np. z YouTube, Spotify).</p>
          </div>
        </button>
      </div>
    </>
  );

  const renderInstructions = () => (
    <>
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Ważna instrukcja</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
      </div>
      <div className="text-gray-300 space-y-4">
          <p>Aby przechwycić dźwięk z komputera, przeglądarka wymaga specjalnego pozwolenia.</p>
          
          <div className="bg-gray-900/50 p-4 rounded-lg border border-pink-500/30">
              <p className="font-semibold text-pink-400 text-lg">W następnym oknie dialogowym:</p>
              <ol className="list-decimal list-inside mt-2 space-y-2">
                  <li>Wybierz kartę przeglądarki (zalecane) lub cały ekran, z którego odtwarzany jest dźwięk.</li>
                  <li className="font-bold text-white">Koniecznie zaznacz pole <span className="bg-purple-600 px-2 py-1 rounded-md text-sm">"Udostępnij dźwięk karty"</span> lub podobne na dole okna.</li>
              </ol>
          </div>

          <p className="text-sm text-gray-500">Aplikacja wykorzysta tylko ścieżkę audio. Obraz z udostępnionego ekranu lub karty jest ignorowany i nigdzie nie jest wyświetlany.</p>
      </div>
      <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setShowInstructions(false)}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
          >
            Wróć
          </button>
          <button
            onClick={handleSystemSelect}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300"
          >
            Rozumiem, kontynuuj
          </button>
      </div>
    </>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 m-4 w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {!showInstructions ? renderInitialSelection() : renderInstructions()}

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