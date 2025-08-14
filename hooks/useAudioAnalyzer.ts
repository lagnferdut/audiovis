import { useState, useRef, useCallback, useEffect } from 'react';

export type AudioSourceType = 'mic' | 'system';

interface AudioAnalyzerResult {
  analyser: AnalyserNode | null;
  error: string | null;
  start: (sourceType: AudioSourceType) => Promise<void>;
  stop: () => void;
}

export const useAudioAnalyzer = (): AudioAnalyzerResult => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (videoTrackRef.current) {
        videoTrackRef.current.stop();
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
    videoTrackRef.current = null;
  }, []);

  const start = useCallback(async (sourceType: AudioSourceType) => {
    stop(); // Zatrzymaj istniejące instancje
    setError(null);

    try {
      if (!navigator.mediaDevices) {
        throw new Error('Twoja przeglądarka nie obsługuje Media Devices API.');
      }

      let stream;
      if (sourceType === 'mic') {
        if (!navigator.mediaDevices.getUserMedia) {
            throw new Error('Twoja przeglądarka nie obsługuje Web Audio API (getUserMedia).');
        }
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } else {
        if (!navigator.mediaDevices.getDisplayMedia) {
            throw new Error('Twoja przeglądarka nie obsługuje przechwytywania ekranu (getDisplayMedia).');
        }
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });
        
        if (displayStream.getAudioTracks().length === 0) {
            displayStream.getVideoTracks().forEach(track => track.stop());
            throw new Error('Nie udostępniono dźwięku systemowego. Spróbuj ponownie i zaznacz opcję udostępniania dźwięku.');
        }

        // Zapisujemy ścieżkę wideo, aby ją później zatrzymać, ale tworzymy nowy strumień tylko z audio
        videoTrackRef.current = displayStream.getVideoTracks()[0];
        stream = new MediaStream(displayStream.getAudioTracks());
      }
      
      streamRef.current = stream;

      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;

      const newAnalyser = context.createAnalyser();
      newAnalyser.fftSize = 2048;
      newAnalyser.smoothingTimeConstant = 0.3;

      const source = context.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      source.connect(newAnalyser);

      setAnalyser(newAnalyser);
    } catch (err) {
      let message = 'Wystąpił nieznany błąd podczas próby dostępu do źródła audio.';
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('permission denied by system')) {
            message = 'Dostęp do mikrofonu jest zablokowany przez Twój system operacyjny. Przejdź do ustawień systemowych, aby przyznać przeglądarce uprawnienia.';
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            message = 'Odmówiono dostępu do wybranego źródła audio. Zezwól na dostęp w oknie przeglądarki, aby kontynuować.';
        } else if (err.name === 'NotFoundError') {
            message = 'Nie znaleziono mikrofonu. Podłącz mikrofon i spróbuj ponownie.';
        } else {
            message = err.message;
        }
      }
      setError(message);
      stop();
      throw err;
    }
  }, [stop]);
  
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { analyser, error, start, stop };
};