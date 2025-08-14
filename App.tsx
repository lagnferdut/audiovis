import React, { useState, useCallback } from 'react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { Visualizer } from './components/Visualizer';
import { PlayIcon, StopIcon, MicIcon, AlertIcon } from './components/Icons';
import { AudioSourceSelector } from './components/AudioSourceSelector';
import type { AudioSourceType } from './hooks/useAudioAnalyzer';

const App: React.FC = () => {
  const { analyser, error, start, stop } = useAudioAnalyzer();
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStart = useCallback(async (sourceType: AudioSourceType) => {
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      await start(sourceType);
      setIsVisualizing(true);
    } catch (err) {
      // Błąd jest już ustawiony w hooku i zostanie wyświetlony.
      console.error("Failed to start visualization:", err);
    } finally {
      setIsLoading(false);
    }
  }, [start]);

  const handleStop = useCallback(() => {
    stop();
    setIsVisualizing(false);
  }, [stop]);

  return (
    <>
      <div className="h-screen bg-gray-900 text-white grid grid-rows-[auto_1fr_auto] p-4 font-sans antialiased">
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              Rhythmic Visualizer
            </h1>
            <p className="text-lg text-gray-400 mt-2">
              Doświadcz swojego dźwięku w nowym wymiarze.
            </p>
        </header>

        <main className="w-full h-full bg-black/50 rounded-2xl shadow-2xl shadow-purple-500/10 flex items-center justify-center my-4 border border-gray-700/50 relative overflow-hidden">
            {isVisualizing && analyser ? (
              <Visualizer analyserNode={analyser} />
            ) : error ? (
              <div className="flex flex-col items-center text-center text-red-300 max-w-lg px-4">
                  <AlertIcon className="w-16 h-16 mb-4 text-red-400" />
                  <h2 className="text-2xl font-semibold">Błąd dostępu do audio</h2>
                  <p className="mt-2 text-red-200">
                      {error}
                  </p>
                  <p className="mt-4 text-sm text-gray-400">
                      Po rozwiązaniu problemu, kliknij ponownie "Uruchom wizualizację".
                  </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-300">
                <MicIcon className="w-16 h-16 mb-4 text-gray-500" />
                <h2 className="text-2xl font-semibold">Gotowy do startu?</h2>
                <p className="mt-2 max-w-md">
                  Kliknij przycisk start, aby wybrać źródło dźwięku i rozpocząć wizualizację.
                </p>
              </div>
            )}
        </main>

        <footer className="text-center">
            {!isVisualizing ? (
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-wait flex items-center space-x-3 mx-auto"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Inicjalizowanie...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-6 h-6" />
                    <span>Uruchom wizualizację</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="px-8 py-4 bg-gray-700 text-white font-bold rounded-full shadow-lg hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center space-x-3 mx-auto"
              >
                <StopIcon className="w-6 h-6" />
                <span>Zatrzymaj wizualizację</span>
              </button>
            )}
        </footer>
      </div>
      {isModalOpen && <AudioSourceSelector onSelect={handleStart} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default App;