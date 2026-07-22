# BuildEstate - Complete Features Catalog
## Real Estate Platform Documentation

**Platform:** BuildEstate Real Estate Website  
**Backend API:** https://myambi.wildjourneysrwanda.com  
**Version:** 2.0  
**Date:** January 2026

---

## Table of Contents

1. [Admin Panel Features](#admin-panel-features)
2. [Frontend Features](#frontend-features)
3. [Technical Architecture](#technical-architecture)
4. [API Integration](#api-integration)

---

## 1. Admin Panel Features

### 1.1 Authentication & Security
- **Admin Login System**
  - Secure JWT-based authentication
  - Admin credentials verification
  - Session management with token storage
  - Auto-redirect to dashboard after login
  - Secure logout functionality
  - Token-based authorization for all API calls

### 1.2 Dashboard
- **Real-time Statistics**
  - Total properties count
  - Total plots count
  - Active appointments
  - Total users
  - Pending appointments
  - Completed appointments
  - Revenue analytics
  - User growth metrics

- **Data Visualization**
  - Line charts for property trends over time
  - Bar charts for appointment statistics
  - Doughnut charts for status distribution
  - Interactive charts with Chart.js
  - Real-time data refresh

- **Quick Actions**
  - Add new property
  - View appointments
  - Manage users
  - System settings access

### 1.3 Property Management
- **Property Listings** (`/admin/properties`)
  - View all properties in grid or list view
  - Search and filter properties
  - Sort by various criteria (price, date, status)
  - Property details preview
  - Edit existing properties
  - Delete properties
  - Bulk actions support

- **Add New Property** (`/admin/add-property`)
  - Complete property information form
  - Multiple image uploads
  - Property type selection (House, Apartment, Villa, etc.)
  - Location details (address, city, state, country)
  - Property specifications:
    - Bedrooms, Bathrooms, Square footage
    - Price and currency selection
    - Property status (Available, Sold, Rented)
  - Amenities selection (checkbox list)
  - Rich text description editor
  - Property features and highlights
  - SEO metadata (title, description, keywords)
  - Preview before submission

- **Edit Property** (`/admin/update-property/:id`)
  - Load existing property data
  - Update all property fields
  - Replace or add new images
  - Modify property status
  - Update pricing information
  - Edit amenities and features

### 1.4 Plot Management
- **Plot Listings** (`/admin/plots`)
  - View all land plots
  - Grid view with plot images
  - Search and filter functionality
  - Plot specifications display
  - Edit and delete plots

- **Add New Plot** (`/admin/add-plot`)
  - Plot information form
  - Image upload
  - Location details
  - Plot size and dimensions
  - Price and currency
  - Plot type (Residential, Commercial, Agricultural)
  - Legal status information
  - Plot features and amenities

### 1.5 Appointment Management
- **Appointments Dashboard** (`/admin/appointments`)
  - View all property viewing appointments
  - Filter by status:
    - Pending
    - Confirmed
    - Completed
    - Cancelled
  - Search appointments
  - Appointment details:
    - User information
    - Property details
    - Date and time
    - Contact information
    - Status and notes
  - Update appointment status
  - Add/Edit meeting links (Zoom, Google Meet, etc.)
  - Send appointment confirmations
  - Manage appointment schedules

### 1.6 User Management
- **Users Dashboard** (`/admin/users`)
  - View all registered users
  - User details:
    - Name, Email, Phone
    - Registration date
    - Account status (Active/Inactive)
    - User role
  - Search and filter users
  - Edit user information
  - Activate/Deactivate user accounts
  - Reset user passwords
  - View user activity
  - Delete user accounts

### 1.7 Blog Management
- **Blog Posts** (`/admin/blogs`)
  - Create, Edit, Delete blog posts
  - Rich text editor (Quill Editor)
  - Featured image upload
  - Blog categories and tags
  - SEO optimization:
    - Meta title
    - Meta description
    - Meta keywords
  - Slug generation
  - Publish/Unpublish status
  - Publication date scheduling
  - Search and filter blogs
  - Blog analytics (views, engagement)

### 1.8 Services Management
- **Services** (`/admin/services`)
  - Add real estate services
  - Service descriptions
  - Service icons and images
  - Service categories
  - Pricing information
  - Display order management
  - Active/Inactive status

### 1.9 Team Management
- **Team Members** (`/admin/team`)
  - Add team members
  - Upload team member photos
  - Team member information:
    - Name, Position, Bio
    - Contact information (Email, Phone)
    - Social media links (LinkedIn, Twitter, Facebook, Instagram)
  - Display order management
  - Active/Inactive status
  - Edit and delete team members

### 1.10 Testimonials Management
- **Testimonials** (`/admin/testimonials`)
  - Add customer testimonials
  - Client information:
    - Name, Position, Company
  - Testimonial content
  - Rating system (1-5 stars)
  - Client photo upload
  - Featured testimonial flag
  - Display order
  - Active/Inactive status

### 1.11 System Settings
- **General Settings** (`/admin/settings`)
  - Company Information:
    - Company Name
    - Company Email
    - Company Phone
    - Company Address
    - Website URL
  - Company Logo Upload
  - Social Media Links:
    - Facebook, Twitter, Instagram
    - LinkedIn, YouTube, WhatsApp
  - Currency Settings
  - Timezone Configuration
  - SEO Settings:
    - Meta Title
    - Meta Description
    - Meta Keywords
  - Content Pages:
    - About Us (Rich text editor)
    - Terms & Conditions
    - Privacy Policy
  - Save and apply settings

### 1.12 Additional Features
- **Responsive Design**
  - Mobile-friendly interface
  - Tablet optimization
  - Desktop experience
- **Real-time Updates**
  - Live data synchronization
  - Auto-refresh functionality
- **Search & Filter**
  - Advanced search capabilities
  - Multi-criteria filtering
- **Image Management**
  - Multiple image uploads
  - Image preview
  - Image optimization

---

## 2. Frontend Features

### 2.1 Authentication System
- **User Registration** (`/signup`)
  - Email and password registration
  - User profile creation
  - Email validation
  - Password strength requirements
  - Terms and conditions acceptance

- **User Login** (`/login`)
  - Secure authentication
  - Remember me functionality
  - JWT token management
  - Auto-redirect after login

- **Password Management**
  - Forgot Password (`/forgot-password`)
    - Email-based password reset
    - Reset token generation
  - Reset Password (`/reset/:token`)
    - Secure token validation
    - New password setting

### 2.2 Home Page (`/`)
- **Hero Section**
  - Eye-catching banner
  - Call-to-action buttons
  - Property search bar
  - Featured properties display

- **Features Section**
  - Platform highlights
  - Key benefits showcase
  - Service offerings

- **Featured Properties**
  - Latest property listings
  - Property cards with images
  - Quick view functionality
  - Direct property links

- **How It Works**
  - Step-by-step process guide
  - User journey explanation
  - Visual workflow

- **Testimonials Section**
  - Customer reviews display
  - Star ratings
  - Client photos and names
  - Smooth scrolling carousel

- **Blog Preview**
  - Latest blog posts
  - Blog cards with excerpts
  - Read more links

### 2.3 Properties Page (`/properties`)
- **Property Listings**
  - Grid and list view options
  - Property cards with:
    - High-quality images
    - Property title and location
    - Price display
    - Bedrooms, bathrooms, area
    - Property type
    - Key features
  - Pagination support
  - Infinite scroll option

- **Advanced Search & Filters**
  - Search by keyword
  - Filter by:
    - Property type (House, Apartment, Villa, etc.)
    - Price range
    - Bedrooms count
    - Bathrooms count
    - Location (City, Area)
    - Property status
  - Sort options:
    - Price: Low to High / High to Low
    - Date: Newest / Oldest
    - Most Popular

- **Property Details** (`/properties/single/:id`)
  - Full property information
  - Image gallery with lightbox
  - Property specifications:
    - Detailed description
    - All amenities listed
    - Location map
    - Nearby facilities
  - Price and contact information
  - Schedule viewing button
  - Save property functionality
  - Share property options
  - Related properties section

### 2.4 Plots Page (`/plots`)
- **Land Plot Listings**
  - All available plots display
  - Plot cards with images
  - Plot specifications:
    - Size and dimensions
    - Location details
    - Price information
    - Plot type
  - Search and filter functionality

- **Plot Details** (`/plots/:id`)
  - Comprehensive plot information
  - Image gallery
  - Location map
  - Legal status
  - Nearby amenities
  - Contact for inquiry
  - Save plot option

### 2.5 Services Page (`/services`)
- **Real Estate Services**
  - Service listings
  - Service descriptions
  - Service icons and images
  - Service categories
  - Contact for services

### 2.6 About Us Page (`/about`)
- **Company Information**
  - Company mission and vision
  - Company values
  - Company milestones/history
  - Team members showcase:
    - Team photos
    - Team member bios
    - Positions and roles
    - Social media links
  - Why choose us section
  - Company benefits

### 2.7 Contact Page (`/contact`)
- **Contact Form**
  - Name, Email, Phone fields
  - Subject selection
  - Message textarea
  - Form validation
  - Submit functionality
  - Success/Error notifications

- **Contact Information**
  - Company address
  - Phone number
  - Email address
  - Social media links
  - Office hours
  - Map location

### 2.8 Blog Section (`/blogs/:slug`)
- **Blog Listing**
  - All blog posts display
  - Blog cards with featured images
  - Post excerpts
  - Publication dates
  - Author information
  - Category tags

- **Blog Detail Page**
  - Full blog content
  - Featured image
  - Rich text formatting
  - Author information
  - Publication date
  - Share buttons
  - Related posts
  - Comments section (if enabled)

### 2.9 AI Property Hub (`/ai-property-hub`)
- **AI-Powered Property Search**
  - Intelligent property recommendations
  - Natural language search queries
  - AI analysis of properties
  - Personalized suggestions

- **Location Trends**
  - Location-based analytics
  - Market trends display
  - Price trends
  - Popular areas

- **Property Analysis**
  - AI-generated insights
  - Investment recommendations
  - Market predictions

### 2.10 Map Search (`/map`)
- **Interactive Map**
  - Google Maps integration
  - Property markers on map
  - Plot locations
  - Interactive markers
  - Click to view details
  - Map filters
  - Radius search

### 2.11 User Dashboard
- **My Profile** (`/profile`)
  - Personal information display
  - Edit profile functionality
  - Profile picture upload
  - Account settings

- **Saved Properties** (`/saved-properties`)
  - List of saved/favorited properties
  - Remove from saved list
  - Quick view saved properties
  - Direct links to property details

- **Notifications** (`/notifications`)
  - Notification center
  - Unread notifications count
  - Mark as read functionality
  - Mark all as read
  - Delete notifications
  - Notification types:
    - New properties
    - Price updates
    - Appointment reminders
    - System notifications

- **Settings** (`/settings`)
  - Change password
  - Notification preferences
  - Email preferences
  - Account preferences

### 2.12 Schedule Viewing
- **Property Viewing Booking**
  - Select date and time
  - Property selection
  - Contact information
  - Special requests/notes
  - Confirmation process
  - Email notifications

### 2.13 Additional Frontend Features
- **Responsive Design**
  - Mobile-first approach
  - Tablet optimization
  - Desktop experience
  - Cross-browser compatibility

- **SEO Optimization**
  - Meta tags management
  - Structured data (JSON-LD)
  - Dynamic page titles
  - Open Graph tags
  - Sitemap support

- **Performance Features**
  - Image lazy loading
  - Code splitting
  - Optimized assets
  - Fast page loads

- **User Experience**
  - Smooth animations (Framer Motion)
  - Loading states
  - Error handling
  - Toast notifications
  - Scroll to top button
  - Smooth scrolling

- **Currency Support**
  - Multiple currency display
  - Currency conversion
  - Currency switcher

- **Newsletter Subscription**
  - Email subscription form in footer
  - Newsletter signup
  - Subscription confirmation

---

## 3. Technical Architecture

### 3.1 Frontend Technology Stack
- **Framework:** React 18
- **Routing:** React Router v6
- **State Management:** React Context API
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Build Tool:** Vite
- **Form Handling:** React Hook Form
- **Notifications:** React Toastify, React Hot Toast

### 3.2 Admin Panel Technology Stack
- **Framework:** React 18
- **Routing:** React Router v6
- **State Management:** React Context API
- **Styling:** Tailwind CSS
- **Charts:** Chart.js, React-Chartjs-2
- **Rich Text Editor:** Quill Editor
- **HTTP Client:** Axios
- **Build Tool:** Vite
- **Notifications:** React Hot Toast

### 3.3 Backend API
- **Runtime:** Node.js (v22.18.0)
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **API Version:** v2.0
- **Base URL:** https://myambi.wildjourneysrwanda.com

---

## 4. API Integration

### 4.1 Authentication Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/admin` - Admin login
- `POST /api/users/forgot` - Password reset request
- `POST /api/users/reset/:token` - Password reset

### 4.2 Property Endpoints
- `GET /api/products/list` - Get all properties
- `GET /api/products/single/:id` - Get single property
- `POST /api/products/add` - Add new property (Admin)
- `POST /api/products/update` - Update property (Admin)
- `POST /api/products/remove` - Delete property (Admin)
- `POST /api/properties/search` - Search properties

### 4.3 Plot Endpoints
- `GET /api/plots/list` - Get all plots
- `GET /api/plots/single/:id` - Get single plot
- `POST /api/plots/add` - Add new plot (Admin)
- `POST /api/plots/remove` - Delete plot (Admin)

### 4.4 Appointment Endpoints
- `GET /api/appointments` - Get user appointments
- `GET /api/appointments/all` - Get all appointments (Admin)
- `POST /api/appointments/schedule` - Schedule viewing
- `PUT /api/appointments/status` - Update appointment status
- `PUT /api/appointments/update-meeting` - Update meeting link

### 4.5 User Endpoints
- `GET /api/users/me` - Get current user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/admin/all` - Get all users (Admin)
- `PUT /api/users/admin/:id` - Update user (Admin)
- `DELETE /api/users/admin/:id` - Delete user (Admin)

### 4.6 Blog Endpoints
- `GET /api/blogs/list` - Get all blogs
- `GET /api/blogs/single/:slug` - Get single blog
- `GET /api/blogs/admin/list` - Get all blogs (Admin)
- `POST /api/blogs/add` - Add blog (Admin)
- `PUT /api/blogs/update/:id` - Update blog (Admin)
- `DELETE /api/blogs/delete/:id` - Delete blog (Admin)

### 4.7 Settings Endpoints
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings (Admin)

### 4.8 Additional Endpoints
- `GET /api/locations/:city/trends` - Location trends
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/testimonials/list` - Get testimonials
- `GET /api/teams/list` - Get team members
- `GET /api/services/list` - Get services
- `GET /api/notifications` - Get notifications
- `GET /health` - Health check
- `GET /status` - System status

---

## 5. Key Features Summary

### Admin Panel Highlights
✅ Complete property management system  
✅ Advanced dashboard with analytics  
✅ User management and control  
✅ Appointment scheduling system  
✅ Content management (Blogs, Services, Team, Testimonials)  
✅ System settings and configuration  
✅ Image upload and management  
✅ SEO optimization tools  

### Frontend Highlights
✅ Modern, responsive design  
✅ Advanced property search and filters  
✅ User authentication and profiles  
✅ AI-powered property recommendations  
✅ Interactive map integration  
✅ Blog and content sections  
✅ Appointment booking system  
✅ Saved properties feature  
✅ Notification system  
✅ SEO optimized pages  

---

**Document Generated:** January 2026  
**Platform:** BuildEstate Real Estate Platform  
**For:** System Documentation and Feature Catalog

