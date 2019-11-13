import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { theme } from '../../theme/theme';
import { Header } from '../ui/Header';
import { Reload } from '../ui/Icons';
import { SectionHeaderComponent } from '../ui/SectionHeader';
import { TextInputComponent } from '../ui/TextInputComponent';

const styles = StyleSheet.create({});

export type FilterRange = {
  from: number;
  to: number;
};
export type SortByOptions = 'A-Z' | 'Z-A' | 'Price-H-L' | 'Price-L-H';

export interface MedicineFilterProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilter: (
    discountRange: FilterRange,
    priceRange: FilterRange,
    sortBy: SortByOptions
  ) => void;
  discountRange: FilterRange;
  priceRange: FilterRange;
  sortBy: SortByOptions;
}

export const MedicineFilter: React.FC<MedicineFilterProps> = (props) => {
  const { discountRange, priceRange, onClose, onApplyFilter } = props;

  const [discount, setdiscount] = useState<FilterRange>({
    from: discountRange.from || 0,
    to: discountRange.to || 100,
  });
  const [price, setprice] = useState<FilterRange>({
    from: priceRange.from,
    to: priceRange.to,
  });
  const [sortBy, setSortBy] = useState<SortByOptions>('A-Z');

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'close'}
        title="FILTERS"
        rightComponent={
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <Reload />
          </TouchableOpacity>
        }
        onPressLeftIcon={onClose}
      />
    );
  };

  const renderCategories = () => {
    return null;
  };

  const renderDiscount = () => {
    return (
      <View
        style={{
          backgroundColor: '#f7f8f5',
          paddingLeft: 20,
          marginTop: 20,
          shadowColor: theme.colors.SHADOW_GRAY,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 4,
          paddingRight: 20,
        }}
      >
        <SectionHeaderComponent
          sectionTitle={'Discount'}
          style={{ marginTop: 10, marginLeft: 0 }}
        ></SectionHeaderComponent>
        <View
          style={{ backgroundColor: '#02475b', opacity: 0.5, height: 1, marginBottom: 10 }}
        ></View>
        {renderInputField()}
      </View>
    );
  };

  const renderInputField = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#fff',
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              marginRight: 10,
              marginLeft: 10,
              width: 130,
              height: 48,
            }}
          >
            <TextInputComponent
              // style={{
              //   flex: 1,
              //   ...theme.fonts.IBMPlexSansMedium(14),
              //   paddingLeft: 12,
              //   marginTop: 12,
              //   marginLeft: 10,
              //   color: 'red',
              //   marginBottom: 16,
              //   textAlign: 'left',
              // }}
              placeholder="0%"
              underlineColorAndroid="transparent"
              placeholderTextColor="#01475b"
              maxLength={100}
            />
          </View>
        </View>
        <Text
          style={{
            textAlign: 'center',
            ...theme.fonts.IBMPlexSansSemiBold(13),
            letterSpacing: 0.5,
            justifyContent: 'center',
            marginTop: 10,
            color: '#01475b',
          }}
        >
          TO
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#fff',
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              marginRight: 10,
              marginLeft: 10,
              width: 130,
              height: 48,
            }}
          >
            <TextInputComponent
              // style={{
              //   flex: 1,
              //   ...theme.fonts.IBMPlexSansMedium(14),
              //   paddingLeft: 12,
              //   marginTop: 12,
              //   marginLeft: 10,
              //   color: 'red',
              //   marginBottom: 16,
              //   textAlign: 'left',
              // }}
              placeholder="0%"
              underlineColorAndroid="transparent"
              placeholderTextColor="#01475b"
              maxLength={100}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderPrice = () => {
    <View
      style={{
        backgroundColor: '#f7f8f5',
        paddingLeft: 20,
        marginTop: 20,
        shadowColor: theme.colors.SHADOW_GRAY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
        paddingRight: 20,
      }}
    >
      <SectionHeaderComponent
        sectionTitle={'Price'}
        style={{ marginTop: 10, marginLeft: 0 }}
      ></SectionHeaderComponent>
      <View
        style={{ backgroundColor: '#02475b', opacity: 0.5, height: 1, marginBottom: 10 }}
      ></View>
      {renderInputField()}
    </View>;
  };

  const renderSortBy = () => {
    <View
      style={{
        backgroundColor: '#f7f8f5',
        padding: 20,
        marginTop: 20,
        shadowColor: theme.colors.SHADOW_GRAY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <SectionHeaderComponent
        sectionTitle={'Sort By'}
        style={{ marginTop: 0, marginLeft: 0 }}
      ></SectionHeaderComponent>
      <View
        style={{ backgroundColor: '#02475b', opacity: 0.5, height: 1, marginBottom: 10 }}
      ></View>
    </View>;
  };

  const renderApplyFilterButton = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <Button
          title={'APPLY FILTERS'}
          style={{
            margin: 20,
            width: 240,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            onApplyFilter(discount, price, sortBy);
          }}
        />
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ flex: 1 }}>
      {renderHeader()}
      {renderCategories()}
      {renderDiscount()}
      {renderPrice()}
      {renderSortBy()}
      {renderApplyFilterButton()}
    </ScrollView>
  );
};
