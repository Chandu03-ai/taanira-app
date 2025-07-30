import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Category, Product } from '../types';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG, staticImageBaseUrl } from '../constants/siteConfig';
import Footer from '../components/common/Footer';
import Neckless from '../assets/Neckless.jpg';
import Header from '../components/common/Header'; // Make sure this import is correct
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
      const sortedProducts = (response || []).sort((a: Product, b: Product) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return Number(b.id) - Number(a.id);
      });

      setProducts(sortedProducts.slice(0, 4));
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
            <div className="text-center px-4 sm:px-6 z-10 max-w-4xl mx-auto">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic font-light text-sand mb-4 sm:mb-6"
                variants={container}
                initial="hidden"
                animate="visible"
              >
                {renderLetters(SITE_CONFIG.shortName)}
              </motion.h1>
              <motion.p
                className="text-sm sm:text-base md:text-lg lg:text-xl font-serif font-light italic tracking-wide text-soft-gold mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: hasAnimated ? 1.5 : 0, duration: 1 }}
              >
                {/* Catalog Section */}
                <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6 pb-6 sm:pb-8 md:pb-0 text-left">
                  <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
                    <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-white">
                      {SITE_CONFIG.name} is more than jewelry - it's a celebration of craftsmanship.
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-white">
                      Each piece is handcrafted with 92.5% pure silver, ensuring lasting quality and timeless beauty.
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-white">
                      From traditional designs to contemporary styles, our collection celebrates the art of silver jewelry making.
                    </p>
                  </div>
                </div>
              </motion.p>
            </div>
          </div>
        </section>

        {/* Intro Section */}
        <section className="py-6 sm:py-8 md:py-12 px-4 sm:px-6 text-center max-w-4xl mx-auto bg-theme-background">
          <div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-relaxed text-burntumber italic mb-2 sm:mb-3">
              {SITE_CONFIG.tagline}
            </p>
            <Link
              to="/products"
              className="inline-block font-serif font-bold italic mt-8 sm:mt-10 md:mt-12 text-xs sm:text-sm text-burntumber tracking-widest border-b border-soft-gold pb-1 hover:border-rose-sand transition-all duration-200 ease-in-out"
              title="Explore our jewelry collection"
            >
              EXPLORE COLLECTION →
            </Link>
          </div>
        </section>

        {/* Product Cards Section */}
        <section className="py-6 sm:py-8 md:py-16 px-3 sm:px-4 md:px-6 bg-theme-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-10 md:mb-12 font-serif italic">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-burntumber mb-4 sm:mb-6 tracking-wide">
                Latest Products
              </h2>
            </div>

            {/* Optimized Product Grid */}
            <div className="w-full flex justify-center">
              <div className="max-w-7xl w-full px-2 sm:px-4 lg:px-6">

                <div className="
      grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 
      xl:flex xl:flex-wrap xl:justify-center 
      gap-4 xl:gap-6"
                >
                  {products.map((product) => (
                    <Link
                      to={`/product/${product.slug}`}
                      key={product.id}
                      className="group block w-full max-w-[220px] xl:mx-3 xl:mb-6"
                    >
                      {/* Product Image Container */}
                      <div className="relative w-full aspect-[3/4] border border-[#d4b896] rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
                        <img
                          src={`${staticImageBaseUrl}/${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                        />
                        {/* Badge */}
                        <div className="absolute top-2 left-2">
                          <span className="bg-[#D4B896] text-[#1C1A17] text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium">
                            PreOrder
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="text-center mt-2 px-1">
                        <h3 className="text-xs sm:text-sm text-[#aa732f] font-medium leading-tight mb-1 line-clamp-2 min-h-[2rem]">
                          {product.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#aa732f] font-semibold">
                          ₹{product.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>


            <div className="text-center mt-6 sm:mt-8 md:mt-12">
              <Link
                to="/products"
                className="inline-block bg-champagne text-coal px-6 sm:px-8 md:px-12 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm tracking-widest hover:bg-sand transition-colors rounded-sm"
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