import React from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaFacebook, FaInstagram } from 'react-icons/fa';
import { SITE_CONFIG } from '../../constants/siteConfig';

const Footer: React.FC = () => {
  return (
    <footer className="text-theme-primary font-serif border-t border-theme-muted/30 font-light bg-theme-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 w-full max-w-4xl text-center md:text-left">
            
            {/* Company Info */}
            <div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-serif italic font-semibold mb-4 sm:mb-6">
                {SITE_CONFIG.name}
              </h3>
              <p className="text-sm sm:text-base font-serif font-light italic mb-6 sm:mb-8 leading-relaxed">
                Celebrating handmade beauty and tradition through every piece.
              </p>
              <div className="flex justify-center md:justify-start space-x-4 sm:space-x-6">
                <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer">
                  <FaFacebook className="h-5 w-5 sm:h-6 sm:w-6 text-[#1877F2] hover:text-[#145DBF] transition-all duration-200 ease-in-out" />
                </a>
                <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer">
                  <FaInstagram className="h-5 w-5 sm:h-6 sm:w-6 text-[#E4405F] hover:text-[#C13584] transition-all duration-200 ease-in-out" />
                </a>
                <a href={SITE_CONFIG.social.youtube} target="_blank" rel="noopener noreferrer">
                  <FaYoutube className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF0000] hover:text-[#CC0000] transition-all duration-200 ease-in-out" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base sm:text-lg lg:text-xl font-serif italic font-semibold mb-4 sm:mb-6">
                Quick Links
              </h4>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base font-serif">
                <li>
                  <Link to="/stores" className="hover:text-theme-muted font-light italic transition-all duration-200 ease-in-out focus:outline-none focus:ring-0">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-theme-muted font-light italic transition-all duration-200 ease-in-out focus:outline-none focus:ring-0">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-theme-muted font-light italic transition-all duration-200 ease-in-out focus:outline-none focus:ring-0">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-theme-muted/30 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm space-y-4 sm:space-y-0 font-serif">
          <p className="text-theme-primary/80 text-center sm:text-left italic">
            © 2024 {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
            <Link to="/privacy" className="hover:text-theme-muted font-semibold transition-colors focus:outline-none focus:ring-0">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-theme-muted font-semibold transition-colors focus:outline-none focus:ring-0">
              Terms & Conditions
            </Link>
            <Link to="/sitemap" className="hover:text-theme-muted font-semibold transition-colors focus:outline-none focus:ring-0">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
