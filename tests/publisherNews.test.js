import test from 'node:test';
import assert from 'node:assert/strict';
import { handleNewsRequest, parsePublisherFeed } from '../services/publisherNews.js';

const feed = `<rss><channel>
  <item><title><![CDATA[Markets &amp; policy]]></title><link>https://publisher.example/article</link><pubDate>Mon, 02 Nov 2026 06:00:00 GMT</pubDate><description><![CDATA[<p>Publisher summary</p>]]></description><media:content url="https://publisher.example/photo.jpg" /></item>
  <item><title>Missing date</title><link>https://publisher.example/undated</link></item>
  <item><title>Unsafe link</title><link>javascript:alert(1)</link><pubDate>Mon, 02 Nov 2026 06:00:00 GMT</pubDate></item>
</channel></rss>`;

test('publisher feeds retain actual source metadata and reject undated or unsafe articles', () => {
  const articles = parsePublisherFeed(feed, 'Publisher');
  assert.equal(articles.length, 1);
  assert.equal(articles[0].title, 'Markets & policy');
  assert.equal(articles[0].summary, 'Publisher summary');
  assert.equal(articles[0].image, 'https://publisher.example/photo.jpg');
  assert.equal(articles[0].source, 'Publisher');
  assert.equal(articles[0].publishedAt, '2026-11-02T06:00:00.000Z');
  assert.deepEqual(parsePublisherFeed('<rss>broken', 'Publisher'), []);
});

test('live news survives one provider failure and deduplicates publisher URLs', async () => {
  let calls = 0;
  const response = await handleNewsRequest(new Request('https://site.example/api/news/live'), async () => {
    if (++calls === 1) throw new Error('Provider timeout');
    return new Response(feed);
  });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.data.length, 1);
  assert.equal(payload.data[0].url, 'https://publisher.example/article');
});

test('scoped financial news returns the array expected by the API client', async () => {
  const response = await handleNewsRequest(new Request('https://site.example/api/news/global?limit=1'), async () => new Response(feed));
  const payload = await response.json();
  assert.ok(Array.isArray(payload));
  assert.equal(payload.length, 1);
  assert.equal(payload[0].category, 'Global Markets');
});

test('total publisher failure returns an uncached JSON error', async () => {
  const response = await handleNewsRequest(new Request('https://site.example/api/news/live'), async () => new Response('Unavailable', { status: 503 }));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.ok((await response.json()).error);
});
