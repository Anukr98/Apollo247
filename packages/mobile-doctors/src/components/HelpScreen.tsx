import { OtpCard } from '@aph/mobile-doctors/src/components/ui/OtpCard';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

import { ifIphoneX } from 'react-native-iphone-x-helper';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: 600,
    backgroundColor: '#f0f4f5',
  },

  statusBarBg: {
    width: '100%',
    opacity: 0.05,
    backgroundColor: '#000000',
    ...ifIphoneX(
      {
        height: 44,
      },
      {
        height: 24,
      }
    ),
  },
  needdataview: {
    marginTop: 0,
  },
  mainview: {
    //marginBottom: 20,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
  },
  headingText: {
    marginTop: 20,
    paddingBottom: 0,
  },
});

export interface HelpScreenProps extends NavigationScreenProps {}

export const HelpScreen: React.FC<HelpScreenProps> = (props) => {
  return (
    <View style={styles.container}>
      <View style={styles.statusBarBg} />
      <SafeAreaView style={styles.container}>
        <View style={{ height: 56 }} />
        <OtpCard
          cardContainer={styles.needdataview}
          heading={strings.login.needhelp}
          onPress={() => props.navigation.pop()}
          headingTextStyle={styles.headingText}
        >
          <View style={styles.mainview}>
            <Text style={styles.descriptionview}>{strings.login.helpText}</Text>
          </View>
          <View style={{ marginBottom: 44, marginTop: 20 }}>
            <Text style={styles.descriptionview}>
              {strings.common.call}
              <Text style={{ color: '#fc9916', ...theme.fonts.IBMPlexSansSemiBold(18) }}>
                {' '}
                {strings.common.toll_free_num}{' '}
              </Text>
              {strings.common.reach_an_expert}
            </Text>
          </View>
        </OtpCard>
      </SafeAreaView>
    </View>
  );
};
