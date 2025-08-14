import React, { useState, useCallback } from 'react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { Visualizer } from './components/Visualizer';
import { PlayIcon, StopIcon, MicIcon, AlertIcon } from './components/Icons';

const App: React.FC = () => {
  const { analyser, error, start, stop } = useAudioAnalyzer();
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    try {
      await start();
      setIsVisualizing(true);
    } catch (err) {
      // Błąd jest już ustawiony w hooku i zostanie wyświetlony.
      // Logujemy go tylko do celów debugowania i zatrzymujemy stan ładowania.
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center text-center">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Rhythmic Visualizer
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            Doświadcz swojego dźwięku w nowym wymiarze.
          </p>
        </header>

        <main className="w-full h-[400px] sm:h-[500px] bg-black/50 rounded-2xl shadow-2xl shadow-purple-500/10 flex items-center justify-center p-4 border border-gray-700/50 relative overflow-hidden">
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
                Kliknij przycisk start i zezwól na dostęp do mikrofonu, aby rozpocząć wizualizację dźwięku z komputera.
              </p>
            </div>
          )}
        </main>

        <footer className="mt-8">
          {!isVisualizing ? (
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-wait flex items-center space-x-3"
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
              className="px-8 py-4 bg-gray-700 text-white font-bold rounded-full shadow-lg hover:bg-gray-600 transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center space-x-3"
            >
              <StopIcon className="w-6 h-6" />
              <span>Zatrzymaj wizualizację</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default App;
