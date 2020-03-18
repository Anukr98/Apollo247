import NeedHelpDonePageStyles from '@aph/mobile-doctors/src/components/NeedHelpDonePage.styles';
import { OtpCard } from '@aph/mobile-doctors/src/components/ui/OtpCard';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

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
