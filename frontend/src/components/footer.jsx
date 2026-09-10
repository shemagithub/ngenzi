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
  ChevronDown,
  ArrowRight,
  Heart,
  Star,
  Zap,
  Clock,
  Shield,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Backendurl } from '../utils/backendUrl';
import PropTypes from 'prop-types';
import logo from "../assets/images/logo.JPEG";
import { useSettings } from '../context/SettingsContext';
import heroimage from '../assets/images/heroimage.png';

const MobileFooterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-100">
          {title}
        </h3>
        <ChevronDown className={`w-4 h-4 text-accent-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/10 pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FooterLink = ({ href, children }) => (
  <a 
    href={href} 
    className="block text-sm text-cream-200/65 hover:text-accent-300 transition-colors py-1.5"
  >
    {children}
  </a>
);

const SocialLinks = () => {
  const { settings } = useSettings();
  
  const formatWhatsAppNumber = (phone) => {
    if (!phone) return null;
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
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
    { icon: Facebook, href: settings?.facebook || '#', label: 'Facebook', show: !!settings?.facebook },
    { icon: Twitter, href: settings?.twitter || '#', label: 'Twitter', show: !!settings?.twitter },
    { icon: Instagram, href: settings?.instagram || '#', label: 'Instagram', show: !!settings?.instagram },
    { icon: Github, href: settings?.linkedin || '#', label: 'LinkedIn', show: !!settings?.linkedin },
    { icon: Mail, href: settings?.youtube ? `https://youtube.com/${settings.youtube}` : '#', label: 'YouTube', show: !!settings?.youtube },
    { icon: MessageCircle, href: whatsappUrl || '#', label: 'WhatsApp', show: !!whatsappUrl },
  ].filter(link => link.show || link.href !== '#');
  
  if (socialLinks.length === 0) return null;
  
  return (
    <div className="flex gap-3 mt-6">
      {socialLinks.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          title={label}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-cream-100 hover:bg-accent-400 hover:text-haven-900 hover:border-accent-400 transition-all"
        >
          {label === 'WhatsApp' ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          ) : (
            <Icon className="w-4 h-4" />
          )}
        </a>
      ))}
    </div>
  );
};

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
        toast.success('Successfully subscribed to our newsletter!');
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
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-100 mb-4">
        Stay Connected
      </h3>
      <p className="text-sm text-cream-200/60 mb-5 leading-relaxed">
        Get the latest property listings and market insights delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          name="email"
          id="newsletter-email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 bg-white/5 border border-white/15 text-cream-100 placeholder:text-cream-200/40 text-sm focus:outline-none focus:border-accent-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-accent !py-3 whitespace-nowrap disabled:opacity-70"
        >
          {loading ? '...' : (
            <>
              Subscribe
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

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
  const companyLogo = settings?.companyLogo || logo;
  const companyName = settings?.companyName || 'NGENZI REALESTATE';
  const aboutUs = settings?.aboutUs || 'Your trusted partner in finding the perfect home. We make property hunting simple, efficient, and tailored to your unique needs.';
  
  if (settingsLoading) {
    return (
      <footer className="bg-haven-900 py-16">
        <div className="max-w-[1600px] mx-auto px-4 text-center text-cream-200/50">Loading...</div>
      </footer>
    );
  }
  
  return (
    <footer className="relative">
      {/* Pre-footer CTA */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroimage})` }}
        />
        <div className="absolute inset-0 bg-haven-950/80" />
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <p className="text-accent-300 text-[11px] font-semibold uppercase tracking-[0.28em] mb-3">
              Ready When You Are
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-white">
              Plan Your Perfect Getaway Home
            </h2>
          </div>
          <a href="/properties" className="btn-accent">
            Book Your Stay
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main dark footer */}
      <div className="bg-haven-900 text-cream-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="hidden lg:grid grid-cols-12 gap-10">
            <div className="col-span-4">
              <img 
                src={companyLogo} 
                alt={companyName} 
                className="h-14 w-auto object-contain mb-5 brightness-110"
                onError={(e) => { e.target.src = logo; }}
              />
              <p className="text-sm text-cream-200/60 leading-relaxed max-w-sm">
                {aboutUs}
              </p>
              <SocialLinks />
            </div>

            <div className="col-span-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-100 mb-5">
                Quick Links
              </h3>
              <ul className="space-y-1">
                {companyLinks.map(link => (
                  <li key={link.name}>
                    <FooterLink href={link.href}>{link.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-100 mb-5">
                Contact
              </h3>
              <ul className="space-y-4">
                {displayContactInfo.map((item, index) => (
                  <li key={index}>
                    <a 
                      href={item.href} 
                      className="flex items-start gap-3 text-sm text-cream-200/65 hover:text-accent-300 transition-colors"
                      target={item.icon === MapPin ? "_blank" : undefined}
                      rel={item.icon === MapPin ? "noopener noreferrer" : undefined}
                    >
                      <item.icon className="w-4 h-4 mt-0.5 text-accent-400 flex-shrink-0" />
                      <span>{item.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-100 mb-3">
                  Support
                </h3>
                <ul className="space-y-1">
                  {helpLinks.map(link => (
                    <li key={link.name}>
                      <FooterLink href={link.href}>{link.name}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-span-3">
              <Newsletter />
            </div>
          </div>

          {/* Mobile */}
          <div className="lg:hidden space-y-4">
            <div className="text-center mb-8">
              <img 
                src={companyLogo} 
                alt={companyName} 
                className="h-14 w-auto object-contain mx-auto mb-4"
                onError={(e) => { e.target.src = logo; }}
              />
              <p className="text-sm text-cream-200/60 leading-relaxed">
                {aboutUs}
              </p>
              <div className="flex justify-center">
                <SocialLinks />
              </div>
            </div>

            <MobileFooterSection title="Quick Links">
              {companyLinks.map(link => (
                <FooterLink key={link.name} href={link.href}>{link.name}</FooterLink>
              ))}
            </MobileFooterSection>

            <MobileFooterSection title="Support">
              {helpLinks.map(link => (
                <FooterLink key={link.name} href={link.href}>{link.name}</FooterLink>
              ))}
            </MobileFooterSection>

            <MobileFooterSection title="Contact">
              {displayContactInfo.map((item, index) => (
                <a 
                  key={index}
                  href={item.href} 
                  className="flex items-start gap-3 text-sm text-cream-200/65 py-1.5"
                >
                  <item.icon className="w-4 h-4 mt-0.5 text-accent-400 flex-shrink-0" />
                  <span>{item.text}</span>
                </a>
              ))}
            </MobileFooterSection>

            <div className="pt-4">
              <Newsletter />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-cream-200/50 text-center md:text-left">
              © {new Date().getFullYear()} {companyName}. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-cream-200/50">
              <a href="/" className="hover:text-accent-300 transition-colors">Privacy Policy</a>
              <a href="/" className="hover:text-accent-300 transition-colors">Terms of Service</a>
            </div>
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
      />
    </footer>
  );
};

MobileFooterSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

FooterLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Footer;
