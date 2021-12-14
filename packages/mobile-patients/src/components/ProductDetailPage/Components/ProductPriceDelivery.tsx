import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getDiscountPercentage } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Location, ExpressDeliveryLogo } from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import moment from 'moment';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { MultiVariant } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/MultiVariant';

export interface ProductPriceDeliveryProps {
  price: number;
  specialPrice: number | null;
  isExpress: boolean;
  isInStock: boolean;
  isSellOnline: boolean;
  showPincodePopup: (show: boolean) => void;
  deliveryTime?: string;
  deliveryError?: string;
  isPharma: boolean;
  cashback: number | string;
  finalPrice: number;
  showDeliverySpinner: boolean;
  isBanned: boolean;
  sku: string;
  multiVariantAttributes?: any[];
  multiVariantProducts?: any[];
  skusInformation?: any[];
  onSelectVariant?: (sku: string) => void;
}

export const ProductPriceDelivery: React.FC<ProductPriceDeliveryProps> = (props) => {
  const {
    price,
    specialPrice,
    isInStock,
    showPincodePopup,
    deliveryError,
    deliveryTime,
    isPharma,
    cashback,
    finalPrice,
    isSellOnline,
    showDeliverySpinner,
    isBanned,
    multiVariantAttributes,
    multiVariantProducts,
    skusInformation,
    sku,
    onSelectVariant,
  } = props;
  const { currentPatient } = useAllCurrentPatients();
  const {
    addresses,
    cartAddressId,
    cartLocationDetails,
    cartCircleSubscriptionId,
  } = useShoppingCart();
  const momentDiff = moment(deliveryTime).diff(moment());
  const hoursMoment = moment.duration(momentDiff);
  const hours = hoursMoment.asHours().toFixed();
  const showExpress = Number(hours) <= AppConfig.Configuration.EXPRESS_MAXIMUM_HOURS;
  const showMultiVariantOption = !!multiVariantAttributes?.length && !!skusInformation?.length;

  let deliveryAddress = addresses.find((item) => item.id == cartAddressId);
  const pincode = cartLocationDetails?.pincode || deliveryAddress?.zipcode;

  const renderProductPrice = () => {
    const discountPercent = getDiscountPercentage(price, specialPrice);
    return !!specialPrice ? (
      <View style={[styles.flexRow, { alignItems: 'center', paddingBottom: 9 }]}>
        <Text style={styles.label}>{`Price: `}</Text>
        <Text style={styles.value}>
          {string.common.Rs}
          {convertNumberToDecimal(price)}
          {'  '}
        </Text>
        <Text style={styles.smallValue}>
          {string.common.Rs}
          {convertNumberToDecimal(specialPrice)} |
        </Text>
        <Text style={styles.discountPercent}>{`  ${discountPercent}%off`}</Text>
        <Text style={theme.viewStyles.text('R', 10, '#02475B', 1, 13, 0)}>
          {'  '}(Inclusive of all Taxes)
        </Text>
      </View>
    ) : (
      <View style={[styles.flexRow, { alignItems: 'center', paddingBottom: 9 }]}>
        <Text style={styles.label}>{`Price: `}</Text>
        <Text style={styles.smallValue}>
          {string.common.Rs}
          {convertNumberToDecimal(price)}
        </Text>
        <Text style={theme.viewStyles.text('R', 10, '#02475B', 1, 13, 0)}>
          {' '}
          (Inclusive of all Taxes)
        </Text>
      </View>
    );
  };

  const renderIsInStock = () => {
    return showDeliverySpinner ? (
      <ActivityIndicator
        style={styles.activityIndicatorStyle}
        animating={true}
        size="small"
        color="green"
      />
    ) : isBanned ? (
      <View style={styles.inStockContainer}>
        <Text style={styles.stockText}>Banned for Sale</Text>
      </View>
    ) : !isSellOnline ? (
      <View style={styles.inStockContainer}>
        <Text style={styles.stockText}>NOT AVAILABLE FOR ONLINE SALE</Text>
      </View>
    ) : isInStock ? (
      <View style={styles.inStockContainer}>
        <Text style={styles.inStockText}>In Stock</Text>
      </View>
    ) : (
      <View style={styles.inStockContainer}>
        <Text style={styles.stockText}>Out Of Stock</Text>
      </View>
    );
  };

  const renderDeliverTo = () => {
    const location = cartLocationDetails?.pincode
      ? `${cartLocationDetails?.city || cartLocationDetails?.state || ''} ${
          cartLocationDetails?.pincode
        }`
      : deliveryAddress
      ? `${deliveryAddress?.city || deliveryAddress?.state || ''} ${deliveryAddress?.zipcode}`
      : ``;
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
    const effectivePrice = finalPrice - Number(cashback);
    const circleDiscountPercent = ((finalPrice - effectivePrice) / finalPrice) * 100;
    return (
      <View>
        <View style={styles.lineView} />
        <View style={{ flexDirection: 'row', paddingBottom: 2 }}>
          <View style={{ paddingVertical: 10, flexDirection: 'column' }}>
            <CareCashbackBanner
              bannerText={`cashback${'    '}`}
              textStyle={styles.circleText}
              logoStyle={styles.circleLogo}
            />
            <Text style={styles.effectivePriceText}>Effective price</Text>
          </View>
          <View style={{ padding: 10, flexDirection: 'column' }}>
            <Text style={styles.circleText}>
              {string.common.Rs}
              {cashback}
              {'   '}({circleDiscountPercent.toFixed(0)}%)
            </Text>

            <Text style={[theme.viewStyles.text('R', 16, '#02475B', 1, 21), { fontWeight: '600' }]}>
              {string.common.Rs}
              {effectivePrice.toFixed(2)}
            </Text>
          </View>
        </View>
        <View style={styles.lineView} />
      </View>
    );
  };

  const rendergetCircleMembership = () => {
    const effectivePrice = finalPrice - Number(cashback);
    const circleDiscountPercent = ((finalPrice - effectivePrice) / finalPrice) * 100;
    const cashbackText = `${circleDiscountPercent.toFixed(0)}% cashback and`;
    // handling O cashback case
    const noncircleText =
      cashback !== 0 ? `and get ${cashbackText} Free Delivery` : `and get Free Delivery`;
    return (
      <View>
        <View style={styles.lineView} />
        <View style={{ paddingVertical: 10, flexDirection: 'row' }}>
          <Text style={[styles.nonCircleText, { paddingVertical: 6 }]}>Buy </Text>
          <CareCashbackBanner
            bannerText={noncircleText}
            textStyle={styles.nonCircleText}
            logoStyle={styles.circleLogo}
          />
        </View>
        <View style={styles.lineView} />
      </View>
    );
  };

  const renderMultiVariantOptions = () => {
    return (
      <MultiVariant
        multiVariantAttributes={multiVariantAttributes}
        multiVariantProducts={multiVariantProducts}
        skusInformation={skusInformation}
        currentSku={sku}
        onSelectVariant={onSelectVariant}
        pincode={pincode}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardStyle}>{renderProductPrice()}</View>
      {/* handling 0 discount cashback case */}
      {!!cartCircleSubscriptionId
        ? !!cashback
          ? renderCareCashback()
          : null
        : rendergetCircleMembership()}
      {showMultiVariantOption && renderMultiVariantOptions()}
      {isSellOnline && renderDeliverTo()}
      {!isBanned &&
        isSellOnline &&
        (showExpress ? renderExpress() : showDeliverySpinner ? null : renderDeliveryDateTime())}
      {renderIsInStock()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  cardStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexRow: {
    flexDirection: 'row',
  },
  label: {
    ...theme.viewStyles.text('R', 12, '#02475B', 1, 14, 0.35),
    fontWeight: '500',
  },
  value: {
    ...theme.viewStyles.text('R', 12, '#02475B', 0.7, 16, 0.35),
    textDecorationLine: 'line-through',
  },
  smallValue: {
    ...theme.viewStyles.text('B', 14, '#02475B', 1, 18, 0.35),
  },
  discountPercent: {
    ...theme.viewStyles.text('R', 16, '#00B38E', 1, 21, 0.35),
    fontWeight: '600',
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
  lineView: {
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  circleText: {
    ...theme.viewStyles.text('M', 12, '#02475B', 1, 14),
    paddingVertical: 8,
    fontWeight: '500',
  },
  circleLogo: {
    resizeMode: 'contain',
    width: 38,
    height: 30,
  },
  nonCircleText: {
    ...theme.viewStyles.text('M', 12, '#02475B', 1, 16),
    fontWeight: '600',
  },
  effectivePriceText: {
    ...theme.viewStyles.text('R', 12, '#02475B', 1, 22),
    fontWeight: '500',
  },
  inStockContainer: {
    marginTop: 8,
    marginBottom: 5,
  },
  stockText: {
    ...theme.viewStyles.text('M', 14, '#890000', 1, 18),
    fontWeight: '500',
  },
  inStockText: {
    ...theme.viewStyles.text('M', 14, '#00B38E', 1, 18),
    fontWeight: '500',
  },
  activityIndicatorStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 5,
    marginLeft: 10,
  },
});
