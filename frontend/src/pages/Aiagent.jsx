import { useState, useEffect, useRef } from "react";
import PageHero from "../components/PageHero";
import SearchForm from "../components/ai/SearchForm";
import PropertyCard from "../components/ai/PropertyCard";
import LocationTrends from "../components/ai/LocationTrends";
import AnalysisDisplay from "../components/ai/AnalysisDisplay";
import { searchProperties, getLocationTrends } from "../services/api";
import {
  Building,
  MapPin,
  TrendingUp,
  Brain,
} from "lucide-react";
import PropTypes from "prop-types";
import AiHubSEO from "../components/SEO/AiHubSEO";
import StructuredData from "../components/SEO/StructuredData";

const AIPropertyHub = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [loadingTime, setLoadingTime] = useState(0);
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState([]);
  const [propertyAnalysis, setPropertyAnalysis] = useState("");
  const [locationAnalysis, setLocationAnalysis] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    document.title =
      "AI Property Hub | NGENZI REALESTATE - Real Estate Market Analysis";
  }, []);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
      setLoadingStage("");

      if (searchPerformed && contentRef.current) {
        setTimeout(() => {
          contentRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
    return () => clearInterval(interval);
  }, [isLoading, searchPerformed]);

  const handleSearch = async (searchParams) => {
    setIsLoading(true);
    setSearchError("");
    setSearchPerformed(true);
    setLoadingTime(0);

    try {
      setLoadingStage("properties");
      const propertyResponse = await searchProperties(searchParams);
      console.log("Property Response:", propertyResponse);
      setProperties(propertyResponse.properties || []);
      setPropertyAnalysis(propertyResponse.analysis || "");

      setLoadingStage("locations");
      const locationResponse = await getLocationTrends(searchParams.city);
      console.log("Location Response:", locationResponse);
      setLocations(locationResponse.locations || []);
      setLocationAnalysis(locationResponse.analysis || "");
    } catch (error) {
      console.error("Error during search:", error);
      setSearchError("Failed to fetch property data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoadingIndicator = () => {
    const getLoadingMessage = () => {
      if (loadingTime < 5) {
        return "Extracting property data from various sources...";
      } else if (loadingTime < 15) {
        return "Loading AI model for comprehensive analysis...";
      } else if (loadingTime < 30) {
        return "AI is analyzing property details and market conditions...";
      } else {
        return "Finalizing results and generating insights for you...";
      }
    };

    const getProgressWidth = () => {
      const progress = Math.min(95, (loadingTime / 45) * 100);
      return `${progress}%`;
    };

    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="relative mb-8 sm:mb-12 pt-12 sm:pt-16">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-haven-800 flex items-center justify-center relative shadow-haven">
            {loadingStage === "properties" ? (
              <Building className="w-10 h-10 sm:w-12 sm:h-12 text-cream-100 animate-pulse" />
            ) : (
              <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-cream-100 animate-pulse" />
            )}
          </div>

          <div className="absolute bottom-0 top-10 -right-4 sm:-right-6 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-haven-500 opacity-20 pulse-animation"></div>

          <div className="absolute top-12 sm:top-16 left-1/2 w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-accent-300 shadow-md orbit-animation"></div>
          <div className="absolute top-1/2 right-0 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-haven-300 orbit-animation-reverse"></div>
          <div className="absolute bottom-0 left-1/2 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-accent-400 orbit-animation-slow"></div>
        </div>

        <style jsx global>{`
          @keyframes orbit {
            0% {
              transform: rotate(0deg) translateX(35px) rotate(0deg);
            }
            100% {
              transform: rotate(360deg) translateX(35px) rotate(-360deg);
            }
          }

          @keyframes orbit-reverse {
            0% {
              transform: rotate(0deg) translateX(40px) rotate(0deg);
            }
            100% {
              transform: rotate(-360deg) translateX(40px) rotate(-360deg);
            }
          }

          @keyframes orbit-slow {
            0% {
              transform: rotate(180deg) translateX(40px) rotate(-180deg);
            }
            100% {
              transform: rotate(-180deg) translateX(40px) rotate(180deg);
            }
          }

          @keyframes pulse {
            0% {
              transform: scale(0.8);
              opacity: 0.3;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.2;
            }
            100% {
              transform: scale(0.8);
              opacity: 0.3;
            }
          }

          .orbit-animation {
            transform: translateX(-50%);
            animation: orbit 3s linear infinite;
          }

          .orbit-animation-reverse {
            transform: translateX(50%);
            animation: orbit-reverse 4s linear infinite;
          }

          .orbit-animation-slow {
            transform: translateX(-50%) translateY(50%);
            animation: orbit-slow 5s linear infinite;
          }

          .pulse-animation {
            animation: pulse 2s ease-in-out infinite;
          }

          @media (max-width: 640px) {
            @keyframes orbit {
              0% {
                transform: rotate(0deg) translateX(25px) rotate(0deg);
              }
              100% {
                transform: rotate(360deg) translateX(25px) rotate(-360deg);
              }
            }
            @keyframes orbit-reverse {
              0% {
                transform: rotate(0deg) translateX(30px) rotate(0deg);
              }
              100% {
                transform: rotate(-360deg) translateX(30px) rotate(-360deg);
              }
            }
            @keyframes orbit-slow {
              0% {
                transform: rotate(180deg) translateX(30px) rotate(-180deg);
              }
              100% {
                transform: rotate(-180deg) translateX(30px) rotate(180deg);
              }
            }
          }
        `}</style>

        <div className="text-center mb-6 max-w-lg px-4">
          <h3 className="font-display text-xl sm:text-2xl text-haven-900 mb-3">
            {loadingStage === "properties"
              ? "Finding Ideal Properties"
              : "Analyzing Market Trends"}
          </h3>
          <p className="text-haven-700/80 text-base sm:text-lg">
            {getLoadingMessage()}
          </p>
        </div>

        <div className="w-full max-w-xs sm:max-w-md h-2 sm:h-2.5 bg-cream-300 rounded-full overflow-hidden mb-6 shadow-inner px-4 sm:px-0">
          <div
            className="h-full bg-haven-700 transition-all duration-300 rounded-full"
            style={{ width: getProgressWidth() }}
          ></div>
        </div>

        <div className="bg-cream-100 border border-cream-400 p-4 sm:p-5 rounded-haven max-w-xs sm:max-w-md shadow-soft mx-4 sm:mx-0">
          <div className="flex items-center mb-3">
            <div className="mr-3">
              {loadingTime < 15 ? (
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-haven-700" />
              ) : (
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-haven-700" />
              )}
            </div>
            <h4 className="font-medium text-haven-900 text-sm sm:text-base">
              AI Processing
            </h4>
          </div>

          <p className="text-haven-700 text-xs sm:text-sm">
            {loadingTime < 20
              ? "Our AI is searching for properties that match your exact requirements and analyzing local market data."
              : "We're using advanced algorithms to evaluate property quality, value for money, and investment potential."}
          </p>

          {loadingTime > 15 && (
            <div className="mt-3 pt-3 border-t border-cream-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-haven-600 font-medium">
                  Deep analysis takes time for quality insights
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-cream-200 pb-8 sm:pb-12 transition-colors duration-200">
      <AiHubSEO />
      <StructuredData type="aiHub" />

      <PageHero
        eyebrow="AI-Powered Insights"
        title="AI Property Hub"
        subtitle="Discover your perfect property with AI-powered insights and market analysis"
        compact
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20 mb-8 sm:mb-12">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {searchError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-haven mb-6 sm:mb-8 max-w-4xl mx-auto border border-red-100 shadow-sm">
            <div className="flex items-center">
              <p className="text-sm sm:text-base">{searchError}</p>
            </div>
          </div>
        )}

        {isLoading && renderLoadingIndicator()}

        <div ref={contentRef}>
          {!isLoading && searchPerformed && (
            <div className="space-y-8 sm:space-y-12">
              <div className="bg-cream-50 rounded-haven shadow-soft border border-cream-400 p-4 sm:p-6 md:p-8">
                <p className="section-eyebrow mb-2">Results</p>
                <h2 className="font-display text-xl sm:text-2xl text-haven-900 mb-4 sm:mb-6 flex items-center">
                  <Building className="mr-2 text-haven-700 flex-shrink-0" />
                  <span className="break-words">Property Results</span>
                </h2>

                {properties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {properties.slice(0, 6).map((property, index) => (
                      <PropertyCard key={index} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-accent-50 p-4 rounded-haven border border-accent-200">
                    <p className="text-sm sm:text-base text-haven-800">
                      No properties found matching your criteria. Try adjusting
                      your search parameters.
                    </p>
                  </div>
                )}

                {propertyAnalysis && (
                  <div className="mt-6 sm:mt-8">
                    <AnalysisDisplay analysis={propertyAnalysis} />
                  </div>
                )}
              </div>

              <div className="bg-cream-50 rounded-haven shadow-soft border border-cream-400 p-4 sm:p-6 md:p-8">
                <p className="section-eyebrow mb-2">Market Data</p>
                <h2 className="font-display text-xl sm:text-2xl text-haven-900 mb-4 sm:mb-6 flex items-center">
                  <TrendingUp className="mr-2 text-haven-700 flex-shrink-0" />
                  <span className="break-words">Location Insights</span>
                </h2>
                <LocationTrends locations={locations} />

                {locationAnalysis && (
                  <div className="mt-6 sm:mt-8">
                    <AnalysisDisplay analysis={locationAnalysis} />
                  </div>
                )}
              </div>
            </div>
          )}

          {!isLoading && !searchPerformed ? (
            <div className="bg-cream-50 p-5 sm:p-8 rounded-haven shadow-soft border border-cream-400 max-w-4xl mx-auto text-center">
              <div className="mb-5 sm:mb-6">
                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-haven-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-haven-700" />
                </div>
                <p className="section-eyebrow mb-3">Get Started</p>
                <h2 className="font-display text-xl sm:text-2xl text-haven-900 mb-2">
                  Welcome to AI Property Hub
                </h2>
                <p className="text-sm sm:text-base text-haven-700/80">
                  Our advanced AI analyzes real estate data to help you make
                  better property decisions
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
                <FeatureCard
                  icon={<Building className="w-5 h-5 sm:w-6 sm:h-6" />}
                  title="Property Analysis"
                  description="Discover properties matching your requirements with detailed AI insights"
                />
                <FeatureCard
                  icon={<MapPin className="w-5 h-5 sm:w-6 sm:h-6" />}
                  title="Location Trends"
                  description="Evaluate neighborhood growth, rental yields, and price appreciation"
                />
                <FeatureCard
                  icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
                  title="Investment Insights"
                  description="Get expert recommendations on property investment potential"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-cream-100 p-4 sm:p-5 rounded-haven border border-cream-400">
    <div className="text-haven-700 mb-2 sm:mb-3">{icon}</div>
    <h3 className="font-semibold text-haven-900 mb-1.5 sm:mb-2 text-sm sm:text-base">
      {title}
    </h3>
    <p className="text-haven-700/75 text-xs sm:text-sm">{description}</p>
  </div>
);

FeatureCard.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default AIPropertyHub;
