import { SITE_CONFIG } from "../constants/siteConfig";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col py-20 bg-theme-background font-serif">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-xs sm:max-w-sm lg:max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-serif italic font-semibold text-rich-brown text-center mb-8 sm:mb-10">
            Privacy Policy
          </h2>

          <div className="space-y-6 text-sm sm:text-base text-rich-brown font-serif italic leading-relaxed">
            <p>
              At {SITE_CONFIG.name}, your privacy is of utmost importance. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our website.
            </p>
            <p>
              <strong className="font-semibold">Information We Collect:</strong> We may collect personal details such as your name, email, phone number, and address when you register or place an order.
            </p>
            <p>
              <strong className="font-semibold">Usage of Information:</strong> Your information helps us personalize your experience, process transactions, improve customer service, and send occasional promotional emails.
            </p>
            <p>
              <strong className="font-semibold">Cookies:</strong> We use cookies to enhance your browsing experience. You can choose to disable cookies in your browser settings.
            </p>
            <p>
              <strong className="font-semibold">Third-Party Disclosure:</strong> We do not sell, trade, or transfer your information to outside parties except to trusted partners who assist in operating our site.
            </p>
            <p>
              <strong className="font-semibold">Security:</strong> We implement a variety of security measures to maintain the safety of your personal data.
            </p>
            <p>
              By using our site, you consent to our privacy policy. For any questions, please contact us at support@youremail.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
