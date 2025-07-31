import { Link } from "react-router-dom";

const SitemapPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-theme-background font-serif">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xs sm:max-w-sm lg:max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-serif italic font-semibold text-rich-brown text-center mb-8 sm:mb-10">
            Sitemap
          </h2>

          <ul className="space-y-4 text-sm sm:text-base text-rich-brown font-serif italic leading-relaxed pl-4 list-disc">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/products" className="hover:underline">Jewelry Collection</Link></li>
            <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:underline">Terms & Conditions</Link></li>
            <li><Link to="/sitemap" className="hover:underline">Sitemap</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
