import { describe, it, expect } from 'vitest';
import { stripCodeFences, ensureRenderCall } from './codeProcessing';

describe('stripCodeFences', () => {
  it('```jsx 코드 펜스를 제거한다', () => {
    const input = '```jsx\nconst Button = () => <button>Click</button>;\n```';
    const result = stripCodeFences(input);
    expect(result).toBe('const Button = () => <button>Click</button>;');
  });

  it('```javascript 코드 펜스를 제거한다', () => {
    const input = '```javascript\nconst x = 1;\n```';
    const result = stripCodeFences(input);
    expect(result).toBe('const x = 1;');
  });

  it('```typescript 코드 펜스를 제거한다', () => {
    const input = '```typescript\nconst x: number = 1;\n```';
    const result = stripCodeFences(input);
    expect(result).toBe('const x: number = 1;');
  });

  it('```tsx 코드 펜스를 제거한다', () => {
    const input = '```tsx\nconst App = () => <div>app</div>;\n```';
    const result = stripCodeFences(input);
    expect(result).toBe('const App = () => <div>app</div>;');
  });

  it('펜스 없는 코드는 그대로 반환한다', () => {
    const input = 'const Button = () => <button>Click</button>;';
    const result = stripCodeFences(input);
    expect(result).toBe('const Button = () => <button>Click</button>;');
  });

  it('앞뒤 공백을 제거한다', () => {
    const input = '  const x = 1;  ';
    const result = stripCodeFences(input);
    expect(result).toBe('const x = 1;');
  });

  it('여러 개의 펜스 중 모두 제거한다', () => {
    const input = '```js\nconst a = 1;\n```\nSome text\n```js\nconst b = 2;\n```';
    const result = stripCodeFences(input);
    expect(result).toContain('const a = 1;');
    expect(result).toContain('const b = 2;');
    expect(result).not.toContain('```');
  });
});

describe('ensureRenderCall', () => {
  it('render() 없으면 컴포넌트 이름으로 추가한다', () => {
    const input = 'const Button = () => <button>Click</button>;';
    const result = ensureRenderCall(input);
    expect(result).toContain('render(<Button />);');
  });

  it('function으로 선언한 컴포넌트도 감지한다', () => {
    const input = 'function Button() { return <button>Click</button>; }';
    const result = ensureRenderCall(input);
    expect(result).toContain('render(<Button />);');
  });

  it('이미 render() 있으면 추가하지 않는다', () => {
    const input = 'const Button = () => <button>Click</button>;\n\nrender(<Button />);';
    const result = ensureRenderCall(input);
    const renderCount = (result.match(/render\(/g) || []).length;
    expect(renderCount).toBe(1);
  });

  it('render() 호출이 있으면 코드를 변경하지 않는다', () => {
    const input = 'const App = () => <div />;\nrender(<App />);';
    const result = ensureRenderCall(input);
    expect(result).toBe(input);
  });

  it('컴포넌트 이름이 없으면 코드를 그대로 반환한다', () => {
    const input = 'const x = 1;';
    const result = ensureRenderCall(input);
    expect(result).toBe(input);
  });

  it('복수 개의 컴포넌트 중 첫 번째를 사용한다', () => {
    const input = 'const Button = () => <button />;\nconst Dialog = () => <div />;';
    const result = ensureRenderCall(input);
    expect(result).toContain('render(<Button />);');
  });

  it('render() 호출이 공백을 포함해도 감지한다', () => {
    const input = 'const Button = () => <button />;\nrender ( <Button /> );';
    const result = ensureRenderCall(input);
    expect(result).toBe(input);
  });
});
