import { Link } from "react-router-dom";
import { SITE_CONFIG } from "../constants/siteConfig";
import Footer from "../components/common/Footer";

const SitemapPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-subtle-beige font-serif">
      <div className="flex-grow flex items-center mt-20 sm:mt-24 lg:mt-32 justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xs mt-20 sm:max-w-sm lg:max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-serif italic font-semibold text-rich-brown text-center mb-8 sm:mb-10">
            Sitemap
          </h2>

          <ul className="space-y-4 text-sm sm:text-base text-rich-brown font-serif italic leading-relaxed pl-4 list-disc">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/products" className="hover:underline">Jewelry Collection</Link></li>
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:underline">Terms & Conditions</Link></li>
            <li><Link to="/sitemap" className="hover:underline">Sitemap</Link></li>
          </ul>
        </div>
      </div>

      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 text-center mt-[120px] sm:mt-[120px] lg:mt-[120px] bg-subtle-beige">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif italic font-semibold text-rich-brown mb-4 sm:mb-6">
            Explore {SITE_CONFIG.shortName}
          </h2>
          <p className="text-base sm:text-lg font-serif font-light italic text-rich-brown mb-4 sm:mb-6">
            Navigate our curated collection and learn more about our brand.
          </p>
          <p className="text-xs sm:text-sm font-serif font-semibold italic text-mocha max-w-lg mx-auto leading-relaxed px-4">
            We’ve designed our site to make it easy for you to find what you're looking for — from products to policies.
          </p>
        </div>
      </section>

      <footer className="border-t border-mocha/30 text-center text-xs text-rich-brown py-4 sm:py-6 px-4 bg-subtle-beige font-serif">
        <Footer />
      </footer>
    </div>
  );
};

export default SitemapPage;
