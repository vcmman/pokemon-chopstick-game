"use client";
import { useEffect, useRef, useState } from "react";

// Original, gently looping melody, synthesized locally without downloads.
const melody = [72,76,79,76,74,77,81,77,71,74,79,74,72,76,79,84,81,77,74,77,79,76,72,76,74,71,67,71,72,76,79,72];
export function useGameMusic(allowed = true) {
  const allowedRef = useRef(allowed);
  allowedRef.current = allowed;
  const [enabled, setEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const enabledRef = useRef(true);
  const context = useRef<AudioContext | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const bus = useRef<GainNode | null>(null);
  const nextNote = useRef(0);
  const step = useRef(0);
  const alive = useRef(true);

  function stop() {
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
    if (bus.current && context.current) {
      bus.current.gain.cancelScheduledValues(context.current.currentTime);
      bus.current.gain.setValueAtTime(0, context.current.currentTime);
      bus.current.disconnect();
      bus.current = null;
    }
    setPlaying(false);
  }

  async function start() {
    if (!allowedRef.current || !enabledRef.current || document.hidden) return;
    try {
      context.current ??= new AudioContext();
      const audio = context.current;
      await audio.resume();
      if (!allowedRef.current || !alive.current || !enabledRef.current || document.hidden || interval.current) return;
      const output = audio.createGain();
      output.gain.value = 0.16;
      output.connect(audio.destination);
      bus.current = output;
      nextNote.current = audio.currentTime + 0.05;
      const note = (midi: number, when: number, duration: number, volume: number, type: OscillatorType) => {
        const oscillator = audio.createOscillator();
        const envelope = audio.createGain();
        oscillator.type = type;
        oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
        envelope.gain.setValueAtTime(0, when);
        envelope.gain.linearRampToValueAtTime(volume, when + 0.015);
        envelope.gain.exponentialRampToValueAtTime(0.001, when + duration);
        oscillator.connect(envelope); envelope.connect(output);
        oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
        oscillator.start(when); oscillator.stop(when + duration + 0.03);
      };
      const schedule = () => {
        while (nextNote.current < audio.currentTime + 0.18) {
          const beat = step.current % melody.length;
          note(melody[beat], nextNote.current, 0.21, 0.4, "sine");
          if (beat % 4 === 0) note([48,50,55,48,53,48,55,48][Math.floor(beat/4)], nextNote.current, 0.65, 0.25, "triangle");
          step.current++; nextNote.current += 0.27;
        }
      };
      schedule(); interval.current = setInterval(schedule, 80);
      setPlaying(true);
    } catch { stop(); }
  }

  async function celebrate() {
    await start();
    const audio = context.current;
    if (!enabledRef.current || !audio || audio.state !== "running") return;
    [72, 76, 79, 84].forEach((midi, index) => {
      const tone = audio.createOscillator(), gain = audio.createGain();
      const when = audio.currentTime + index * 0.11;
      tone.type = "sine";
      tone.frequency.value = 440 * 2 ** ((midi - 69) / 12);
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(0.10, when + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.4);
      tone.connect(gain); gain.connect(audio.destination);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
      tone.start(when); tone.stop(when + 0.42);
    });
  }

  function toggle() {
    enabledRef.current = !enabledRef.current;
    setEnabled(enabledRef.current);
    try { localStorage.setItem("chopstick-music", enabledRef.current ? "on" : "off"); } catch {}
    if (enabledRef.current) void start(); else stop();
  }

  useEffect(() => {
    alive.current = true;
    try { enabledRef.current = localStorage.getItem("chopstick-music") !== "off"; setEnabled(enabledRef.current); } catch {}
    const visibility = () => { if (document.hidden) stop(); else void start(); };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      alive.current = false;
      document.removeEventListener("visibilitychange", visibility);
      if (interval.current) clearInterval(interval.current);
      bus.current?.disconnect();
      if (context.current) void context.current.close();
      context.current = null; interval.current = null; bus.current = null;
    };
  }, []);
  return { enabled, playing, start, stop, toggle, celebrate };
}
