import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { SITE_CONFIG } from '../../constants/siteConfig';

const Footer: React.FC = () => {
  return (
    <footer className="text-rich-brown font-serif border-t border-mocha/30  font-light bg-subtle-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8 w-full max-w-6xl text-center">
            
            {/* Company Info */}
            <div>
              <h3 className="text-lg sm:text-xl font-serif italic font-semibold mb-3">
                {SITE_CONFIG.name}
              </h3>
              <p className="text-xs sm:text-sm font-serif font-light italic mb-4">
                Celebrating handmade beauty and tradition through every piece.
              </p>
              <div className="flex justify-center space-x-3">
                <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-[#1877F2] hover:text-[#145DBF] transition-all duration-200 ease-in-out" />
                </a>
                <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-[#E4405F] hover:text-[#C13584] transition-all duration-200 ease-in-out" />
                </a>
                <a href={SITE_CONFIG.social.youtube} target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF0000] hover:text-[#CC0000] transition-all duration-200 ease-in-out" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm sm:text-base font-serif italic font-semibold mb-1">
                Quick Links
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm font-serif">
                {/* <li>
                  <Link to="/about" className="hover:text-mocha font-light italic transition-all duration-200 ease-in-out">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-mocha font-light italic transition-all duration-200 ease-in-out">
                    Contact Us
                  </Link>
                </li> */}
                <li>
                  <Link to="/stores" className="hover:text-mocha font-light italic transition-all duration-200 ease-in-out">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            {/* <div>
              <h4 className="text-sm sm:text-base font-serif italic font-semibold mb-3">
                Contact Info
              </h4>
              <div className="space-y-2 font-serif font-light italic text-xs sm:text-sm">
                <p>📞 {SITE_CONFIG.supportPhone}</p>
                <p>✉️ {SITE_CONFIG.supportEmail}</p>
                <p>📍 {SITE_CONFIG.address}</p>
                <p>🕒 {SITE_CONFIG.workingHours}</p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-mocha/30 mt-8 pt-5 flex flex-col sm:flex-row justify-between items-center text-xs space-y-4 sm:space-y-0 font-serif">
          <p className="text-rich-brown/80 text-center sm:text-left italic">© 2024 {SITE_CONFIG.name}. All rights reserved.</p>
          <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
            <Link to="/privacy" className="hover:text-[#aa732f] font-semibold transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#aa732f] font-semibold transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/sitemap" className="hover:text-[#aa732f] font-semibold transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
