const {
  buildSession,
  getWordProgress,
  loadState,
  saveState,
  toggleFavorite,
  updateWordOutcome
} = require('../../utils/state');

const AUTO_NEXT_DELAY = 220;
const ENTER_RESET_DELAY = 40;

Page({
  audioCtx: null,
  autoNextTimer: 0,
  enterTimer: 0,
  data: {
    modeLabel: '学习模式',
    words: [],
    currentIndex: 0,
    currentWord: null,
    progress: null,
    revealed: false,
    finished: false,
    answering: false,
    speaking: false,
    cardStage: 'idle',
    summary: { remembered: 0, forgotten: 0 }
  },
  onLoad(query) {
    const mode = query && query.mode ? query.mode : 'study';
    const state = loadState();
    const words = buildSession(state, mode);
    const labels = {
      study: '学习新词',
      review: '到期复习',
      favorites: '收藏巩固',
      mistakes: '错词回看'
    };

    this.audioCtx = wx.createInnerAudioContext();
    this.audioCtx.obeyMuteSwitch = false;
    this.audioCtx.onPlay(() => this.setData({ speaking: true }));
    this.audioCtx.onStop(() => this.setData({ speaking: false }));
    this.audioCtx.onEnded(() => this.setData({ speaking: false }));
    this.audioCtx.onError(() => {
      this.setData({ speaking: false });
      wx.showToast({ title: '当前单词暂时无法发音', icon: 'none' });
    });

    if (!words.length) {
      this.setData({
        finished: true,
        modeLabel: labels[mode] || '学习模式'
      });
      return;
    }

    this.setData({
      modeLabel: labels[mode] || '学习模式',
      words: words,
      currentIndex: 0,
      currentWord: words[0],
      progress: getWordProgress(state, words[0].id),
      revealed: false,
      finished: false,
      answering: false,
      speaking: false,
      cardStage: 'enter',
      summary: { remembered: 0, forgotten: 0 }
    });
    this.queueEnterReset();
  },
  onUnload() {
    if (this.autoNextTimer) clearTimeout(this.autoNextTimer);
    if (this.enterTimer) clearTimeout(this.enterTimer);
    if (this.audioCtx) {
      this.audioCtx.destroy();
      this.audioCtx = null;
    }
  },
  queueEnterReset() {
    if (this.enterTimer) clearTimeout(this.enterTimer);
    this.enterTimer = setTimeout(() => {
      this.setData({ cardStage: 'idle' });
    }, ENTER_RESET_DELAY);
  },
  onReveal() {
    this.setData({ revealed: true });
  },
  onPronounce() {
    const currentWord = this.data.currentWord;
    if (!currentWord || !this.audioCtx) return;
    const word = encodeURIComponent((currentWord.word || '').trim());
    if (!word) return;
    this.audioCtx.stop();
    this.audioCtx.src = 'https://dict.youdao.com/dictvoice?audio=' + word + '&type=2';
    this.audioCtx.play();
  },
  onToggleFavorite() {
    const currentWord = this.data.currentWord;
    if (!currentWord) return;
    const nextState = toggleFavorite(loadState(), currentWord.id);
    saveState(nextState);
    this.setData({ progress: getWordProgress(nextState, currentWord.id) });
  },
  goNext(nextState, rememberedBool) {
    const nextIndex = this.data.currentIndex + 1;
    const nextSummary = {
      remembered: this.data.summary.remembered + (rememberedBool ? 1 : 0),
      forgotten: this.data.summary.forgotten + (rememberedBool ? 0 : 1)
    };
    if (nextIndex >= this.data.words.length) {
      this.setData({
        finished: true,
        answering: false,
        revealed: false,
        cardStage: 'idle',
        summary: nextSummary
      });
      return;
    }
    const nextWord = this.data.words[nextIndex];
    this.setData({
      currentIndex: nextIndex,
      currentWord: nextWord,
      progress: getWordProgress(nextState, nextWord.id),
      revealed: false,
      answering: false,
      cardStage: 'enter',
      summary: nextSummary
    });
    this.queueEnterReset();
  },
  onAnswer(event) {
    const currentWord = this.data.currentWord;
    if (!currentWord || this.data.answering) return;
    const rememberedBool = event.currentTarget.dataset.remembered === 'true';
    const nextState = updateWordOutcome(loadState(), currentWord.id, rememberedBool);
    saveState(nextState);
    wx.showToast({
      title: rememberedBool ? '已标记为记住' : '已加入重点复习',
      icon: 'none'
    });
    this.setData({
      answering: true,
      cardStage: 'leave'
    });
    if (this.autoNextTimer) clearTimeout(this.autoNextTimer);
    this.autoNextTimer = setTimeout(() => this.goNext(nextState, rememberedBool), AUTO_NEXT_DELAY);
  },
  onFinishBack() {
    wx.navigateBack();
  }
});
