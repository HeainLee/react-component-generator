import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

interface LivePreviewProps {
  code: string;
  viewportWidth?: string;
}

export function LivePreview({ code, viewportWidth = '100%' }: LivePreviewProps) {
  return (
    <div className="preview-panel">
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div className="preview-viewport-wrapper">
            <div
              className="preview-render"
              style={{ width: viewportWidth, maxWidth: '100%', transition: 'width 0.2s ease' }}
            >
              <ReactLivePreview />
            </div>
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
