import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

export interface PatientsProps extends NavigationScreenProps {}

export const ChatDoctor: React.FC<PatientsProps> = (props) => {
  const renderMainHeader = () => {
    return (
      <Header
        containerStyle={{ height: 50 }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText="Chat with Dr. Arun Arora "
      />
    );
  };

  return <SafeAreaView style={[theme.viewStyles.container]}>{renderMainHeader()}</SafeAreaView>;
};
