const { getActiveBook, getBookMetrics, loadState, saveState } = require('../../utils/state');

Page({
  data: {
    currentBook: null,
    bookMetrics: { total: 0, studied: 0, mastered: 0, due: 0, favorites: 0, mistakes: 0 },
    allBooks: []
  },
  onShow() {
    const state = loadState();
    const currentBook = getActiveBook(state);
    this.setData({ currentBook, bookMetrics: getBookMetrics(state, currentBook), allBooks: state.books });
  },
  onSelectBook(event) {
    const id = event.currentTarget.dataset.id;
    if (!id) return;
    const state = loadState();
    const nextState = { ...state, activeBookId: id };
    saveState(nextState);
    const currentBook = getActiveBook(nextState);
    this.setData({ currentBook, bookMetrics: getBookMetrics(nextState, currentBook), allBooks: nextState.books });
    wx.showToast({ title: '已切换到 ' + currentBook.name, icon: 'none' });
  },
  onFeatureTap() {
    wx.showToast({ title: '导入和备份会在后续版本补齐', icon: 'none' });
  }
});
