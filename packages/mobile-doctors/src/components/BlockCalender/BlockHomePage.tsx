import moment from 'moment';
import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, Remove } from '@aph/mobile-doctors/src/components/ui/Icons';
import { colors } from '@aph/mobile-doctors/src/theme/colors';

const styles = StyleSheet.create({});

export interface BlockHomePageProps extends NavigationScreenProps {}

export const BlockHomePage: React.FC<BlockHomePageProps> = (props) => {
  const { doctorDetails } = useAuth();

  const renderHeader = () => {
    return (
      <Header
        containerStyle={{
          height: 50,
          shadowColor: '#808080',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 16,
          backgroundColor: colors.CARD_BG,
        }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.goBack(),
          },
        ]}
        headerText="BLOCK CALENDAR"
        rightIcons={[
          {
            icon: <Remove />,
            onPress: () => {},
          },
        ]}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>{renderHeader()}</SafeAreaView>
  );
};
