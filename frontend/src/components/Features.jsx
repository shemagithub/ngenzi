import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Shield, Home, Users, Sparkles } from "lucide-react";
import { features } from "../assets/featuredata";

const iconMap = {
  MessageSquare,
  Shield,
  Home,
  Users,
};

const Features = () => {
  return (
    <section className="relative z-0 bg-cream-100 dark:bg-haven-950 border-b border-cream-400/60 dark:border-haven-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Amenities / icon bar — luxury horizontal strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-cream-400/80 dark:divide-haven-800">
          {features.map((feature, index) => {
            const Icon = feature.icon || iconMap[feature.title] || Sparkles;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="group px-6 lg:px-8 py-10 lg:py-12 text-center"
              >
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center">
                  <Icon
                    className="h-8 w-8 text-accent-500 stroke-[1.25] group-hover:scale-110 transition-transform duration-300"
                    strokeWidth={1.25}
                  />
                </div>
                <h3 className="font-display text-xl text-haven-900 dark:text-cream-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-haven-700/70 dark:text-cream-200/60 leading-relaxed max-w-xs mx-auto">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Soft CTA band */}
      <div className="border-t border-cream-400/60 dark:border-haven-800 bg-cream-200/70 dark:bg-haven-900/40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <p className="section-eyebrow mb-3">Why Ngenzi</p>
          <h2 className="section-title mb-3">Crafted for Discerning Buyers</h2>
          <div className="section-divider" />
          <p className="text-haven-700/75 dark:text-cream-200/65 max-w-2xl mx-auto mb-8 leading-relaxed">
            From verified listings to personal guidance, every detail is designed to make finding
            your next home feel effortless and refined.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/properties" className="btn-haven">
              Browse Properties
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-haven-900/30 dark:border-cream-200/30 text-haven-900 dark:text-cream-100 text-xs font-semibold uppercase tracking-[0.14em] rounded-haven hover:bg-haven-900 hover:text-white dark:hover:bg-cream-100 dark:hover:text-haven-900 transition-all duration-300"
            >
              Contact Expert
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
