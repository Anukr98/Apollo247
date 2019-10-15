import { AuthProvider } from '@aph/mobile-patients/src/components/AuthProvider';
import { NavigatorContainer } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ShoppingCartProvider } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UIElementsProvider } from '@aph/mobile-patients/src/components/UIElementsProvider';
import React from 'react';
import { Text, TextInput } from 'react-native';

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
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.allowFontScaling = false;
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
  }

  render() {
    return (
      <AuthProvider>
        <ShoppingCartProvider>
          <UIElementsProvider>
            <NavigatorContainer />
          </UIElementsProvider>
        </ShoppingCartProvider>
      </AuthProvider>
    );
  }
}
