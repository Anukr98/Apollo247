import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { availabilityApi247 } from '@aph/mobile-patients/src/helpers/apiCalls';

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

  const selectedSku = skusInformation?.filter((value) => value.sku == currentSku);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    selectedSku?.[0]?.code?.split('_') || []
  );
  const [skuAvailability, setSkuAvailability] = useState(skusInformation);

  useEffect(() => {
    checkAvailability();
  }, [pincode]);

  const checkAvailability = () => {
    const skus = skusInformation?.map((item) => {
      return item.sku;
    });
    availabilityApi247(pincode, skus.join(',')).then((res) => {
      if (res?.data?.response?.length) {
        const availabilityInfo = skuAvailability?.map((data, index) => {
          const checkExist = res.data.response.filter((resData) => resData.sku === data.sku);
          if (checkExist.length) {
            return { ...data, available: checkExist[0].exist };
          }
          return { ...data, available: false };
        });
        setSkuAvailability(availabilityInfo);
      }
    });
  };

  const getSkuStatus = (code, index) => {
    let skuStatus;
    if (selectedOptions[index] === `${code}`) {
      skuStatus = 'selected';
    } else {
      const checkItem = (data) =>
        data.split('_').filter((data) => selectedOptions?.includes(data)).length;
      const filteredArray = skuAvailability?.filter((data) =>
        selectedOptions.length > 1
          ? data.code.includes(`${code}`) && checkItem(data.code)
          : data.code.includes(`${code}`)
      );
      const status = filteredArray && filteredArray.length ? filteredArray[0].available : '';
      skuStatus = status ? '' : 'outOfStock';
    }

    return skuStatus;
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
      return (
        <View style={{ marginBottom: 7 }}>
          <View style={styles.flexRow}>
            <Text style={theme.viewStyles.text('M', 14, '#02475B', 1, 27, 0.35)}>
              {`Selected ${value?.label}:`}
            </Text>
            <Text style={theme.viewStyles.text('SB', 14, '#02475B', 1, 27, 0.35)}>
              {selectedVariantLabel}
            </Text>
          </View>
          <View style={styles.flexRow}>
            {value?.values?.map((variant) => {
              const skuStatus = getSkuStatus(variant?.code, index);
              const isSelected = skuStatus === 'selected';
              const isOutOfStock = skuStatus === 'outOfStock';
              return (
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
                  </Text>
                </TouchableOpacity>
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
  labelText: {
    ...theme.viewStyles.text('M', 14, '#02475B', 1, 20, 0.35),
  },
});
