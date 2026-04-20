import { useState } from 'react';
import type { GeneratedComponent } from '../types';
import { LivePreview } from './LivePreview';
import { CodeView } from './CodeView';

interface ComponentCardProps {
  component: GeneratedComponent;
  onRemove: (id: string) => void;
  onRegenerate: (prompt: string) => void;
  isLoading: boolean;
}

type Tab = 'preview' | 'code';
type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORTS: { id: Viewport; label: string; icon: string; width: string }[] = [
  { id: 'mobile', label: '모바일', icon: '📱', width: '375px' },
  { id: 'tablet', label: '태블릿', icon: '📟', width: '768px' },
  { id: 'desktop', label: '데스크탑', icon: '🖥', width: '100%' },
];

export function ComponentCard({ component, onRemove, onRegenerate, isLoading }: ComponentCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [previewKey, setPreviewKey] = useState(0);
  const [viewport, setViewport] = useState<Viewport>('desktop');

  // 스트리밍 중에는 코드 탭으로 표시
  const displayTab = component.isStreaming ? 'code' : activeTab;
  const displayCode = component.isStreaming
    ? (component.streamingCode ?? '')
    : component.code;

  return (
    <div className="component-card">
      <div className="card-header">
        <p className="card-prompt">{component.prompt}</p>
        <div className="card-actions">
          <button
            className="btn-refresh"
            onClick={() => setPreviewKey((k) => k + 1)}
            title="미리보기 새로고침"
          >
            ↻
          </button>
          <button
            className="btn-regenerate"
            onClick={() => onRegenerate(component.prompt)}
            disabled={isLoading || !!component.isStreaming}
          >
            {isLoading || component.isStreaming ? '생성 중...' : '재생성'}
          </button>
          <button
            className="btn-remove"
            onClick={() => onRemove(component.id)}
            disabled={!!component.isStreaming}
          >
            삭제
          </button>
        </div>
      </div>
      <div className="card-tabs">
        <div className="tabs-left">
          <button
            className={`tab ${displayTab === 'preview' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('preview')}
            disabled={component.isStreaming}
          >
            미리보기
          </button>
          <button
            className={`tab ${displayTab === 'code' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('code')}
            disabled={component.isStreaming}
          >
            코드
          </button>
        </div>
        {displayTab === 'preview' && (
          <div className="viewport-buttons">
            {VIEWPORTS.map((vp) => (
              <button
                key={vp.id}
                className={`btn-viewport ${viewport === vp.id ? 'btn-viewport--active' : ''}`}
                onClick={() => setViewport(vp.id)}
                title={`${vp.label} (${vp.width})`}
              >
                {vp.icon} {vp.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="card-content">
        {displayTab === 'preview' ? (
          <LivePreview
            key={previewKey}
            code={component.code}
            viewportWidth={VIEWPORTS.find((v) => v.id === viewport)!.width}
            isStreaming={component.isStreaming}
          />
        ) : (
          <CodeView code={displayCode} isStreaming={component.isStreaming} />
        )}
      </div>
    </div>
  );
}
