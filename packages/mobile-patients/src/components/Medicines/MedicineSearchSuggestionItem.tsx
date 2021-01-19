import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { MedicineIcon, MedicineRxIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'react-native-elements';
import { MedicineProduct } from '../../helpers/apiCalls';
import { QuantityButton } from '../ui/QuantityButton';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  productsThumbnailUrl,
  isProductInStock,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

const styles = StyleSheet.create({
  containerStyle: {},
  iconAndDetailsContainerStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 9.5,
  },
  iconOrImageContainerStyle: {
    width: 40,
  },
  nameAndPriceViewStyle: {
    flex: 1,
  },
  discount: {
    ...theme.viewStyles.text('SB', 13, '#00B38E', 0.6, 25),
    marginLeft: 5,
  },
  lineThrough: {
    textDecorationLine: 'line-through',
  },
  specialPrice: {
    ...theme.viewStyles.text('M', 13, '#02475b', 0.6, 25),
    marginLeft: 5,
  },
  flexRow: {
    flexDirection: 'row',
  },
  quantityView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 25,
  },
});

export interface MedicineSearchSuggestionItemProps {
  onPress: () => void;
  onPressAddToCart: () => void;
  onPressNotify: () => void;
  onPressAdd: () => void;
  onPressSubstract: () => void;
  quantity: number;
  style?: ViewStyle;
  showSeparator?: boolean;
  loading?: boolean;
  data: MedicineProduct;
}

export const MedicineSearchSuggestionItem: React.FC<MedicineSearchSuggestionItemProps> = (
  props
) => {
  const { data } = props;
  const prescriptionRequired = data.is_prescription_required == '1';
  const imageUri = productsThumbnailUrl(data.thumbnail);
  const isOutOfStock = !isProductInStock(data);
  const isNotForOnlineSelling = !data.sell_online;
  const specialPrice = Number(data.special_price) || undefined;
  const { dose_form_variant, pack_form, pack_size, unit_of_measurement } = data;

  function getDiscountPercent() {
    return (((data.price - specialPrice) / data.price) * 100).toFixed(1);
  }

  const renderNamePriceAndInStockStatus = () => {
    return (
      <View style={styles.nameAndPriceViewStyle}>
        <Text
          numberOfLines={2}
          style={{ ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0), width: '90%' }}
        >
          {data.name}
        </Text>
        {!!dose_form_variant && !!pack_form && !!pack_size && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={theme.viewStyles.text('R', 13, '#02475B', 0.7, 20)}>
              {`${pack_form} of ${pack_size}${unit_of_measurement || ''} ${dose_form_variant}`}
            </Text>
          </View>
        )}
        {isOutOfStock ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...theme.viewStyles.text('SB', 13, '#890000', 1, 20) }}>
              {'Out Of Stock'}
            </Text>
            {renderAddToCartView()}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
              {!specialPrice && (
                <Text style={theme.viewStyles.text('M', 13, '#01475B', 1, 25)}>{'MRP '}</Text>
              )}
              <Text style={theme.viewStyles.text('SB', 13, '#01475B', 1, 25)}>
                {string.common.Rs}
                {convertNumberToDecimal(specialPrice || data?.price)}
              </Text>
              {specialPrice ? (
                <View style={styles.flexRow}>
                  <Text style={styles.specialPrice}>
                    <Text style={styles.lineThrough}>{' MRP '}</Text>
                    <Text style={styles.lineThrough}>{`${string.common.Rs} ${convertNumberToDecimal(
                      data?.price
                    )}`}</Text>
                  </Text>
                  <Text style={styles.discount}>{`${getDiscountPercent()}%off`}</Text>
                </View>
              ) : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {isNotForOnlineSelling
                ? renderNotForSaleTag()
                : props.quantity
                ? renderQuantityView()
                : renderAddToCartView()}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderIconOrImage = () => {
    return (
      <View style={styles.iconOrImageContainerStyle}>
        {imageUri ? (
          <Image
            placeholderStyle={theme.viewStyles.imagePlaceholderStyle}
            source={{ uri: imageUri }}
            style={{ height: 40, width: 40 }}
            resizeMode="contain"
          />
        ) : prescriptionRequired ? (
          <MedicineRxIcon />
        ) : (
          <MedicineIcon />
        )}
      </View>
    );
  };

  const renderNotForSaleTag = () => <NotForSaleBadge containerStyle={{ alignSelf: 'center' }} />;

  const renderAddToCartView = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={!props.loading && isOutOfStock ? props.onPressNotify : props.onPressAddToCart}
      >
        <Text style={{ ...theme.viewStyles.text('SB', 12, '#fc9916', 1, 24, 0) }}>
          {props.loading ? 'Loading...' : isOutOfStock ? 'NOTIFY ME' : 'ADD TO CART'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderQuantityView = () => {
    return (
      <View style={styles.quantityView}>
        <QuantityButton text={'-'} onPress={props.onPressSubstract} />
        <Text style={theme.viewStyles.text('B', 14, '#fc9916', 1, 24, 0)}>{props.quantity}</Text>
        <QuantityButton text={'+'} onPress={props.onPressAdd} />
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.containerStyle, props.style]}
      onPress={props.onPress}
    >
      <View style={styles.containerStyle} key={data.name}>
        <View style={styles.iconAndDetailsContainerStyle}>
          {renderIconOrImage()}
          <View style={{ width: 16 }} />
          {renderNamePriceAndInStockStatus()}
        </View>
        {props.showSeparator ? <Spearator /> : null}
      </View>
    </TouchableOpacity>
  );
};
