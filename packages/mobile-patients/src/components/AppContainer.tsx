import { AuthProvider } from '@aph/mobile-patients/src/components/AuthProvider';
import { NavigatorContainer } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsProvider } from '@aph/mobile-patients/src/components/UIElementsProvider';
import React from 'react';
import { Text, TextInput } from 'react-native';
import { DiagnosticsCartProvider } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppCommonDataProvider } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

// export const AppContainer: React.FC = () => {

//   return (
//     <AuthProvider>
//       <ShoppingCartProvider>
//         <UIElementsProvider>
//           <NavigatorContainer />
//         </UIElementsProvider>
//       </ShoppingCartProvider>
//     </AuthProvider>
//   );
// };

interface AppContainerTypes {}

export class AppContainer extends React.Component<AppContainerTypes> {
  constructor(props: AppContainerTypes) {
    super(props);
    (Text as any).defaultProps = (Text as any).defaultProps || {};
    (Text as any).defaultProps.allowFontScaling = false;
    (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
    (TextInput as any).defaultProps.allowFontScaling = false;
  }

  render() {
    return (
      <AuthProvider>
        <AppCommonDataProvider>
          <ShoppingCartProvider>
            <DiagnosticsCartProvider>
              <UIElementsProvider>
                <NavigatorContainer />
              </UIElementsProvider>
            </DiagnosticsCartProvider>
          </ShoppingCartProvider>
        </AppCommonDataProvider>
      </AuthProvider>
    );
  }
}
