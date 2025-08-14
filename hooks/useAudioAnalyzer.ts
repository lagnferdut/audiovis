import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioAnalyzerResult {
  analyser: AnalyserNode | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

export const useAudioAnalyzer = (): AudioAnalyzerResult => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setAnalyser(null);
    audioContextRef.current = null;
    streamRef.current = null;
    sourceNodeRef.current = null;
  }, []);

  const start = useCallback(async () => {
    stop(); // Zatrzymaj istniejące instancje
    setError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Twoja przeglądarka nie obsługuje Web Audio API (getUserMedia).');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const newAnalyser = context.createAnalyser();
      newAnalyser.fftSize = 2048; // Wyższa rozdzielczość
      newAnalyser.smoothingTimeConstant = 0.85; // Płynniejsze przejścia

      const source = context.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      source.connect(newAnalyser);

      setAnalyser(newAnalyser);
    } catch (err) {
      let message = 'Wystąpił nieznany błąd podczas próby dostępu do mikrofonu.';
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('permission denied by system')) {
            message = 'Dostęp do mikrofonu jest zablokowany przez Twój system operacyjny. Przejdź do ustawień systemowych, aby przyznać przeglądarce uprawnienia do mikrofonu.';
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            message = 'Odmówiono dostępu do mikrofonu. Zezwól na dostęp w przeglądarce, aby korzystać z wizualizatora.';
        } else if (err.name === 'NotFoundError') {
            message = 'Nie znaleziono mikrofonu. Podłącz mikrofon i spróbuj ponownie.';
        } else {
            message = err.message;
        }
      }
      setError(message);
      stop(); // Sprzątanie po błędzie
      throw err; // Rzuć błąd dalej, aby można go było złapać w komponencie
    }
  }, [stop]);
  
  // Sprzątanie przy odmontowywaniu komponentu
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { analyser, error, start, stop };
};
