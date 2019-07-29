import { BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, Alert, View, Text, StyleSheet } from 'react-native';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
const styles = StyleSheet.create({
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
});
export interface CallRequestScreenProps {}

export const CallRequestScreen: React.FC<CallRequestScreenProps> = (props) => {
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
        <Text style={styles.descriptionview}>Call requested</Text>
      </View>
      <View style={{ marginLeft: 20, marginBottom: 32 }}>
        <Text style={styles.textview}>You will receive a call from us shortly.</Text>
      </View>
    </SafeAreaView>
  );
};
