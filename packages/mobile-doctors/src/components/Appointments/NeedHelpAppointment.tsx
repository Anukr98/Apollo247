import { BackArrow, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, Alert, View, Text, StyleSheet } from 'react-native';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import { TagCard } from '@aph/mobile-doctors/src/components/ui/TagCard';
import { ChatMessageCard } from '@aph/mobile-doctors/src/components/ui/ChatMessageCard';
import { ChipViewCard } from '@aph/mobile-doctors/src/components/ui/ChipViewCard';
const styles = StyleSheet.create({
  mainview: {
    marginTop: 16,
    marginBottom: 20,
    marginLeft: 16,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: '#0087ba',
    lineHeight: 24,
  },
  fullview: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    margin: 20,
  },
});
export interface NeedHelpAppointmentProps {}

export const NeedHelpAppointment: React.FC<NeedHelpAppointmentProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <View style={{ marginBottom: 5 }}>
        <NotificationHeader
          leftIcons={[
            {
              icon: <BackArrow />,
              onPress: () => Alert.alert('click'),
            },
          ]}
          middleText="NEED HELP?"
        />
      </View>
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
            to reach an{'\n'}expert from our team who will resolve{'\n'}your issue.
          </Text>
        </View>
      </View>
      <CollapseCard
        heading="Symptoms"
        children="hi"
        collapse={show}
        onPress={() => setShow(!show)}
      />
      <TagCard label="NEW" />
      <Button
        title="AUDIO CALL"
        buttonIcon={<Up />}
        style={{
          borderRadius: 5,
          width: 240,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        }}
      />
      <ChatMessageCard text="hi" variant="received" />
      <View style={{ flexDirection: 'row' }}>
        <ChipViewCard text="Morning" selected={true} />
        <ChipViewCard text="Noon" selected={true} />
        <ChipViewCard text="Evening" selected={false} />
        <ChipViewCard text="Night" selected={false} />
      </View>
    </SafeAreaView>
  );
};
