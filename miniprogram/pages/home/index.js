const { getDashboard, getRecentActivity, loadState } = require('../../utils/state');

Page({
  data: {
    activeBookName: '',
    reviewQueueCount: 0,
    todayGoal: 0,
    studiedToday: 0,
    streak: 0,
    accuracy: '0%',
    weakWords: [],
    completionRate: 0,
    trendDays: [],
    quickActions: [
      { id: 'study', label: '开始学习', desc: '学习新词与未掌握词' },
      { id: 'review', label: '重点复习', desc: '优先处理到期与错词' },
      { id: 'books', label: '切换词书', desc: '查看内置词书' },
      { id: 'mistakes', label: '错词回看', desc: '集中回看易错内容' }
    ]
  },
  onShow() {
    const state = loadState();
    const dashboard = getDashboard(state);
    const completionRate = state.dailyGoal ? Math.min(100, Math.round((dashboard.today.studiedWords / state.dailyGoal) * 100)) : 0;
    const rawTrend = getRecentActivity(state, 7);
    const maxValue = Math.max.apply(null, rawTrend.map((item) => item.studiedWords).concat([1]));
    const trendDays = rawTrend.map((item) => ({
      label: item.date.slice(5),
      value: item.studiedWords,
      height: Math.max(18, Math.round((item.studiedWords / maxValue) * 100)),
    }));
    this.setData({
      activeBookName: dashboard.activeBook.name,
      reviewQueueCount: dashboard.metrics.due,
      todayGoal: state.dailyGoal,
      studiedToday: dashboard.today.studiedWords,
      streak: dashboard.streak,
      accuracy: `${dashboard.accuracy}%`,
      weakWords: dashboard.weakWords,
      completionRate,
      trendDays,
    });
  },
  openStudy(mode) {
    const { buildSession } = require('../../utils/state');
    const state = loadState();
    const session = buildSession(state, mode);
    if (!session.length) {
      wx.showToast({ title: mode === 'mistakes' ? '当前没有错词可回看' : '当前没有可学习的单词', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/study/index?mode=${mode}` });
  },
  onStartStudy() { this.openStudy('study'); },
  onHeroTap() { this.openStudy('study'); },
  onMetricTap(event) {
    const target = event.currentTarget.dataset.target;
    if (target === 'study') return this.openStudy('study');
    if (target === 'review') return wx.switchTab({ url: '/pages/review/index' });
    if (target === 'books') return wx.switchTab({ url: '/pages/books/index' });
    return wx.switchTab({ url: '/pages/me/index' });
  },
  onWeakWordsTap() { this.openStudy('mistakes'); },
  onQuickActionTap(event) {
    const action = event.currentTarget.dataset.action;
    if (action === 'books') return wx.switchTab({ url: '/pages/books/index' });
    if (action === 'review') return wx.switchTab({ url: '/pages/review/index' });
    if (action === 'study') return this.openStudy('study');
    return this.openStudy('mistakes');
  }
});
