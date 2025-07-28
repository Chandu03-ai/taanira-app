import Footer from "../components/common/Footer";
import { SITE_CONFIG } from "../constants/siteConfig";

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-subtle-beige font-serif">
      <div className="flex-grow flex items-center mt-20 sm:mt-24 lg:mt-32 justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xs mt-20 sm:max-w-sm lg:max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-serif italic font-semibold text-rich-brown text-center mb-8 sm:mb-10">
            Terms & Conditions
          </h2>

          <div className="space-y-6 text-sm sm:text-base text-rich-brown font-serif italic leading-relaxed">
            <p>
              Welcome to {SITE_CONFIG.name}. By accessing and using our website, you agree to comply with the following terms and conditions.
            </p>
            <p>
              <strong className="font-semibold">Product Descriptions:</strong> We strive to ensure that our jewelry listings are accurate. However, slight variations in size, color, and materials may occur due to handmade craftsmanship.
            </p>
            <p>
              <strong className="font-semibold">Orders & Payments:</strong> All orders must be paid in full before dispatch. We accept multiple payment methods and ensure your data is securely processed.
            </p>
            <p>
              <strong className="font-semibold">Shipping:</strong> Estimated delivery times are provided but not guaranteed. Delays due to carriers or customs are beyond our control.
            </p>
            <p>
              <strong className="font-semibold">Returns & Exchanges:</strong> Please refer to our Return Policy. Custom or personalized items may not be eligible for return.
            </p>
            <p>
              <strong className="font-semibold">Intellectual Property:</strong> All content, including product photos and designs, are the property of {SITE_CONFIG.name} and may not be reused without permission.
            </p>
            <p>
              <strong className="font-semibold">Changes to Terms:</strong> We reserve the right to update these terms at any time. Continued use of our site implies acceptance of the changes.
            </p>
          </div>
        </div>
      </div>

      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 text-center mt-[120px] sm:mt-[120px] lg:mt-[120px] bg-subtle-beige">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif italic font-semibold text-rich-brown mb-4 sm:mb-6">
            {SITE_CONFIG.shortName}
          </h2>
          <p className="text-base sm:text-lg font-serif font-light italic text-rich-brown mb-4 sm:mb-6">
            Thank you for choosing us for your jewelry needs.
          </p>
          <p className="text-xs sm:text-sm font-serif font-semibold italic text-mocha max-w-lg mx-auto leading-relaxed px-4">
            For questions about these terms, contact our support team. We’re here to help with transparency and trust.
          </p>
        </div>
      </section>

      <footer className="border-t border-mocha/30 text-center text-xs text-rich-brown py-4 sm:py-6 px-4 bg-subtle-beige font-serif">
        <Footer />
      </footer>
    </div>
  );
};

export default TermsPage;
