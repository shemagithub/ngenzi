import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  FileText,
  Hammer,
  MapPin,
  Home,
  Calculator,
  Shield,
  CreditCard,
  ClipboardCheck,
  ArrowRight,
  CheckCircle,
  Loader,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Backendurl } from '../utils/backendUrl';
import PageHero from '../components/PageHero';
import SEOHead from '../components/SEO/SEOHead';

// Icon mapping
const iconMap = {
  Building2,
  FileText,
  Hammer,
  MapPin,
  Home,
  Calculator,
  Shield,
  CreditCard,
  ClipboardCheck
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching services from:', `${Backendurl}/api/services/list`);
      
      const response = await axios.get(`${Backendurl}/api/services/list`);
      
      console.log('✅ Services API response:', response.data);
      
      if (response.data.success && response.data.services) {
        // Map icon names to components and ensure all data is properly formatted
        const mappedServices = response.data.services.map(service => {
          // Parse features if it's a string
          let featuresArray = [];
          if (service.features) {
            if (Array.isArray(service.features)) {
              featuresArray = service.features;
            } else if (typeof service.features === 'string') {
              try {
                featuresArray = JSON.parse(service.features);
              } catch {
                // If parsing fails, try splitting by comma
                featuresArray = service.features.split(',').map(f => f.trim()).filter(f => f);
              }
            }
          }
          
          // Map icon name to component
          const IconComponent = iconMap[service.icon] || Building2;
          
          return {
            ...service,
            icon: IconComponent,
            features: featuresArray,
            color: service.color || 'from-blue-500 to-cyan-500',
            link: service.link || '/contact',
            image: service.image || null
          };
        });
        
        console.log('📦 Mapped services:', mappedServices);
        setServices(mappedServices);
      } else {
        console.warn('⚠️ No services found in response');
        setServices([]);
      }
    } catch (err) {
      console.error('❌ Error fetching services:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load services. Please try again later.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-200 dark:bg-haven-950 flex items-center justify-center transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-accent-500 animate-spin mx-auto mb-4" />
          <p className="text-haven-700/70 dark:text-cream-200/60 text-sm uppercase tracking-[0.14em]">Loading services...</p>
        </motion.div>
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="min-h-screen bg-cream-200 dark:bg-haven-950 flex items-center justify-center transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-white dark:bg-haven-900 border border-cream-400/80 dark:border-haven-800 shadow-soft p-8">
            <p className="font-display text-xl text-haven-900 dark:text-cream-100 mb-2">Unable to Load Services</p>
            <div className="section-divider !my-4" />
            <p className="text-haven-700/75 dark:text-cream-200/65 mb-6">{error}</p>
            <button
              onClick={fetchServices}
              className="btn-haven"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const defaultServices = [
    {
      id: 1,
      title: 'Construction Services',
      description: 'Professional construction and building services for residential and commercial properties. From planning to execution, we handle it all.',
      icon: Building2,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Residential Construction',
        'Commercial Building',
        'Renovation & Remodeling',
        'Interior Design',
        'Project Management'
      ],
      link: '/contact'
    },
    {
      id: 2,
      title: 'Land Registration',
      description: 'Complete assistance with land registration, title verification, and property documentation. Ensure your property is legally secure.',
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      features: [
        'Title Verification',
        'Documentation Support',
        'Legal Compliance',
        'Registration Assistance',
        'Property Surveys'
      ],
      link: '/contact'
    },
    {
      id: 3,
      title: 'Property Valuation',
      description: 'Accurate property valuation services for buying, selling, or investment purposes. Professional assessment by certified experts.',
      icon: Calculator,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Market Value Assessment',
        'Investment Analysis',
        'Tax Evaluation',
        'Insurance Valuation',
        'Detailed Reports'
      ],
      link: '/contact'
    },
    {
      id: 4,
      title: 'Property Inspection',
      description: 'Comprehensive property inspection services to identify issues and ensure quality. Pre-purchase and pre-sale inspections available.',
      icon: ClipboardCheck,
      color: 'from-orange-500 to-red-500',
      features: [
        'Structural Inspection',
        'Electrical & Plumbing',
        'HVAC Systems',
        'Safety Compliance',
        'Detailed Reports'
      ],
      link: '/contact'
    },
    {
      id: 5,
      title: 'Home Loans & Financing',
      description: 'Expert guidance on home loans, mortgages, and property financing options. Get the best rates and terms for your property purchase.',
      icon: CreditCard,
      color: 'from-indigo-500 to-blue-500',
      features: [
        'Loan Pre-approval',
        'Interest Rate Comparison',
        'EMI Calculator',
        'Documentation Support',
        'Banking Partnerships'
      ],
      link: '/contact'
    },
    {
      id: 6,
      title: 'Property Insurance',
      description: 'Comprehensive property insurance solutions to protect your investment. Get the right coverage for your property and assets.',
      icon: Shield,
      color: 'from-amber-500 to-yellow-500',
      features: [
        'Home Insurance',
        'Property Damage Coverage',
        'Liability Protection',
        'Natural Disaster Coverage',
        'Competitive Premiums'
      ],
      link: '/contact'
    },
    {
      id: 7,
      title: 'Legal Consultation',
      description: 'Expert legal advice for property transactions, contracts, and disputes. Ensure all legal aspects are handled properly.',
      icon: Hammer,
      color: 'from-red-500 to-rose-500',
      features: [
        'Contract Review',
        'Legal Documentation',
        'Dispute Resolution',
        'Property Rights',
        'Compliance Advisory'
      ],
      link: '/contact'
    },
    {
      id: 8,
      title: 'Property Management',
      description: 'Complete property management services for landlords and property owners. Handle maintenance, tenants, and administration.',
      icon: Home,
      color: 'from-teal-500 to-cyan-500',
      features: [
        'Tenant Management',
        'Maintenance Services',
        'Rent Collection',
        'Property Maintenance',
        'Financial Reporting'
      ],
      link: '/contact'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
      <SEOHead
        title="Real Estate Services in Rwanda"
        description="Construction, legal, valuation, and property management services from NGENZI REALESTATE. End-to-end support for buyers and investors in Rwanda."
        keywords="real estate services Rwanda, property management Kigali, land valuation Rwanda"
        canonicalPath="/services"
      />
      <PageHero
        compact
        eyebrow="Services"
        title="Our Services"
        subtitle="Comprehensive real estate services to meet all your property needs. From construction to legal assistance, we've got you covered."
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Section intro */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="section-eyebrow">What We Offer</p>
          <h2 className="section-title mt-3 mb-2">Tailored Property Services</h2>
          <div className="section-divider" />
          <p className="text-haven-700/75 dark:text-cream-200/65 max-w-3xl mx-auto leading-relaxed">
            Every service is delivered with the same attention to detail and care that defines the Ngenzi experience.
          </p>
        </motion.div>

        {/* Services Grid */}
        {services.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white dark:bg-haven-900 border border-cream-400/80 dark:border-haven-800 shadow-soft p-10 max-w-md mx-auto">
              <Briefcase className="w-14 h-14 text-accent-500 mx-auto mb-5 stroke-[1.25]" strokeWidth={1.25} />
              <h3 className="font-display text-xl text-haven-900 dark:text-cream-100 mb-2">No Services Available</h3>
              <div className="section-divider !my-4" />
              <p className="text-haven-700/75 dark:text-cream-200/65 text-sm leading-relaxed">
                Services will be displayed here once they are added to the system.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {services.map((service, index) => {
              const IconComponent = typeof service.icon === 'function' ? service.icon : (iconMap[service.icon] || Building2);
              const serviceFeatures = Array.isArray(service.features) ? service.features : [];
              
              return (
                <motion.div
                  key={service.id || index}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-haven-900 border border-cream-400/80 dark:border-haven-800 shadow-soft overflow-hidden hover:border-accent-400/60 transition-all duration-300 group flex flex-col"
                >
                  {/* Image or Icon Header */}
                  {service.image ? (
                    <div className="relative h-48 overflow-hidden border-b border-cream-400/60 dark:border-haven-800">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-haven-900/90 dark:bg-haven-950/90 p-6 items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center border border-accent-400/40">
                          <IconComponent className="w-8 h-8 text-accent-400 stroke-[1.25]" strokeWidth={1.25} />
                        </div>
                        <ArrowRight className="w-6 h-6 text-accent-400/80 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-haven-900 dark:bg-haven-800 p-6 border-b border-haven-800 dark:border-haven-700">
                      <div className="flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center border border-accent-400/40">
                          <IconComponent className="w-8 h-8 text-accent-400 stroke-[1.25]" strokeWidth={1.25} />
                        </div>
                        <ArrowRight className="w-6 h-6 text-accent-400/80 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-display text-xl text-haven-900 dark:text-cream-100 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-haven-700/75 dark:text-cream-200/65 mb-5 text-sm leading-relaxed flex-1">
                      {service.description}
                    </p>

                    {/* Features */}
                    {serviceFeatures.length > 0 && (
                      <div className="space-y-2.5 mb-6 pt-4 border-t border-cream-400/60 dark:border-haven-800">
                        {serviceFeatures.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2.5">
                            <CheckCircle className="w-4 h-4 text-accent-500 flex-shrink-0 stroke-[1.5]" strokeWidth={1.5} />
                            <span className="text-sm text-haven-800/80 dark:text-cream-200/70">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA Button */}
                    <Link
                      to={service.link || '/contact'}
                      className="btn-haven !py-2.5 !px-5 w-fit group/btn"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20 bg-haven-900 dark:bg-haven-950 border border-haven-800 dark:border-haven-800 p-10 md:p-14 text-center"
        >
          <p className="text-accent-400 text-[11px] font-semibold uppercase tracking-[0.28em] mb-4">Custom Solutions</p>
          <h2 className="font-display text-3xl md:text-4xl text-cream-100 mb-4">
            Need Custom Services?
          </h2>
          <div className="h-px w-16 bg-accent-400 mx-auto mb-6" />
          <p className="text-cream-200/75 max-w-2xl mx-auto mb-8 leading-relaxed">
            We offer customized solutions tailored to your specific needs.
            Contact us today to discuss how we can help with your property requirements.
          </p>
          <Link
            to="/contact"
            className="btn-accent !py-3.5 !px-8"
          >
            Contact Us
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
