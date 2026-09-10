import CarsPage from '../components/cars/Carspage.jsx';
import SEOHead from '../components/SEO/SEOHead';

const Cars = () => {
  return (
    <div className="bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
      <SEOHead
        title="Cars for Sale in Rwanda"
        description="Browse quality used and new cars for sale in Kigali and across Rwanda. Compare brands, mileage, and prices with NGENZI REALESTATE."
        keywords="cars for sale Kigali, used cars Rwanda, buy car Kigali"
        canonicalPath="/cars"
      />
      <CarsPage />
    </div>
  );
};

export default Cars;
