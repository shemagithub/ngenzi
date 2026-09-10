import PlotsPage from '../components/plots/Plotspage.jsx';
import SEOHead from '../components/SEO/SEOHead';

const Plots = () => {
  return (
    <div className="bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
      <SEOHead
        title="Land Plots for Sale in Rwanda"
        description="Explore land plots and investment parcels across Rwanda. Find residential and commercial plots with clear details from NGENZI REALESTATE."
        keywords="land for sale Rwanda, plots Kigali, buy land Rwanda, investment plots"
        canonicalPath="/plots"
      />
      <PlotsPage />
    </div>
  );
};

export default Plots;
