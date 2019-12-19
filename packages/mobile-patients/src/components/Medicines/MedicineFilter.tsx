import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { DropdownGreen, Reload } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { SectionHeaderComponent } from '@aph/mobile-patients/src/components/ui/SectionHeader';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
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
  // const discountarray = [{ from: 0, to: 20 }, { from: 20, to: 40 }, { from: 40, to: undefined }];
  // const priceArray = [{ from: 0, to: 250 }, { from: 250, to: 500 }, { from: 500, to: undefined }];
  const [discount, setdiscount] = useState<FilterRange>({
    from: 0,
    to: 100,
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
              setdiscount({ from: 0, to: 100 });
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

  const getDiscount = (text: string) => {
    return text && !isNaN(parseInt(text)) ? parseInt(text) : undefined;
  };
  // const renderButton = (item: { from: number; to: number | undefined }, isDiscount: boolean) => {
  //   return (
  //     <Button
  //       style={[styles.buttonStyle, true ? { backgroundColor: theme.colors.APP_GREEN } : null]}
  //       titleTextStyle={[styles.buttonTextStyle, true ? { color: theme.colors.WHITE } : null]}
  //       title={item.from}
  //     />
  //   );
  // };
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
        {/* <View style={styles.optionsView}>
          {discountarray.map((item) => {
            return renderButton(item, true);
          })}
        </View> */}
        <InputField
          maxLength={3}
          fromPlaceholder={'Discount'}
          toPlaceholder={'Discount'}
          fromValue={`${discount.from == undefined ? '' : discount.from}`}
          toValue={`${discount.to == undefined ? '' : discount.to}`}
          onFromChangeText={(text) => {
            setdiscount({
              ...discount,
              from: getDiscount(text),
            });
          }}
          onToChangeText={(text) => {
            setdiscount({
              ...discount,
              to: getDiscount(text),
            });
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
            setprice({
              ...price,
              from: text && !isNaN(parseInt(text)) ? parseInt(text) : undefined,
            });
          }}
          onToChangeText={(text) => {
            setprice({ ...price, to: text && !isNaN(parseInt(text)) ? parseInt(text) : undefined });
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
          marginBottom: 20,
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

  const validateAndApplyFilter = () => {
    if (typeof discount.from == 'number' && discount.to == undefined) {
      Alert.alert('Uh oh.. :(', `Please provide maximum discount value.`);
      return;
    } else if (typeof discount.to == 'number' && discount.from == undefined) {
      Alert.alert('Uh oh.. :(', `Please provide minimum discount value.`);
      return;
    } else if (
      typeof discount.to == 'number' &&
      typeof discount.from == 'number' &&
      (discount.from > 100 || discount.to > 100)
    ) {
      Alert.alert('Uh oh.. :(', `Discount cannot be more than 100.`);
      return;
    }
    onApplyFilter(discount, price, sortBy, categoryIds.filter((i) => i));
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
          onPress={validateAndApplyFilter}
        />
      </View>
    );
  };
  const keyboardVerticalOffset = Platform.OS === 'android' ? { keyboardVerticalOffset: 0 } : {};

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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
            {...keyboardVerticalOffset}
          >
            <ScrollView bounces={false}>
              {renderCategories()}
              {renderDiscount()}
              {renderPrice()}
              {renderSortBy()}
            </ScrollView>
            {renderApplyFilterButton()}
          </KeyboardAvoidingView>
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
  maxLength?: number;
  onFromChangeText: (text: string) => void;
  onToChangeText: (text: string) => void;
}

const InputField: React.FC<InputFieldProps> = (props) => {
  return (
    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
      <View
        style={{
          flex: 1,
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
            width: '82.85%',
            height: 48,
          }}
        >
          <TextInputComponent
            value={props.fromValue}
            onChangeText={(text) => props.onFromChangeText(text)}
            placeholder={props.fromPlaceholder}
            underlineColorAndroid="transparent"
            placeholderTextColor="#01475b"
            keyboardType="numeric"
            maxLength={props.maxLength || 100}
          />
        </View>
      </View>
      <Text
        style={{
          textAlign: 'center',
          ...theme.fonts.IBMPlexSansSemiBold(13),
          letterSpacing: 0.5,
          justifyContent: 'center',
          marginTop: 15,
          marginHorizontal: 11,
          color: '#01475b',
        }}
      >
        TO
      </Text>
      <View
        style={{
          flex: 1,
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
            width: '82.85%',
            height: 48,
          }}
        >
          <TextInputComponent
            value={props.toValue}
            onChangeText={(text) => props.onToChangeText(text)}
            placeholder={props.toPlaceholder}
            underlineColorAndroid="transparent"
            placeholderTextColor="#01475b"
            keyboardType="numeric"
            maxLength={props.maxLength || 100}
          />
        </View>
      </View>
    </View>
  );
};
