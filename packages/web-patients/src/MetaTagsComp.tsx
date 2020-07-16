import { Helmet } from 'react-helmet';
import React from 'react';
interface MetaTagProps {
  title: string;
  description: string;
  canonicalLink: string;
  src?: string;
  keywords?: string;
}

export const MetaTagsComp: React.FC<MetaTagProps> = (props) => {
  const { title, description, canonicalLink, src, keywords } = props;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalLink} />
      <script src={src} type="text/javascript" />
    </Helmet>
  );
};
