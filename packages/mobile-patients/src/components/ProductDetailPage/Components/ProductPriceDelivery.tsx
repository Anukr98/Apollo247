import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getDiscountPercentage } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Location, ExpressDeliveryLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import moment from 'moment';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

export interface ProductPriceDeliveryProps {
  price: number;
  specialPrice: number | null;
  isExpress: boolean;
  isInStock: boolean;
  isSellOnline: boolean;
  manufacturer?: string;
  showPincodePopup: (show: boolean) => void;
  deliveryTime?: string;
  deliveryError?: string;
  isPharma: boolean;
  cashback: number;
  finalPrice: number;
  showDeliverySpinner: boolean;
  isBanned: boolean;
}

export const ProductPriceDelivery: React.FC<ProductPriceDeliveryProps> = (props) => {
  const {
    price,
    specialPrice,
    isInStock,
    manufacturer,
    showPincodePopup,
    deliveryError,
    deliveryTime,
    isPharma,
    cashback,
    finalPrice,
    isSellOnline,
    showDeliverySpinner,
    isBanned,
  } = props;
  const { currentPatient } = useAllCurrentPatients();
  const { addresses, deliveryAddressId, circleSubscriptionId, asyncPincode } = useShoppingCart();
  const { pharmacyLocation, locationDetails } = useAppCommonData();
  const momentDiff = moment(deliveryTime).diff(moment());
  const hoursMoment = moment.duration(momentDiff);
  const hours = hoursMoment.asHours().toFixed();
  const showExpress = Number(hours) <= AppConfig.Configuration.EXPRESS_MAXIMUM_HOURS;

  const renderProductPrice = () => {
    const discountPercent = getDiscountPercentage(price, specialPrice);
    return !!specialPrice ? (
      <View style={styles.flexRow}>
        <Text style={styles.label}>{`Price: `}</Text>
        <Text style={styles.value}>
          {string.common.Rs}
          {convertNumberToDecimal(specialPrice)}
          {'  '}
        </Text>
        <Text style={styles.smallLabel}>{`MRP `}</Text>
        <Text style={styles.smallValue}>
          {string.common.Rs}
          {convertNumberToDecimal(price)}
        </Text>
        <Text style={styles.discountPercent}>{`  ${discountPercent}%off`}</Text>
      </View>
    ) : (
      <View style={styles.flexRow}>
        <Text style={styles.label}>{`MRP: `}</Text>
        <Text style={styles.value}>
          {string.common.Rs}
          {convertNumberToDecimal(price)}
        </Text>
      </View>
    );
  };

  const renderIsInStock = () => {
    return showDeliverySpinner ? (
      <ActivityIndicator
        style={{ alignItems: 'flex-end', marginRight: 20 }}
        animating={true}
        size="small"
        color="green"
      />
    ) : isBanned ? (
      <View style={[styles.inStockContainer, { backgroundColor: '#890000' }]}>
        <Text style={styles.stockText}>Banned for Sale</Text>
      </View>
    ) : !isSellOnline ? (
      <View style={[styles.inStockContainer, { backgroundColor: '#890000' }]}>
        <Text style={styles.stockText}>NOT AVAILABLE FOR ONLINE SALE</Text>
      </View>
    ) : isInStock ? (
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
    const location = asyncPincode?.pincode
      ? `${asyncPincode?.city || asyncPincode?.state || ''} ${asyncPincode?.pincode}`
      : !deliveryAddress
      ? pharmacyLocation
        ? `${pharmacyLocation?.city || pharmacyLocation?.state || ''} ${pharmacyLocation?.pincode}`
        : `${locationDetails?.city || pharmacyLocation?.state || ''} ${locationDetails?.pincode}`
      : `${deliveryAddress?.city || deliveryAddress?.state || ''} ${deliveryAddress?.zipcode}`;
    return (
      <TouchableOpacity
        onPress={() => {
          showPincodePopup(false);
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
        {!!hours && (
          <Text style={theme.viewStyles.text('SB', 14, '#02475B', 1, 25, 0.35)}>
            {`  within ${hours} `}
            {parseInt(hours) > 1 ? `hours` : `hour`}
          </Text>
        )}
      </View>
    );
  };

  const renderDeliveryDateTime = () => {
    return !!deliveryError ? (
      <Text style={[theme.viewStyles.text('R', 14, '#01475b'), isInStock ? {} : { marginTop: 7 }]}>
        {deliveryError}
      </Text>
    ) : !isInStock ? (
      <Text
        style={[theme.viewStyles.text('R', 14, '#01475b'), isInStock ? {} : { marginTop: 7 }]}
      >{`Sorry, this item is out of stock in your area.`}</Text>
    ) : !!deliveryTime ? (
      <Text style={theme.viewStyles.text('M', 14, '#01475b', 1, 20, 0)}>
        Delivery By{' '}
        {moment(deliveryTime, AppConfig.Configuration.MED_DELIVERY_DATE_TAT_API_FORMAT).format(
          AppConfig.Configuration.MED_DELIVERY_DATE_DISPLAY_FORMAT
        )}
      </Text>
    ) : null;
  };

  const renderCareCashback = () => {
    return (
      <>
        <CareCashbackBanner
          bannerText={`extra cashback ${string.common.Rs}${cashback.toFixed(2)}`}
          textStyle={styles.circleText}
          logoStyle={styles.circleLogo}
        />
        <Text style={theme.viewStyles.text('R', 12, '#02475B', 1, 17)}>
          Effective price for you
          <Text style={{ fontWeight: 'bold' }}>
            {' '}
            {string.common.Rs}
            {(finalPrice - cashback).toFixed(2)}
          </Text>
        </Text>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardStyle}>
        {renderProductPrice()}
        {renderIsInStock()}
      </View>
      {!!circleSubscriptionId && !!cashback && renderCareCashback()}
      {!!manufacturer && !isPharma && renderManufacturer()}
      {isSellOnline && renderDeliverTo()}
      {!isBanned &&
        isSellOnline &&
        (showExpress ? renderExpress() : showDeliverySpinner ? null : renderDeliveryDateTime())}
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
    marginRight: 10,
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
  circleText: {
    ...theme.viewStyles.text('M', 12, '#00A0E3', 1, 15),
    paddingVertical: 8,
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 38,
    height: 30,
  },
});
