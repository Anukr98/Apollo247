import { BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';

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
          middleText={strings.need_help.need_help_tittle}
        />
      </View>
      <View style={styles.mainview}>
        <Text style={styles.descriptionview}>{strings.need_help.call_requested}</Text>
      </View>
      <View style={{ marginLeft: 20, marginBottom: 32 }}>
        <Text style={styles.textview}>{strings.need_help.you_will_receive_call}</Text>
      </View>
    </SafeAreaView>
  );
};
