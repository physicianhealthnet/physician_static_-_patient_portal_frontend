import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({ title, description, keywords, type = "website", url = "", schema }) => {
  const fullUrl = `https://physicianhealthnet.com${url}`;
  const defaultKeywords = "health, healthcare, doctor, patient, diseases, treatment, health net, physician, physician health net, physicianhealthnet, PHN, phn, Phn, online consultation, medical records, clinics, hospital, specialist";
  const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={finalKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="https://physicianhealthnet.com/logo.png" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content="https://physicianhealthnet.com/logo.png" />
      
      <link rel="canonical" href={fullUrl} />

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
