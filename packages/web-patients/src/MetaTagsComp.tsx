import { Helmet } from 'react-helmet';
import React from 'react';
interface MetaTagProps {
  title: string;
  description: string;
  canonicalLink: string;
  src?: string;
  keywords?: string;
  robotsMeta?: string;
  deepLink?: string;
}

export const MetaTagsComp: React.FC<MetaTagProps> = (props) => {
  const { title, description, canonicalLink, src, keywords, robotsMeta, deepLink } = props;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalLink} />
      {deepLink && <link rel="alternate" href={`android-app://com.apollopatient/${deepLink}`} />}
      {src && <script src={src} type="text/javascript" />}
    </Helmet>
  );
};
