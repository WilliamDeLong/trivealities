import React, { createContext, useContext, useEffect, useRef, useState } from "react";

const MusicContext = createContext();

// Shared audio instance for the whole app session
let sharedAudio = null;

const getSharedAudio = () => {
  if (!sharedAudio) {
    sharedAudio = new Audio("/trivialities-theme.mp3");
    sharedAudio.loop = true;
    sharedAudio.preload = "auto";
    sharedAudio.volume = 1;
  }
  return sharedAudio;
};

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(null);

  const [hasStartedMusic, setHasStartedMusic] = useState(() => {
    return sessionStorage.getItem("hasStartedMusic") === "true";
  });

  const [isMuted, setIsMuted] = useState(() => {
    return sessionStorage.getItem("isMuted") === "true";
  });

  useEffect(() => {
    const audio = getSharedAudio();
    audioRef.current = audio;

    const savedTime = Number(sessionStorage.getItem("musicCurrentTime") || "0");
    if (!Number.isNaN(savedTime) && savedTime > 0 && Math.abs(audio.currentTime - savedTime) > 1) {
      audio.currentTime = savedTime;
    }

    const saveTime = () => {
      if (audioRef.current) {
        sessionStorage.setItem(
          "musicCurrentTime",
          String(audioRef.current.currentTime || 0)
        );
      }
    };

    audio.addEventListener("timeupdate", saveTime);

    if (hasStartedMusic && !isMuted && audio.paused) {
      audio.play().catch((error) => {
        console.error("Music failed to resume:", error);
      });
    }

    return () => {
      audio.removeEventListener("timeupdate", saveTime);
    };
  }, [hasStartedMusic, isMuted]);

  useEffect(() => {
    sessionStorage.setItem("hasStartedMusic", String(hasStartedMusic));
  }, [hasStartedMusic]);

  useEffect(() => {
    sessionStorage.setItem("isMuted", String(isMuted));
  }, [isMuted]);

  const startMusic = async () => {
    const audio = audioRef.current || getSharedAudio();
    audioRef.current = audio;

    setHasStartedMusic(true);

    if (isMuted) return;
    if (!audio.paused) return;

    try {
      await audio.play();
    } catch (error) {
      console.error("Music failed to start:", error);
    }
  };

  const pauseMusic = () => {
    const audio = audioRef.current || getSharedAudio();
    audioRef.current = audio;

    audio.pause();
    sessionStorage.setItem("musicCurrentTime", String(audio.currentTime || 0));
  };

  const muteMusic = () => {
    const audio = audioRef.current || getSharedAudio();
    audioRef.current = audio;

    audio.pause();
    setIsMuted(true);
    sessionStorage.setItem("musicCurrentTime", String(audio.currentTime || 0));
  };

  const unmuteMusic = async () => {
    const audio = audioRef.current || getSharedAudio();
    audioRef.current = audio;

    setIsMuted(false);

    if (hasStartedMusic) {
      try {
        await audio.play();
      } catch (error) {
        console.error("Music failed to unmute:", error);
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

  const setMusicVolume = (volume) => {
    const audio = audioRef.current || getSharedAudio();
    audioRef.current = audio;

    const safeVolume = Math.max(0, Math.min(1, volume));
    audio.volume = safeVolume;
  };

  const getMusicVolume = () => {
    const audio = audioRef.current || getSharedAudio();
    audioRef.current = audio;
    return audio.volume;
  };

  const stopAndResetMusic = () => {
    const audio = audioRef.current || getSharedAudio();
    audioRef.current = audio;

    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;

    setHasStartedMusic(false);
    setIsMuted(false);

    sessionStorage.removeItem("hasStartedMusic");
    sessionStorage.removeItem("isMuted");
    sessionStorage.removeItem("musicCurrentTime");
  };

  return (
    <MusicContext.Provider
      value={{
        hasStartedMusic,
        isMuted,
        startMusic,
        pauseMusic,
        muteMusic,
        unmuteMusic,
        toggleMute,
        setMusicVolume,
        getMusicVolume,
        stopAndResetMusic,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);