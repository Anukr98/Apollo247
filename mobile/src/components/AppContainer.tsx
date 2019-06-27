import { AppNavigatorContainer } from 'app/src/components/AppNavigatorContainer';
import React from 'react';
import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';

addLocaleData(en);

// const enMessages = {
//   welcome: 'Welome! :)',
// };

export const AppContainer: React.FC = () => {
  return (
    // <IntlProvider locale="en" messages={enMessages}>
    <>
      <AppNavigatorContainer />
    </>
    // </IntlProvider>
  );
};
