let lastScrollTimestamp = Date.now();
addEventListener("scroll", () => (lastScrollTimestamp = Date.now()));

export default function scrollFinished(): Promise<void> {
  return new Promise((resolve) => {
    const id = setInterval(() => {
      const d = Date.now() - lastScrollTimestamp;
      if (d > 50) {
        resolve();
        clearInterval(id);
      }
    }, 0);
  });
}
