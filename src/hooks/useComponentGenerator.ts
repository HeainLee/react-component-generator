import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { stripCodeFences, ensureRenderCall } from '../utils/codeProcessing';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    const streamingId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // 1. 스트리밍 placeholder 즉시 추가
    setComponents((prev) => [
      {
        id: streamingId,
        prompt,
        code: '',
        streamingCode: '',
        isStreaming: true,
        createdAt: new Date(),
      },
      ...prev,
    ]);

    try {
      const res = await fetch('/api/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate component');
      }

      // 2. SSE 청크 누적 읽기
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const raw = line.slice(6);

          if (raw === '[DONE]') {
            const finalCode = ensureRenderCall(stripCodeFences(accumulated));
            setComponents((prev) =>
              prev.map((c) =>
                c.id === streamingId
                  ? { ...c, code: finalCode, isStreaming: false, streamingCode: undefined }
                  : c
              )
            );
            setIsLoading(false);
            return;
          }

          try {
            const parsed = JSON.parse(raw);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            accumulated += parsed.chunk ?? '';
            setComponents((prev) =>
              prev.map((c) =>
                c.id === streamingId ? { ...c, streamingCode: accumulated } : c
              )
            );
          } catch (parseErr) {
            if (!(parseErr instanceof SyntaxError)) {
              throw parseErr;
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setComponents((prev) => prev.filter((c) => c.id !== streamingId));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}
