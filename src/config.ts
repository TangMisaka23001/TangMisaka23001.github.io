export const SITE = {
  website: "https://misakatang.cn/", // replace this with your deployed domain
  author: "MisakaTang",
  profile: "https://github.com/TangMisaka23001",
  desc: "The limits of my language are the limits of my world",
  title: "MisakaTang's Blog",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/TangMisaka23001/TangMisaka23001.github.io/edit/source/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "zh-CN", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Shanghai", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
