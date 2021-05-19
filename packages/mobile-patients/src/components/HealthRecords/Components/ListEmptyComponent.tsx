import { PhrNoDataComponent } from '@aph/mobile-patients/src/components/HealthRecords/Components/PhrNoDataComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import React from 'react';

const ListEmptyComponent = {
  getEmptyListComponent: (isDataAvailable: boolean, apiError: boolean) => {
    if (!isDataAvailable) {
      return <PhrNoDataComponent />;
    } else if (apiError) {
      <PhrNoDataComponent noDataText={string.common.phr_api_error_text} phrErrorIcon />;
    } else {
      return null;
    }
  },
};

export default ListEmptyComponent;
