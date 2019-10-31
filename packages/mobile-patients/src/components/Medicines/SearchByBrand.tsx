import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CartIcon, SearchSendIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { SAVE_SEARCH } from '@aph/mobile-patients/src/graphql/profiles';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getProductsByCategoryApi,
  MedicineProduct,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { aphConsole, handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AxiosResponse } from 'axios';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Keyboard,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { Input } from 'react-native-elements';
import { CommonLogEvent } from '../../FunctionHelpers/DeviceHelper';

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  headerSearchInputShadow: {
    zIndex: 1,
    backgroundColor: theme.colors.WHITE,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  labelView: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff748e',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
  searchValueStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  sorryTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#890000',
    paddingVertical: 8,
    marginHorizontal: 10,
  },
});

export interface SearchByBrandProps
  extends NavigationScreenProps<{
    title: string;
    category_id: string;
  }> {}

export const SearchByBrand: React.FC<SearchByBrandProps> = (props) => {
  const category_id = props.navigation.getParam('category_id');
  const pageTitle = props.navigation.getParam('title');

  const [searchText, setSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { addCartItem, removeCartItem, updateCartItem, cartItems } = useShoppingCart();
  const { showAphAlert } = useUIElements();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  //   useEffect(() => {
  //     searchTextFromProp && onSearch(searchTextFromProp);
  //   }, []);

  useEffect(() => {
    getProductsByCategoryApi(category_id)
      .then(({ data }) => {
        console.log(data, 'getProductsByCategoryApi');
        const products = data.products || [];
        setMedicineList(products);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err, 'errr');
      })
      .finally(() => {
        // setshowSpinner(false);
      });
  }, []);

  const showGenericALert = (e: { response: AxiosResponse }) => {
    const error = e && e.response && e.response.data.message;
    aphConsole.log({ errorResponse: e.response, error }); //remove this line later
    showAphAlert!({
      title: `Uh oh.. :(`,
      description: `Something went wrong.`,
    });
  };

  const onSearch = (_searchText: string) => {
    setSearchText(_searchText);
  };

  const savePastSeacrh = (sku: string, name: string) =>
    client.mutate({
      mutation: SAVE_SEARCH,
      variables: {
        saveSearchInput: {
          type: SEARCH_TYPE.MEDICINE,
          typeId: sku,
          typeName: name,
          patient: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
      },
    });

  const onAddCartItem = ({
    sku,
    mou,
    name,
    price,
    special_price,
    is_prescription_required,
    thumbnail,
  }: MedicineProduct) => {
    addCartItem &&
      addCartItem({
        id: sku,
        mou,
        name,
        price: special_price
          ? typeof special_price == 'string'
            ? parseInt(special_price)
            : special_price
          : price,
        prescriptionRequired: is_prescription_required == '1',
        quantity: 1,
        thumbnail,
      });
  };

  const onRemoveCartItem = ({ sku }: MedicineProduct) => {
    removeCartItem && removeCartItem(sku);
  };

  const onUpdateCartItem = ({ sku }: MedicineProduct, unit: number) => {
    if (!(unit < 1)) {
      updateCartItem && updateCartItem({ id: sku, quantity: unit });
    }
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    const cartItemsCount = cartItems.length;
    return (
      <Header
        container={{ borderBottomWidth: 0 }}
        leftIcon={'backArrow'}
        title={pageTitle || 'SEARCH PRODUCTS'}
        rightComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={1}
              // style={{ marginRight: 24 }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.YourCart);
              }}
            >
              <CartIcon />
              {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
            </TouchableOpacity>
            {/* <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <Filter />
            </TouchableOpacity> */}
          </View>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const filteredMedicineList = !!searchText
    ? medicineList.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()))
    : medicineList;

  const isNoMedicinesFound =
    !isLoading && searchText.length > 0 && filteredMedicineList.length == 0;

  const renderSorryMessage = isNoMedicinesFound ? (
    <Text style={styles.sorryTextStyle}>Sorry, we couldn’t find what you are looking for :(</Text>
  ) : (
    <View style={{ paddingBottom: 19 }} />
  );

  //   const renderSearchInput = () => {
  //     return (
  //       <View style={{ paddingHorizontal: 20, backgroundColor: theme.colors.WHITE }}>
  //         <TextInputComponent
  //           conatinerstyles={{ paddingBottom: 0 }}
  //           inputStyle={[
  //             styles.searchValueStyle,
  //             isNoMedicinesFound ? { borderBottomColor: '#e50000' } : {},
  //           ]}
  //           textInputprops={{
  //             ...(isNoMedicinesFound ? { selectionColor: '#e50000' } : {}),
  //             autoFocus: true,
  //           }}
  //           value={searchText}
  //           placeholder="Search medicine and more"
  //           underlineColorAndroid="transparent"
  //           onChangeText={(value) => {
  //             onSearch(value);
  //           }}
  //         />
  //         {renderSorryMessage}
  //       </View>
  //     );
  //   };

  const renderSearchInput = () => {
    const styles = StyleSheet.create({
      inputStyle: {
        minHeight: 29,
        ...theme.fonts.IBMPlexSansMedium(18),
      },
      inputContainerStyle: {
        borderBottomColor: '#00b38e',
        borderBottomWidth: 2,
        // marginHorizontal: 10,
      },
      rightIconContainerStyle: {
        height: 24,
      },
      style: {
        // paddingBottom: 18.5,
      },
      containerStyle: {
        // marginBottom: 19,
        // marginTop: 18,
      },
    });

    const shouldEnableSearchSend = searchText.length > 0 && medicineList.length > 0;
    const rigthIconView = (
      <TouchableOpacity
        activeOpacity={1}
        style={{
          opacity: shouldEnableSearchSend ? 1 : 0.4,
        }}
        disabled={!shouldEnableSearchSend}
        onPress={Keyboard.dismiss}
      >
        <SearchSendIcon />
      </TouchableOpacity>
    );

    return (
      <View style={{ paddingHorizontal: 10, backgroundColor: theme.colors.WHITE }}>
        <Input
          value={searchText}
          onChangeText={(value) => {
            onSearch(value);
          }}
          autoCorrect={false}
          rightIcon={rigthIconView}
          placeholder={(pageTitle && `Search ${pageTitle}`) || 'Search medicine and more'}
          selectionColor="#00b38e"
          underlineColorAndroid="transparent"
          placeholderTextColor="rgba(1,48,91, 0.4)"
          inputStyle={styles.inputStyle}
          inputContainerStyle={styles.inputContainerStyle}
          rightIconContainerStyle={styles.rightIconContainerStyle}
          style={styles.style}
          containerStyle={styles.containerStyle}
        />
        {renderSorryMessage}
      </View>
    );
  };

  const renderMedicineCard = (
    medicine: MedicineProduct,
    index: number,
    array: MedicineProduct[]
  ) => {
    const medicineCardContainerStyle = [
      { marginBottom: 8, marginHorizontal: 20 },
      index == 0 ? { marginTop: 20 } : {},
      index == array.length - 1 ? { marginBottom: 20 } : {},
    ];
    const foundMedicineInCart = cartItems.find((item) => item.id == medicine.sku);
    const price = medicine.special_price
      ? typeof medicine.special_price == 'string'
        ? parseInt(medicine.special_price)
        : medicine.special_price
      : medicine.price;

    return (
      <MedicineCard
        containerStyle={[medicineCardContainerStyle, {}]}
        onPress={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Save past Search');
          savePastSeacrh(medicine.sku, medicine.name).catch((e) => {
            handleGraphQlError(e);
          });
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: medicine.sku,
            title: medicine.name,
          });
        }}
        medicineName={medicine.name}
        imageUrl={
          medicine.thumbnail && !medicine.thumbnail.includes('/default/placeholder')
            ? `${medicine.thumbnail}`
            : ''
        }
        price={price}
        unit={(foundMedicineInCart && foundMedicineInCart.quantity) || 0}
        onPressAdd={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Add item to cart');
          onAddCartItem(medicine);
        }}
        onPressRemove={() => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Remove item from cart');
          onRemoveCartItem(medicine);
        }}
        onChangeUnit={(unit) => {
          CommonLogEvent('SEARCH_BY_BRAND', 'Change unit in cart');
          onUpdateCartItem(medicine, unit);
        }}
        isCardExpanded={!!foundMedicineInCart}
        isInStock={medicine.is_in_stock}
        packOfCount={(medicine.mou && parseInt(medicine.mou)) || undefined}
        isPrescriptionRequired={medicine.is_prescription_required == '1'}
        subscriptionStatus={'unsubscribed'}
        onChangeSubscription={() => {}}
        onEditPress={() => {}}
        onAddSubscriptionPress={() => {}}
      />
    );
  };

  const renderEmptyData = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Card
          cardContainer={{ marginTop: 0 }}
          heading={'Uh oh! :('}
          description={'No data Found!'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      </View>
    );
  };

  const renderMatchingMedicines = () => {
    return filteredMedicineList.length ? (
      <FlatList
        onScroll={() => Keyboard.dismiss()}
        data={filteredMedicineList}
        renderItem={({ item, index }) => renderMedicineCard(item, index, medicineList)}
        keyExtractor={(_, index) => `${index}`}
        bounces={false}
      />
    ) : searchText.length ? null : (
      renderEmptyData()
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <Spinner />
      ) : (
        <SafeAreaView style={styles.safeAreaViewStyle}>
          <View style={styles.headerSearchInputShadow}>
            {renderHeader()}
            {renderSearchInput()}
          </View>
          {renderMatchingMedicines()}
        </SafeAreaView>
      )}
    </View>
  );
};
