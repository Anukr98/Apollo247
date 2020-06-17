import { Helmet } from 'react-helmet';
import React from 'react';
interface MetaTagProps {
  title: string;
  desciption: string;
  canonicalLink: string;
}

export const MetaTagsComp: React.FC<MetaTagProps> = (props) => {
  const { title, desciption, canonicalLink } = props;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desciption} />
      <link rel="canonical" href={canonicalLink} />
    </Helmet>
  );
};
