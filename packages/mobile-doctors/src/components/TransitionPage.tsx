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

const styles = StyleSheet.create({
  buttonStyle: {
    marginBottom: 32,
    position: 'absolute',
    alignSelf: 'center',
    bottom: 0,
    borderRadius: 10,
    width: 240,
    backgroundColor: '#fc9916',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.BUTTON_TEXT,
  },
});

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
