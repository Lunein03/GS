'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

export function CustomAudioPlayer({ src, title }: CustomAudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    // Atualização suave do tempo usando requestAnimationFrame
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !isPlaying) return;

        let animationFrameId: number;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            animationFrameId = requestAnimationFrame(updateTime);
        };

        animationFrameId = requestAnimationFrame(updateTime);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPlaying]);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            void audio.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        audio.currentTime = newTime;
    }, []);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newVolume = parseFloat(e.target.value);
        audio.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    }, []);

    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            audio.volume = volume || 0.5;
            setVolume(volume || 0.5);
            setIsMuted(false);
        } else {
            audio.volume = 0;
            setIsMuted(true);
        }
    }, [isMuted, volume]);

    const skipBackward = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    }, []);

    const skipForward = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.min(duration, audio.currentTime + 10);
    }, [duration]);

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const volumeProgress = (isMuted ? 0 : volume) * 100;

    return (
        <div className="space-y-3 rounded-lg bg-zinc-800 p-4">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Progress bar */}
            <div className="group relative h-1">
                {/* Background - duração total em branco */}
                <div className="absolute inset-0 overflow-hidden rounded-full bg-white/30">
                    {/* Progress - parte reproduzida em vermelho */}
                    <div
                        className="h-full bg-red-600 transition-none will-change-[width]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {/* Input invisível para interação */}
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.01"
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={isLoading}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label="Barra de progresso do áudio"
                />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4">
                {/* Controles de reprodução à esquerda */}
                <div className="flex items-center gap-3">
                    {/* Skip backward */}
                    <button
                        onClick={skipBackward}
                        disabled={isLoading}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                        aria-label="Voltar 10 segundos"
                    >
                        <SkipBack className="h-4 w-4" />
                    </button>

                    {/* Play/Pause */}
                    <button
                        onClick={togglePlay}
                        disabled={isLoading}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-900 transition-all hover:scale-105 disabled:opacity-50"
                        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5" fill="currentColor" />
                        ) : (
                            <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
                        )}
                    </button>

                    {/* Skip forward */}
                    <button
                        onClick={skipForward}
                        disabled={isLoading}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                        aria-label="Avançar 10 segundos"
                    >
                        <SkipForward className="h-4 w-4" />
                    </button>

                    {/* Time */}
                    <div className="ml-1 flex items-center gap-1 text-xs text-white/70">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume control à direita */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                        aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeX className="h-4 w-4" />
                        ) : (
                            <Volume2 className="h-4 w-4" />
                        )}
                    </button>
                    <div className="relative h-1 w-20">
                        {/* Background branco da barra de volume */}
                        <div className="absolute inset-0 overflow-hidden rounded-full bg-white/30">
                            {/* Volume atual em branco sólido */}
                            <div
                                className="h-full bg-white transition-none will-change-[width]"
                                style={{ width: `${volumeProgress}%` }}
                            />
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
                            aria-label="Controle de volume"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface CustomAudioPlayerProps {
    src: string;
    title?: string;
}
