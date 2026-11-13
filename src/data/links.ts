export interface FriendLink {
  /** 显示名称 */
  title: string;
  /** 链接地址 */
  url: string;
  /** 一句话描述 */
  desc?: string;
}

export const LINKS: FriendLink[] = [
  {
    title: "个人账本 Bookkeeping",
    url: "https://tangmisaka23001.github.io/book-keeping/",
    desc: "复式记账 + 订阅台账 + 耗材摊销",
  },
  {
    title: "且慢长赢知识库",
    url: "https://tangmisaka23001.github.io/qieman-finance/",
    desc: "E 大 645 篇图文帖炼化成的投资知识库",
  },
];
