import '@testing-library/jest-dom';

// Giả lập an toàn getContext trong JSDOM để không in thông báo "Not implemented"
if (typeof window !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null;
}

// Giả lập an toàn window.matchMedia trong JSDOM cho GSAP ScrollTrigger
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
