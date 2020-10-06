import { Helmet } from 'react-helmet';
import React from 'react';
interface StructuredJSON {
  [name: string]: any;
}
interface StructureSchema {
  structuredJSON: StructuredJSON;
}

export const SchemaMarkup: React.FC<StructureSchema> = (props) => {
  const { structuredJSON } = props;
  return (
    <Helmet>
      <script className="structured-data-list" type="application/ld+json">
        {JSON.stringify(structuredJSON)}
      </script>
    </Helmet>
  );
};
