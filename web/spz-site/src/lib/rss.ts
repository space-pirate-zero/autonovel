import Parser from 'rss-parser';

const parser = new Parser();

export const fetchRssFeed = async (feedUrl: string) => {
  const feed = await parser.parseURL(feedUrl);
  return feed.items;
};
