import Stats from '../models/statsModel.js';

let statsTableReady = false;
let statsDisabled = false;
let warnedMissing = false;

/**
 * Track API usage. Never throws / never breaks the request.
 * Auto-creates the stats table once if it is missing.
 */
export const trackAPIStats = async (req, res, next) => {
  const start = Date.now();

  res.on('finish', async () => {
    if (statsDisabled) return;
    if (['OPTIONS', 'HEAD'].includes(req.method)) return;

    try {
      const duration = Date.now() - start;
      const payload = {
        endpoint: req.originalUrl,
        method: req.method,
        responseTime: duration,
        statusCode: res.statusCode,
      };

      try {
        await Stats.create(payload);
        statsTableReady = true;
      } catch (err) {
        const missing =
          err?.name === 'SequelizeDatabaseError' &&
          (err?.parent?.code === 'ER_NO_SUCH_TABLE' ||
            String(err?.message || '').includes("doesn't exist"));

        if (missing && !statsTableReady) {
          try {
            await Stats.sync({ alter: false });
            statsTableReady = true;
            await Stats.create(payload);
            if (!warnedMissing) {
              console.log('✅ Created missing `stats` table');
              warnedMissing = true;
            }
          } catch (syncErr) {
            statsDisabled = true;
            console.warn('⚠️  Stats tracking disabled:', syncErr.message);
          }
        }
        // swallow all other stats errors silently
      }
    } catch {
      // never crash the app for analytics
    }
  });

  next();
};
