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
      let lineBuffer = '';

      const processLine = (line: string) => {
        if (!line.startsWith('data: ')) return false;

        const raw = line.slice(6).trim();
        if (!raw) return false;

        if (raw === '[DONE]') return true; // signal completion

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
          // Ignore JSON parse errors
        }
        return false;
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        lineBuffer += chunk;
        const lines = lineBuffer.split('\n');

        // 마지막 라인은 불완전할 수 있으므로 버퍼에 보관
        lineBuffer = lines.pop() || '';

        for (const line of lines) {
          if (processLine(line)) {
            // [DONE] 수신
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
        }
      }

      // 스트림 끝난 후 버퍼에 남은 라인 처리
      if (lineBuffer.trim()) {
        if (processLine(lineBuffer)) {
          // [DONE] 수신
          const finalCode = ensureRenderCall(stripCodeFences(accumulated));
          setComponents((prev) =>
            prev.map((c) =>
              c.id === streamingId
                ? { ...c, code: finalCode, isStreaming: false, streamingCode: undefined }
                : c
            )
          );
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
