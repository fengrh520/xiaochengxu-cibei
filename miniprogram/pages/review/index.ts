import { buildSession, getDashboard, loadState } from '../../utils/state';

type FilterKey = 'all' | 'urgent' | 'favorites' | 'mistakes';
type QueueCard = {
  id: 'review' | 'favorites' | 'mistakes';
  title: string;
  desc: string;
  count: number;
  priority: 'urgent' | 'focus' | 'warning' | 'normal';
  filter: FilterKey;
};

Page({
  data: {
    queueCards: [] as QueueCard[],
    filteredQueueCards: [] as QueueCard[],
    weakWords: [] as ReturnType<typeof getDashboard>['weakWords'],
    totalQueueCount: 0,
    activeFilter: 'all' as FilterKey
  },
  onShow() {
    const state = loadState();
    const dashboard = getDashboard(state);
    const reviewSession = buildSession(state, 'review');
    const favoriteSession = buildSession(state, 'favorites');
    const mistakeSession = buildSession(state, 'mistakes');
    const queueCards: QueueCard[] = [
      { id: 'review', title: '到期复习', desc: '优先消化到期词和掌握度不稳的内容。', count: reviewSession.length, priority: reviewSession.length ? 'urgent' : 'normal', filter: 'urgent' },
      { id: 'favorites', title: '收藏巩固', desc: '回看你标记收藏的重点词。', count: favoriteSession.length, priority: favoriteSession.length ? 'focus' : 'normal', filter: 'favorites' },
      { id: 'mistakes', title: '错词回看', desc: '针对错词做再次识别和强化记忆。', count: mistakeSession.length, priority: mistakeSession.length ? 'warning' : 'normal', filter: 'mistakes' }
    ];
    this.setData({
      queueCards,
      filteredQueueCards: this.getFilteredCards(queueCards, this.data.activeFilter),
      weakWords: dashboard.weakWords,
      totalQueueCount: queueCards.reduce((sum, item) => sum + item.count, 0)
    });
  },
  getFilteredCards(queueCards: QueueCard[], filter: FilterKey) {
    if (filter === 'all') return queueCards;
    return queueCards.filter((item) => item.filter === filter);
  },
  onFilterTap(event: WechatMiniprogram.BaseEvent) {
    const { filter } = event.currentTarget.dataset as { filter?: FilterKey };
    if (!filter) return;
    this.setData({ activeFilter: filter, filteredQueueCards: this.getFilteredCards(this.data.queueCards, filter) });
  },
  onQueueTap(event: WechatMiniprogram.BaseEvent) {
    const { mode } = event.currentTarget.dataset as { mode?: 'review' | 'favorites' | 'mistakes' };
    if (!mode) return;
    const state = loadState();
    const session = buildSession(state, mode);
    if (!session.length) {
      wx.showToast({ title: '当前没有可进入的复习内容', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/study/index?mode=${mode}` });
  }
});
