import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import NeedHelpAppointmentStyles from '@aph/mobile-doctors/src/components/Appointments/NeedHelpAppointment.styles';

const styles = NeedHelpAppointmentStyles;

export interface NeedHelpAppointmentProps extends NavigationScreenProps {}

export const NeedHelpAppointment: React.FC<NeedHelpAppointmentProps> = (props) => {
  const showHeaderView = () => {
    return (
      <Header
        containerStyle={{ height: 50 }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.goBack(),
          },
        ]}
        headerText={strings.need_help.need_help_q}
      />
    );
  };
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {showHeaderView()}
      <View style={styles.fullview}>
        <View style={styles.mainview}>
          <Text style={styles.descriptionview}>{strings.need_help.dont_worry_we_are_here}</Text>
        </View>
        <View style={styles.freenum}>
          <Text style={styles.descriptionview}>
            {strings.common.call}
            <Text style={styles.call}> {strings.common.toll_free_num} </Text>
            {strings.need_help.reach_an_expert}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
