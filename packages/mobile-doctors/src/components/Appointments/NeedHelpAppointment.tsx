import { BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, Alert, View, Text, StyleSheet } from 'react-native';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
const styles = StyleSheet.create({
  containerStyles: {
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.BUTTON_BG,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.BUTTON_TEXT,
  },
  mainview: {
    marginLeft: 20,
    marginBottom: 20,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: '#003646',
    letterSpacing: 0.05,
  },
  textview: {
    fontFamily: 'IBMPlexSans',
    fontSize: 15,
    color: '#003646',
  },
  buttonview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export interface NeedHelpAppointmentProps {}

export const NeedHelpAppointment: React.FC<NeedHelpAppointmentProps> = (props) => {
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <View style={{ marginBottom: 32 }}>
        <NotificationHeader
          leftIcons={[
            {
              icon: <BackArrow />,
              onPress: () => Alert.alert('click'),
            },
          ]}
          middleText="NEED HELP"
        />
      </View>
      <View style={styles.mainview}>
        <Text style={styles.descriptionview}>We’re here to help!</Text>
      </View>
      <View style={{ marginLeft: 20, marginBottom: 32 }}>
        <Text style={styles.textview}>
          Don’t worry. We’ve got you! {'\n'}Someone from our team will reach out {'\n'}to you
          shortly!
        </Text>
      </View>
      <View style={styles.buttonview}>
        <Button
          style={styles.containerStyles}
          title="CALLME"
          titleTextStyle={styles.titleTextStyle}
          onPress={() => Alert.alert('Call me')}
        />
      </View>
    </SafeAreaView>
  );
};
