// Web Speech API types & helper

type SpeechRecognitionCtor = new () => any;

export function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechSupported() {
  return getSpeechRecognition() !== null;
}