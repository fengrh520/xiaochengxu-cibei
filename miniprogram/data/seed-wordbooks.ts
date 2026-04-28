import type { WordBook } from '../utils/types';

function createWordBook(
  meta: Omit<WordBook, 'kind' | 'words'>,
  words: Array<Omit<WordBook['words'][number], 'id' | 'bookId'>>,
): WordBook {
  return {
    ...meta,
    kind: 'builtin',
    words: words.map((word, index) => ({
      id: `${meta.id}-${index + 1}`,
      bookId: meta.id,
      ...word,
    })),
  };
}

export const SEED_WORDBOOKS: WordBook[] = [
  createWordBook(
    {
      id: 'kaoyan',
      name: '考研核心词',
      exam: '考研',
      description: '适合考研和进阶英语学习，优先覆盖高频核心词。',
      accentColor: '#2563eb',
    },
    [
      { word: 'accurate', translation: '准确的', phonetic: '/ˈækjərət/', partOfSpeech: 'adj.', example: 'The answer is accurate and complete.', mnemonic: '对准事实就是准确。' },
      { word: 'derive', translation: '获得；推导', phonetic: '/dɪˈraɪv/', partOfSpeech: 'v.', example: 'Many words derive from Latin roots.', mnemonic: '像从源头里引出来。' },
      { word: 'sustain', translation: '维持；支撑', phonetic: '/səˈsteɪn/', partOfSpeech: 'v.', example: 'It is hard to sustain focus without a plan.', mnemonic: '在下面支撑住状态。' },
      { word: 'feature', translation: '特点；功能', phonetic: '/ˈfiːtʃər/', partOfSpeech: 'n.', example: 'This app adds a review feature.', mnemonic: '产品亮点功能。' },
      { word: 'maintain', translation: '保持；维护', phonetic: '/meɪnˈteɪn/', partOfSpeech: 'v.', example: 'Review helps maintain your memory.', mnemonic: '抓住主要状态不掉。' },
      { word: 'resource', translation: '资源', phonetic: '/ˈriːsɔːrs/', partOfSpeech: 'n.', example: 'Time is your most valuable learning resource.', mnemonic: '可利用的来源。' },
      { word: 'opportunity', translation: '机会', phonetic: '/ˌɑːpərˈtuːnəti/', partOfSpeech: 'n.', example: 'Every review is an opportunity to improve.', mnemonic: '合适的时机。' },
      { word: 'precise', translation: '精确的', phonetic: '/prɪˈsaɪs/', partOfSpeech: 'adj.', example: 'Use precise words in your writing.', mnemonic: '切得很准。' },
      { word: 'compile', translation: '编译；汇编', phonetic: '/kəmˈpaɪl/', partOfSpeech: 'v.', example: 'The app failed to compile.', mnemonic: '把内容收集编到一起。' },
      { word: 'constraint', translation: '限制；约束', phonetic: '/kənˈstreɪnt/', partOfSpeech: 'n.', example: 'Time is the biggest constraint.', mnemonic: 'constrain 的名词形式。' },
      { word: 'inevitable', translation: '不可避免的', phonetic: '/ɪnˈevɪtəbl/', partOfSpeech: 'adj.', example: 'Mistakes are inevitable while learning.', mnemonic: '无法避免。' },
      { word: 'allocate', translation: '分配', phonetic: '/ˈæləkeɪt/', partOfSpeech: 'v.', example: 'Allocate time for daily review.', mnemonic: '放到对应位置。' },
      { word: 'substitute', translation: '代替；替代品', phonetic: '/ˈsʌbstɪtuːt/', partOfSpeech: 'v./n.', example: 'Nothing can substitute for regular review.', mnemonic: 'sub 表示下面，stitute 表示站立替换。' },
      { word: 'dimension', translation: '维度；尺寸', phonetic: '/dɪˈmenʃn/', partOfSpeech: 'n.', example: 'Vocabulary depth is another dimension of language skill.', mnemonic: '衡量事物的一个方面。' },
      { word: 'interpret', translation: '解释；口译', phonetic: '/ɪnˈtɜːrprət/', partOfSpeech: 'v.', example: 'It is important to interpret the sentence correctly.', mnemonic: '把意思在中间传达出来。' }
    ],
  ),
  createWordBook(
    {
      id: 'cet6',
      name: '四六级高频词',
      exam: 'CET-6',
      description: '偏重阅读、写作和考试场景的常见高频词。',
      accentColor: '#0f766e',
    },
    [
      { word: 'accumulate', translation: '积累；堆积', phonetic: '/əˈkjuːmjəleɪt/', partOfSpeech: 'v.', example: 'Good habits accumulate over time.', mnemonic: '一点点堆起来。' },
      { word: 'acknowledge', translation: '承认；确认收到', phonetic: '/əkˈnɑːlɪdʒ/', partOfSpeech: 'v.', example: 'He acknowledged the mistake quickly.', mnemonic: '知道并承认。' },
      { word: 'ambitious', translation: '有抱负的', phonetic: '/æmˈbɪʃəs/', partOfSpeech: 'adj.', example: 'She set an ambitious goal this year.', mnemonic: '目标很大。' },
      { word: 'anticipate', translation: '预期；预料', phonetic: '/ænˈtɪsɪpeɪt/', partOfSpeech: 'v.', example: 'We anticipate better results after review.', mnemonic: '提前去想。' },
      { word: 'comprehensive', translation: '全面的；综合的', phonetic: '/ˌkɑːmprɪˈhensɪv/', partOfSpeech: 'adj.', example: 'The report gives a comprehensive summary.', mnemonic: '把内容都抓住。' },
      { word: 'constitute', translation: '构成；组成', phonetic: '/ˈkɑːnstɪtuːt/', partOfSpeech: 'v.', example: 'Practice and review constitute the core of learning.', mnemonic: '组成整体。' },
      { word: 'convey', translation: '传达；运输', phonetic: '/kənˈveɪ/', partOfSpeech: 'v.', example: 'Words convey meaning precisely.', mnemonic: '把信息送过去。' },
      { word: 'decline', translation: '下降；谢绝', phonetic: '/dɪˈklaɪn/', partOfSpeech: 'v./n.', example: 'Without practice, memory may decline.', mnemonic: '往下倾斜。' },
      { word: 'emerge', translation: '出现；显现', phonetic: '/ɪˈmɜːrdʒ/', partOfSpeech: 'v.', example: 'Patterns emerge after repeated review.', mnemonic: '从里面冒出来。' },
      { word: 'retain', translation: '保留；记住', phonetic: '/rɪˈteɪn/', partOfSpeech: 'v.', example: 'Spacing helps you retain vocabulary.', mnemonic: '重新抓住。' }
    ],
  ),
  createWordBook(
    {
      id: 'tech-ui',
      name: '软件与产品常用词',
      exam: '场景词汇',
      description: '适合做产品、前端、AI 应用时经常看到的高频界面词。',
      accentColor: '#7c3aed',
    },
    [
      { word: 'dashboard', translation: '仪表盘；总览面板', phonetic: '/ˈdæʃbɔːrd/', partOfSpeech: 'n.', example: 'The dashboard shows today’s learning progress.', mnemonic: '车上的仪表盘引申为总览面板。' },
      { word: 'settings', translation: '设置', phonetic: '/ˈsetɪŋz/', partOfSpeech: 'n.', example: 'Open settings to change your preferences.', mnemonic: '把参数设好。' },
      { word: 'notification', translation: '通知', phonetic: '/ˌnoʊtɪfɪˈkeɪʃn/', partOfSpeech: 'n.', example: 'You will receive a notification for reminders.', mnemonic: '被 notice 到的消息。' },
      { word: 'privacy', translation: '隐私', phonetic: '/ˈpraɪvəsi/', partOfSpeech: 'n.', example: 'The app explains its privacy policy clearly.', mnemonic: '私人的范围。' },
      { word: 'feedback', translation: '反馈', phonetic: '/ˈfiːdbæk/', partOfSpeech: 'n.', example: 'User feedback helps improve the app.', mnemonic: '喂回来，信息回流。' },
      { word: 'upload', translation: '上传', phonetic: '/ˌʌpˈloʊd/', partOfSpeech: 'v./n.', example: 'Upload the file to import your words.', mnemonic: '往上装载。' },
      { word: 'download', translation: '下载', phonetic: '/ˌdaʊnˈloʊd/', partOfSpeech: 'v./n.', example: 'Download your backup before switching devices.', mnemonic: '往下取回。' },
      { word: 'preview', translation: '预览', phonetic: '/ˈpriːvjuː/', partOfSpeech: 'n./v.', example: 'Preview the imported words before saving.', mnemonic: '提前看一眼。' },
      { word: 'bookmark', translation: '书签；收藏', phonetic: '/ˈbʊkmɑːrk/', partOfSpeech: 'n./v.', example: 'Bookmark difficult words for later review.', mnemonic: '夹书签，引申为收藏。' },
      { word: 'shortcut', translation: '快捷方式', phonetic: '/ˈʃɔːrtkʌt/', partOfSpeech: 'n.', example: 'Use the shortcut to jump into review mode.', mnemonic: '短路径就是捷径。' }
    ],
  )
];
