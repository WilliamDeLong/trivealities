// src/context/MusicContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(null);

  const [hasStartedMusic, setHasStartedMusic] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio("/trivialities-theme.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 1;

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const startMusic = async () => {
    if (!audioRef.current) return;
    if (isMuted) return;

    try {
      await audioRef.current.play();
      setHasStartedMusic(true);
    } catch (error) {
      console.error("Music failed to start:", error);
    }
  };

  const muteMusic = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsMuted(true);
  };

  const unmuteMusic = async () => {
    if (!audioRef.current) return;

    setIsMuted(false);

    if (hasStartedMusic) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Music failed to resume:", error);
      }
    }
  };

  const toggleMute = async () => {
    if (isMuted) {
      await unmuteMusic();
    } else {
      muteMusic();
    }
  };

  const stopAndResetMusic = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setHasStartedMusic(false);
    setIsMuted(false);
  };

  return (
    <MusicContext.Provider
      value={{
        hasStartedMusic,
        isMuted,
        startMusic,
        muteMusic,
        unmuteMusic,
        toggleMute,
        stopAndResetMusic,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);