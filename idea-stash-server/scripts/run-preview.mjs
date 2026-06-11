import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulePath = path.resolve(__dirname, '../dist/services/metadataService.js');

const { detectAndFetchMetadata } = await import(modulePath);

const urls = [
  // YouTube full URL
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  // YouTube short youtu.be
  'https://youtu.be/dQw4w9WgXcQ',
  // GitHub repo
  'https://github.com/facebook/react',
  // GitHub profile
  'https://github.com/torvalds',
  // Twitter (may redirect to x.com)
  'https://twitter.com/jack/status/20',
  // Article likely with OG image
  'https://blog.mozilla.org',
  // Example.com (no OG image)
  'https://example.com',
  // Medium article (has OG)
  'https://medium.com/topic/programming',
  // Generic website
  'https://news.ycombinator.com',
];

for (const u of urls) {
  try {
    const detected = await detectAndFetchMetadata(u);
    console.log('URL:', u);
    console.log(JSON.stringify({ contentType: detected.contentType, title: detected.title, thumbnail: detected.thumbnail, metadataSample: { siteName: detected.metadata?.siteName, ownerAvatar: detected.metadata?.ownerAvatar, tweetText: detected.metadata?.tweetText } }, null, 2));
    console.log('---');
  } catch (err) {
    console.error('Error for', u, err && err.message ? err.message : err);
  }
}
