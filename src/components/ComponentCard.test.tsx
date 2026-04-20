import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentCard } from './ComponentCard';
import type { GeneratedComponent } from '../types';

vi.mock('react-live', () => ({
  LiveProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LivePreview: () => <div data-testid="live-preview" />,
  LiveError: () => null,
}));

const mockComponent: GeneratedComponent = {
  id: 'test-1',
  prompt: '버튼 컴포넌트',
  code: 'render(<button>Click me</button>);',
  createdAt: new Date(),
};

function renderCard() {
  return render(
    <ComponentCard
      component={mockComponent}
      onRemove={vi.fn()}
      onRegenerate={vi.fn()}
      isLoading={false}
    />,
  );
}

describe('ComponentCard - 반응형 뷰포트 버튼', () => {
  it('미리보기 탭에서 모바일/태블릿/데스크탑 버튼이 표시된다', () => {
    renderCard();

    expect(screen.getByTitle('모바일 (375px)')).toBeInTheDocument();
    expect(screen.getByTitle('태블릿 (768px)')).toBeInTheDocument();
    expect(screen.getByTitle('데스크탑 (100%)')).toBeInTheDocument();
  });

  it('기본 선택은 데스크탑이다', () => {
    renderCard();

    expect(screen.getByTitle('데스크탑 (100%)')).toHaveClass('btn-viewport--active');
    expect(screen.getByTitle('모바일 (375px)')).not.toHaveClass('btn-viewport--active');
    expect(screen.getByTitle('태블릿 (768px)')).not.toHaveClass('btn-viewport--active');
  });

  it('모바일 버튼 클릭 시 모바일이 활성화된다', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByTitle('모바일 (375px)'));

    expect(screen.getByTitle('모바일 (375px)')).toHaveClass('btn-viewport--active');
    expect(screen.getByTitle('데스크탑 (100%)')).not.toHaveClass('btn-viewport--active');
  });

  it('태블릿 버튼 클릭 시 태블릿이 활성화된다', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByTitle('태블릿 (768px)'));

    expect(screen.getByTitle('태블릿 (768px)')).toHaveClass('btn-viewport--active');
    expect(screen.getByTitle('데스크탑 (100%)')).not.toHaveClass('btn-viewport--active');
  });

  it('코드 탭으로 전환 시 뷰포트 버튼이 사라진다', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('button', { name: '코드' }));

    expect(screen.queryByTitle('모바일 (375px)')).not.toBeInTheDocument();
    expect(screen.queryByTitle('태블릿 (768px)')).not.toBeInTheDocument();
    expect(screen.queryByTitle('데스크탑 (100%)')).not.toBeInTheDocument();
  });

  it('코드 탭에서 미리보기로 돌아오면 뷰포트 버튼이 다시 표시된다', async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole('button', { name: '코드' }));
    await user.click(screen.getByRole('button', { name: '미리보기' }));

    expect(screen.getByTitle('모바일 (375px)')).toBeInTheDocument();
  });
});
