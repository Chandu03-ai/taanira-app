import { SITE_CONFIG } from "../constants/siteConfig";

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-subtle-beige font-serif">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xs sm:max-w-sm lg:max-w-2xl">
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
    </div>
  );
};

export default TermsPage;
