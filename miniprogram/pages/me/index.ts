import { DEFAULT_DAILY_GOAL, buildSession, getDashboard, loadState, saveState } from '../../utils/state';

type ShortcutId = 'study' | 'review' | 'books' | 'favorites';
type SupportId = 'settings' | 'help';

Page({
  data: {
    profileInitial: '我',
    activeBookName: '',
    goalText: '',
    progressStats: [] as Array<{ key: string; label: string; value: string; note: string }>,
    shortcuts: [
      { id: 'study', title: '继续学习', desc: '进入学习页，继续当前词书计划' },
      { id: 'review', title: '开始复习', desc: '直接处理到期、收藏和错词' },
      { id: 'books', title: '切换词书', desc: '查看当前词书并切换其他词书' },
      { id: 'favorites', title: '收藏巩固', desc: '回看收藏的重点单词' }
    ] as Array<{ id: ShortcutId; title: string; desc: string }>,
    supportItems: [
      { id: 'settings', title: '学习设置', desc: '调整每日目标，保留最常用的学习参数。' },
      { id: 'help', title: '关于与帮助', desc: '查看当前可用功能、学习路径和恢复建议。' }
    ] as Array<{ id: SupportId; title: string; desc: string }>
  },
  onShow() {
    const state = loadState();
    const dashboard = getDashboard(state);
    const studiedCount = Object.values(state.progressByWordId).filter((item) => item.seenCount > 0).length;

    this.setData({
      activeBookName: dashboard.activeBook.name,
      goalText: `今天已学习 ${dashboard.today.studiedWords} / ${state.dailyGoal} 词`,
      progressStats: [
        { key: 'studied', label: '累计学习', value: String(studiedCount), note: '已留下学习记录的单词' },
        { key: 'mastered', label: '已掌握', value: String(dashboard.metrics.mastered), note: '掌握度达到 80%+' },
        { key: 'review', label: '待复习', value: String(dashboard.metrics.due), note: '建议优先清空' },
        { key: 'accuracy', label: '正确率', value: `${dashboard.accuracy}%`, note: '累计答题表现' }
      ]
    });
  },
  openStudy(mode: 'study' | 'review' | 'favorites') {
    const realMode = mode === 'review' ? 'review' : mode === 'favorites' ? 'favorites' : 'study';
    const state = loadState();
    const session = buildSession(state, realMode);

    if (!session.length) {
      wx.showToast({
        title:
          mode === 'favorites'
            ? '当前没有收藏词可巩固'
            : mode === 'review'
              ? '当前没有可复习内容'
              : '当前没有可学习的单词',
        icon: 'none'
      });
      return;
    }

    wx.navigateTo({ url: `/pages/study/index?mode=${realMode}` });
  },
  onShortcutTap(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id?: ShortcutId };
    if (id === 'study') {
      this.openStudy('study');
      return;
    }
    if (id === 'review') {
      this.openStudy('review');
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
      this.openStudy('review');
      return;
    }
    if (key === 'mastered') {
      this.openStudy('favorites');
      return;
    }
    wx.switchTab({ url: '/pages/home/index' });
  },
  onSupportTap(event: WechatMiniprogram.BaseEvent) {
    const { id } = event.currentTarget.dataset as { id?: SupportId };
    if (id === 'settings') {
      this.openSettings();
      return;
    }
    this.openHelp();
  },
  openSettings() {
    const state = loadState();
    const options = ['10 词 / 天', '20 词 / 天', '30 词 / 天', '50 词 / 天', '恢复默认'];
    const values = [10, 20, 30, 50, DEFAULT_DAILY_GOAL];

    wx.showActionSheet({
      itemList: options,
      success: ({ tapIndex }) => {
        const nextGoal = values[tapIndex];
        if (!nextGoal) return;
        saveState({ ...state, dailyGoal: nextGoal });
        this.onShow();
        wx.showToast({ title: `已将每日目标调整为 ${nextGoal} 词`, icon: 'none' });
      }
    });
  },
  openHelp() {
    const state = loadState();
    wx.showModal({
      title: '关于与帮助',
      content:
        `当前词书：${state.books.find((book) => book.id === state.activeBookId)?.name || '未选择'}\n` +
        `\n可用功能：\n` +
        `1. 首页开始学习与错词回看\n` +
        `2. 复习模式 / 收藏巩固 / 错词回看\n` +
        `3. 词书切换与每日目标设置\n` +
        `\n如果某个入口没有内容，通常是因为当前还没有到期词、收藏词或错词。先完成几轮学习后，再回来使用会更明显。`,
      showCancel: false,
      confirmText: '我知道了'
    });
  }
});
