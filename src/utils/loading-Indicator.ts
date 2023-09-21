export function startLoadingIndicator(message?: string): () => void {
  let counter = 0;
  const loadingChars = ['|', '/', '-', '\\'];
  const loadingInterval = setInterval(() => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(
      message
        ? `message ${loadingChars[counter % 4]}`
        : `Gathering data and scanning packages... ${loadingChars[counter % 4]}`
    );
    counter++;
  }, 200);

  return () => {
    clearInterval(loadingInterval);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  };
}
