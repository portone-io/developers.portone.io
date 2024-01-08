export default function once() {
  let fired = false;
  return function fire(fn: () => void) {
    if (fired) return;
    fired = true;
    fn();
  }
}
