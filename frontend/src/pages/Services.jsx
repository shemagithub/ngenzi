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
      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
        </motion.div>
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Unable to Load Services</p>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchServices}
              className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
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
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Our Services
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comprehensive real estate services to meet all your property needs.
            From construction to legal assistance, we've got you covered.
          </p>
        </motion.div>

        {/* Services Grid */}
        {services.length === 0 && !loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 max-w-md mx-auto">
              <Briefcase className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200 mb-2">No Services Available</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Services will be displayed here once they are added to the system.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service, index) => {
              const IconComponent = typeof service.icon === 'function' ? service.icon : (iconMap[service.icon] || Building2);
              const serviceFeatures = Array.isArray(service.features) ? service.features : [];
              
              return (
                <motion.div
                  key={service.id || index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Image or Icon Header */}
                  {service.image ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className={`hidden absolute inset-0 bg-gradient-to-r ${service.color || 'from-blue-500 to-cyan-500'} p-6 items-center justify-between`}>
                        <IconComponent className="w-12 h-12 text-white" />
                        <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  ) : (
                    <div className={`bg-gradient-to-r ${service.color || 'from-blue-500 to-cyan-500'} p-6`}>
                      <div className="flex items-center justify-between">
                        <IconComponent className="w-12 h-12 text-white" />
                        <ArrowRight className="w-6 h-6 text-white/80 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  {serviceFeatures.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {serviceFeatures.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <Link
                    to={service.link || '/contact'}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium text-sm group/btn"
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
          className="mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Custom Services?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            We offer customized solutions tailored to your specific needs.
            Contact us today to discuss how we can help with your property requirements.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
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

