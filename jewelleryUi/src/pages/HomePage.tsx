import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Category, Product } from '../types';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG, staticImageBaseUrl } from '../constants/siteConfig';
import Neckless from '../assets/Neckless.jpg';
import Header from '../components/common/Header';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const letter = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HomePage: React.FC = () => {
  const [, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('heroAnimated');
    if (!alreadyShown) {
      setHasAnimated(true);
      sessionStorage.setItem('heroAnimated', 'true');
    }
  }, []);

  useEffect(() => {
    loadData();
    fetchProducts();
  }, []);

  const loadData = async () => {
    try {
      const categoriesRes = await apiService.getCategories();
      setCategories(categoriesRes || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiService.getProducts();
      const latestProducts = (response || []).filter(product => product.isLatest === true);
      setProducts(latestProducts.slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLetters = (text: string) =>
    text.split('').map((char, index) => (
      <motion.span key={index} variants={letter}>
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ));

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <SEOHead
        title={`${SITE_CONFIG.name} - ${SITE_CONFIG.description} | Necklaces, Earrings, Bangles`}
        description={`Discover exquisite handcrafted pure silver jewelry at ${SITE_CONFIG.name}. Shop necklaces, earrings, bangles, anklets and more. Free shipping within India.`}
        keywords={`silver jewelry, handcrafted jewelry, necklaces, earrings, bangles, anklets, rings, Indian jewelry, ${SITE_CONFIG.name}, pure silver, 925 silver`}
      />
      <div className="text-sand overflow-hidden bg-theme-background">
        <Header />

        {/* Hero Section */}
        <section className="min-h-screen relative flex items-center justify-center overflow-hidden font-serif bg-theme-background">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-screen">
            <div className="relative overflow-hidden">
              <img
                src="https://images.pexels.com/photos/6624862/pexels-photo-6624862.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Hero Left"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-rich-brown/30"></div>
            </div>
            <div className="relative overflow-hidden hidden lg:block">
              <img
                src={Neckless}
                alt="Hero Right"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 sm:px-6 lg:px-8 z-10 max-w-4xl mx-auto">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-ephesis italic font-light text-sand mb-4 sm:mb-6"
                variants={container}
                initial="hidden"
                animate="visible"
              >
                {renderLetters(SITE_CONFIG.logoName)}
              </motion.h1>

              <motion.div
                className="text-sm sm:text-base md:text-lg lg:text-xl font-serif font-light italic tracking-wide text-soft-gold mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: hasAnimated ? 1.5 : 0, duration: 1 }}
              >
                {/* Catalog Section */}
                <div className="relative z-10 w-full max-w-3xl px-4 sm:px-6 pb-6 sm:pb-8 md:pb-0 text-center lg:text-left">
                  <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                    <p className="text-sm sm:text-base text-center md:text-lg font-light leading-relaxed text-white">
                      {SITE_CONFIG.name} isn’t just jewelry — it’s a love affair with silver.
                    </p>
                    <p className="text-sm sm:text-base text-center md:text-lg font-light leading-relaxed text-white">
                      Handcrafted with 92.5% pure silver, every piece is a timeless stunner.
                    </p>
                    <p className="text-sm sm:text-base text-center md:text-lg font-light leading-relaxed text-white">
                      From classic charm to modern sparkle, we craft stories you’ll want to wear.
                    </p>
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        </section>

        {/* Intro Section */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 text-center bg-theme-background">
          {/* Centered container with max-width */}
          <div className="w-full max-w-5xl mx-auto">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold leading-relaxed text-burntumber italic mb-4 sm:mb-6">
              {SITE_CONFIG.tagline}
            </p>
            <Link
              to="/products"
              className="inline-block font-serif font-bold italic mt-6 sm:mt-8 md:mt-10 text-sm sm:text-base text-burntumber tracking-widest border-b border-soft-gold pb-1 hover:border-rose-sand transition-all duration-200 ease-in-out"
              title="Explore our jewelry collection"
            >
              EXPLORE COLLECTION →
            </Link>
          </div>
        </section>

        {/* Product Cards Section */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-theme-background">
          {/* Centered container with max-width */}
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 md:mb-16 font-serif italic">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-burntumber mb-6 sm:mb-8 tracking-wide">
                Latest Products
              </h2>
            </div>

            {/* Optimized Product Grid - Limited to 3 columns on large screens */}
            <div className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto"
              >
                {products.map((product) => (
                  <Link
                    to={`/product/${product.slug}`}
                    key={product.id}
                    className="group block w-full"
                  >
                    {/* Product Image Container */}
                    <div className="relative w-full aspect-[3/4] border border-[#d4b896] rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
                      <img
                        src={`${staticImageBaseUrl}/${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                      />
                      {/* Badge */}
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <span className="bg-[#D4B896] text-[#1C1A17] text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-medium">
                          PreOrder
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="text-center mt-3 sm:mt-4 px-1">
                      <h3 className="text-xs sm:text-sm md:text-base lg:text-lg text-[#aa732f] font-medium leading-tight mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                        {product.name}
                      </h3>
                      <p className="text-sm sm:text-base lg:text-lg text-[#aa732f] font-semibold">
                        ₹{product.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="text-center mt-8 sm:mt-12 md:mt-16">
              <Link
                to="/products"
                className="inline-block bg-champagne text-coal px-8 sm:px-10 md:px-12 py-3 sm:py-4 text-sm sm:text-base tracking-widest hover:bg-sand transition-colors rounded-lg"
                title="View all products"
              >
                VIEW ALL PRODUCTS
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;