import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Backendurl } from '../../utils/backendUrl';
import {
  absoluteImage,
  absoluteUrl,
  clipDescription,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_LOCALE,
  DEFAULT_SITE_NAME,
  getSiteUrl,
} from '../../utils/seoConfig';

/**
 * Per-page SEO head tags (title, description, canonical, Open Graph, Twitter).
 * Follows Google Search Central recommendations for title links & snippets.
 */
const SEOHead = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  noindex = false,
  canonicalPath,
  children,
}) => {
  const location = useLocation();
  const { settings } = useSettings();

  const siteName = settings?.companyName || DEFAULT_SITE_NAME;
  const siteUrl = getSiteUrl(settings);
  const path = canonicalPath || location.pathname || '/';
  const canonical = absoluteUrl(path, settings);

  const pageTitle = title
    ? (title.includes(siteName) ? title : `${title} | ${siteName}`)
    : settings?.metaTitle || `${siteName} — Premium Real Estate in Rwanda`;

  const pageDescription = clipDescription(
    description || settings?.metaDescription || DEFAULT_DESCRIPTION
  );

  const pageKeywords = keywords || settings?.metaKeywords || DEFAULT_KEYWORDS;
  const ogImage = absoluteImage(
    image || settings?.companyLogo,
    settings,
    Backendurl
  );

  const robots = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="author" content={siteName} />
      <meta name="geo.region" content="RW" />
      <meta name="geo.placename" content="Kigali" />
      <link rel="canonical" href={canonical} />
      <link rel="icon" type="image/png" href={ogImage} />
      <link rel="shortcut icon" href={ogImage} />
      <link rel="apple-touch-icon" href={ogImage} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={DEFAULT_LOCALE} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Helpful for local discovery */}
      <meta name="theme-color" content="#1b3a2f" />

      {children}
    </Helmet>
  );
};

SEOHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string,
  noindex: PropTypes.bool,
  canonicalPath: PropTypes.string,
  children: PropTypes.node,
};

export default SEOHead;
