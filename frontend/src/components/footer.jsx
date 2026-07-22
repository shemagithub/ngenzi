import { useState } from 'react';
import { 
  Home, 
  Twitter, 
  Facebook, 
  Instagram, 
  Github, 
  Mail, 
  Send, 
  MapPin, 
  Phone,
  MessageCircle,
  ChevronRight,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Heart,
  Star,
  Zap,
  Clock,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Backendurl } from '../utils/backendUrl';
import PropTypes from 'prop-types';
import logo from "../assets/images/logo.JPEG";
import { useSettings } from '../context/SettingsContext';

// Enhanced Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.6
    }
  }
};

const floatingAnimation = {
  y: [-2, 2, -2],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const glowAnimation = {
  boxShadow: [
    "0 0 20px rgba(59, 130, 246, 0.3)",
    "0 0 40px rgba(59, 130, 246, 0.5)",
    "0 0 20px rgba(59, 130, 246, 0.3)"
  ],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Mobile Collapsible Footer Section
const MobileFooterSection = ({ title, children, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 hover:shadow-lg transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-blue-600" />}
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 transition-colors duration-200">
            {title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 transition-colors duration-200">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Footer Column Component
const FooterColumn = ({ title, children, className = '', delay = 0, icon: Icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`${className} group`}
    >
      {title && (
        <div className="flex items-center gap-2 mb-6">
          {Icon && (
            <motion.div 
              className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"
              animate={floatingAnimation}
            >
              <Icon className="w-4 h-4 text-white" />
            </motion.div>
          )}
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 transition-colors duration-200">
            {title}
          </h3>
        </div>
      )}
      {children}
    </motion.div>
  );
};

// Footer Link Component
const FooterLink = ({ href, children, icon: Icon }) => {
  return (
    <motion.a 
      href={href} 
      className="group flex items-center text-gray-600 dark:text-gray-400 transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-2 py-2 relative overflow-hidden"
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      <div className="relative z-10 flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-3 text-blue-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />}
        <ChevronRight className="w-3 h-3 mr-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0" />
        <span className="font-medium">{children}</span>
      </div>
    </motion.a>
  );
};

// Social Links Component
const SocialLinks = () => {
  const { settings } = useSettings();
  
  // Format phone number for WhatsApp (remove spaces, dashes, and ensure it starts with country code)
  const formatWhatsAppNumber = (phone) => {
    if (!phone) return null;
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    // If it doesn't start with +, add it (assuming it's a valid international number)
    if (!cleaned.startsWith('+')) {
      // If it starts with 0, remove it and add country code (Rwanda: +250)
      if (cleaned.startsWith('0')) {
        cleaned = '+250' + cleaned.substring(1);
      } else {
        cleaned = '+' + cleaned;
      }
    }
    return cleaned;
  };

  const whatsappNumber = settings?.whatsapp || settings?.companyPhone;
  const formattedWhatsApp = formatWhatsAppNumber(whatsappNumber);
  const whatsappUrl = formattedWhatsApp ? `https://wa.me/${formattedWhatsApp.replace(/\+/g, '')}` : null;
  
  const socialLinks = [
    { 
      icon: Facebook, 
      href: settings?.facebook || '#', 
      label: 'Facebook', 
      color: 'from-[#1877F2] to-[#0d65d9]',
      hoverColor: 'hover:shadow-[#1877F2]/25',
      show: !!settings?.facebook
    },
    { 
      icon: Twitter, 
      href: settings?.twitter || '#', 
      label: 'Twitter', 
      color: 'from-[#1DA1F2] to-[#0d8bd9]',
      hoverColor: 'hover:shadow-[#1DA1F2]/25',
      show: !!settings?.twitter
    },
    { 
      icon: Instagram, 
      href: settings?.instagram || '#', 
      label: 'Instagram', 
      color: 'from-[#fd5949] via-[#d6249f] to-[#285AEB]',
      hoverColor: 'hover:shadow-pink-500/25',
      show: !!settings?.instagram
    },
    { 
      icon: Github, 
      href: settings?.linkedin || '#', 
      label: 'LinkedIn', 
      color: 'from-[#0077b5] to-[#005885]',
      hoverColor: 'hover:shadow-[#0077b5]/25',
      show: !!settings?.linkedin
    },
    { 
      icon: Mail, 
      href: settings?.youtube ? `https://youtube.com/${settings.youtube}` : '#', 
      label: 'YouTube', 
      color: 'from-[#FF0000] to-[#CC0000]',
      hoverColor: 'hover:shadow-[#FF0000]/25',
      show: !!settings?.youtube
    },
    { 
      icon: MessageCircle, 
      href: whatsappUrl || '#', 
      label: 'WhatsApp', 
      color: 'from-[#25D366] to-[#128C7E]',
      hoverColor: 'hover:shadow-[#25D366]/25',
      show: !!whatsappUrl
    },
  ].filter(link => link.show || link.href !== '#');
  
  if (socialLinks.length === 0) return null;
  
  return (
    <div className="flex items-center gap-4 mt-8">
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-200">Follow us:</span>
      <div className="flex gap-3">
        {socialLinks.map(({ icon: Icon, href, label, color, hoverColor }) => (
          <motion.a
            key={label}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
            href={href}
            title={label}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center text-white bg-gradient-to-br ${color} ${hoverColor} rounded-xl w-11 h-11 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group`}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            {label === 'WhatsApp' ? (
              <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            ) : (
              <Icon className="w-5 h-5 relative z-10" />
            )}
          </motion.a>
        ))}
      </div>
    </div>
  );
};

// Newsletter Component
const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${Backendurl}/api/news/newsdata`, { email });
      if (response.status === 200) {
        toast.success('🎉 Successfully subscribed to our newsletter!');
        setEmail('');
      } else {
        toast.error('Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="relative p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-lg transition-colors duration-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decoration */}
      <div className="absolute top-2 right-2">
        <motion.div animate={glowAnimation}>
          <Sparkles className="w-6 h-6 text-blue-400 dark:text-blue-500" />
        </motion.div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg"
          animate={floatingAnimation}
        >
          <Mail className="w-5 h-5 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Stay Updated</h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
        Get the latest property listings, market insights, and exclusive deals delivered straight to your inbox.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="email"
            name="email"
            id="newsletter-email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 pr-4 py-4 w-full text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 shadow-sm"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-6 py-4 rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-70 font-semibold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Subscribing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              <span>Subscribe Now</span>
              <Zap className="w-4 h-4" />
            </div>
          )}
        </motion.button>
      </form>

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <Shield className="w-3 h-3 text-gray-500 dark:text-gray-400" />
        By subscribing, you agree to our <a href="#" className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a>.
      </p>
    </motion.div>
  );
};

// Main Footer Component
const companyLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Properties', href: '/properties', icon: MapPin },
  { name: 'About Us', href: '/about', icon: Star },
  { name: 'Contact', href: '/contact', icon: Mail },
  { name: 'AI Property Hub', href: '/ai-agent', icon: Zap },
];

const helpLinks = [
  { name: 'Customer Support', href: '/', icon: Heart },
  { name: 'FAQs', href: '/', icon: Sparkles },
  { name: 'Terms & Conditions', href: '/', icon: Shield },
  { name: 'Privacy Policy', href: '/', icon: Clock },
];

const Footer = () => {
  const { settings, loading: settingsLoading } = useSettings();
  
  // Build contact info from settings
  const contactInfo = [
    settings?.companyAddress && { 
      icon: MapPin, 
      text: settings.companyAddress,
      href: `https://maps.google.com/?q=${encodeURIComponent(settings.companyAddress)}` 
    },
    settings?.companyPhone && { 
      icon: Phone, 
      text: settings.companyPhone,
      href: `tel:${settings.companyPhone.replace(/\s/g, '')}`
    },
    settings?.companyEmail && { 
      icon: Mail, 
      text: settings.companyEmail,
      href: `mailto:${settings.companyEmail}` 
    },
  ].filter(Boolean);
  
  // Use default if no settings loaded yet
  const defaultContactInfo = [
    { 
      icon: MapPin, 
      text: settings?.companyAddress || '123 Property Plaza, Silicon Valley, CA 94088',
      href: settings?.companyAddress ? `https://maps.google.com/?q=${encodeURIComponent(settings.companyAddress)}` : 'https://maps.google.com/?q=123+Property+Plaza,Silicon+Valley,CA+94088' 
    },
    { 
      icon: Phone, 
      text: settings?.companyPhone || '+1 (234) 567-890',
      href: settings?.companyPhone ? `tel:${settings.companyPhone.replace(/\s/g, '')}` : 'tel:+1234567890'
    },
    { 
      icon: Mail, 
      text: settings?.companyEmail || 'support@ngenzirealestate.com',
      href: settings?.companyEmail ? `mailto:${settings.companyEmail}` : 'mailto:support@ngenzirealestate.com' 
    },
  ];
  
  const displayContactInfo = contactInfo.length > 0 ? contactInfo : defaultContactInfo;
  
  // Get logo from settings or use default
  const companyLogo = settings?.companyLogo || logo;
  const companyName = settings?.companyName || 'NGENZI REALESTATE';
  const aboutUs = settings?.aboutUs || 'Your trusted partner in finding the perfect home. We make property hunting simple, efficient, and tailored to your unique needs with cutting-edge technology and personalized service.';
  
  if (settingsLoading) {
    return (
      <footer className="relative">
      <div className="relative pt-16 lg:pt-20 pb-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </footer>
    );
  }
  
  return (
    <footer className="relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 transition-colors duration-200"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent"></div>
      
      {/* Main Footer */}
      <div className="relative pt-16 lg:pt-20 pb-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand section */}
          <motion.div 
            className="text-center lg:text-left mb-16"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <img 
                src={companyLogo} 
                alt={companyName} 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.src = logo; // Fallback to default logo if settings logo fails
                }}
              />
            </div>
            
            <motion.p 
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-lg transition-colors duration-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {aboutUs}
            </motion.p>
            
            <div className="flex justify-center lg:justify-start">
              <SocialLinks />
            </div>
          </motion.div>

          {/* Desktop layout */}
          <div className="hidden lg:grid grid-cols-12 gap-8 mb-12">
            {/* Quick Links Column */}
            <FooterColumn 
              title="Quick Links" 
              className="col-span-3" 
              delay={0.2}
              icon={Home}
            >
              <ul className="space-y-3">
                {companyLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Help Column */}
            <FooterColumn 
              title="Support" 
              className="col-span-3" 
              delay={0.3}
              icon={Heart}
            >
              <ul className="space-y-3">
                {helpLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            {/* Contact Info */}
            <FooterColumn 
              title="Contact Us" 
              className="col-span-3" 
              delay={0.4}
              icon={MapPin}
            >
              <ul className="space-y-4">
                {displayContactInfo.map((item, index) => (
                  <li key={index}>
                    <motion.a 
                      href={item.href} 
                      className="group flex items-start text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                      whileHover={{ x: 5 }}
                    >
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors duration-300">
                        <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium leading-relaxed">{item.text}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </FooterColumn>
            
            {/* Newsletter */}
            <div className="col-span-3">
              <Newsletter />
            </div>
          </div>

          {/* Mobile Accordions */}
          <motion.div 
            className="lg:hidden space-y-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <MobileFooterSection title="Quick Links" icon={Home}>
              <ul className="space-y-2">
                {companyLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <MobileFooterSection title="Support" icon={Heart}>
              <ul className="space-y-2">
                {helpLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href} icon={link.icon}>
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <MobileFooterSection title="Contact Us" icon={MapPin}>
              <ul className="space-y-3">
                {displayContactInfo.map((item, index) => (
                  <li key={index}>
                    <motion.a 
                      href={item.href} 
                      className="flex items-start text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="w-4 h-4 mt-1 mr-3 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                      <span className="text-sm">{item.text}</span>
                    </motion.a>
                  </li>
                ))}
              </ul>
            </MobileFooterSection>

            <div className="pt-6">
              <Newsletter />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="relative bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900 border-t border-gray-700/50 dark:border-gray-700/80 transition-colors duration-200">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.p 
              className="text-sm text-gray-300 text-center md:text-left flex items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span>© {new Date().getFullYear()} {companyName}. All Rights Reserved.</span>
            </motion.p>
            
            <motion.a
              href="/properties"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4" />
              Explore Properties
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      />
    </footer>
  );
};

Footer.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  icon: PropTypes.elementType
};

MobileFooterSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType
};

FooterColumn.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  icon: PropTypes.elementType
};

FooterLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.elementType
};

export default Footer;