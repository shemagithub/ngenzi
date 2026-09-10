import Property from '../models/propertymodel.js';
import Plot from '../models/plotmodel.js';
import Car from '../models/carmodel.js';
import Blog from '../models/blogModel.js';
import Settings from '../models/settingsModel.js';

const escapeXml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toIsoDate = (date) => {
  try {
    return new Date(date || Date.now()).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

const urlEntry = (loc, lastmod, changefreq = 'weekly', priority = '0.7') => `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

/**
 * Dynamic XML sitemap for Google Search Console / crawlers.
 * Includes core pages plus all live listings and published blogs.
 */
export const getSitemap = async (req, res) => {
  try {
    const settings = await Settings.findOne().catch(() => null);
    const rawSite =
      settings?.websiteUrl ||
      process.env.FRONTEND_URL ||
      process.env.WEBSITE_URL ||
      'https://ngenzirealestate.com';
    const siteUrl = (
      /localhost|127\.0\.0\.1/i.test(rawSite)
        ? ((process.env.FRONTEND_URL || process.env.WEBSITE_URL) &&
           !/localhost|127\.0\.0\.1/i.test(process.env.FRONTEND_URL || process.env.WEBSITE_URL || '')
            ? (process.env.FRONTEND_URL || process.env.WEBSITE_URL)
            : 'https://ngenzirealestate.com')
        : rawSite
    ).replace(/\/$/, '');

    const [properties, plots, cars, blogs] = await Promise.all([
      Property.findAll({ attributes: ['id', 'updatedAt'], order: [['updatedAt', 'DESC']] }).catch(() => []),
      Plot.findAll({ attributes: ['id', 'updatedAt'], order: [['updatedAt', 'DESC']] }).catch(() => []),
      Car.findAll({ attributes: ['id', 'updatedAt'], order: [['updatedAt', 'DESC']] }).catch(() => []),
      Blog.findAll({
        where: { isPublished: true },
        attributes: ['slug', 'updatedAt', 'publishedAt'],
        order: [['updatedAt', 'DESC']],
      }).catch(() => []),
    ]);

    const staticPages = [
      { path: '/', changefreq: 'daily', priority: '1.0' },
      { path: '/properties', changefreq: 'daily', priority: '0.9' },
      { path: '/plots', changefreq: 'daily', priority: '0.9' },
      { path: '/cars', changefreq: 'daily', priority: '0.8' },
      { path: '/services', changefreq: 'weekly', priority: '0.8' },
      { path: '/map', changefreq: 'weekly', priority: '0.7' },
      { path: '/ai-property-hub', changefreq: 'weekly', priority: '0.7' },
      { path: '/about', changefreq: 'monthly', priority: '0.7' },
      { path: '/contact', changefreq: 'monthly', priority: '0.7' },
    ];

    const today = toIsoDate();
    let body = staticPages
      .map((p) => urlEntry(`${siteUrl}${p.path}`, today, p.changefreq, p.priority))
      .join('');

    properties.forEach((p) => {
      body += urlEntry(
        `${siteUrl}/properties/single/${p.id}`,
        toIsoDate(p.updatedAt),
        'weekly',
        '0.8'
      );
    });

    plots.forEach((p) => {
      body += urlEntry(
        `${siteUrl}/plots/${p.id}`,
        toIsoDate(p.updatedAt),
        'weekly',
        '0.8'
      );
    });

    cars.forEach((c) => {
      body += urlEntry(
        `${siteUrl}/cars/${c.id}`,
        toIsoDate(c.updatedAt),
        'weekly',
        '0.7'
      );
    });

    blogs.forEach((b) => {
      if (!b.slug) return;
      body += urlEntry(
        `${siteUrl}/blogs/${b.slug}`,
        toIsoDate(b.updatedAt || b.publishedAt),
        'monthly',
        '0.6'
      );
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate sitemap',
    });
  }
};

/**
 * robots.txt that points crawlers at the dynamic sitemap on this API host.
 * Prefer hosting robots on the frontend domain; this is a fallback for Search Console.
 */
export const getRobots = (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  const body = `User-agent: *
Allow: /api/products
Allow: /api/plots
Allow: /api/cars
Allow: /api/blogs
Allow: /api/services
Allow: /sitemap.xml
Disallow: /api/admin
Disallow: /api/users
Disallow: /api/appointments
Disallow: /uploads/private

Sitemap: ${host}/sitemap.xml
`;
  res.type('text/plain').send(body);
};
