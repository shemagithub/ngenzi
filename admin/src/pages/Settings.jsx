import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Upload, 
  X, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Save,
  Loader
} from 'lucide-react';
import { backendurl } from '../config/constants';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null); // Store the actual file object
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    websiteUrl: '',
    currency: 'RWF',
    timezone: 'Africa/Kigali',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    whatsapp: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    aboutUs: '',
    termsAndConditions: '',
    privacyPolicy: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendurl}/api/settings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const settings = response.data.settings;
        setFormData({
          companyName: settings.companyName || '',
          companyEmail: settings.companyEmail || '',
          companyPhone: settings.companyPhone || '',
          companyAddress: settings.companyAddress || '',
          websiteUrl: settings.websiteUrl || '',
          currency: settings.currency || 'RWF',
          timezone: settings.timezone || 'Africa/Kigali',
          facebook: settings.facebook || '',
          twitter: settings.twitter || '',
          instagram: settings.instagram || '',
          linkedin: settings.linkedin || '',
          youtube: settings.youtube || '',
          whatsapp: settings.whatsapp || '',
          metaTitle: settings.metaTitle || '',
          metaDescription: settings.metaDescription || '',
          metaKeywords: settings.metaKeywords || '',
          aboutUs: settings.aboutUs || '',
          termsAndConditions: settings.termsAndConditions || '',
          privacyPolicy: settings.privacyPolicy || ''
        });
        
        if (settings.companyLogo) {
          setLogoPreview(settings.companyLogo);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Logo size should be less than 5MB');
        e.target.value = ''; // Reset input
        return;
      }
      setLogoFile(file); // Store the file object
      setLogoPreview(URL.createObjectURL(file));
      console.log('📎 Logo file selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    // Reset file input
    const logoInput = document.querySelector('input[type="file"][name="logo"]');
    if (logoInput) {
      logoInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formdata = new FormData();

      // Append all form fields
      console.log('📝 Preparing form data...');
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formdata.append(key, formData[key]);
          console.log(`  ✓ Added ${key}: ${formData[key]}`);
        }
      });

      // Append logo file if a new one was selected
      // Use the stored logoFile state instead of querySelector
      console.log('🔍 Logo file check:');
      console.log('   logoFile state:', logoFile ? 'Exists' : 'null');
      
      if (logoFile) {
        formdata.append('logo', logoFile);
        console.log(`  ✅ Added logo file to FormData:`);
        console.log(`     Name: ${logoFile.name}`);
        console.log(`     Size: ${(logoFile.size / 1024).toFixed(2)} KB`);
        console.log(`     Type: ${logoFile.type}`);
        
        // Verify it's in FormData
        if (formdata.has('logo')) {
          console.log(`  ✅ Logo confirmed in FormData`);
        } else {
          console.error(`  ❌ Logo NOT in FormData!`);
        }
      } else {
        console.log('  ⚠ No logo file selected (logoFile state is null)');
        // Also check the input as fallback
        const logoInput = document.querySelector('input[type="file"][name="logo"]');
        if (logoInput && logoInput.files && logoInput.files[0]) {
          console.log('  ℹ️ Found file in input, adding to FormData...');
          formdata.append('logo', logoInput.files[0]);
        }
      }

      console.log('🚀 Sending settings update request...');
      console.log('   FormData entries:');
      for (let pair of formdata.entries()) {
        if (pair[1] instanceof File) {
          console.log(`     ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`     ${pair[0]}: ${typeof pair[1] === 'string' && pair[1].length > 50 ? pair[1].substring(0, 50) + '...' : pair[1]}`);
        }
      }
      
      const response = await axios.put(`${backendurl}/api/settings`, formdata, {
        headers: {
          // Don't set Content-Type - axios will set it automatically with correct boundary for FormData
          Authorization: `Bearer ${token}`
        }
      });

      console.log('📥 Response received:', response.data);

      if (response.data.success) {
        console.log('✅ Settings updated successfully!');
        console.log('📊 Updated settings:', response.data.settings);
        
        // Log all saved fields
        if (response.data.settings) {
          console.log('💾 Saved to database:');
          Object.keys(response.data.settings).forEach(key => {
            if (key !== 'createdAt' && key !== 'updatedAt') {
              const value = response.data.settings[key];
              if (value) {
                console.log(`  - ${key}: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value}`);
              }
            }
          });
        }
        
        toast.success('Settings updated successfully!');
        // Update logo preview if new logo was uploaded
        if (response.data.settings?.companyLogo) {
          setLogoPreview(response.data.settings.companyLogo);
          console.log('🖼️ Logo URL updated:', response.data.settings.companyLogo);
        }
      } else {
        console.error('❌ Failed to update settings:', response.data.message);
        toast.error(response.data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-haven-700 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="max-w-5xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-blue-100 mt-1">Manage your company information and preferences</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Company Information */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-haven-700" />
                Company Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Email *
                  </label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Phone
                  </label>
                  <input
                    type="tel"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address
                  </label>
                  <textarea
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Logo Upload */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-haven-700" />
                Company Logo
              </h2>
              
              <div className="flex items-start gap-6">
                {logoPreview && (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Company Logo"
                      className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg p-2 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Logo (PNG, JPG, max 5MB)
                  </label>
                  <input
                    type="file"
                    name="logo"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleLogoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended size: 200x200px or larger. Square images work best.
                  </p>
                </div>
              </div>
            </section>

            {/* Social Media */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-haven-700" />
                Social Media Links
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-haven-700" />
                    Facebook
                  </label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    Twitter
                  </label>
                  <input
                    type="url"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/yourhandle"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    Instagram
                  </label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-700" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/company/yourcompany"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-600" />
                    YouTube
                  </label>
                  <input
                    type="url"
                    name="youtube"
                    value={formData.youtube}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/@yourchannel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+250 788 123 456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* General Settings */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-haven-700" />
                General Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  >
                    <option value="RWF">Rwandan Francs (RWF)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  >
                    <option value="Africa/Kigali">Africa/Kigali (Rwanda)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
              </div>
            </section>

            {/* SEO Settings */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-haven-700" />
                SEO Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Page title for search engines"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Brief description for search engines"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleInputChange}
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Additional Content */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-haven-700" />
                Additional Content
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About Us
                  </label>
                  <textarea
                    name="aboutUs"
                    value={formData.aboutUs}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Write about your company..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms and Conditions
                  </label>
                  <textarea
                    name="termsAndConditions"
                    value={formData.termsAndConditions}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Terms and conditions content..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Policy
                  </label>
                  <textarea
                    name="privacyPolicy"
                    value={formData.privacyPolicy}
                    onChange={handleInputChange}
                    rows={5}
                    placeholder="Privacy policy content..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-haven-600 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={fetchSettings}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-haven-800 text-white rounded-lg hover:bg-haven-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;

