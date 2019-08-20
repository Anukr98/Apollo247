import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  mainview: {
    marginTop: 16,
    marginBottom: 20,
    marginLeft: 16,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
    marginRight: 16,
  },
  fullview: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    margin: 20,
  },
});
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
        headerText="NEED HELP?"
      />
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      {showHeaderView()}
      <View style={styles.fullview}>
        <View style={styles.mainview}>
          <Text style={styles.descriptionview}>Don’t worry. We are here for you :)</Text>
        </View>
        <View style={{ marginLeft: 16, marginBottom: 32 }}>
          <Text style={styles.descriptionview}>
            Call
            <Text style={{ color: '#fc9916', ...theme.fonts.IBMPlexSansSemiBold(18) }}>
              {' '}
              1800 - 3455 - 3455{' '}
            </Text>
            to reach an expert from our team who will resolve your issue.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
