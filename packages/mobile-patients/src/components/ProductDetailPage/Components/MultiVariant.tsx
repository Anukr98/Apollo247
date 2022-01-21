import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getDeliveryTAT247v3, TatApiInput247 } from '@aph/mobile-patients/src/helpers/apiCalls';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

export interface MultiVariantProps {
  multiVariantAttributes?: any[];
  multiVariantProducts?: any[];
  skusInformation?: any[];
  currentSku?: string;
  onSelectVariant?: (sku: string) => void;
  pincode: string;
}

export const MultiVariant: React.FC<MultiVariantProps> = (props) => {
  const {
    multiVariantAttributes,
    multiVariantProducts,
    skusInformation,
    currentSku,
    onSelectVariant,
    pincode,
  } = props;

  const { addresses, cartLocationDetails, cartAddressId } = useShoppingCart();

  const defaultAddress = addresses.find((item) => item?.id == cartAddressId);
  const pharmacyLocation = cartLocationDetails || defaultAddress;

  const multiVariantsProductsKeys = Object.keys(multiVariantProducts);

  const selectedSku = skusInformation?.filter((value) => value.sku == currentSku);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    selectedSku?.[0]?.code?.split('_') || []
  );
  const [skuAvailability, setSkuAvailability] = useState(skusInformation);

  useEffect(() => {
    checkAvailability();
  }, [pincode]);

  const checkAvailability = () => {
    const skus = [];
    if (multiVariantAttributes && multiVariantAttributes?.length > 1) {
      multiVariantsProductsKeys.map((item) => {
        if (item.startsWith(selectedOptions[0] + '_')) {
          const x = multiVariantProducts && multiVariantProducts?.[item]?.sku;
          skus.push({ sku: x, qty: 1 });
        }
      });
    } else {
      skusInformation?.map((item) => {
        skus.push({ sku: item?.sku, qty: 1 });
      });
    }
    getDeliveryTAT247v3({
      items: skus,
      pincode: pincode,
      lat: pharmacyLocation?.latitude || 0,
      lng: pharmacyLocation?.longitude || 0,
    } as TatApiInput247)
      .then((res) => {
        if (res?.data?.response?.length > 0) {
          const availabilityInfo = skuAvailability?.map((data, index) => {
            const checkExist = res?.data?.response?.[0]?.items?.filter(
              (resData) => resData?.sku === data?.sku
            );
            if (checkExist?.[0]?.exist) {
              return { ...data, available: true };
            }
            return { ...data, available: false };
          });
          setSkuAvailability(availabilityInfo);
        }
      })
      .catch((error) => {});
  };

  const getSkuStatus = (code, index) => {
    let skuStatus;
    let unit;
    if (selectedOptions[index] === `${code}`) {
      skuStatus = 'selected';
      unit = selectedSku?.[0]?.unitOfMeasurement || '';
    } else {
      const checkItem = (data) =>
        data.split('_').filter((data) => selectedOptions?.includes(data)).length;
      const filteredArray = skuAvailability?.filter((data) =>
        selectedOptions.length > 1
          ? data?.code.includes(`${code}`) && checkItem(data?.code)
          : data?.code.includes(`${code}`)
      );
      const status =
        filteredArray?.[0]?.available ||
        (index === 0 && multiVariantAttributes && multiVariantAttributes?.length > 1) ||
        '';
      skuStatus = status ? '' : 'outOfStock';
      const unit1 =
        filteredArray?.[0]?.unitOfMeasurement ||
        (index === 0 && multiVariantAttributes && multiVariantAttributes?.length > 1) ||
        '';
      unit = unit1;
    }

    return [skuStatus, unit];
  };

  const handleClick = (variant, code) => {
    let newSelectedItems = [...selectedOptions];
    newSelectedItems[variant] = code;
    let sku = multiVariantProducts?.[newSelectedItems.join('_')]?.sku;
    if (sku) {
      setSelectedOptions(newSelectedItems);
      onSelectVariant?.(sku);
    } else {
      const selectedItem = Object.keys(multiVariantProducts)?.filter((item) =>
        item.includes(newSelectedItems?.[variant])
      );
      let sku = multiVariantProducts?.[selectedItem?.[0]]?.sku;
      if (sku) {
        setSelectedOptions(selectedItem);
        onSelectVariant?.(sku);
      }
    }
  };

  const renderMultiVariantAttributes = () => {
    return multiVariantAttributes?.map((value, index) => {
      const selectedVariantLabel = multiVariantAttributes?.[index]?.values?.filter(
        (data) => data?.code === selectedOptions?.[index]
      )?.[0]?.label;
      const label = value?.label.split('_').map((ele) => {
        return ele[0].toUpperCase() + ele.slice(1, ele.length);
      });
      const labelToBeDisplayed = label.join(' ');
      const unitDisplayed = selectedSku?.[0]?.unitOfMeasurement || '';
      return (
        <View style={{ marginBottom: 7 }}>
          <View style={styles.flexRow}>
            <Text style={theme.viewStyles.text('M', 14, '#02475B', 1, 27, 0.35)}>
              {`Selected ${labelToBeDisplayed}:`}
            </Text>
            <Text style={theme.viewStyles.text('SB', 14, '#02475B', 1, 27, 0.35)}>
              {selectedVariantLabel}
              {labelToBeDisplayed === 'Pack Size' ? unitDisplayed : ''}
            </Text>
          </View>
          <View style={[styles.flexRow, styles.textWrapping]}>
            {value?.values
              ?.filter((data) =>
                Boolean(
                  index === 0 ||
                    skuAvailability?.find(
                      (item) =>
                        `${selectedOptions[0]}_${data?.code}` === item?.code ||
                        `${data?.code}_${selectedOptions[1]}` === item?.code
                    )
                )
              )
              .map((variant) => {
                const [skuStatus, unit] = getSkuStatus(variant?.code, index);
                const isSelected = skuStatus === 'selected';
                const isOutOfStock = skuStatus === 'outOfStock';
                return (
                  <View style={{ paddingBottom: 5 }}>
                    <TouchableOpacity
                      style={[
                        styles.option,
                        {
                          backgroundColor: isSelected
                            ? '#02475B'
                            : isOutOfStock
                            ? theme.colors.CARD_BG
                            : 'white',
                        },
                      ]}
                      onPress={() => {
                        if (!isSelected) handleClick(index, variant?.code);
                      }}
                    >
                      <Text
                        style={[
                          styles.labelText,
                          isSelected ? { color: 'white' } : {},
                          isOutOfStock
                            ? {
                                textDecorationLine: 'line-through',
                              }
                            : {},
                        ]}
                      >
                        {variant?.label}
                        {labelToBeDisplayed === 'Pack Size' ? unit : ''}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
          </View>
        </View>
      );
    });
  };

  return <View style={styles.container}>{renderMultiVariantAttributes()}</View>;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  option: {
    borderWidth: 1,
    borderColor: '#02475B',
    marginRight: 7,
    padding: 5,
    borderRadius: 6,
  },
  flexRow: {
    flexDirection: 'row',
  },
  textWrapping: {
    flexWrap: 'wrap',
    paddingBottom: 5,
  },
  labelText: {
    ...theme.viewStyles.text('M', 14, '#02475B', 1, 20, 0.35),
  },
});
