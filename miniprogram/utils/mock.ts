import type { AppState } from "./types";

export const mockState: AppState = {
  selectedBookId: "builtin-ky",
  books: [
    {
      id: "builtin-ky",
      name: "考研核心词",
      description: "小程序骨架内置演示词书",
      words: [
        { id: "w1", word: "accurate", translation: "准确的" },
        { id: "w2", word: "derive", translation: "获得；推导" }
      ]
    }
  ]
};
