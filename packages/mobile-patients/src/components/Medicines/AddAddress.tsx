import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginHorizontal: 20,
  },
  labelTextStyle: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  yellowTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: theme.colors.APP_YELLOW,
    padding: 16,
  },
  blueTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  medicineCostStyle: {
    ...theme.fonts.IBMPlexSansBold(11),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
});

export interface AddAddressProps extends NavigationScreenProps {}

export const AddAddress: React.FC<AddAddressProps> = (props) => {
  const [selectedTab, setselectedTab] = useState<string>('');

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'ADD NEW ADDRESS'}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderAddress = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          margin: 20,
          padding: 16,
        }}
      >
        <TextInputComponent />
        <TextInputComponent />
        <TextInputComponent />
        <TextInputComponent />
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        {renderAddress()}
        <StickyBottomComponent defaultBG>
          <Button title={'SAVE & USE'} style={{ flex: 1, marginHorizontal: 40 }} />
        </StickyBottomComponent>
      </SafeAreaView>
    </View>
  );
};
