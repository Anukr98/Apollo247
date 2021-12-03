import React, { useEffect, useRef, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { View, SafeAreaView, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  g,
  doRequestAndAccessLocationModified,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  searchPickupStoresApi,
  Store,
  GetStoreInventoryResponse,
  getStoreInventoryApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { StoreDriveWayPickupPopup } from '@aph/mobile-patients/src/components/MedicineCart/Components/StoreDriveWayPickupPopup';
import { StorePickupCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/StorePickupCard';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  postPharmacyStorePickupViewed,
  postPharmacyStoreSelectedSuccess,
} from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { saveCart_saveCart_data_medicineOrderCartLineItems } from '@aph/mobile-patients/src/graphql/types/saveCart';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { InputCartLineItems } from '@aph/mobile-patients/src/graphql/types/globalTypes';
export interface StorePickupProps extends NavigationScreenProps {}

export const StorePickup: React.FC<StorePickupProps> = (props) => {
  const {
    pinCode,
    setPinCode,
    setStoreId,
    setStores,
    storeId,
    stores: storesFromContext,
    storesInventory,
    setStoresInventory,
    serverCartItems,
    addresses,
    deliveryAddressId,
  } = useShoppingCart();
  const { setUserActionPayload } = useServerCart();
  const { locationDetails, pharmacyLocation } = useAppCommonData();

  const [loading, setloading] = useState<boolean>(false);
  const [showDriveWayPopup, setShowDriveWayPopup] = useState<boolean>(false);
  const selectedStore =
    (storeId && storesFromContext.find((item) => item.storeid == storeId)) || undefined;
  const selectedAddress = addresses.find((item) => item.id == deliveryAddressId);
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);
  const pharmacyPincode =
    selectedAddress?.zipcode || pharmacyLocation?.pincode || locationDetails?.pincode || pinCode;
  const [zipcode, setzipcode] = useState<string>(pharmacyPincode);

  useEffect(() => {
    setStoreId!('');
    if (pharmacyPincode) {
      fetchPickupStores(pharmacyPincode);
    } else {
      doRequestAndAccessLocationModified()
        .then((response) => {
          if (response) {
            fetchPickupStores(response.pincode || '');
          }
        })
        .catch((e) => {
          CommonBugFender('StorePickup_getPlaceInfoByLatLng', e);
        });
    }
  }, []);

  useEffect(() => {
    if (storeId && storesInventory.length && serverCartItems.length) {
      SyncwithStorePrices();
    }
  }, [storeId]);

  const getStoresInventory = (
    storeIds: string[],
    serverCartItems: saveCart_saveCart_data_medicineOrderCartLineItems[]
  ) =>
    Promise.all(
      storeIds.map((storeId) =>
        getStoreInventoryApi(
          storeId,
          serverCartItems?.map((item) => item?.sku)
        )
      )
    );

  async function fetchPickupStores(pincode: string) {
    if (isValidPinCode(pincode)) {
      setPinCode!(pincode);
      setzipcode(pincode);
      if (pincode.length == 6) {
        setloading!(true);
        try {
          const response = await searchPickupStoresApi(pincode);
          const { data } = response;
          const { Stores } = data;
          fetchStoresInventory(Stores);
        } catch (error) {
          setloading(false);
        }
      } else {
        setStores!([]);
        setStoresInventory!([]);
        setStoreId!('');
      }
    }
  }

  async function fetchStoresInventory(Stores: Store[]) {
    const response = await getStoresInventory(
      Stores.map((s) => s.storeid),
      serverCartItems
    );
    const storesInventory = response.map((item) => item.data);
    const storesWithInventory = storesInventory.filter((item) => {
      const storeItems = g(item, 'itemDetails');
      return storeItems && areItemsAvailableInStore(storeItems);
    });
    const storeIdsWithInventory = storesWithInventory.map((item) => item.shopId);
    const filteredStores = Stores.filter((item) => storeIdsWithInventory.includes(item.storeid));
    setStoresInventory!(storesInventory);
    setStores!(filteredStores);
    setStoreId!('');
    setloading(false);
    postPharmacyStorePickupViewed({
      Pincode: zipcode,
      'Store display success': filteredStores.length ? 'Yes' : 'No',
    });
  }

  const areItemsAvailableInStore = (storeItems: GetStoreInventoryResponse['itemDetails']) => {
    const isInventoryAvailable = (cartItem: saveCart_saveCart_data_medicineOrderCartLineItems) =>
      !!storeItems?.find((item) => item?.itemId == cartItem?.sku && item.qty >= cartItem?.quantity);
    return !serverCartItems?.find((item) => !isInventoryAvailable(item));
  };

  const SyncwithStorePrices = () => {
    let Items: InputCartLineItems[] = [];
    serverCartItems.forEach((item) => {
      // let object = item;
      let inventoryData = storesInventory.filter((item) => item.shopId == storeId);
      let cartItem = inventoryData?.[0]?.['itemDetails']?.filter(
        (cartItem) => cartItem?.itemId == item?.sku
      );
      let cartItemToAdd: InputCartLineItems = {
        medicineSKU: cartItem?.[0]?.itemId,
        quantity: cartItem?.[0]?.qty,
      };
      // if (cartItem.length) {
      //   if (object?.price != Number(object?.mou) * cartItem?.[0]?.mrp && cartItem?.[0]?.mrp != 0) {
      //     object?.sellingPrice &&
      //       (object?.sellingPrice =
      //         Number(object?.mou) * cartItem?.[0]?.mrp * (object?.sellingPrice / object?.price));
      //     object?.price = Number(object?.mou) * cartItem?.[0]?.mrp;
      //   }
      // }
      Items.push(cartItemToAdd);
    });
    setUserActionPayload({
      medicineOrderCartLineItems: {
        Items,
      },
    });
    postPharmacyStoreSelectedSuccess(pinCode, selectedStore!);
  };

  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={'STORE PICK UP'}
        onPressLeftIcon={() => {
          props.navigation.goBack();
          setStoreId!('');
        }}
      />
    );
  };

  const renderStorePickup = () => {
    return (
      <StorePickupCard
        pincode={zipcode}
        onChangePincode={(pincode) => {
          setzipcode(pincode);
          fetchPickupStores(pincode);
          setStores!([]);
          setStoreId!('');
        }}
        onPressKnowMore={() => setShowDriveWayPopup(true)}
        onPressRightIcon={() => fetchPickupStores(zipcode)}
        loading={loading}
        onSelectStore={(storeID) => {
          setStoreId!(storeID);
          setShowDriveWayPopup(true);
        }}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
          {renderHeader()}
          {renderStorePickup()}
        </ScrollView>
        {showDriveWayPopup && (
          <StoreDriveWayPickupPopup
            store={selectedStore}
            onPressOkGotIt={() => {
              setShowDriveWayPopup(false);
              selectedStore && props.navigation.navigate(AppRoutes.PickUpCartSummary, {});
            }}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  card: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    paddingTop: 20,
  },
});
