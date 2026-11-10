import '@testing-library/jest-dom';

// Giả lập an toàn getContext trong JSDOM để không in thông báo "Not implemented"
if (typeof window !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null;
}
