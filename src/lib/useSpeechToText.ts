import { useCallback, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

type ResultEvent = {
  results: { transcript: string }[];
  isFinal: boolean;
};

type ErrorEvent = { error: string; message: string };

export type UseSpeechToTextOptions = {
  lang?: string;
  /** Fires for every interim and final result. */
  onResult?: (text: string, isFinal: boolean) => void;
};

export type UseSpeechToText = {
  isAvailable: boolean;
  isListening: boolean;
  partialText: string;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
};

export function useSpeechToText(
  options: UseSpeechToTextOptions = {},
): UseSpeechToText {
  const { lang = "en-US", onResult } = options;
  const [isListening, setIsListening] = useState(false);
  const [partialText, setPartialText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAvailable] = useState(() => {
    try {
      return ExpoSpeechRecognitionModule.isRecognitionAvailable();
    } catch {
      return false;
    }
  });

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setError(null);
  });
  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    setPartialText("");
  });
  useSpeechRecognitionEvent("result", (event: unknown) => {
    const e = event as ResultEvent;
    const text = e.results[0]?.transcript ?? "";
    setPartialText(text);
    onResult?.(text, e.isFinal);
  });
  useSpeechRecognitionEvent("error", (event: unknown) => {
    const e = event as ErrorEvent;
    setError(e.error ?? "error");
    setIsListening(false);
  });

  const start = useCallback(async () => {
    const perms = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perms.granted) {
      setError("not-allowed");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang,
      interimResults: true,
      continuous: false,
    });
  }, [lang]);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  return { isAvailable, isListening, partialText, error, start, stop };
}
