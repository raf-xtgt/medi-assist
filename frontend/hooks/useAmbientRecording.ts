"use client";

import { useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/api/constants";

const CHUNK_INTERVAL_MS = 30_000; // 30 seconds per chunk

/**
 * Gain multiplier for the microphone input.
 * Ambient room recording (doctor-patient across a desk) typically needs
 * amplification since the mic isn't close to either speaker.
 * Value of 2.5 = ~8dB boost. Adjust if clipping occurs.
 */
const MIC_GAIN = 2.5;

interface UseAmbientRecordingOptions {
  appointmentGuid: string;
  doctorGuid: string;
}

interface UseAmbientRecordingReturn {
  /** Start recording and create a session on the backend */
  startRecording: () => Promise<string | null>;
  /** Stop recording and trigger transcription */
  stopRecording: () => Promise<void>;
  /** Poll for transcription status */
  pollTranscript: (sessionGuid: string) => Promise<TranscriptStatus>;
  /** Whether we're currently recording */
  isRecording: boolean;
  /** Current session guid */
  sessionGuid: string | null;
  /** Number of chunks uploaded so far */
  chunkCount: number;
  /** Any error that occurred */
  error: string | null;
}

interface TranscriptStatus {
  transcription_status: string;
  transcript: string | null;
}

export function useAmbientRecording({
  appointmentGuid,
  doctorGuid,
}: UseAmbientRecordingOptions): UseAmbientRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionGuid, setSessionGuid] = useState<string | null>(null);
  const [chunkCount, setChunkCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunkIndexRef = useRef(0);
  const sessionGuidRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const uploadChunk = useCallback(async (blob: Blob, chunkIndex: number, sGuid: string) => {
    const formData = new FormData();
    formData.append("session_guid", sGuid);
    formData.append("chunk_index", chunkIndex.toString());
    formData.append("timestamp_ms", (Date.now() - startTimeRef.current).toString());
    formData.append("file", blob, `chunk_${chunkIndex.toString().padStart(4, "0")}.webm`);

    try {
      const res = await fetch(`${API_BASE_URL}/api/agent/ambient-session/upload-chunk`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Chunk upload failed (${chunkIndex}):`, text);
      }
    } catch (err) {
      console.error(`Chunk upload error (${chunkIndex}):`, err);
    }
  }, []);

  const startRecording = useCallback(async (): Promise<string | null> => {
    setError(null);
    try {
      // 1. Create session on backend
      const res = await fetch(
        `${API_BASE_URL}/api/agent/ambient-session/start?appointment_guid=${appointmentGuid}&doctor_guid=${doctorGuid}`,
        { method: "POST" }
      );
      if (!res.ok) {
        throw new Error(`Failed to start session: ${res.status}`);
      }
      const data = await res.json();
      const sGuid = data.session_guid as string;
      setSessionGuid(sGuid);
      sessionGuidRef.current = sGuid;

      // 2. Request microphone access with constraints optimized for ambient room recording
      // CRITICAL: noiseSuppression MUST be false for ambient recording.
      // It treats distant speech as "noise" and attenuates it severely.
      // autoGainControl helps boost quiet ambient audio automatically.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
        },
      });
      streamRef.current = stream;

      // 3. Route through Web Audio API with GainNode to amplify the signal.
      // Ambient mics pick up conversation at low levels — we boost before encoding.
      const audioContext = new AudioContext({ sampleRate: 48000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = MIC_GAIN;

      const destination = audioContext.createMediaStreamDestination();
      source.connect(gainNode);
      gainNode.connect(destination);

      // 4. Create MediaRecorder from the gain-boosted stream
      const boostedStream = destination.stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(boostedStream, {
        mimeType,
        audioBitsPerSecond: 128000, // 128kbps for high quality speech
      });
      mediaRecorderRef.current = recorder;
      chunkIndexRef.current = 0;
      startTimeRef.current = Date.now();
      setChunkCount(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && sessionGuidRef.current) {
          const idx = chunkIndexRef.current;
          chunkIndexRef.current += 1;
          setChunkCount((c) => c + 1);
          uploadChunk(event.data, idx, sessionGuidRef.current);
        }
      };

      recorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("Recording error occurred");
      };

      // 5. Start recording with timeslice (fires ondataavailable every 30s)
      recorder.start(CHUNK_INTERVAL_MS);
      setIsRecording(true);

      return sGuid;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start recording";
      setError(message);
      console.error("startRecording error:", err);
      return null;
    }
  }, [appointmentGuid, doctorGuid, uploadChunk]);

  const stopRecording = useCallback(async () => {
    try {
      // Stop the MediaRecorder (triggers final ondataavailable)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }

      // Stop all audio tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Close the AudioContext
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setIsRecording(false);

      // Give the final chunk a moment to upload
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Trigger end session on backend
      if (sessionGuidRef.current) {
        const res = await fetch(
          `${API_BASE_URL}/api/agent/ambient-session/end?session_guid=${sessionGuidRef.current}`,
          { method: "POST" }
        );
        if (!res.ok) {
          const text = await res.text();
          console.error("End session failed:", text);
        }
      }
    } catch (err) {
      console.error("stopRecording error:", err);
      setError("Failed to stop recording");
    }
  }, []);

  const pollTranscript = useCallback(async (sGuid: string): Promise<TranscriptStatus> => {
    const res = await fetch(
      `${API_BASE_URL}/api/agent/ambient-session/status/${sGuid}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to poll transcript: ${res.status}`);
    }
    return res.json();
  }, []);

  return {
    startRecording,
    stopRecording,
    pollTranscript,
    isRecording,
    sessionGuid,
    chunkCount,
    error,
  };
}
