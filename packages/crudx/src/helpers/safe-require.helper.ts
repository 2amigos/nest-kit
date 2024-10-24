export function safeRequire<T = any>(path: string, loader?: () => T): T | null {
  try {
    return loader ? loader() : require(path);
  } catch (_) {
    return null;
  }
}
