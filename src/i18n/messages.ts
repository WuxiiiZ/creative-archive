export interface Messages {
  masthead: {
    publicEyebrow: string;
    publicLede: string;
    adminEyebrow: string;
    adminLede: string;
    home: string;
    posts: string;
    newPost: string;
    managePosts: string;
    viewSite: string;
    signOut: string;
    langZh: string;
    langEn: string;
    langNav: string;
  };
  home: {
    eyebrow: string;
    title: string;
    lede: string;
    postsCta: string;
    sectionsLabel: string;
    sectionKind: { A: string; B: string; C: string };
    sectionEmpty: { A: string; B: string; C: string };
    sectionWaiting: string;
    sectionMore: string;
  };
  adminHome: {
    eyebrow: string;
    title: string;
    lede: string;
    statsLabel: string;
    statsEyebrow: string;
    statsTitle: string;
    statsHint: string;
    yesterdayTitle: string;
    yesterdayHint: string;
    yesterdayPosts: string;
    yesterdayImages: string;
    dayTabsLabel: string;
    tabToday: string;
    tabYesterday: string;
    allStatsLabel: string;
    allStatsEyebrow: string;
    allStatsTitle: string;
    allStatsHint: string;
    loading: string;
    todayPosts: string;
    todayImages: string;
    totalPosts: string;
    totalImages: string;
    totalViews: string;
    chartTitle: string;
    chartPosts: string;
    chartImages: string;
    charsChartTitle: string;
    totalChars: string;
    todayChars: string;
    earlierChars: string;
    charsEmpty: string;
  };
  posts: {
    title: string;
    count: (n: number) => string;
    emptyTitle: string;
    emptyBody: string;
    filterLabel: string;
    filterAll: string;
    searchLabel: string;
    searchPlaceholder: string;
    filterEmptyTitle: string;
    filterEmptyBody: string;
    waitingTitle: string;
    waitingBody: string;
    summaryPrefix: string;
    views: (n: number) => string;
  };
  postDetail: {
    back: string;
    none: string;
    loading: string;
    missingEyebrow: string;
    missingTitle: string;
    missingLede: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    lede: string;
    backHome: string;
  };
  login: {
    eyebrow: string;
    title: string;
    hint: string;
    username: string;
    password: string;
    submit: string;
    submitting: string;
    failed: string;
  };
  compose: {
    createEyebrow: string;
    editEyebrow: string;
    createTitle: string;
    editTitle: string;
    createHint: string;
    editHint: string;
    title: string;
    content: string;
    summary: string;
    optional: string;
    section: string;
    language: string;
    tags: string;
    subtags: string;
    images: string;
    imagesHint: string;
    uploading: string;
    removeImage: string;
    titlePlaceholder: string;
    contentPlaceholder: string;
    summaryPlaceholder: string;
    tagsPlaceholder: string;
    subtagsPlaceholder: string;
    save: string;
    update: string;
    saving: string;
    tagsHint: string;
    tagsNoMatch: string;
    tagsSuggestions: string;
    removeTag: string;
    charCount: (n: number) => string;
    aiLabel: string;
    aiHint: string;
    aiOpen: string;
    aiClose: string;
    aiPreviewLabel: string;
    aiPreviewEmpty: string;
    aiSummarize: string;
    aiCritique: string;
    aiProofread: string;
    aiWorking: string;
    aiNeedContent: string;
    aiFailed: string;
    aiCached: string;
    aiCritiqueTitle: string;
    aiAppliedSummary: string;
    aiAppliedProofread: string;
  };
  form: {
    titleRequired: string;
    titleShort: string;
    titleLong: string;
    contentRequired: string;
    saveFailed: string;
    uploadFailed: string;
    saveSuccess: string;
    updateSuccess: string;
    noticeSuccess: string;
    noticeDismiss: string;
  };
  manage: {
    title: string;
    edit: string;
    delete: string;
    deleting: string;
    deleteConfirm: string;
    deleteFailed: string;
    missingEyebrow: string;
    missingTitle: string;
    missingLede: string;
  };
  section: {
    A: string;
    B: string;
    C: string;
  };
  language: {
    en: string;
    zh: string;
  };
  error: {
    title: string;
    fallback: string;
    retry: string;
  };
  connection: {
    wakingTitle: string;
    wakingBody: string;
    unavailableTitle: string;
    unavailableBody: string;
    retry: string;
  };
}

export const en: Messages = {
  masthead: {
    publicEyebrow: "personal fanpage · est. forever",
    publicLede:
      "a little scrapbook corner for diary crumbs, soft galleries, and songs that feel like midnight rain.",
    adminEyebrow: "admin · creative archive",
    adminLede:
      "private desk for drafting diary crumbs, galleries, and soft notes.",
    home: "Home",
    posts: "All Content",
    newPost: "New Post",
    managePosts: "Manage Posts",
    viewSite: "View Site",
    signOut: "Sign out",
    langZh: "中",
    langEn: "EN",
    langNav: "Language",
  },
  home: {
    eyebrow: "welcome",
    title: "Your scrapbook starts here",
    lede: "Flip through diary crumbs, soft galleries, and notes already saved in the archive.",
    postsCta: "All Content",
    sectionsLabel: "Archive sections",
    sectionKind: {
      A: "notebook",
      B: "scratch paper",
      C: "photo paper",
    },
    sectionEmpty: {
      A: "This notebook is still a blank page.",
      B: "No marks on the scratch paper yet.",
      C: "Nothing taped into the gallery yet.",
    },
    sectionWaiting: "Still opening this page…",
    sectionMore: "There's more in this book",
  },
  adminHome: {
    eyebrow: "admin desk",
    title: "Your private scrapbook desk",
    lede: "Draft new entries, or manage what is already published. Everything here stays behind the login gate.",
    statsLabel: "Today’s stats",
    statsEyebrow: "daily",
    statsTitle: "Today",
    statsHint:
      "Live for today. After midnight these numbers freeze — later edits won’t change them.",
    yesterdayTitle: "Yesterday",
    yesterdayHint: "Settled overnight. Changing old posts won’t rewrite this day.",
    yesterdayPosts: "Posts yesterday",
    yesterdayImages: "Images yesterday",
    dayTabsLabel: "Day",
    tabToday: "Today",
    tabYesterday: "Yesterday",
    allStatsLabel: "All-time stats",
    allStatsEyebrow: "all time",
    allStatsTitle: "Everything so far",
    allStatsHint: "All posts, images, views, and how much you wrote.",
    loading: "Gathering numbers…",
    todayPosts: "Posts today",
    todayImages: "Images today",
    totalPosts: "All posts",
    totalImages: "All images",
    totalViews: "All views",
    chartTitle: "Last 7 days",
    chartPosts: "Posts",
    chartImages: "Images",
    charsChartTitle: "Words written",
    totalChars: "total chars",
    todayChars: "Today",
    earlierChars: "Before today",
    charsEmpty: "No writing yet — open New Post to begin.",
  },
  posts: {
    title: "All Content",
    count: (n) => (n === 1 ? "1 entry" : `${n} entries`),
    emptyTitle: "Nothing on the page yet",
    emptyBody: "Entries will show up here once they are published.",
    filterLabel: "Filter content",
    filterAll: "All",
    searchLabel: "Search",
    searchPlaceholder: "Search titles, notes, tags…",
    filterEmptyTitle: "No matching entries",
    filterEmptyBody: "Try another section or a shorter search.",
    waitingTitle: "The scrapbook is still opening",
    waitingBody: "Give the desk a moment — entries will land here when it wakes.",
    summaryPrefix: "Summary: ",
    views: (n) => (n === 1 ? "1 view" : `${n} views`),
  },
  postDetail: {
    back: "All Content",
    none: "—",
    loading: "Loading…",
    missingEyebrow: "entry",
    missingTitle: "Post not found",
    missingLede: "This entry is missing, or the link is out of date.",
  },
  notFound: {
    eyebrow: "404",
    title: "Page not found",
    lede: "This page is not in the archive. It may have moved, or it never existed.",
    backHome: "Back to Home",
  },
  login: {
    eyebrow: "admin",
    title: "Sign in",
    hint: "Enter admin credentials to open the drafting desk.",
    username: "Username",
    password: "Password",
    submit: "Sign in",
    submitting: "Signing in…",
    failed: "Login failed",
  },
  compose: {
    createEyebrow: "new post",
    editEyebrow: "edit post",
    createTitle: "Create Post",
    editTitle: "Edit Post",
    createHint: "Add a title, a section, and the words as they come.",
    editHint: "Update the title, section, or words, then save.",
    title: "Title",
    content: "Content",
    summary: "Summary",
    optional: "optional",
    section: "Section",
    language: "Language",
    tags: "Tags",
    subtags: "Subtags",
    images: "Images",
    imagesHint: "JPEG, PNG, WebP, or GIF — up to 5MB each.",
    uploading: "Uploading…",
    removeImage: "Remove",
    titlePlaceholder: "A working title",
    contentPlaceholder: "Write freely…",
    summaryPlaceholder: "A short line for the scrapbook cover…",
    tagsPlaceholder: "Type and press Enter…",
    subtagsPlaceholder: "Type and press Enter…",
    save: "Save",
    update: "Update",
    saving: "Saving…",
    tagsHint: "Add several — Enter or comma to confirm; click × to remove.",
    tagsNoMatch: "No matches — keep typing, then press Enter to add it.",
    tagsSuggestions: "suggestions",
    removeTag: "Remove",
    charCount: (n) => `${n} chars`,
    aiLabel: "AI assist",
    aiHint: "Uses your current title and body. All results stay in this panel — nothing is written into the form automatically.",
    aiOpen: "Open AI",
    aiClose: "Close AI",
    aiPreviewLabel: "Current content",
    aiPreviewEmpty: "No content yet. Write a draft first.",
    aiSummarize: "Summarize",
    aiCritique: "Critique",
    aiProofread: "Proofread",
    aiWorking: "Thinking…",
    aiNeedContent: "Write some body text first.",
    aiFailed: "AI assist failed",
    aiCached: "Showing the previous result — the text has not changed.",
    aiCritiqueTitle: "Critique",
    aiAppliedSummary: "Summary ready in the panel.",
    aiAppliedProofread: "Corrections ready in the panel.",
  },
  form: {
    titleRequired: "Title is required",
    titleShort: "Title must be at least 3 characters",
    titleLong: "Title must be under 100 characters",
    contentRequired: "Content is required",
    saveFailed: "Failed to save post",
    uploadFailed: "Failed to upload image",
    saveSuccess: "Post saved.",
    updateSuccess: "Post updated.",
    noticeSuccess: "Success",
    noticeDismiss: "Dismiss",
  },
  manage: {
    title: "Manage Posts",
    edit: "Edit",
    delete: "Delete",
    deleting: "Deleting…",
    deleteConfirm: "Delete this post? This cannot be undone.",
    deleteFailed: "Failed to delete post",
    missingEyebrow: "edit",
    missingTitle: "Post not found",
    missingLede: "This entry is missing or was already deleted.",
  },
  section: {
    A: "Writing",
    B: "Design",
    C: "Gallery",
  },
  language: {
    en: "EN",
    zh: "中文",
  },
  error: {
    title: "Something went wrong",
    fallback: "An unexpected error occurred.",
    retry: "Try again",
  },
  connection: {
    wakingTitle: "The archive is waking up",
    wakingBody:
      "The desk was asleep. Give it about a minute — pages will appear when it sits up.",
    unavailableTitle: "The desk is still stretching",
    unavailableBody:
      "Couldn’t reach the archive yet. Wait a moment, then try again.",
    retry: "Try again",
  },
};

export const zh: Messages = {
  masthead: {
    publicEyebrow: "个人同人页 · 一直在",
    publicLede:
      "一小角剪贴簿：日记碎屑、柔软的展廊，还有像午夜雨一样的歌。",
    adminEyebrow: "后台 · creative archive",
    adminLede: "写日记碎屑、展廊和软笔记的私人书桌。",
    home: "首页",
    posts: "所有内容",
    newPost: "新帖",
    managePosts: "管理帖子",
    viewSite: "后台首页",
    signOut: "退出",
    langZh: "中",
    langEn: "EN",
    langNav: "语言",
  },
  home: {
    eyebrow: "欢迎",
    title: "剪贴簿从这里开始",
    lede: "翻看已经收进档案的日记碎屑、柔软展廊，和随手记下的句子。",
    postsCta: "所有内容",
    sectionsLabel: "三个分区",
    sectionKind: {
      A: "日记本",
      B: "草稿纸",
      C: "相纸",
    },
    sectionEmpty: {
      A: "这一本还是空白页。",
      B: "草稿纸上还没有记号。",
      C: "展廊里还没有贴上照片。",
    },
    sectionWaiting: "这一页还在翻开…",
    sectionMore: "这一本里还有",
  },
  adminHome: {
    eyebrow: "后台书桌",
    title: "你的私人剪贴簿书桌",
    lede: "在这里起草新篇，或整理已经发布的条目。整张书桌都在登录门后。",
    statsLabel: "今日数据",
    statsEyebrow: "按日",
    statsTitle: "今天",
    statsHint: "今日实时累计；过零点后会结算冻结，之后改帖不会再动这一天。",
    yesterdayTitle: "昨天",
    yesterdayHint: "已隔夜结算。改旧帖不会改写这一天的数字。",
    yesterdayPosts: "昨日帖子",
    yesterdayImages: "昨日图片",
    dayTabsLabel: "日期",
    tabToday: "Today",
    tabYesterday: "Yesterday",
    allStatsLabel: "全部汇总",
    allStatsEyebrow: "累计",
    allStatsTitle: "全部到现在",
    allStatsHint: "全部帖子、图片、浏览量，以及写了多少字。",
    loading: "正在汇总…",
    todayPosts: "今日帖子",
    todayImages: "今日图片",
    totalPosts: "全部帖子",
    totalImages: "全部图片",
    totalViews: "全部浏览",
    chartTitle: "近 7 天",
    chartPosts: "帖子",
    chartImages: "图片",
    charsChartTitle: "写了多少字",
    totalChars: "总字数",
    todayChars: "今日",
    earlierChars: "今日之前",
    charsEmpty: "还没有正文——去「新帖」写第一段吧。",
  },
  posts: {
    title: "所有内容",
    count: (n) => `${n} 篇`,
    emptyTitle: "这一页还是空的",
    emptyBody: "发布之后，条目会出现在这里。",
    filterLabel: "筛选内容",
    filterAll: "全部",
    searchLabel: "搜索",
    searchPlaceholder: "搜标题、正文、标签…",
    filterEmptyTitle: "没有匹配的内容",
    filterEmptyBody: "换个分区，或缩短搜索词再试。",
    waitingTitle: "剪贴簿还在翻开",
    waitingBody: "书桌刚醒来，再等一会儿，条目就会落到这一页。",
    summaryPrefix: "简介：",
    views: (n) => `${n} 次点击`,
  },
  postDetail: {
    back: "所有内容",
    none: "—",
    loading: "加载中…",
    missingEyebrow: "条目",
    missingTitle: "找不到这篇内容",
    missingLede: "它可能已被删除，或链接已经过期。",
  },
  notFound: {
    eyebrow: "404",
    title: "找不到这一页",
    lede: "档案里没有这一页。也许搬走了，也许从未存在。",
    backHome: "回到首页",
  },
  login: {
    eyebrow: "后台",
    title: "登录",
    hint: "输入管理员账密，打开创作桌。",
    username: "用户名",
    password: "密码",
    submit: "登录",
    submitting: "登录中…",
    failed: "登录失败",
  },
  compose: {
    createEyebrow: "新帖",
    editEyebrow: "编辑",
    createTitle: "写一篇",
    editTitle: "编辑帖子",
    createHint: "写下标题、分区，和此刻想到的句子。",
    editHint: "改好标题、分区或正文，然后保存。",
    title: "标题",
    content: "正文",
    summary: "简介",
    optional: "可选",
    section: "分区",
    language: "语言",
    tags: "标签",
    subtags: "子标签",
    images: "图片",
    imagesHint: "支持 JPEG、PNG、WebP、GIF，单张不超过 5MB。",
    uploading: "上传中…",
    removeImage: "移除",
    titlePlaceholder: "先起个名字",
    contentPlaceholder: "随便写…",
    summaryPlaceholder: "首页卡片上的一句短介绍…",
    tagsPlaceholder: "输入后按 Enter…",
    subtagsPlaceholder: "输入后按 Enter…",
    save: "保存",
    update: "更新",
    saving: "保存中…",
    tagsHint: "可以加多个：Enter 或逗号确认，点 × 删除。",
    tagsNoMatch: "没有匹配，继续输入后按 Enter 即可新增。",
    tagsSuggestions: "建议",
    removeTag: "移除",
    charCount: (n) => `${n} 字`,
    aiLabel: "AI 助手",
    aiHint: "基于当前标题与正文。结果只显示在本窗口，不会自动改表单字段。",
    aiOpen: "打开 AI",
    aiClose: "关闭 AI",
    aiPreviewLabel: "当前正文",
    aiPreviewEmpty: "还没有正文，请先写一点内容。",
    aiSummarize: "总结",
    aiCritique: "评价",
    aiProofread: "纠错语病",
    aiWorking: "思考中…",
    aiNeedContent: "请先写一点正文。",
    aiFailed: "AI 助手失败",
    aiCached: "正文未变化，已显示上次分析结果。",
    aiCritiqueTitle: "评价",
    aiAppliedSummary: "总结已显示在窗口。",
    aiAppliedProofread: "纠错建议已显示在窗口。",
  },
  form: {
    titleRequired: "请填写标题",
    titleShort: "标题至少 3 个字",
    titleLong: "标题请控制在 100 字以内",
    contentRequired: "请填写正文",
    saveFailed: "保存失败",
    uploadFailed: "图片上传失败",
    saveSuccess: "帖子已保存。",
    updateSuccess: "帖子已更新。",
    noticeSuccess: "成功",
    noticeDismiss: "关闭",
  },
  manage: {
    title: "管理帖子",
    edit: "编辑",
    delete: "删除",
    deleting: "删除中…",
    deleteConfirm: "删除这篇帖子？此操作无法撤销。",
    deleteFailed: "删除失败",
    missingEyebrow: "编辑",
    missingTitle: "找不到这篇帖子",
    missingLede: "它可能已被删除，或不在档案里。",
  },
  section: {
    A: "写作",
    B: "设计",
    C: "展廊",
  },
  language: {
    en: "EN",
    zh: "中文",
  },
  error: {
    title: "出了点问题",
    fallback: "发生了意外错误。",
    retry: "再试一次",
  },
  connection: {
    wakingTitle: "档案正在翻开",
    wakingBody: "书桌刚从休眠里醒来，大约半分钟到一分钟。页码写好就会出现。",
    unavailableTitle: "书桌还在伸懒腰",
    unavailableBody: "暂时连不上档案。再等一会儿，然后重试一次。",
    retry: "再试一次",
  },
};

export const messages: Record<"zh" | "en", Messages> = { zh, en };
