import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useContext, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { AuthContext } from '../AuthProvider';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    margin: 20,
    padding: 16,
    paddingTop: 5,
  },
});

export interface SelectDeliveryAddressProps extends NavigationScreenProps {}

export const SelectDeliveryAddress: React.FC<SelectDeliveryAddressProps> = (props) => {
  const addressList = useContext(AuthContext).addresses;
  const selectedAddressId = useContext(AuthContext).selectedAddressId;
  const setSelectedAddressId = useContext(AuthContext).setSelectedAddressId;
  const [selectedId, setselectedId] = useState<string>(selectedAddressId);
  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="DONE"
          style={{ flex: 1, marginHorizontal: 60 }}
          onPress={() => {
            setSelectedAddressId && setSelectedAddressId(selectedId);
            props.navigation.pop();
          }}
        />
      </StickyBottomComponent>
    );
  };

  const renderRadioButtonList = () => {
    return addressList.map((address, i) => (
      <RadioSelectionItem
        title={`${address.addressLine1}, ${address.addressLine2}\n${address.landmark}\n${address.city}, ${address.state} - ${address.zipcode}`}
        isSelected={selectedId === address.id}
        onPress={() => setselectedId(address.id)}
        key={i}
        containerStyle={{
          paddingTop: 15,
        }}
        hideSeparator={i + 1 === addressList.length}
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
      <ScrollView bounces={false}>
        {renderAddresses()}
        <View style={{ height: 80 }} />
      </ScrollView>
      {renderBottomButtons()}
    </SafeAreaView>
  );
};
