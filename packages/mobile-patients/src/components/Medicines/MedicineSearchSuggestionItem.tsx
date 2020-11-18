import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { MedicineIcon, MedicineRxIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'react-native-elements';
import { MedicineProduct } from '../../helpers/apiCalls';
import { QuantityButton } from '../ui/QuantityButton';
import { NotForSaleBadge } from '@aph/mobile-patients/src/components/Medicines/NotForSaleBadge';
import { productsThumbnailUrl } from '@aph/mobile-patients/src/helpers/helperFunctions';

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
  const isOutOfStock = !data.is_in_stock;
  const isNotForOnlineSelling = !data.sell_online;
  const specialPrice = Number(data.special_price) || undefined;

  const renderNamePriceAndInStockStatus = () => {
    return (
      <View style={styles.nameAndPriceViewStyle}>
        <Text numberOfLines={1} style={{ ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0) }}>
          {data.name}
        </Text>
        {isOutOfStock && !isNotForOnlineSelling ? (
          <Text style={{ ...theme.viewStyles.text('M', 12, '#890000', 1, 20) }}>
            {'Out Of Stock'}
          </Text>
        ) : (
          <View style={{ flexDirection: 'row' }}>
            {!specialPrice && (
              <Text style={theme.viewStyles.text('M', 12, '#02475b', 0.6, 20)}>{'MRP '}</Text>
            )}
            <Text style={theme.viewStyles.text('M', 12, '#02475b', 0.6, 20)}>
              Rs. {specialPrice || data.price}
            </Text>
            {specialPrice ? (
              <Text
                style={[{ ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20), marginLeft: 8 }]}
              >
                <Text style={theme.viewStyles.text('M', 12, '#02475b')}>{' MRP '}</Text>
                {'('}
                <Text style={{ textDecorationLine: 'line-through' }}>{`Rs. ${data.price}`}</Text>
                {')'}
              </Text>
            ) : null}
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
          <View style={{ width: 24 }} />
          <View style={{ alignItems: 'flex-end' }}>
            {isNotForOnlineSelling
              ? renderNotForSaleTag()
              : props.quantity
              ? renderQuantityView()
              : renderAddToCartView()}
          </View>
        </View>
        {props.showSeparator ? <Spearator /> : null}
      </View>
    </TouchableOpacity>
  );
};
