import { OtpCard } from '@aph/mobile-doctors/src/components/ui/OtpCard';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  container: {
    //...theme.viewStyles.container,
    flex: 1,
    width: '100%',
    height: 600,
    backgroundColor: '#f0f4f5',
  },

  statusBarBg: {
    width: '100%',
    opacity: 0.05,
    backgroundColor: '#000000',
    ...ifIphoneX(
      {
        height: 44,
      },
      {
        height: 24,
      }
    ),
  },
  needdataview: {
    marginTop: 0,
    height: 300,
  },
});

export interface NeedHelpDonePageProps extends NavigationScreenProps {}

export const NeedHelpDonePage: React.FC<NeedHelpDonePageProps> = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.statusBarBg} />
      <SafeAreaView style={styles.container}>
        <View style={{ height: 56 }} />
        <OtpCard
          isModelCard={true}
          cardContainer={styles.needdataview}
          heading={strings.need_help.done}
          description={strings.need_help.you_will_receive_call}
          onPress={() => props.navigation.pop(2)}
        ></OtpCard>
      </SafeAreaView>
    </View>
  );
};
