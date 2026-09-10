import { useState, useEffect } from 'react';
import { Star, ArrowLeft, ArrowRight, Quote, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Backendurl } from '../utils/backendUrl';
import PropTypes from 'prop-types';

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white dark:bg-haven-900 border border-cream-400/80 dark:border-haven-800 p-8 h-full flex flex-col shadow-soft">
      <Quote className="w-8 h-8 text-accent-400 mb-5 stroke-[1.25]" strokeWidth={1.25} />

      <p className="text-haven-800 dark:text-cream-100 leading-relaxed mb-8 flex-1 font-light text-[15px]">
        {testimonial.content || testimonial.text}
      </p>

      <div className="flex items-center gap-4 mt-auto pt-6 border-t border-cream-400/80 dark:border-haven-700">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover border border-cream-400"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/100?text=Client';
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-haven-900 dark:text-cream-100 text-sm truncate">
            {testimonial.name}
          </p>
          <p className="text-xs text-haven-700/60 dark:text-cream-200/50 truncate">
            {testimonial.location}
          </p>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < (testimonial.rating || 5)
                  ? 'fill-accent-400 text-accent-400'
                  : 'text-cream-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

TestimonialCard.propTypes = {
  testimonial: PropTypes.object.isRequired,
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${Backendurl}/api/testimonials/list`, {
          params: { isActive: true }
        });

        if (response.data.success && response.data.testimonials) {
          const testimonialsArray = Array.isArray(response.data.testimonials)
            ? response.data.testimonials
            : [];

          if (testimonialsArray.length === 0) {
            setTestimonials([]);
            return;
          }

          const mappedTestimonials = testimonialsArray.map((testimonial) => ({
            id: testimonial.id,
            name: testimonial.name || 'Anonymous',
            text: testimonial.content || '',
            content: testimonial.content || '',
            location: [testimonial.position, testimonial.company]
              .filter(Boolean)
              .join(', ') || 'Client',
            position: testimonial.position || null,
            company: testimonial.company || null,
            image: testimonial.image || 'https://via.placeholder.com/100?text=Client',
            rating: testimonial.rating || 5,
            isFeatured: testimonial.isFeatured || false,
            order: testimonial.order || 0,
            isActive: testimonial.isActive !== false
          }));

          setTestimonials(mappedTestimonials);
          setActiveIndex(0);
        } else {
          setError(response.data.message || 'Failed to load testimonials');
          setTestimonials([]);
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch testimonials.');
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (loading) {
    return (
      <section className="py-24 bg-cream-200 dark:bg-haven-950">
        <div className="flex items-center justify-center py-20">
          <Loader className="w-8 h-8 animate-spin text-accent-500" />
        </div>
      </section>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <section className="py-24 bg-cream-200 dark:bg-haven-950">
        <div className="max-w-[1600px] mx-auto px-4 text-center">
          <p className="section-eyebrow">Client Stories</p>
          <h2 className="section-title mt-3 mb-4">What Our Clients Say</h2>
          <div className="section-divider" />
          <p className="text-haven-700/70 dark:text-cream-200/60">
            {error || 'Testimonials will be displayed here soon.'}
          </p>
        </div>
      </section>
    );
  }

  const visible = testimonials.slice(0, 3);

  return (
    <section className="py-24 bg-cream-200 dark:bg-haven-950">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="section-eyebrow">Client Stories</p>
          <h2 className="section-title mt-3 mb-2">What Our Clients Say</h2>
          <div className="section-divider" />
          <p className="text-haven-700/70 dark:text-cream-200/60 max-w-2xl mx-auto leading-relaxed">
            Discover why homeowners trust NGENZI REALESTATE to find their perfect property
          </p>
        </div>

        {/* Desktop 3-card grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {visible.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden relative mb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
            >
              <TestimonialCard testimonial={testimonials[activeIndex]} />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() =>
                setActiveIndex((prev) =>
                  prev === 0 ? testimonials.length - 1 : prev - 1
                )
              }
              className="p-2 border border-haven-900/20 dark:border-cream-200/20 text-haven-900 dark:text-cream-100 hover:bg-haven-900 hover:text-white transition-colors"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 transition-all ${
                    i === activeIndex ? 'w-6 bg-accent-400' : 'w-1.5 bg-cream-500'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() =>
                setActiveIndex((prev) => (prev + 1) % testimonials.length)
              }
              className="p-2 border border-haven-900/20 dark:border-cream-200/20 text-haven-900 dark:text-cream-100 hover:bg-haven-900 hover:text-white transition-colors"
              aria-label="Next testimonial"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop dots if more than 3 */}
        {testimonials.length > 3 && (
          <div className="hidden md:flex justify-center gap-2">
            {testimonials.slice(0, Math.min(testimonials.length, 6)).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 ${i < 3 ? 'bg-accent-400' : 'bg-cream-500'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
