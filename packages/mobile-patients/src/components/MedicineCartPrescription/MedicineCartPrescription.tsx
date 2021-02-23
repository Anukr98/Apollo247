import { PrescriptionOptions } from '@aph/mobile-patients/src/components/MedicineCartPrescription';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { PrescriptionType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';

export interface Props extends NavigationScreenProps {}

export const MedicineCartPrescription: React.FC<Props> = ({ navigation }) => {
  const {
    cartItems,
    prescriptionType,
    setPrescriptionType,
    physicalPrescriptions,
    ePrescriptions,
    setPhysicalPrescriptions,
    setEPrescriptions,
  } = useShoppingCart();

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainer}
        leftIcon={'backArrow'}
        title={'UPLOAD PRESCRIPTION'}
        onPressLeftIcon={() => navigation.goBack()}
      />
    );
  };

  const renderItemsNeedPrescription = () => {
    const reqItems = cartItems.filter(({ prescriptionRequired }) => prescriptionRequired);
    const count = reqItems.length;
    const heading = `${count} ITEM${count > 1 ? 'S' : ''} IN CART NEED PRESCRIPTION`;
    const items = reqItems.map(({ name }) => (
      <View style={styles.itemContainer}>
        <View style={styles.point} />
        <Text style={styles.item}>{name}</Text>
      </View>
    ));

    return (
      <View style={styles.itemPrescriptionContainer}>
        <Text style={styles.header}>{heading}</Text>
        <Divider style={styles.divider} />
        {items}
      </View>
    );
  };

  const renderOptions = () => {
    return (
      <View style={[styles.prescriptionOptions]}>
        <PrescriptionOptions
          selectedOption={prescriptionType || PrescriptionType.UPLOADED}
          onSelectOption={(option, ePres, physPres) => {
            setPrescriptionType(option);
            if (option === PrescriptionType.UPLOADED) {
              setEPrescriptions?.(ePres || []);
              setPhysicalPrescriptions?.(physPres || []);
            }
          }}
        />
      </View>
    );
  };

  const renderContinueButton = () => {
    const isDisabled = prescriptionType
      ? prescriptionType === PrescriptionType.UPLOADED &&
        physicalPrescriptions.length === 0 &&
        ePrescriptions.length === 0
      : true;
    return (
      <View style={styles.buttonView}>
        <Button
          onPress={() => navigation.navigate(AppRoutes.CartSummary)}
          title={'CONTINUE WITH PRESCRIPTION'}
          disabled={isDisabled}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      <ScrollView>
        {renderItemsNeedPrescription()}
        {renderOptions()}
      </ScrollView>
      {renderContinueButton()}
    </SafeAreaView>
  );
};

const { text, card, container } = theme.viewStyles;
const styles = StyleSheet.create({
  headerContainer: {
    ...card(0, 0, 0, '#fff', 6),
    borderBottomWidth: 0,
    zIndex: 2,
  },
  itemPrescriptionContainer: {
    ...card(20, 0, 0, '#fff', 5),
    paddingBottom: 10,
    zIndex: 1,
  },
  prescriptionOptions: {
    ...card(0, 0, 0, '#fff', 4),
  },
  header: {
    ...text('B', 13, '#01475B'),
  },
  divider: {
    marginVertical: 4,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  point: {
    height: 4,
    width: 4,
    borderRadius: 2,
    backgroundColor: '#01475B',
  },
  item: {
    ...text('R', 12, '#02475B'),
    paddingLeft: 8,
  },
  buttonView: {
    ...card(0, 0, 0),
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
});
