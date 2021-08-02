import {
  MedicineIcon,
  MedicineRxIcon,
  ExpressDeliveryLogo,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { TouchableOpacityProps, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native-elements';
import { CareCashbackBanner } from './CareCashbackBanner';
import {
  getDiscountPercentage,
  productsThumbnailUrl,
  calculateCashbackForItem,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AddToCartButtons } from '@aph/mobile-patients/src/components/Medicines/AddToCartButtons';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  rowSpaceBetweenView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexStyle: {
    flex: 1,
  },
  medicineTitle: {
    flex: 1,
    marginRight: 0,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  offTextStyle: {
    ...theme.viewStyles.text('M', 11, '#00B38E', 1, 20, 0),
    marginTop: 4,
  },
  outOfStockStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.INPUT_FAILURE_TEXT,
    marginTop: 4,
  },
  priceTextCollapseStyle: {
    ...theme.viewStyles.text('SB', 12, '#02475b', 1, 20, 0.04),
    marginTop: 4,
  },
  specialPriceTextCollapseStyle: {
    ...theme.viewStyles.text('M', 12, '#02475b', 1, 20, 0.04),
    marginTop: 4,
    marginLeft: 4,
    letterSpacing: 0,
  },
  expressContainer: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  expressLogo: {
    resizeMode: 'contain',
    width: 50,
    height: 20,
  },
  addToCartViewStyle: {
    alignSelf: 'center',
    borderColor: '#fc9916',
    borderWidth: 0.5,
    borderRadius: 1,
    paddingHorizontal: 8,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    backgroundColor: '#fff',
    elevation: 5,
  },
  imageContainer: {
    width: 60,
    marginRight: 28,
    alignItems: 'center',
    alignSelf: 'center',
  },
  medicineImageSize: {
    height: 80,
    width: 80,
  },
});

export interface Props extends MedicineProduct {
  onPress: () => void;
  onPressRemove: () => void;
  onPressAdd: () => void;
  onNotifyMeClicked: () => void;
  onPressAddQuantity: () => void;
  onPressSubtractQuantity: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  maxOrderQty: number;
  removeCartItem: () => void;
  type_id?: string | null;
  is_express?: 'Yes' | 'No';
  onPressAddToCart: () => void;
  onPressNotify: () => void;
  onPressAddQty: () => void;
  onPressSubtractQty: () => void;
  quantity: number;
}

export const SearchMedicineCard: React.FC<Props> = (props) => {
  const {
    name,
    price,
    special_price,
    thumbnail,
    subcategory,
    sku,
    sell_online,
    is_prescription_required,
    MaxOrderQty,
    quantity,
    containerStyle,
    onPress,
    type_id,
    is_express,
    onPressAddToCart,
    onPressNotify,
    onPressAddQty,
    onPressSubtractQty,
    dc_availability,
    is_in_contract,
    image,
  } = props;

  const isOutOfStock =
    dc_availability?.toLowerCase() === 'no' && is_in_contract?.toLowerCase() === 'no';

  const renderCareCashback = () => {
    const finalPrice = Number(special_price) || price;
    const cashback = calculateCashbackForItem(Number(finalPrice), type_id, subcategory, sku);
    if (!!cashback && type_id) {
      return <CareCashbackBanner bannerText={`extra ${string.common.Rs}${cashback} cashback`} />;
    } else {
      return <></>;
    }
  };

  const renderTitleAndIcon = () => {
    return (
      <View style={styles.rowSpaceBetweenView}>
        <View style={{ flex: 1 }}>
          <Text style={styles.medicineTitle}>{name}</Text>
          {!!type_id && renderCareCashback()}
          {renderOutOfStock()}
        </View>
      </View>
    );
  };

  const renderAddToCartView = () => {
    return (
      <TouchableOpacity
        style={[
          styles.addToCartViewStyle,
          !isOutOfStock && { paddingHorizontal: 23 },
          !!is_express && { marginTop: 10 },
        ]}
        onPress={isOutOfStock ? onPressNotify : onPressAddToCart}
      >
        <Text style={theme.viewStyles.text('SB', 10, '#fc9916', 1, 24, 0)}>
          {isOutOfStock ? 'NOTIFY ME' : 'ADD'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderNotForSaleTag = () => <NotForSaleBadge containerStyle={{ alignSelf: 'center' }} />;

  const renderQuantityView = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AddToCartButtons
          numberOfItemsInCart={quantity}
          maxOrderQty={MaxOrderQty}
          addToCart={onPressAddQty}
          removeItemFromCart={onPressSubtractQty}
          removeFromCart={onPressSubtractQty}
          isSolidContainer={false}
        />
      </View>
    );
  };

  const renderMedicineIcon = () => {
    const isPrescriptionRequired = is_prescription_required == 1;
    return (
      <View style={styles.imageContainer}>
        {thumbnail || image ? (
          <Image
            PlaceholderContent={isPrescriptionRequired ? <MedicineRxIcon /> : <MedicineIcon />}
            placeholderStyle={{ backgroundColor: 'transparent' }}
            source={{ uri: productsThumbnailUrl(thumbnail || image) }}
            style={styles.medicineImageSize}
            resizeMode="contain"
          />
        ) : isPrescriptionRequired ? (
          <MedicineRxIcon />
        ) : (
          <MedicineIcon />
        )}
      </View>
    );
  };

  const renderOutOfStock = () => {
    const discount = getDiscountPercentage(price, special_price);
    const off_text = discount ? ' ' + discount + '%off' : '';
    return isOutOfStock && sell_online ? (
      <Text style={styles.outOfStockStyle}>{'Out Of Stock'}</Text>
    ) : (
      <View style={{ flexDirection: 'row', marginBottom: 5 }}>
        <Text style={styles.priceTextCollapseStyle}>
          {!discount && `MRP `}
          {string.common.Rs}
          {convertNumberToDecimal(discount ? special_price : price)}
        </Text>
        {!!special_price && (
          <>
            <Text style={styles.specialPriceTextCollapseStyle}>
              {'('}
              <Text style={{ textDecorationLine: 'line-through' }}>{`MRP ${
                string.common.Rs
              }${convertNumberToDecimal(price)}`}</Text>
              {')'}
            </Text>
            <Text style={styles.offTextStyle}>{off_text}</Text>
          </>
        )}
      </View>
    );
  };

  const renderExpressFlag = () => {
    return (
      <View style={styles.expressContainer}>
        <ExpressDeliveryLogo style={styles.expressLogo} />
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.containerStyle, containerStyle, { zIndex: -1 }]}
      onPress={() => onPress()}
    >
      {is_express === 'Yes' && renderExpressFlag()}
      <View style={{ flexDirection: 'row' }}>
        {renderMedicineIcon()}
        <View style={styles.flexStyle}>{renderTitleAndIcon()}</View>
        <View style={{ width: 10 }}></View>
        {!sell_online
          ? renderNotForSaleTag()
          : !quantity
          ? renderAddToCartView()
          : renderQuantityView()}
      </View>
    </TouchableOpacity>
  );
};
