import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { DropdownGreen, Reload } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { getMedicinePageProducts } from '@aph/mobile-patients/src/helpers/apiCalls';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useFetch } from '@aph/mobile-patients/src/hooks/fetchHook';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Overlay } from 'react-native-elements';

const styles = StyleSheet.create({
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 11,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
});

export type FilterRange = {
  from: number | undefined;
  to: number | undefined;
};
export type SortByOptions = 'A-Z' | 'Z-A' | 'Price-H-L' | 'Price-L-H' | undefined;

export interface MedicineFilterProps {
  isVisible: boolean;
  hideCategoryFilter?: boolean;
  onClose: () => void;
  onApplyFilter: (
    discountRange: FilterRange,
    priceRange: FilterRange,
    sortBy: SortByOptions,
    categoryIds: string[]
  ) => void;
}

export const MedicineFilter: React.FC<MedicineFilterProps> = (props) => {
  const { onClose, onApplyFilter, hideCategoryFilter } = props;

  const [discount, setdiscount] = useState<FilterRange>({
    from: undefined,
    to: undefined,
  });
  const [price, setprice] = useState<FilterRange>({
    from: undefined,
    to: undefined,
  });
  const [sortBy, setSortBy] = useState<SortByOptions>(undefined);
  const [categoryIds, setcategoryIds] = useState<string[]>(['']);

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
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setprice({ from: undefined, to: undefined });
              setdiscount({ from: undefined, to: undefined });
              setSortBy(undefined);
              setcategoryIds(['']);
            }}
          >
            <Reload />
          </TouchableOpacity>
        }
        onPressLeftIcon={onClose}
      />
    );
  };

  // const { data, loading, error } = useFetch(() => getMedicinePageProducts());
  // TODO: Optimize API call for `hideCategoryFilter` prop

  const renderCategories = () => {
    // const shopByCategory = (!loading && !error && g(data, 'data', 'shop_by_category')) || [];
    // let categories = shopByCategory.map((item) => [item.title, item.category_id]);
    // if (categories.length) {
    //   categories = [['All', ''], ...categories];
    // }
    const categories = [
      ['All', ''],
      ['Personal Care', '14'],
      ['Mom & Baby', '24'],
      ['Nutrition', '6'],
      ['Healthcare', '71'],
      ['Special Offers', '234'],
      ['Holland & Barrett', '97'],
      ['Apollo Products', '680'],
    ];
    if (hideCategoryFilter) {
      return null;
    }
    // return loading ? (
    //   <Spinner
    //     style={{
    //       position: 'relative',
    //       backgroundColor: 'transparent',
    //     }}
    //   />
    // ) :
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
          sectionTitle={'Categories'}
          style={{ marginTop: 10, marginLeft: 0 }}
        />
        <View style={{ backgroundColor: '#02475b', opacity: 0.5, height: 1, marginBottom: 0 }} />
        <View style={styles.optionsView}>
          {categories.map((item, idx) => (
            <Button
              key={idx}
              title={item[0]}
              style={[
                styles.buttonStyle,
                categoryIds.includes(item[1]) ? { backgroundColor: theme.colors.APP_GREEN } : null,
              ]}
              titleTextStyle={[
                styles.buttonTextStyle,
                categoryIds.includes(item[1]) ? { color: theme.colors.WHITE } : null,
              ]}
              onPress={() => {
                if (item[1] == '') {
                  setcategoryIds(['']);
                  return;
                }
                if (categoryIds.includes(item[1])) {
                  setcategoryIds(categoryIds.filter((_item) => _item != item[1]).filter((i) => i));
                } else {
                  setcategoryIds([...categoryIds, item[1]].filter((i) => i));
                }
              }}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderDiscount = () => {
    return (
      <View
        style={{
          backgroundColor: '#f7f8f5',
          paddingLeft: 20,
          marginTop: 19,
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
        />
        <View style={{ backgroundColor: '#02475b', opacity: 0.5, height: 1, marginBottom: 10 }} />
        <InputField
          fromPlaceholder={'Discount in %'}
          toPlaceholder={'Discount in %'}
          fromValue={`${discount.from == undefined ? '' : discount.from}`}
          toValue={`${discount.to == undefined ? '' : discount.to}`}
          onFromChangeText={(text) => {
            setdiscount({ ...discount, from: text ? parseInt(text) : undefined });
          }}
          onToChangeText={(text) => {
            setdiscount({ ...discount, to: text ? parseInt(text) : undefined });
          }}
        />
      </View>
    );
  };

  const renderPrice = () => {
    return (
      <View
        style={{
          backgroundColor: '#f7f8f5',
          paddingLeft: 20,
          marginTop: 8,
          shadowColor: theme.colors.SHADOW_GRAY,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 4,
          paddingRight: 20,
        }}
      >
        <SectionHeaderComponent sectionTitle={'Price'} style={{ marginTop: 10, marginLeft: 0 }} />
        <View style={{ backgroundColor: '#02475b', opacity: 0.5, height: 1, marginBottom: 10 }} />
        <InputField
          fromPlaceholder={'Price'}
          toPlaceholder={'Price'}
          fromValue={`${price.from == undefined ? '' : price.from}`}
          toValue={`${price.to == undefined ? '' : price.to}`}
          onFromChangeText={(text) => {
            setprice({ ...price, from: text ? parseInt(text) : undefined });
          }}
          onToChangeText={(text) => {
            setprice({ ...price, to: text ? parseInt(text) : undefined });
          }}
        />
      </View>
    );
  };

  const renderSortBy = () => {
    return (
      <View
        style={{
          backgroundColor: '#f7f8f5',
          padding: 20,
          marginTop: 8,
          shadowColor: theme.colors.SHADOW_GRAY,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <SectionHeaderComponent sectionTitle={'Sort By'} style={{ marginTop: 0, marginLeft: 0 }} />
        <View style={{ backgroundColor: '#02475b', opacity: 0.5, height: 1, marginBottom: 10 }} />
        <MaterialMenu
          options={['A-Z', 'Z-A', 'Price-H-L', 'Price-L-H'].map((item) => ({
            key: item!,
            value: item!,
          }))}
          selectedText={sortBy}
          menuContainerStyle={{
            alignItems: 'flex-end',
            marginTop: 24,
            marginLeft: Dimensions.get('window').width / 2 - 110,
          }}
          lastContainerStyle={{ borderBottomWidth: 0 }}
          bottomPadding={{ paddingBottom: 0 }}
          itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b') }}
          selectedTextStyle={{ ...theme.viewStyles.text('M', 16, '#00b38e') }}
          onPress={(item) => {
            setSortBy(item.value as SortByOptions);
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              ...theme.viewStyles.card(12, 0),
            }}
          >
            <Text style={{ ...theme.viewStyles.text('M', 16, '#01475b'), flex: 1 }}>
              {sortBy == 'A-Z'
                ? 'Products Name A-Z'
                : sortBy == 'Z-A'
                ? 'Products Name Z-A'
                : sortBy == 'Price-L-H'
                ? 'Price: Low To High'
                : sortBy == 'Price-H-L'
                ? 'Price: High To Low'
                : 'Please Select'}
            </Text>
            <DropdownGreen />
          </View>
        </MaterialMenu>
      </View>
    );
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
            onApplyFilter(discount, price, sortBy, categoryIds.filter((i) => i));
          }}
        />
      </View>
    );
  };

  return (
    <Overlay
      onRequestClose={() => props.onClose()}
      overlayStyle={{
        padding: 0,
        margin: 0,
        backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
      }}
      fullScreen
      isVisible={props.isVisible}
    >
      <View style={theme.viewStyles.container}>
        <SafeAreaView
          style={{
            backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            flex: 1,
          }}
        >
          {renderHeader()}
          <ScrollView bounces={false}>
            {renderCategories()}
            {renderDiscount()}
            {renderPrice()}
            {renderSortBy()}
          </ScrollView>
          {renderApplyFilterButton()}
        </SafeAreaView>
      </View>
    </Overlay>
  );
};

interface InputFieldProps {
  fromPlaceholder: string;
  toPlaceholder: string;
  fromValue: string;
  toValue: string;
  onFromChangeText: (text: string) => void;
  onToChangeText: (text: string) => void;
}

const InputField: React.FC<InputFieldProps> = (props) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View
        style={{
          ...theme.viewStyles.card(0, 0),
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#fff',
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
            value={props.fromValue}
            onChangeText={(text) => props.onFromChangeText(text)}
            placeholder={props.fromPlaceholder}
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
          ...theme.viewStyles.card(0, 0),
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#fff',
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
            value={props.toValue}
            onChangeText={(text) => props.onToChangeText(text)}
            placeholder={props.toPlaceholder}
            underlineColorAndroid="transparent"
            placeholderTextColor="#01475b"
            maxLength={100}
          />
        </View>
      </View>
    </View>
  );
};
