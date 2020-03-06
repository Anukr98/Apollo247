import { BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { Alert, SafeAreaView, Text, View } from 'react-native';
import CallRequestScreenStyles from '@aph/mobile-doctors/src/components/Appointments/CallRequestScreen.styles';

const styles = CallRequestScreenStyles;

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
      <View style={styles.receivecall}>
        <Text style={styles.textview}>{strings.need_help.you_will_receive_call}</Text>
      </View>
    </SafeAreaView>
  );
};
