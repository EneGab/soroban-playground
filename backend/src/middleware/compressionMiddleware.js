// Copyright (c) 2026 StellarDevTools
// SPDX-License-Identifier: MIT

import { createBrotliCompress, createGzip, constants } from 'zlib';

const THRESHOLD = 1024;
const SKIP_TYPES = /^(image|video|audio)\//i;
const SKIP_SUBTYPES = /application\/(zip|gzip|br|zstd|x-compress)/i;

function selectEncoding(header) {
  const found = (header || '')
    .split(',')
    .map((s) => {
      const parts = s.trim().split(';q=');
      return {
        e: parts[0].trim(),
        q: parts[1] != null ? parseFloat(parts[1]) : 1,
      };
    })
    .filter((x) => Number.isFinite(x.q))
    .sort((a, b) => b.q - a.q)
    .map((x) => x.e)
    .find((e) => e === 'br' || e === 'gzip');
  return found ?? null;
}

function shouldSkip(res) {
  const ct = res.getHeader('Content-Type') || '';
  return (
    !!res.getHeader('Content-Encoding') ||
    SKIP_TYPES.test(ct) ||
    SKIP_SUBTYPES.test(ct)
  );
}

export function compressionMiddleware(req, res, next) {
  const encoding = selectEncoding(req.headers['accept-encoding']);
  if (!encoding) return next();

  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);
  let byteCount = 0;
  let compressor = null;
  let finished = false;

  function getCompressor() {
    if (compressor) return compressor;
    res.setHeader('Content-Encoding', encoding);
    res.setHeader('Vary', 'Accept-Encoding');
    res.removeHeader('Content-Length');
    compressor =
      encoding === 'br'
        ? createBrotliCompress({
            params: { [constants.BROTLI_PARAM_QUALITY]: 4 },
          })
        : createGzip({ level: 6 });
    compressor.on('data', (chunk) => originalWrite(chunk));
    compressor.on('end', () => {
      if (!finished) {
        finished = true;
        originalEnd();
      }
    });
    compressor.on('error', () => {
      if (!finished) {
        finished = true;
        originalEnd();
      }
    });
    return compressor;
  }

  res.write = function (chunk, enc, cb) {
    if (shouldSkip(res)) {
      res.write = originalWrite;
      return originalWrite(chunk, enc, cb);
    }
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc);
    byteCount += buf.length;
    if (byteCount < THRESHOLD) {
      return originalWrite(buf, null, cb);
    }
    return getCompressor().write(buf, null, cb);
  };

  res.end = function (chunk, enc, cb) {
    if (finished) return;

    if (chunk) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, enc);
      byteCount += buf.length;

      if (byteCount < THRESHOLD || shouldSkip(res)) {
        res.write = originalWrite;
        res.end = originalEnd;
        finished = true;
        return originalEnd(buf, null, cb);
      }

      getCompressor().write(buf);
    } else if (!compressor) {
      res.write = originalWrite;
      res.end = originalEnd;
      finished = true;
      return originalEnd(null, null, cb);
    }

    if (compressor) {
      compressor.end();
    } else {
      finished = true;
      originalEnd(null, null, cb);
    }
  };

  next();
}
