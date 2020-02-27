import { OtpCard } from '@aph/mobile-doctors/src/components/ui/OtpCard';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import NeedHelpDonePageStyles from '@aph/mobile-doctors/src/components/NeedHelpDonePage.styles';

const styles = NeedHelpDonePageStyles;

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
