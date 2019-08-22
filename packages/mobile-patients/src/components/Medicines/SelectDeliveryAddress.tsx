import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    margin: 20,
    padding: 16,
    paddingTop: 5,
  },
});

const addresses = [
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
  'Apollo Pharmacy\nPlot No B / 88, Opposite Andhra Bank\nJubilee Hills',
];

export interface SelectDeliveryAddressProps extends NavigationScreenProps {}

export const SelectDeliveryAddress: React.FC<SelectDeliveryAddressProps> = (props) => {
  const [selectedId, setselectedId] = useState<number>(0);

  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button title="DONE" style={{ flex: 1, marginHorizontal: 60 }} />
      </StickyBottomComponent>
    );
  };

  const renderRadioButtonList = () => {
    return addresses.map((address, i) => (
      <RadioSelectionItem
        title={address}
        isSelected={selectedId === i}
        onPress={() => setselectedId(i)}
        key={i}
        containerStyle={{
          paddingTop: 15,
        }}
        hideSeparator={i + 1 === addresses.length}
      />
    ));
  };

  const renderAddresses = () => {
    return <View style={styles.cardStyle}>{renderRadioButtonList()}</View>;
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header
        leftIcon="backArrow"
        title={'SELECT DELIVERY ADDRESS'}
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
      <ScrollView bounces={false}>{renderAddresses()}</ScrollView>
      {renderBottomButtons()}
    </SafeAreaView>
  );
};
