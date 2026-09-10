/**
 * Seed the local buildestate MySQL database with demo content
 * so the frontend/admin can display working listings.
 *
 * Usage: node scripts/seed-buildestate.js
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DB = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'buildestate',
  multipleStatements: true,
};

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

const propertyImages = [
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
];

const plotImages = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=1200&q=80',
];

const carImages = [
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e282f38bc71?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
];

async function seed() {
  console.log(`🌱 Seeding database: ${DB.database} @ ${DB.host}:${DB.port}`);
  const conn = await mysql.createConnection(DB);

  try {
    // Admin user
    const adminPass = await bcrypt.hash('Admin@123', 10);
    await conn.execute(
      `INSERT INTO users (name, email, password, role, createdAt, updatedAt)
       VALUES (?, ?, ?, 'admin', ?, ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'admin', updatedAt = VALUES(updatedAt)`,
      ['Admin User', 'admin@buildestate.com', adminPass, now(), now()]
    );
    console.log('✅ Admin user ready (admin@buildestate.com / Admin@123)');

    // Settings
    await conn.execute(`UPDATE settings SET
      companyName = ?,
      companyEmail = ?,
      companyPhone = ?,
      companyAddress = ?,
      websiteUrl = ?,
      currency = ?,
      timezone = ?,
      aboutUs = ?,
      metaTitle = ?,
      metaDescription = ?,
      updatedAt = ?
      WHERE id = 1`, [
      'NGENZI REALESTATE',
      'support@ngenzirealestate.com',
      '+250 788 000 000',
      'KG 7 Ave, Kigali, Rwanda',
      'https://ngenzirealestate.com',
      'RWF',
      'Africa/Kigali',
      'NGENZI REALESTATE is your trusted partner for premium properties, land, and vehicles across Rwanda. We combine local expertise with modern tools to help you find your next home or investment.',
      'NGENZI REALESTATE — Premium Real Estate in Rwanda',
      'Browse verified properties, plots, and cars across Kigali and Rwanda.',
      now(),
    ]);
    console.log('✅ Settings updated');

    // Clear content tables (keep structure) for a clean demo seed
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of [
      'saved_properties',
      'appointments',
      'notifications',
      'properties',
      'plots',
      'cars',
      'blogs',
      'testimonials',
      'services',
      'teams',
    ]) {
      await conn.query(`TRUNCATE TABLE \`${table}\``);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // Properties
    const properties = [
      ['Luxury Villa in Nyarutarama', 'Nyarutarama, Kigali', 85000000, propertyImages[0], JSON.stringify([propertyImages[0], propertyImages[3]]), 5, 4, 3200, 'Villa', 'Buy', 'Spacious luxury villa with garden views, private parking, and modern finishes in exclusive Nyarutarama.', JSON.stringify(['Parking', 'Garden', 'Security', 'Generator', 'WiFi']), '+250788111111'],
      ['Modern Apartment in Kacyiru', 'Kacyiru, Kigali', 45000000, propertyImages[1], JSON.stringify([propertyImages[1], propertyImages[4]]), 3, 2, 1450, 'Apartment', 'Buy', 'Bright modern apartment near embassies and business districts, ideal for professionals and families.', JSON.stringify(['Elevator', 'Parking', 'Balcony', 'Security']), '+250788111112'],
      ['Family House in Kimironko', 'Kimironko, Kigali', 32000000, propertyImages[2], JSON.stringify([propertyImages[2]]), 4, 3, 2100, 'House', 'Buy', 'Comfortable family house close to markets and schools with a quiet residential atmosphere.', JSON.stringify(['Parking', 'Garden', 'Water Tank']), '+250788111113'],
      ['Studio in City Center', 'CBD, Kigali', 450000, propertyImages[3], JSON.stringify([propertyImages[3]]), 1, 1, 520, 'Studio', 'Rent', 'Furnished studio apartment in the heart of Kigali CBD — perfect for short or long stays.', JSON.stringify(['Furnished', 'WiFi', 'Security']), '+250788111114'],
      ['Hillside Villa in Remera', 'Remera, Kigali', 62000000, propertyImages[4], JSON.stringify([propertyImages[4], propertyImages[5]]), 4, 3, 2800, 'Villa', 'Buy', 'Elegant hillside villa with panoramic city views and premium finishes throughout.', JSON.stringify(['Parking', 'View', 'Security', 'Generator']), '+250788111115'],
      ['2-Bed Apartment Gacuriro', 'Gacuriro, Kigali', 650000, propertyImages[5], JSON.stringify([propertyImages[5]]), 2, 2, 980, 'Apartment', 'Rent', 'Well-maintained 2-bedroom apartment in a secure Gacuriro compound with amenities.', JSON.stringify(['Parking', 'Security', 'Gym']), '+250788111116'],
    ];

    for (const p of properties) {
      await conn.execute(
        `INSERT INTO properties
          (title, location, price, frontImage, image, beds, baths, sqft, type, availability, description, amenities, phone, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...p, now(), now()]
      );
    }
    console.log(`✅ ${properties.length} properties`);

    // Plots
    const plots = [
      ['Premium Residential Plot — Kigali', 'Kigali, Rwanda', 50000000, plotImages[0], JSON.stringify([plotImages[0]]), 500, 'sqm', 'Plot', 'Buy', 'Ready-to-build residential plot in a prime Kigali neighborhood with clear title.', JSON.stringify(['Title Ready', 'Road Access', 'Electricity Nearby']), '+250788222221', 'PLT-001', 'SV-1001', 'East', 0, 1],
      ['Commercial Plot — Musanze', 'Musanze, Rwanda', 80000000, plotImages[1], JSON.stringify([plotImages[1]]), 1000, 'sqm', 'Plot', 'Buy', 'Large commercial plot ideal for hospitality or retail development near Musanze town.', JSON.stringify(['Corner Plot', 'Road Access']), '+250788222222', 'PLT-002', 'SV-1002', 'North', 1, 1],
      ['Mountain View Plot — Rubavu', 'Rubavu, Rwanda', 35000000, plotImages[2], JSON.stringify([plotImages[2]]), 750, 'sqm', 'Plot', 'Buy', 'Scenic plot overlooking the lake region — perfect for a holiday home or lodge.', JSON.stringify(['Lake View Area', 'Quiet']), '+250788222223', 'PLT-003', 'SV-1003', 'West', 0, 0],
      ['Investment Land — Nyagatare', 'Nyagatare, Rwanda', 18000000, plotImages[3], JSON.stringify([plotImages[3]]), 2000, 'sqm', 'Plot', 'Buy', 'Affordable investment land with strong growth potential in Eastern Province.', JSON.stringify(['Large Area', 'Road Access']), '+250788222224', 'PLT-004', 'SV-1004', 'South', 0, 0],
    ];

    for (const p of plots) {
      await conn.execute(
        `INSERT INTO plots
          (title, location, price, frontImage, image, area, areaUnit, type, availability, description, amenities, phone, plotNumber, surveyNumber, facing, cornerPlot, approvedLayout, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...p, now(), now()]
      );
    }
    console.log(`✅ ${plots.length} plots`);

    // Cars
    const cars = [
      ['Toyota RAV4 2021', 'Toyota', 'RAV4', 2021, 42000, 'km', 'Petrol', 'Automatic', 'White', 'Used', 'SUV', '2.5L', null, 'Kigali', 28000000, carImages[0], JSON.stringify([carImages[0]]), 'Buy', 'Reliable SUV with low mileage, service history available, excellent for family use.', JSON.stringify(['Bluetooth', 'Reverse Camera', 'Alloy Wheels']), '+250788333331'],
      ['Mercedes-Benz C-Class 2019', 'Mercedes-Benz', 'C-Class', 2019, 61000, 'km', 'Petrol', 'Automatic', 'Black', 'Used', 'Sedan', '2.0L', null, 'Kigali', 35000000, carImages[1], JSON.stringify([carImages[1]]), 'Buy', 'Premium sedan in excellent condition with leather interior and sunroof.', JSON.stringify(['Leather Seats', 'Sunroof', 'Navigation']), '+250788333332'],
      ['Toyota Hiace 2018', 'Toyota', 'Hiace', 2018, 98000, 'km', 'Diesel', 'Manual', 'Silver', 'Used', 'Van', '3.0L', null, 'Kigali', 22000000, carImages[2], JSON.stringify([carImages[2]]), 'Buy', 'Spacious van ideal for business transport or tourism groups.', JSON.stringify(['AC', 'High Roof']), '+250788333333'],
      ['Honda Civic 2020', 'Honda', 'Civic', 2020, 35000, 'km', 'Petrol', 'Automatic', 'Blue', 'Used', 'Sedan', '1.8L', null, 'Kigali', 18000000, carImages[3], JSON.stringify([carImages[3]]), 'Buy', 'Fuel-efficient Civic with clean interior and recent servicing.', JSON.stringify(['Bluetooth', 'Backup Camera']), '+250788333334'],
    ];

    for (const c of cars) {
      await conn.execute(
        `INSERT INTO cars
          (title, brand, model, year, mileage, mileageUnit, fuelType, transmission, color, \`condition\`, bodyType, engineSize, vin, location, price, frontImage, image, availability, description, features, phone, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [...c, now(), now()]
      );
    }
    console.log(`✅ ${cars.length} cars`);

    // Services
    const services = [
      ['Construction Services', 'Professional construction and building services for residential and commercial properties.', 'Building2', 'from-haven-800 to-haven-600', JSON.stringify(['Residential Construction', 'Commercial Building', 'Renovation', 'Project Management']), '/contact', 1],
      ['Land Registration', 'Complete assistance with land registration, title verification, and property documentation.', 'FileText', 'from-accent-500 to-accent-400', JSON.stringify(['Title Verification', 'Documentation', 'Legal Compliance']), '/contact', 2],
      ['Property Valuation', 'Accurate property valuation for buying, selling, or investment decisions.', 'Calculator', 'from-haven-700 to-accent-500', JSON.stringify(['Market Assessment', 'Investment Analysis', 'Detailed Reports']), '/contact', 3],
      ['Property Inspection', 'Comprehensive inspections to identify issues and ensure quality before purchase.', 'ClipboardCheck', 'from-haven-800 to-haven-700', JSON.stringify(['Structural', 'Electrical & Plumbing', 'Safety']), '/contact', 4],
      ['Home Loans & Financing', 'Guidance on mortgages and financing options with trusted banking partners.', 'CreditCard', 'from-accent-600 to-accent-400', JSON.stringify(['Pre-approval', 'Rate Comparison', 'Documentation']), '/contact', 5],
      ['Property Management', 'Full management services for landlords — tenants, maintenance, and reporting.', 'Home', 'from-haven-900 to-haven-700', JSON.stringify(['Tenant Management', 'Maintenance', 'Rent Collection']), '/contact', 6],
    ];

    for (const s of services) {
      await conn.execute(
        `INSERT INTO services (title, description, icon, color, features, link, \`order\`, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [...s, now(), now()]
      );
    }
    console.log(`✅ ${services.length} services`);

    // Testimonials
    const testimonials = [
      ['Jean Baptiste', 'Homeowner', 'Kigali', 'NGENZI helped us find our dream villa in Nyarutarama. Professional, transparent, and truly caring throughout the process.', 5, 'https://i.pravatar.cc/150?img=12', 1, 1],
      ['Alice Uwase', 'Investor', 'Musanze', 'Excellent guidance on land investment. Clear documentation and honest advice made the purchase stress-free.', 5, 'https://i.pravatar.cc/150?img=5', 2, 1],
      ['David Mugisha', 'Tenant', 'Kigali', 'Found a perfect apartment within a week. The team understood exactly what we needed.', 5, 'https://i.pravatar.cc/150?img=33', 3, 1],
      ['Grace Ingabire', 'Buyer', 'Rubavu', 'From viewing to closing, everything was handled with care. Highly recommend NGENZI Real Estate.', 5, 'https://i.pravatar.cc/150?img=9', 4, 0],
    ];

    for (const t of testimonials) {
      await conn.execute(
        `INSERT INTO testimonials (name, position, company, content, rating, image, \`order\`, isActive, isFeatured, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [...t, now(), now()]
      );
    }
    console.log(`✅ ${testimonials.length} testimonials`);

    // Team
    const teams = [
      ['Eric Nshimiyimana', 'Managing Director', 'Leading NGENZI with a focus on trust, quality, and client success across Rwanda.', 'eric@ngenzirealestate.com', '+250788000001', 'https://i.pravatar.cc/300?img=11', JSON.stringify({ linkedin: '#', twitter: '#' }), 1],
      ['Claire Mukamana', 'Head of Sales', 'Specializes in residential sales and helping families find the right home.', 'claire@ngenzirealestate.com', '+250788000002', 'https://i.pravatar.cc/300?img=5', JSON.stringify({ linkedin: '#' }), 2],
      ['Patrick Habimana', 'Land Specialist', 'Expert in land acquisition, title verification, and investment plots.', 'patrick@ngenzirealestate.com', '+250788000003', 'https://i.pravatar.cc/300?img=14', JSON.stringify({ linkedin: '#' }), 3],
      ['Diane Uwera', 'Client Relations', 'Ensures every client receives personalized support from inquiry to handover.', 'diane@ngenzirealestate.com', '+250788000004', 'https://i.pravatar.cc/300?img=20', JSON.stringify({}), 4],
    ];

    for (const t of teams) {
      await conn.execute(
        `INSERT INTO teams (name, position, bio, email, phone, image, socialLinks, \`order\`, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [...t, now(), now()]
      );
    }
    console.log(`✅ ${teams.length} team members`);

    // Blogs
    const blogs = [
      [
        'Kigali Real Estate Trends in 2026',
        'kigali-real-estate-trends-2026',
        '<p>Kigali continues to attract homeowners and investors alike. From Nyarutarama villas to Gacuriro apartments, demand remains strong for quality housing with secure compounds and modern amenities.</p><p>In this guide we highlight neighborhoods to watch, pricing patterns, and tips for first-time buyers.</p>',
        'Explore the neighborhoods and price trends shaping Rwanda’s capital this year.',
        'NGENZI Editorial',
        propertyImages[0],
        'Market Insights',
        JSON.stringify(['Kigali', 'Trends', 'Investment']),
      ],
      [
        'How to Buy Land Safely in Rwanda',
        'how-to-buy-land-safely-rwanda',
        '<p>Buying land requires careful due diligence — title verification, surveys, and understanding zoning. Our specialists walk you through each step so your investment is protected.</p>',
        'A practical checklist for verifying titles, surveys, and documentation before you buy.',
        'Patrick Habimana',
        plotImages[0],
        'Guides',
        JSON.stringify(['Land', 'Legal', 'Tips']),
      ],
      [
        'Choosing the Right Family Home in Kigali',
        'choosing-family-home-kigali',
        '<p>Schools, commute, security, and outdoor space all matter when choosing a family home. We compare popular residential areas to help you decide.</p>',
        'What to prioritize when searching for a family-friendly home across Kigali.',
        'Claire Mukamana',
        propertyImages[2],
        'Lifestyle',
        JSON.stringify(['Family', 'Homes', 'Kigali']),
      ],
    ];

    for (const b of blogs) {
      await conn.execute(
        `INSERT INTO blogs
          (title, slug, content, excerpt, author, image, category, tags, views, isPublished, publishedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [...b, Math.floor(Math.random() * 200) + 20, now(), now(), now()]
      );
    }
    console.log(`✅ ${blogs.length} blogs`);

    console.log('\n🎉 Seed complete. Refresh the frontend to see listings.');
    console.log('   Admin login: admin@buildestate.com / Admin@123');
  } finally {
    await conn.end();
  }
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
