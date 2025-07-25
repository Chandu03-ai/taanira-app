import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../../constants/siteConfig';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  productData?: {
    name: string;
    price: number;
    currency: string;
    availability: string;
    brand: string;
    category: string;
  };
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = `${SITE_CONFIG.name} - ${SITE_CONFIG.description}`,
  description = `Discover exquisite handcrafted pure silver jewelry at ${SITE_CONFIG.name}. Shop necklaces, earrings, bangles, anklets and more. Free shipping within India.`,
  keywords = `silver jewelry, handcrafted jewelry, necklaces, earrings, bangles, anklets, rings, Indian jewelry, ${SITE_CONFIG.name}`,
  image = '/images/ji-logo.png',
  url = window.location.href,
  type = 'website',
  productData
}) => {
  const structuredData = productData ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productData.name,
    "image": image,
    "description": description,
    "brand": {
      "@type": "Brand",
      "name": productData.brand
    },
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": productData.currency,
      "price": productData.price,
      "availability": `https://schema.org/${productData.availability}`,
      "seller": {
        "@type": "Organization",
        "name": SITE_CONFIG.name
      }
    },
    "category": productData.category
  } : {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_CONFIG.name,
    "url": `https://${SITE_CONFIG.domain}`,
    "logo": image,
    "description": description
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEOHead;