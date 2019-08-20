import { OtpCard } from '@aph/mobile-doctors/src/components/ui/OtpCard';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

import { ifIphoneX } from 'react-native-iphone-x-helper';

const styles = StyleSheet.create({
  container: {
    //...theme.viewStyles.container,
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
    //height: 300,
  },
  mainview: {
    //marginBottom: 20,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
    //marginTop: 20,
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
          heading="need help?"
          onPress={() => props.navigation.pop()}
          headingTextStyle={styles.headingText}
        >
          <View style={styles.mainview}>
            <Text style={styles.descriptionview}>{string.LocalStrings.helpText}</Text>
          </View>
          <View style={{ marginBottom: 44, marginTop: 20 }}>
            <Text style={styles.descriptionview}>
              Call
              <Text style={{ color: '#fc9916', ...theme.fonts.IBMPlexSansSemiBold(18) }}>
                {' '}
                1800 - 3455 - 3455{' '}
              </Text>
              to reach anexpert from our team who will resolveyour issue.
            </Text>
          </View>
        </OtpCard>
      </SafeAreaView>
    </View>
  );
};
