import { render, screen } from '@testing-library/react';
import { LivePreview } from './LivePreview';

vi.mock('react-live', () => ({
  LiveProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LivePreview: () => <div data-testid="live-preview" />,
  LiveError: () => null,
}));

describe('LivePreview - 뷰포트 너비', () => {
  it('viewportWidth를 지정하지 않으면 100% 너비로 렌더링된다', () => {
    const { container } = render(<LivePreview code="render(<div/>);" />);
    const renderDiv = container.querySelector('.preview-render') as HTMLElement;

    expect(renderDiv.style.width).toBe('100%');
  });

  it('viewportWidth="375px" 전달 시 해당 너비가 적용된다', () => {
    const { container } = render(
      <LivePreview code="render(<div/>);" viewportWidth="375px" />,
    );
    const renderDiv = container.querySelector('.preview-render') as HTMLElement;

    expect(renderDiv.style.width).toBe('375px');
  });

  it('viewportWidth="768px" 전달 시 해당 너비가 적용된다', () => {
    const { container } = render(
      <LivePreview code="render(<div/>);" viewportWidth="768px" />,
    );
    const renderDiv = container.querySelector('.preview-render') as HTMLElement;

    expect(renderDiv.style.width).toBe('768px');
  });

  it('live-preview 컴포넌트가 렌더링된다', () => {
    render(<LivePreview code="render(<div/>);" />);
    expect(screen.getByTestId('live-preview')).toBeInTheDocument();
  });

  it('isStreaming이 true이면 "생성 중..." 메시지를 표시한다', () => {
    const { container } = render(<LivePreview code="render(<div/>);" isStreaming={true} />);
    expect(container.textContent).toContain('생성 중...');
  });
});
