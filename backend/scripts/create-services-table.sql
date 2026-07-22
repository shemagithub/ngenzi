-- Create services table
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(100) DEFAULT 'Building2',
  `color` VARCHAR(50) DEFAULT 'from-blue-500 to-cyan-500',
  `features` JSON DEFAULT NULL,
  `link` VARCHAR(200) DEFAULT '/contact',
  `image` VARCHAR(500) DEFAULT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `order` INT(11) NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_isActive` (`isActive`),
  KEY `idx_order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default services
INSERT INTO `services` (`title`, `description`, `icon`, `color`, `features`, `link`, `order`, `isActive`) VALUES
('Construction Services', 'Professional construction and building services for residential and commercial properties. From planning to execution, we handle it all.', 'Building2', 'from-blue-500 to-cyan-500', '["Residential Construction", "Commercial Building", "Renovation & Remodeling", "Interior Design", "Project Management"]', '/contact', 1, 1),
('Land Registration', 'Complete assistance with land registration, title verification, and property documentation. Ensure your property is legally secure.', 'FileText', 'from-green-500 to-emerald-500', '["Title Verification", "Documentation Support", "Legal Compliance", "Registration Assistance", "Property Surveys"]', '/contact', 2, 1),
('Property Valuation', 'Accurate property valuation services for buying, selling, or investment purposes. Professional assessment by certified experts.', 'Calculator', 'from-purple-500 to-pink-500', '["Market Value Assessment", "Investment Analysis", "Tax Evaluation", "Insurance Valuation", "Detailed Reports"]', '/contact', 3, 1),
('Property Inspection', 'Comprehensive property inspection services to identify issues and ensure quality. Pre-purchase and pre-sale inspections available.', 'ClipboardCheck', 'from-orange-500 to-red-500', '["Structural Inspection", "Electrical & Plumbing", "HVAC Systems", "Safety Compliance", "Detailed Reports"]', '/contact', 4, 1),
('Home Loans & Financing', 'Expert guidance on home loans, mortgages, and property financing options. Get the best rates and terms for your property purchase.', 'CreditCard', 'from-indigo-500 to-blue-500', '["Loan Pre-approval", "Interest Rate Comparison", "EMI Calculator", "Documentation Support", "Banking Partnerships"]', '/contact', 5, 1),
('Property Insurance', 'Comprehensive property insurance solutions to protect your investment. Get the right coverage for your property and assets.', 'Shield', 'from-amber-500 to-yellow-500', '["Home Insurance", "Property Damage Coverage", "Liability Protection", "Natural Disaster Coverage", "Competitive Premiums"]', '/contact', 6, 1),
('Legal Consultation', 'Expert legal advice for property transactions, contracts, and disputes. Ensure all legal aspects are handled properly.', 'Hammer', 'from-red-500 to-rose-500', '["Contract Review", "Legal Documentation", "Dispute Resolution", "Property Rights", "Compliance Advisory"]', '/contact', 7, 1),
('Property Management', 'Complete property management services for landlords and property owners. Handle maintenance, tenants, and administration.', 'Home', 'from-teal-500 to-cyan-500', '["Tenant Management", "Maintenance Services", "Rent Collection", "Property Maintenance", "Financial Reporting"]', '/contact', 8, 1);

