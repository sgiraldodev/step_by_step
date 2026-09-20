'use client';

import { useEffect, useRef } from 'react';
import type { Timer } from '@/modules/focus/timer';

export function useTimerSound(timer: Timer | null, onError: (message: string) => void) {
  const audio = useRef<AudioContext | null>(null);
  const previous = useRef<Timer | null>(null);

  useEffect(() => {
    if (!window.AudioContext) return;
    function enableAudio() {
      audio.current ??= new AudioContext();
      if (audio.current.state === 'suspended')
        void audio.current
          .resume()
          .catch(() => onError('No se pudo activar el sonido del temporizador.'));
    }
    document.addEventListener('pointerdown', enableAudio, true);
    document.addEventListener('keydown', enableAudio, true);
    return () => {
      document.removeEventListener('pointerdown', enableAudio, true);
      document.removeEventListener('keydown', enableAudio, true);
      void audio.current?.close();
      audio.current = null;
    };
  }, [onError]);

  useEffect(() => {
    const before = previous.current;
    previous.current = timer;
    const expired =
      before &&
      timer &&
      before.taskId === timer.taskId &&
      ((before.phase === 'work' && timer.phase === 'decision') ||
        (before.phase === 'rest' && timer.phase === 'work'));
    const context = audio.current;
    if (!expired || !context) return;
    if (context.state !== 'running') {
      onError('El tiempo terminó. Activa el sonido del navegador para escuchar el aviso.');
      return;
    }
    // Arpegio suave con ataque breve y decaimiento similar a cuerdas pulsadas.
    [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25].forEach((frequency, index) => {
      const start = context.currentTime + index * 0.28;
      const note = context.createOscillator();
      const volume = context.createGain();
      note.type = 'triangle';
      note.frequency.value = frequency;
      volume.gain.setValueAtTime(0, start);
      volume.gain.linearRampToValueAtTime(0.14, start + 0.015);
      volume.gain.exponentialRampToValueAtTime(0.001, start + 1.5);
      note.connect(volume);
      volume.connect(context.destination);
      note.start(start);
      note.stop(start + 1.6);
      note.onended = () => {
        note.disconnect();
        volume.disconnect();
      };
    });
  }, [timer, onError]);
}
