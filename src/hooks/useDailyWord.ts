import { useState, useEffect } from "react";
import crypto from "crypto";

interface DailyWord {
  date: string;
  word: string;
}

interface UseDailyWordReturn {
  dailyWord: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function decrypt(text: string) {
  const encryptionKey = process.env.NEXT_PUBLIC_WORD_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error("Encryption key not found");
  }

  if (encryptionKey.length !== 32) {
    throw new Error(`Invalid encryption key length: ${encryptionKey.length}`);
  }

  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(encryptionKey, "utf8"),
    iv
  );

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export function useDailyWord(): UseDailyWordReturn {
  const [dailyWord, setDailyWord] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyWord = async () => {
    try {
      setLoading(true);
      setError(null);

      // const date = new Date().toISOString().split("T")[0];
      const date = new Date().toLocaleDateString("en-CA");
      const url = `/api/daily-word?date=${encodeURIComponent(date)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch daily word");
      }

      const data: DailyWord = await response.json();

      const decryptedWord = data.word.includes(":")
        ? decrypt(data.word)
        : data.word;
      setDailyWord(decryptedWord);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching daily word:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyWord();
  }, []);

  const refetch = async () => {
    await fetchDailyWord();
  };

  return {
    dailyWord,
    loading,
    error,
    refetch,
  };
}
