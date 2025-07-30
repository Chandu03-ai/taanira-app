import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { SITE_CONFIG } from '../constants/siteConfig';

const NotFoundPage: React.FC = () => {
  const baseFocusClasses = "focus:outline-none focus:ring-0";

  return (
    <>
      <SEOHead
        title={`404 - Page Not Found | ${SITE_CONFIG.name}`}
        description="The page you're looking for doesn't exist. Return to our jewelry collection."
      />
      
      <div className="min-h-screen bg-theme-background text-theme-primary font-serif flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-theme-surface rounded-full mb-6">
              <Search className="h-12 w-12 text-theme-muted" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold italic text-theme-primary mb-4">
            404
          </h1>
          
          <h2 className="text-xl sm:text-2xl font-serif font-semibold italic text-theme-primary mb-4">
            Oops! Page not found.
          </h2>
          
          <p className="text-theme-muted font-serif italic mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to discovering our beautiful jewelry collection.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to="/"
              className={`inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-theme-secondary text-theme-primary rounded-xl font-serif font-semibold italic hover:bg-theme-accent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md ${baseFocusClasses}`}
              title="Return to homepage"
            >
              <Home className="h-5 w-5 mr-2" />
              Go to Home
            </Link>
            
            <div className="text-center">
              <Link
                to="/products"
                className={`text-theme-muted hover:text-theme-primary font-serif italic text-sm underline transition-colors duration-200 ${baseFocusClasses}`}
                title="Browse our jewelry collection"
              >
                Or browse our collection
              </Link>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-theme-surface">
            <p className="text-xs font-serif italic text-theme-muted">
              Need help? Contact us at{' '}
              <a 
                href={`mailto:${SITE_CONFIG.supportEmail}`}
                className="text-theme-primary hover:text-theme-muted transition-colors"
              >
                {SITE_CONFIG.supportEmail}
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;