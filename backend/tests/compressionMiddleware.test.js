import { compressionMiddleware } from '../src/middleware/compressionMiddleware.js';
import express from 'express';
import request from 'supertest';

function buildApp(payload, contentType = 'application/json') {
  const app = express();
  app.use(compressionMiddleware);
  app.get('/data', (_req, res) => {
    res.setHeader('Content-Type', contentType);
    res.send(payload);
  });
  return app;
}

describe('compressionMiddleware', () => {
  it('sets Content-Encoding: br for large response when Accept-Encoding: br', async () => {
    const large = JSON.stringify({ data: 'x'.repeat(2000) });
    const app = buildApp(large);
    const res = await request(app).get('/data').set('Accept-Encoding', 'br');
    expect(res.status).toBe(200);
    expect(res.headers['content-encoding']).toBe('br');
    expect(res.headers['vary']).toMatch(/Accept-Encoding/i);
  });

  it('sets Content-Encoding: gzip and body is correct after supertest decompression', async () => {
    const large = JSON.stringify({ data: 'y'.repeat(2000) });
    const app = buildApp(large);
    // supertest automatically decompresses gzip so res.text is the original content
    const res = await request(app).get('/data').set('Accept-Encoding', 'gzip');
    expect(res.status).toBe(200);
    expect(res.headers['content-encoding']).toBe('gzip');
    expect(res.text).toBe(large);
  });

  it('prefers brotli over gzip when both are accepted (quality values)', async () => {
    const large = 'z'.repeat(2000);
    const app = buildApp(large, 'text/plain');
    const res = await request(app)
      .get('/data')
      .set('Accept-Encoding', 'gzip;q=0.9, br;q=1.0');
    expect(res.headers['content-encoding']).toBe('br');
  });

  it('does not compress payloads smaller than 1KB', async () => {
    const small = JSON.stringify({ ok: true });
    const app = buildApp(small);
    // Explicitly request no compression to ensure threshold is what prevents it
    const res = await request(app)
      .get('/data')
      .set('Accept-Encoding', 'br, gzip');
    expect(res.headers['content-encoding']).toBeUndefined();
    expect(res.text).toBe(small);
  });

  it('does not compress when Accept-Encoding is identity', async () => {
    const large = 'a'.repeat(2000);
    const app = buildApp(large, 'text/plain');
    // supertest adds Accept-Encoding by default; set 'identity' to opt out
    const res = await request(app)
      .get('/data')
      .set('Accept-Encoding', 'identity');
    expect(res.headers['content-encoding']).toBeUndefined();
  });

  it('skips compression for image content types', async () => {
    const large = Buffer.alloc(2000, 0xff);
    const app = express();
    app.use(compressionMiddleware);
    app.get('/img', (_req, res) => {
      res.setHeader('Content-Type', 'image/png');
      res.send(large);
    });
    const res = await request(app)
      .get('/img')
      .set('Accept-Encoding', 'br, gzip');
    expect(res.headers['content-encoding']).toBeUndefined();
  });

  it('skips compression when Content-Encoding already set', async () => {
    const large = 'b'.repeat(2000);
    const app = express();
    app.use(compressionMiddleware);
    app.get('/pre', (_req, res) => {
      res.setHeader('Content-Encoding', 'identity');
      res.setHeader('Content-Type', 'text/plain');
      res.send(large);
    });
    const res = await request(app)
      .get('/pre')
      .set('Accept-Encoding', 'br, gzip');
    expect(res.headers['content-encoding']).toBe('identity');
  });
});
