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
  ogtitle?: string;
  ogdescription?: string;
  ogurl?: string;
  ogimage?: string;
  ogsite_name?: string;
}

export const MetaTagsComp: React.FC<MetaTagProps> = (props) => {
  const { title, description, canonicalLink, src, keywords, robotsMeta, deepLink, ogtitle, ogdescription, ogurl, ogimage, ogsite_name } = props;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {robotsMeta && <meta name="robots" content={robotsMeta} />}
      
      {ogtitle && <meta property="og:title" content={ogtitle}/>}
      {ogdescription && <meta property="og:description" content={ogdescription}/>}
      {ogurl && <meta property="og:url" content={ogurl}/>}
      {ogimage && <meta property="og:image" content={ogimage}/>}
      {ogsite_name && <meta property="og:site_name" content={ogsite_name}/>}

      <link rel="canonical" href={canonicalLink} />
      {deepLink && <link rel="alternate" href={`android-app://com.apollopatient/${deepLink}`} />}
      {src && <script src={src} type="text/javascript" />}
    </Helmet>
  );
};
