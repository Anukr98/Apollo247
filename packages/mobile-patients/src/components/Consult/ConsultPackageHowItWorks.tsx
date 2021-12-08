import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  SingleUserPackageIcon,
  HowDoesItWorkIcon,
  Online,
} from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  howDoesItWorkContainer: {
    marginVertical: 16,
    marginHorizontal: 5,
  },
  howDoesItWorkIcon: {
    width: 35,
    height: 40,
  },
  howDoesItWorkTitle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE),
    marginLeft: 16,
  },
  howDoesItWorkSeparator: {
    height: 0.5,
    marginVertical: 10,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.25,
  },
  howDoesItWorkTnCTextItem: {
    ...theme.viewStyles.text('R', 13, theme.colors.SHERPA_BLUE),
    opacity: 0.85,
    marginLeft: 10,
    marginRight: 12,
  },
});

interface ConsultPackageHowItWorksProps {}

export const ConsultPackageHowItWorks: React.FC<ConsultPackageHowItWorksProps> = (props) => {
  const howDoesItWork = AppConfig.Configuration.Consult_Package_TnC || [];

  return (
    <View style={styles.howDoesItWorkContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <HowDoesItWorkIcon style={styles.howDoesItWorkIcon} />
        <Text style={styles.howDoesItWorkTitle}> How does it work ?</Text>
      </View>
      <View style={styles.howDoesItWorkSeparator} />
      {howDoesItWork?.map((tnc: string, index: number) => (
        <View style={{ flexDirection: 'row', marginVertical: 8, alignItems: 'center' }}>
          {index % 2 !== 0 ? (
            <Online style={{ height: 18, width: 18 }} />
          ) : (
            <SingleUserPackageIcon style={{ height: 14, width: 14, opacity: 0.6 }} />
          )}

          <Text style={styles.howDoesItWorkTnCTextItem}>{tnc}</Text>
        </View>
      ))}
    </View>
  );
};
