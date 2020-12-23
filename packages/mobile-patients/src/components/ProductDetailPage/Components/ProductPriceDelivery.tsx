import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getDiscountPercentage } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Location, ExpressDeliveryLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

export interface ProductPriceDeliveryProps {
  price: number;
  specialPrice: number | null;
  isExpress: boolean;
  isInStock: boolean;
  manufacturer?: string;
  showPincodePopup: () => void;
}

export const ProductPriceDelivery: React.FC<ProductPriceDeliveryProps> = (props) => {
  const { price, specialPrice, isExpress, isInStock, manufacturer, showPincodePopup } = props;
  const { currentPatient } = useAllCurrentPatients();
  const { addresses, deliveryAddressId } = useShoppingCart();
  const { pharmacyLocation, locationDetails } = useAppCommonData();

  const renderProductPrice = () => {
    const discountPercent = getDiscountPercentage(price, specialPrice);
    return !!specialPrice ? (
      <View style={styles.flexRow}>
        <Text style={styles.label}>{`Price: `}</Text>
        <Text style={styles.value}>
          {string.common.Rs}
          {specialPrice}
          {'  '}
        </Text>
        <Text style={styles.smallLabel}>{`MRP `}</Text>
        <Text style={styles.smallValue}>
          {string.common.Rs}
          {price}
        </Text>
        <Text style={styles.discountPercent}>{`  ${discountPercent}%off`}</Text>
      </View>
    ) : (
      <View style={styles.flexRow}>
        <Text style={styles.label}>{`MRP: `}</Text>
        <Text style={styles.value}>
          {string.common.Rs}
          {price}
        </Text>
      </View>
    );
  };

  const renderIsInStock = () => {
    return isInStock ? (
      <View style={styles.inStockContainer}>
        <Text style={styles.stockText}>In Stock</Text>
      </View>
    ) : (
      <View style={[styles.inStockContainer, { backgroundColor: '#890000' }]}>
        <Text style={styles.stockText}>Out Of Stock</Text>
      </View>
    );
  };

  const renderManufacturer = () => {
    return (
      <View style={styles.manufacture}>
        <Text
          style={theme.viewStyles.text('R', 14, '#02475B', 1, 16, 0.35)}
        >{`Manufacturer :`}</Text>
        <Text style={styles.label}>{manufacturer}</Text>
      </View>
    );
  };

  const renderDeliverTo = () => {
    let deliveryAddress = addresses.find((item) => item.id == deliveryAddressId);
    const location = !deliveryAddress
      ? pharmacyLocation
        ? `${pharmacyLocation?.city || pharmacyLocation?.state || ''} ${pharmacyLocation?.pincode}`
        : `${locationDetails?.city || pharmacyLocation?.state || ''} ${locationDetails?.pincode}`
      : `${deliveryAddress?.city || deliveryAddress?.state || ''} ${deliveryAddress?.zipcode}`;
    return (
      <TouchableOpacity
        onPress={() => {
          showPincodePopup();
        }}
        style={styles.deliveryTo}
      >
        <Location style={styles.locationIcon} />
        <Text style={theme.viewStyles.text('M', 13, '#02475B', 1, 20)}>
          {` Deliver to ${currentPatient?.firstName} - ${location} (Change)`}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderExpress = () => {
    return (
      <View style={styles.flexRow}>
        <ExpressDeliveryLogo style={styles.expressLogo} />
        <Text
          style={theme.viewStyles.text('SB', 14, '#02475B', 1, 25, 0.35)}
        >{`  within 1 hour`}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardStyle}>
        {renderProductPrice()}
        {renderIsInStock()}
      </View>
      {manufacturer && renderManufacturer()}
      {renderDeliverTo()}
      {isExpress && renderExpress()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  cardStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexRow: {
    flexDirection: 'row',
  },
  label: theme.viewStyles.text('R', 15, '#02475B', 1, 25, 0.35),
  value: theme.viewStyles.text('B', 15, '#02475B', 1, 25, 0.35),
  smallLabel: {
    ...theme.viewStyles.text('R', 14, '#02475B', 1, 27, 0.35),
    textDecorationLine: 'line-through',
  },
  smallValue: {
    ...theme.viewStyles.text('B', 14, '#02475B', 1, 27, 0.35),
    textDecorationLine: 'line-through',
  },
  discountPercent: theme.viewStyles.text('R', 14, '#00B38E', 1, 27, 0.35),
  inStockContainer: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: '#00B38E',
    borderRadius: 5,
  },
  stockText: theme.viewStyles.text('M', 13, '#FFFFFF', 1, 18),
  manufacture: {
    marginTop: 7,
  },
  deliveryTo: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  locationIcon: {
    resizeMode: 'contain',
    width: 20,
    height: 20,
  },
  expressLogo: {
    resizeMode: 'contain',
    width: 60,
    height: 30,
  },
});
