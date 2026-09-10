import React from 'react'
import PropertiesPage from '../components/properties/Propertiespage'
import SEOHead from '../components/SEO/SEOHead'

const Properties = () => {
  return (
    <div className="bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
      <SEOHead
        title="Properties for Sale & Rent in Rwanda"
        description="Browse apartments, houses, and villas for sale or rent across Kigali and Rwanda. Filter by location, price, and amenities with NGENZI REALESTATE."
        keywords="properties Kigali, apartments for rent Rwanda, houses for sale Kigali, villas Nyarutarama"
        canonicalPath="/properties"
      />
      <PropertiesPage />
    </div>
  )
}

export default Properties
