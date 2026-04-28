const STORAGE_KEY = "word-app-mini-state";

export function loadState<T>(fallback: T): T {
  try {
    const value = wx.getStorageSync(STORAGE_KEY);
    return value ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveState<T>(value: T) {
  wx.setStorageSync(STORAGE_KEY, value);
}

export { STORAGE_KEY };
