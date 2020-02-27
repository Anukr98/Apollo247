import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { ProfileTabHeader } from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader';
import { colors } from '@aph/mobile-doctors/src/theme/colors';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import TransitionPageStyles from '@aph/mobile-doctors/src/components/TransitionPage.styles';

const styles = TransitionPageStyles;

export interface TransitionPageProps extends NavigationScreenProps {}

export const TransitionPage: React.FC<TransitionPageProps> = (props) => {
  const doctorName = props.navigation.state.params && props.navigation.state.params.doctorName;
  const doctorId = props.navigation.state.params && props.navigation.state.params.DoctorId;
  console.log('doctorname', doctorName);
  console.log('doctorId', doctorId);

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <View style={{ backgroundColor: colors.WHITE, flex: 1 }}>
        <Header />
        <ProfileTabHeader
          title={`${strings.account.thanku_dr} ${doctorName.toLowerCase()} :)`}
          description={strings.account.profile_tab_descr}
          activeTabIndex={0}
        />
        <Button
          onPress={() =>
            props.navigation.replace(AppRoutes.TabBar, {
              Firstname: doctorName,
              DoctorId: doctorId,
            })
          }
          title={strings.buttons.get_started}
          titleTextStyle={styles.titleTextStyle}
          style={styles.buttonStyle}
        />
      </View>
    </SafeAreaView>
  );
};
