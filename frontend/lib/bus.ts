type Listener = (payload?: any) => void;

const listeners: Record<string, Listener[]> = {};

export function on(event: string, fn: Listener) {
  listeners[event] = listeners[event] || [];
  listeners[event].push(fn);
  return () => off(event, fn);
}

export function off(event: string, fn?: Listener) {
  if (!listeners[event]) return;
  if (!fn) {
    delete listeners[event];
    return;
  }
  listeners[event] = listeners[event].filter(l => l !== fn);
}

export function emit(event: string, payload?: any) {
  const list = listeners[event] || [];
  list.slice().forEach(fn => {
    try { fn(payload); } catch (e) { /* swallow */ }
  });
}

export default { on, off, emit };
