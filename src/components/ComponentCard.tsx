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
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '재생성'}
          </button>
          <button
            className="btn-remove"
            onClick={() => onRemove(component.id)}
          >
            삭제
          </button>
        </div>
      </div>
      <div className="card-tabs">
        <div className="tabs-left">
          <button
            className={`tab ${activeTab === 'preview' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            미리보기
          </button>
          <button
            className={`tab ${activeTab === 'code' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            코드
          </button>
        </div>
        {activeTab === 'preview' && (
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
        {activeTab === 'preview' ? (
          <LivePreview
            key={previewKey}
            code={component.code}
            viewportWidth={VIEWPORTS.find((v) => v.id === viewport)!.width}
          />
        ) : (
          <CodeView code={component.code} />
        )}
      </div>
    </div>
  );
}
