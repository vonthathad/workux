import cheerio from 'cheerio';

export function getDescription(body) {
  const $ = cheerio.load(body);
  return $('p:first-child').text();
}
