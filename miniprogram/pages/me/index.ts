import { getDashboard, loadState } from '../../utils/state';

Page({
  data: {
    profileInitial: '学',
    activeBookName: '',
    goalText: '',
    progressStats: [] as Array<{ key: string; label: string; value: string; note: string }>,
    shortcuts: [
      { id: 'study', title: '继续学习', desc: '进入学习页继续本轮计划' },
      { id: 'review', title: '开始复习', desc: '优先处理到期、收藏和错词' },
      { id: 'books', title: '切换词书', desc: '查看当前词书与切换其他词书' },
      { id: 'favorites', title: '收藏巩固', desc: '回看收藏的重点单词' }
    ],
    supportItems: [
      { id: 'settings', title: '学习设置', desc: '当前版本聚焦主流程，保留常用设置入口。' },
      { id: 'help', title: '关于与帮助', desc: '当前版本已经具备学习、复习、切词书和收藏错词主流程。' }
    ]
  },
  onShow() {
    const state = loadState();
    const dashboard = getDashboard(state);
    this.setData({
      activeBookName: dashboard.activeBook.name,
      goalText: `今天已学习 ${dashboard.today.studiedWords} / ${state.dailyGoal} 词`,
      progressStats: [
        { key: 'studied', label: '累计学习', value: String(Object.values(state.progressByWordId).filter((item) => item.seenCount > 0).length), note: '已留下学习记录的单词' },
        { key: 'mastered', label: '已掌握', value: String(dashboard.metrics.mastered), note: '掌握度达到 80%+' },
        { key: 'review', label: '待复习', value: String(dashboard.metrics.due), note: '建议优先清空' },
        { key: 'accuracy', label: '正确率', value: `${dashboard.accuracy}%`, note: '累计答题表现' },
      ]
    });
  },
  openStudy(mode: 'study' | 'review' | 'favorites') {
    const { buildSession } = require('../../utils/state');
    const state = loadState();
    const realMode = mode === 'review' ? 'review' : mode === 'favorites' ? 'favorites' : 'study';
    const session = buildSession(state, realMode);
    if (!session.length) {
      wx.showToast({ title: mode === 'favorites' ? '当前没有收藏词可巩固' : mode === 'review' ? '当前没有可复习内容' : '当前没有可学习的单词', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/study/index?mode=${realMode}` });
  },
  onShortcutTap(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id?: string };
    if (id === 'study') {
      this.openStudy('study');
      return;
    }
    if (id === 'review') {
      wx.switchTab({ url: '/pages/review/index' });
      return;
    }
    if (id === 'books') {
      wx.switchTab({ url: '/pages/books/index' });
      return;
    }
    this.openStudy('favorites');
  },
  onStatTap(event: WechatMiniprogram.BaseEvent) {
    const { key } = event.currentTarget.dataset as { key?: string };
    if (key === 'review') {
      wx.switchTab({ url: '/pages/review/index' });
      return;
    }
    if (key === 'accuracy' || key === 'studied' || key === 'mastered') {
      wx.switchTab({ url: '/pages/home/index' });
    }
  },
  onSupportTap(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id?: string };
    wx.showToast({ title: id === 'settings' ? '设置能力将在后续版本补齐' : '欢迎继续补充反馈与建议', icon: 'none' });
  }
});
