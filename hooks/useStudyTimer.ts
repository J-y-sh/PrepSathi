"use client";

import { useEffect } from "react";
import { useStudySessionStore } from "@/store/useStudySessionStore";

export function useStudyTimer() {
  const {
    isStudying,
    elapsedSeconds,
    tick,
  } = useStudySessionStore();

  useEffect(() => {
    if (!isStudying) return;

    const interval = window.setInterval(() => {
      tick();
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isStudying, tick]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const formattedTime = [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");

  return {
    elapsedSeconds,
    formattedTime,
    hours,
    minutes,
    seconds,
    isStudying,
  };
}