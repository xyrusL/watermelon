"use client";

import { useState, useRef, useEffect } from "react";
import ActionButton from "./ActionButton";

interface Song {
    id: string;
    title: string;
    artist: string;
    file: string;
}

const songs: Song[] = [
    {
        id: "illit-not-cute-anymore",
        title: "Not Cute Anymore",
        artist: "ILLIT (아일릿)",
        file: "/music/background-music.mp3",
    },
    {
        id: "katseye-gabriela",
        title: "Gabriela",
        artist: "KATSEYE",
        file: "/music/gabriela-katseye.mp3",
    },
];

export default function MusicPlayer() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(() => {
        if (typeof window === "undefined") return 0.5;

        const savedVolume = localStorage.getItem("watermelon-music-volume");
        const parsedVolume = savedVolume ? parseFloat(savedVolume) : NaN;

        return Number.isFinite(parsedVolume) ? parsedVolume : 0.5;
    });
    const [isMuted, setIsMuted] = useState(false);
    const [showPrompt, setShowPrompt] = useState(() => {
        if (typeof window === "undefined") return true;
        return localStorage.getItem("watermelon-music-enabled") !== "true";
    });
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [currentSongIndex, setCurrentSongIndex] = useState(() => {
        if (typeof window === "undefined") return 0;

        const savedSongIndex = localStorage.getItem("watermelon-music-song-index");
        const parsedIndex = savedSongIndex ? parseInt(savedSongIndex, 10) : NaN;

        return Number.isInteger(parsedIndex) && parsedIndex >= 0 && parsedIndex < songs.length
            ? parsedIndex
            : 0;
    });
    const [showSongList, setShowSongList] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const currentSong = songs[currentSongIndex];

    // Check screen size - only show on tablets, PCs, and smart TVs (768px+)
    useEffect(() => {
        const checkScreenSize = () => {
            const isCurrentlyLarge = window.innerWidth >= 768;
            setIsLargeScreen((prev) => (prev === isCurrentlyLarge ? prev : isCurrentlyLarge));
        };

        let resizeTimeout: number | undefined;
        const handleResize = () => {
            window.clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(checkScreenSize, 150);
        };

        checkScreenSize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.clearTimeout(resizeTimeout);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Load saved preferences on mount
    useEffect(() => {
        const savedTime = localStorage.getItem("watermelon-music-time");

        if (savedTime && audioRef.current) {
            audioRef.current.currentTime = parseFloat(savedTime);
        }
    }, []);

    // Save playback position periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (audioRef.current && isPlaying) {
                localStorage.setItem("watermelon-music-time", audioRef.current.currentTime.toString());
                localStorage.setItem("watermelon-music-playing", "true");
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Save volume and song index changes
    useEffect(() => {
        localStorage.setItem("watermelon-music-volume", volume.toString());
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    useEffect(() => {
        localStorage.setItem("watermelon-music-song-index", currentSongIndex.toString());
    }, [currentSongIndex]);

    // Restore position when audio is ready
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            const savedTime = localStorage.getItem("watermelon-music-time");
            if (savedTime) {
                audio.currentTime = parseFloat(savedTime);
            }
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        return () => audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }, []);

    // Don't render on small screens
    if (!isLargeScreen) {
        return null;
    }

    const enableMusic = () => {
        setShowPrompt(false);
        localStorage.setItem("watermelon-music-enabled", "true");

        if (audioRef.current) {
            const savedTime = localStorage.getItem("watermelon-music-time");
            if (savedTime) {
                audioRef.current.currentTime = parseFloat(savedTime);
            }
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch((err) => {
                console.error("Failed to play audio:", err);
            });
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
            localStorage.setItem("watermelon-music-playing", "false");
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
                localStorage.setItem("watermelon-music-playing", "true");
            }).catch((err) => {
                console.error("Failed to play audio:", err);
            });
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    };

    const changeSong = (index: number) => {
        const wasPlaying = isPlaying;
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setCurrentSongIndex(index);
        localStorage.setItem("watermelon-music-time", "0");
        setShowSongList(false);

        // Wait for source to update then play
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                if (wasPlaying) {
                    audioRef.current.play().then(() => {
                        setIsPlaying(true);
                    }).catch((err) => {
                        console.error("Failed to play audio:", err);
                    });
                }
            }
        }, 100);
    };

    const nextSong = () => {
        changeSong((currentSongIndex + 1) % songs.length);
    };

    const prevSong = () => {
        changeSong((currentSongIndex - 1 + songs.length) % songs.length);
    };

    return (
        <>
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={currentSong.file}
                preload="auto"
                onEnded={nextSong}
            />

            {/* First-time Music Prompt Modal */}
            {showPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="glass rounded-2xl p-8 max-w-md w-full text-center border-2 border-[#2ed573]/50 animate-[float_3s_ease-in-out_infinite]">
                        {/* Pixel Jukebox Icon */}
                        <div className="mb-6">
                            <svg className="w-24 h-24 mx-auto" viewBox="0 0 64 64" fill="none">
                                <rect x="12" y="20" width="40" height="36" fill="#5d4e37" />
                                <rect x="14" y="22" width="36" height="32" fill="#8b7355" />
                                <rect x="18" y="38" width="28" height="12" fill="#2c2c2c" />
                                <rect x="20" y="40" width="4" height="2" fill="#444" />
                                <rect x="26" y="40" width="4" height="2" fill="#444" />
                                <rect x="32" y="40" width="4" height="2" fill="#444" />
                                <rect x="38" y="40" width="4" height="2" fill="#444" />
                                <rect x="20" y="44" width="4" height="2" fill="#444" />
                                <rect x="26" y="44" width="4" height="2" fill="#444" />
                                <rect x="32" y="44" width="4" height="2" fill="#444" />
                                <rect x="38" y="44" width="4" height="2" fill="#444" />
                                <rect x="22" y="26" width="20" height="10" fill="#1a1a1a" />
                                <circle cx="32" cy="31" r="4" fill="#2ed573" />
                                <circle cx="32" cy="31" r="1" fill="#1a1a1a" />
                                <rect x="16" y="24" width="4" height="4" fill="#ff4757" />
                                <rect x="44" y="24" width="4" height="4" fill="#ff4757" />
                                <rect x="16" y="56" width="6" height="4" fill="#5d4e37" />
                                <rect x="42" y="56" width="6" height="4" fill="#5d4e37" />
                            </svg>
                        </div>

                        <h2 className="font-pixel text-lg text-[#2ed573] mb-4">
                            🎵 JUKEBOX 🎵
                        </h2>

                        <p className="text-gray-300 mb-4">
                            Want some background music while you explore?
                        </p>

                        {/* Song List for Selection */}
                        <div className="glass rounded-xl p-3 mb-4 border border-white/10">
                            <p className="text-xs text-gray-400 mb-2">Pick a song to start:</p>
                            <div className="space-y-2">
                                {songs.map((song, index) => (
                                    <ActionButton
                                        key={song.id}
                                        onClick={() => setCurrentSongIndex(index)}
                                        variant="secondary"
                                        size="sm"
                                        className={`w-full p-2 rounded-lg text-left cursor-pointer ${currentSongIndex === index
                                            ? "bg-[#2ed573]/20 border border-[#2ed573]/50"
                                            : "bg-white/5 hover:bg-white/10 border border-transparent"
                                            }`}
                                    >
                                        <p className="text-sm text-white font-medium">{song.title}</p>
                                        <p className="text-xs text-gray-400">{song.artist}</p>
                                    </ActionButton>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <ActionButton
                                onClick={enableMusic}
                                variant="primary"
                                className="w-full py-4 px-6 font-pixel text-xs hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <span>▶</span> PLAY {currentSong.title}
                            </ActionButton>
                            <ActionButton
                                onClick={() => setShowPrompt(false)}
                                variant="secondary"
                                className="w-full py-3 px-6 border-white/20 hover:border-white/40 text-sm text-gray-400 hover:text-white cursor-pointer"
                            >
                                No thanks, maybe later
                            </ActionButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Jukebox Button */}
            <ActionButton
                onClick={() => setIsOpen(!isOpen)}
                variant="secondary"
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 border-2 hover:scale-110 cursor-pointer flex items-center justify-center p-0 ${isPlaying
                    ? "border-[#2ed573] shadow-[0_0_20px_rgba(46,213,115,0.5)]"
                    : "border-white/20 hover:border-[#ff4757]"
                    }`}
                title="Music Player"
            >
                <svg className={`w-8 h-8 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="12" fill="#1a1a1a" />
                    <circle cx="16" cy="16" r="10" fill={isPlaying ? "#2ed573" : "#ff4757"} />
                    <circle cx="16" cy="16" r="8" fill="#1a1a1a" />
                    <circle cx="16" cy="16" r="3" fill={isPlaying ? "#2ed573" : "#ff4757"} />
                    <circle cx="16" cy="16" r="1" fill="#1a1a1a" />
                    <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.3)" />
                </svg>
            </ActionButton>

            {/* Music Player Modal */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80">
                    <div className="glass rounded-2xl p-5 border-2 border-[#2ed573]/30">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-pixel text-xs text-[#2ed573]">JUKEBOX</h3>
                            <ActionButton
                                onClick={() => setIsOpen(false)}
                                variant="secondary"
                                size="sm"
                                className="w-6 h-6 flex items-center justify-center hover:bg-white/10 border-transparent cursor-pointer p-0"
                            >
                                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 6l12 12M18 6l-12 12" />
                                </svg>
                            </ActionButton>
                        </div>

                        {/* Now Playing */}
                        <div className="glass rounded-xl p-4 mb-4 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#2ed573] to-[#ff4757] flex items-center justify-center ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }}>
                                    <div className="w-4 h-4 rounded-full bg-[#1a1a1a]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white font-medium truncate">{currentSong.title}</p>
                                    <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <ActionButton
                                onClick={prevSong}
                                variant="secondary"
                                className="w-10 h-10 rounded-lg hover:border-[#2ed573]/50 flex items-center justify-center hover:scale-105 cursor-pointer p-0"
                            >
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
                                </svg>
                            </ActionButton>
                            <ActionButton
                                onClick={togglePlay}
                                variant="primary"
                                className="w-14 h-14 flex items-center justify-center transition-all hover:scale-105 cursor-pointer p-0"
                            >
                                {isPlaying ? (
                                    <svg className="w-7 h-7 text-black" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="6" y="5" width="4" height="14" />
                                        <rect x="14" y="5" width="4" height="14" />
                                    </svg>
                                ) : (
                                    <svg className="w-7 h-7 text-black ml-1" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="6,4 20,12 6,20" />
                                    </svg>
                                )}
                            </ActionButton>
                            <ActionButton
                                onClick={nextSong}
                                variant="secondary"
                                className="w-10 h-10 rounded-lg hover:border-[#2ed573]/50 flex items-center justify-center hover:scale-105 cursor-pointer p-0"
                            >
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                </svg>
                            </ActionButton>
                        </div>

                        {/* Song List Toggle */}
                        <ActionButton
                            onClick={() => setShowSongList(!showSongList)}
                            variant="secondary"
                            size="sm"
                            className="w-full mb-4 py-2 px-3 rounded-lg hover:border-[#2ed573]/50 cursor-pointer flex items-center justify-between"
                        >
                            <span className="text-xs text-gray-400">Song List ({songs.length} songs)</span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showSongList ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </ActionButton>

                        {/* Song List */}
                        {showSongList && (
                            <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">
                                {songs.map((song, index) => (
                                    <ActionButton
                                        key={song.id}
                                        onClick={() => changeSong(index)}
                                        variant="secondary"
                                        size="sm"
                                        className={`w-full p-3 rounded-lg text-left cursor-pointer ${currentSongIndex === index
                                            ? "bg-[#2ed573]/20 border border-[#2ed573]/50"
                                            : "glass border border-white/10 hover:border-[#2ed573]/30"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {currentSongIndex === index && isPlaying ? (
                                                <div className="w-4 h-4 flex items-center justify-center">
                                                    <div className="flex gap-0.5">
                                                        <div className="w-1 h-3 bg-[#2ed573] animate-[bounce_0.5s_ease-in-out_infinite]" />
                                                        <div className="w-1 h-3 bg-[#2ed573] animate-[bounce_0.5s_ease-in-out_infinite_0.1s]" />
                                                        <div className="w-1 h-3 bg-[#2ed573] animate-[bounce_0.5s_ease-in-out_infinite_0.2s]" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 w-4 text-center">{index + 1}</span>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-white font-medium truncate">{song.title}</p>
                                                <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                                            </div>
                                        </div>
                                    </ActionButton>
                                ))}
                            </div>
                        )}

                        {/* Volume Control */}
                        <div className="flex items-center gap-3">
                            <ActionButton
                                onClick={toggleMute}
                                variant="secondary"
                                size="sm"
                                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 border-transparent cursor-pointer p-0"
                            >
                                {isMuted || volume === 0 ? (
                                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-[#2ed573]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                    </svg>
                                )}
                            </ActionButton>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2ed573] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:bg-[#26de81]"
                            />
                        </div>

                        {/* Footer */}
                        <p className="text-xs text-gray-600 text-center mt-4">
                            🎵 Minecraft Jukebox Vibes 🎵
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

