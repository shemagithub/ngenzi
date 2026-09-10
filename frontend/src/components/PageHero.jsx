import PropTypes from "prop-types";
import { motion } from "framer-motion";
import heroimage from "../assets/images/heroimage.png";

/**
 * Shared full-bleed page hero for interior pages.
 * Matches the luxury haven design language.
 */
const PageHero = ({
  eyebrow = "Ngenzi Real Estate",
  title,
  subtitle,
  image = heroimage,
  compact = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden ${
        compact ? "h-[42vh] min-h-[280px]" : "h-[56vh] min-h-[360px]"
      }`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-haven-950/85 via-haven-900/70 to-haven-900/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-haven-950/50 via-transparent to-haven-900/20" />

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            {eyebrow && (
              <p className="text-accent-300 text-[11px] font-semibold uppercase tracking-[0.28em] mb-4">
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-4">
              {title}
            </h1>
            <div className="h-px w-16 bg-accent-400 mb-5" />
            {subtitle && (
              <p className="text-cream-200/85 text-base sm:text-lg font-light leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

PageHero.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  image: PropTypes.string,
  compact: PropTypes.bool,
};

export default PageHero;
