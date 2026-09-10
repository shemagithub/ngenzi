import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Backendurl } from '../../utils/backendUrl';
import {
  absoluteImage,
  absoluteUrl,
  clipDescription,
  DEFAULT_SITE_NAME,
  getSiteUrl,
} from '../../utils/seoConfig';

/**
 * JSON-LD structured data for rich results eligibility.
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-to-structured-data
 */
const StructuredData = ({ type = 'website', data }) => {
  const location = useLocation();
  const { settings } = useSettings();

  const companyName = settings?.companyName || DEFAULT_SITE_NAME;
  const websiteUrl = getSiteUrl(settings);
  const companyLogo = absoluteImage(settings?.companyLogo, settings, Backendurl);
  const companyEmail = settings?.companyEmail || 'support@ngenzirealestate.com';
  const companyPhone = settings?.companyPhone || undefined;
  const companyAddress = settings?.companyAddress || 'Kigali, Rwanda';
  const currentUrl = absoluteUrl(location.pathname || '/', settings);

  const sameAs = [
    settings?.facebook,
    settings?.twitter,
    settings?.instagram,
    settings?.linkedin,
    settings?.youtube
      ? (settings.youtube.startsWith('http')
          ? settings.youtube
          : `https://youtube.com/${settings.youtube}`)
      : null,
  ].filter(Boolean);

  const organization = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'RealEstateAgent'],
    name: companyName,
    url: websiteUrl,
    logo: {
      '@type': 'ImageObject',
      url: companyLogo,
    },
    email: companyEmail,
    ...(companyPhone ? { telephone: companyPhone } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: companyAddress,
      addressLocality: 'Kigali',
      addressCountry: 'RW',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Rwanda',
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: companyName,
    url: websiteUrl,
    description: clipDescription(settings?.metaDescription || settings?.aboutUs),
    publisher: {
      '@type': 'Organization',
      name: companyName,
      logo: { '@type': 'ImageObject', url: companyLogo },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${websiteUrl}/properties?location={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const property = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: data.title,
        description: clipDescription(data.description, 300),
        url: currentUrl,
        datePosted: data.createdAt || new Date().toISOString(),
        image: (() => {
          const imgs = Array.isArray(data.image) ? data.image : data.frontImage ? [data.frontImage] : [];
          return imgs
            .filter(Boolean)
            .map((src) => absoluteImage(src, settings, Backendurl));
        })(),
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.location || 'Kigali',
          addressCountry: 'RW',
        },
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: settings?.currency || 'RWF',
          availability:
            String(data.availability || '').toLowerCase() === 'rent'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/InStock',
        },
        ...(data.sqft
          ? {
              floorSize: {
                '@type': 'QuantitativeValue',
                value: data.sqft,
                unitCode: 'FTK',
                unitText: 'SQFT',
              },
            }
          : {}),
        ...(data.beds ? { numberOfRooms: data.beds } : {}),
        ...(data.baths ? { numberOfBathroomsTotal: data.baths } : {}),
      }
    : null;

  const plot = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: data.title,
        description: clipDescription(data.description, 300),
        url: currentUrl,
        image: absoluteImage(data.frontImage || (Array.isArray(data.image) ? data.image[0] : null), settings, Backendurl),
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.location || 'Rwanda',
          addressCountry: 'RW',
        },
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: settings?.currency || 'RWF',
        },
      }
    : null;

  const car = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'Car',
        name: data.title,
        brand: data.brand,
        model: data.model,
        vehicleModelDate: data.year,
        mileageFromOdometer: {
          '@type': 'QuantitativeValue',
          value: data.mileage,
          unitCode: 'KMT',
        },
        color: data.color,
        vehicleTransmission: data.transmission,
        fuelType: data.fuelType,
        image: absoluteImage(data.frontImage || (Array.isArray(data.image) ? data.image[0] : null), settings, Backendurl),
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: settings?.currency || 'RWF',
          availability: 'https://schema.org/InStock',
          url: currentUrl,
        },
      }
    : null;

  const blog = data
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data.title,
        description: clipDescription(data.excerpt || data.content, 200),
        image: absoluteImage(data.image, settings, Backendurl),
        datePublished: data.publishedAt || data.createdAt,
        dateModified: data.updatedAt || data.publishedAt || data.createdAt,
        author: {
          '@type': 'Person',
          name: data.author || companyName,
        },
        publisher: {
          '@type': 'Organization',
          name: companyName,
          logo: { '@type': 'ImageObject', url: companyLogo },
        },
        mainEntityOfPage: currentUrl,
        url: currentUrl,
      }
    : null;

  const breadcrumb = Array.isArray(data?.breadcrumbs)
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.breadcrumbs.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: absoluteUrl(item.path, settings),
        })),
      }
    : null;

  const aiHub = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Property Hub',
    applicationCategory: 'RealEstateApplication',
    description:
      'AI-powered property search and location trend analysis for Rwanda real estate.',
    url: `${websiteUrl}/ai-property-hub`,
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'RWF',
    },
  };

  const contactPage = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: `Contact ${companyName}`,
    url: currentUrl,
    mainEntity: organization,
  };

  const aboutPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${companyName}`,
    url: currentUrl,
    mainEntity: organization,
  };

  const schemas = {
    website,
    organization,
    property,
    plot,
    car,
    blog,
    breadcrumb,
    aiHub,
    contact: contactPage,
    about: aboutPage,
  };

  const schemaData = schemas[type];
  if (!schemaData) return null;

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
};

StructuredData.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object,
};

export default StructuredData;
