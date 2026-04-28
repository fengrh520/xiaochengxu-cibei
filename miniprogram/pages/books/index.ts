import { getActiveBook, getBookMetrics, loadState, saveState } from '../../utils/state';
import type { WordBook } from '../../utils/types';

Page({
  data: {
    currentBook: null as WordBook | null,
    bookMetrics: { total: 0, studied: 0, mastered: 0, due: 0, favorites: 0, mistakes: 0 },
    allBooks: [] as WordBook[]
  },
  onShow() {
    const state = loadState();
    const currentBook = getActiveBook(state);
    this.setData({ currentBook, bookMetrics: getBookMetrics(state, currentBook), allBooks: state.books });
  },
  onSelectBook(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (!id) return;
    const state = loadState();
    const nextState = { ...state, activeBookId: id };
    saveState(nextState);
    const currentBook = getActiveBook(nextState);
    this.setData({ currentBook, bookMetrics: getBookMetrics(nextState, currentBook), allBooks: nextState.books });
    wx.showToast({ title: `Switched to ${currentBook.name}`, icon: 'none' });
  },
  onFeatureTap() {
    wx.showToast({ title: 'Import and backup come later', icon: 'none' });
  }
});
