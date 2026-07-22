import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSettings } from '../../context/SettingsContext';

const StructuredData = ({ type, data }) => {
  const location = useLocation();
  const { settings } = useSettings();
  
  const companyName = settings?.companyName || 'NGENZI REALESTATE';
  const websiteUrl = settings?.websiteUrl || 'https://ngenzirealestate.rw';
  const companyLogo = settings?.companyLogo || 'https://ngenzirealestate.rw/logo.png';
  const companyEmail = settings?.companyEmail || 'support@ngenzirealestate.com';
  
  // Build sameAs array from social media links
  const sameAs = [];
  if (settings?.facebook) sameAs.push(settings.facebook);
  if (settings?.twitter) sameAs.push(settings.twitter);
  if (settings?.instagram) sameAs.push(settings.instagram);
  if (settings?.linkedin) sameAs.push(settings.linkedin);
  if (settings?.youtube) sameAs.push(`https://youtube.com/${settings.youtube}`);
  // No GitHub fallback - use only social media links from settings
  
  const currentUrl = `${websiteUrl}${location.pathname}`;

  // Different schema types based on page content
  const schemas = {
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: companyName,
      url: websiteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: '{search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: companyName,
      url: websiteUrl,
      logo: companyLogo,
      email: companyEmail,
      sameAs: sameAs
    },
    property: {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: data?.title || 'Property Listing',
      description: data?.description || 'Property details',
      url: currentUrl,
      datePosted: data?.createdAt || new Date().toISOString(),
      address: {
        '@type': 'PostalAddress',
        addressLocality: data?.location || 'City',
        addressRegion: data?.region || 'Region',
        addressCountry: 'RW'
      },
      price: data?.price ? `₹${data.price}` : '',
      floorSize: {
        '@type': 'QuantitativeValue',
        unitText: 'SQFT',
        value: data?.sqft || ''
      },
      numberOfRooms: data?.beds || '',
      numberOfBathroomsTotal: data?.baths || ''
    },
    aiHub: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'AI Property Hub',
      applicationCategory: 'RealEstateApplication',
      description: 'AI-powered real estate analytics and recommendations tool',
      // Always use production domain regardless of settings or hosting
      url: 'https://ngenzirealestate.rw/ai-property-hub',
      applicationName: 'AI Property Hub',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'RWF',
        availability: 'https://schema.org/InStock'
      }
    }
  };

  const schemaData = schemas[type] || schemas.website;

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

StructuredData.propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.object
};



export default StructuredData;