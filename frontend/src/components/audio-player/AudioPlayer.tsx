import { useRef, useEffect } from 'react';
import boomSound from './assets/boom.wav';
import winSound from './assets/win.mp3';
import loseSound from './assets/lose.mp3';
import opponentLeaveSound from './assets/opponentLeave.mp3';

type SoundType = 'boom' | 'win' | 'lose' | 'opponentLeave';

const soundFiles: Record<SoundType, string> = {
    boom: boomSound,
    win: winSound,
    lose: loseSound,
    opponentLeave: opponentLeaveSound
};

const AudioPlayer = () => {
    const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
        boom: null,
        win: null,
        lose: null,
        opponentLeave: null
    });

    // Предзагрузка звуков при монтировании
    useEffect(() => {
        Object.entries(soundFiles).forEach(([type, src]) => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            audioRefs.current[type as SoundType] = audio;
        });

        return () => {
            // Очистка при размонтировании
            Object.values(audioRefs.current).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.remove();
                }
            });
        };
    }, []);

    // Функция для воспроизведения звука
    const playSound = (type: SoundType) => {
        const audio = audioRefs.current[type];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error('Audio playback failed:', e));
        }
    };

    // Экспортируем playSound
    return { playSound };
};

export default AudioPlayer;