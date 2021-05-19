import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import {
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  searchPickupStoresApi,
  Store,
  GetStoreInventoryResponse,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { aphConsole, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { StoreDriveWayPickupView } from './StoreDriveWayPickupView';
import { StoreDriveWayPickupPopup } from './StoreDriveWayPickupPopup';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SearchSendIcon } from '../ui/Icons';
import { useUIElements } from '../UIElementsProvider';

const styles = StyleSheet.create({
  bottonButtonContainer: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
    width: '66%',
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
  },
  heading: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    marginBottom: 8,
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginBottom: 16,
  },
  inputValidationStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: theme.colors.INPUT_FAILURE_TEXT,
    paddingTop: 8,
    letterSpacing: 0.04,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    margin: 20,
    paddingTop: 16,
  },
});

export interface StorePickupSceneProps
  extends NavigationScreenProps<{
    fetchStores?: (pincode: string, globalLoading?: boolean | undefined) => void;
    pincode: string;
    stores: Store[];
  }> {}

export const StorePickupScene: React.FC<StorePickupSceneProps> = (props) => {
  const fetchStores = props.navigation.getParam('fetchStores');
  const storesFromProp = props.navigation.getParam('stores');
  const [storePickUpLoading, setStorePickUpLoading] = useState<boolean>(false);
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);
  const {
    storeId,
    setStoreId,
    pinCode,
    setStores,
    stores,
    setPinCode,
    storesInventory,
    cartItems,
  } = useShoppingCart();
  const { loading: globalLoading } = useUIElements();
  const [_pinCode, _setPinCode] = useState(pinCode);
  const [_stores, _setStores] = useState<Store[]>(storesFromProp);
  const [selectedStore, setSelectedStore] = useState<string>(storeId || '');
  const [showDriveWayPopup, setShowDriveWayPopup] = useState<boolean>(false);

  const areItemsAvailableInStore = (
    storeItems: GetStoreInventoryResponse['itemDetails'],
    cartItems: ShoppingCartItem[]
  ) => {
    const isInventoryAvailable = (cartItem: ShoppingCartItem) =>
      !!storeItems.find((item) => item.itemId == cartItem.id && item.qty >= cartItem.quantity);

    return !cartItems.find((item) => !isInventoryAvailable(item));
  };

  const getStores = (
    storeItemsInventory: GetStoreInventoryResponse[],
    stores: Store[],
    cartItems: ShoppingCartItem[]
  ) => {
    const storesWithInventory = storeItemsInventory.filter((item) => {
      const storeItems = g(item, 'itemDetails');
      return storeItems && areItemsAvailableInStore(storeItems, cartItems);
    });
    const storeIdsWithInventory = storesWithInventory.map((item) => item.shopId);
    const storesWithFullInventory = stores.filter((item) =>
      storeIdsWithInventory.includes(item.storeid)
    );
    return storesWithFullInventory;
  };

  useEffect(() => {
    _setPinCode(pinCode);
    _pinCode.length == 6 && _setStores(getStores(storesInventory, stores, cartItems));
  }, [pinCode, stores, storesInventory]);

  const fetchStorePickup = (pincode: string) => {
    if (isValidPinCode(pincode)) {
      setPinCode && setPinCode(pincode);
      _setPinCode(pincode);
      if (pincode.length == 6) {
        if (fetchStores) {
          fetchStores(pincode, true);
          return;
        }
        setStorePickUpLoading(true);
        searchPickupStoresApi(pincode)
          .then(({ data: { Stores, stores_count } }) => {
            setStorePickUpLoading(false);
            _setStores(stores_count > 0 ? Stores : []);
          })
          .catch((e) => {
            CommonBugFender('StorePickupScene_searchPickupStoresApi', e);
            aphConsole.log({ e });
            setStorePickUpLoading(false);
          });
      } else {
        setStoreId && setStoreId('');
        setSelectedStore('');
        _setStores([]);
      }
    }
  };

  const renderBottomButton = () => {
    const foundStoreIdIndex = _stores.findIndex(({ storeid }) => storeid == selectedStore);
    return (
      <View style={styles.bottonButtonContainer}>
        <Button
          disabled={!(foundStoreIdIndex > -1)}
          title="DONE"
          onPress={() => {
            setStoreId && setStoreId(selectedStore);
            setStores!(_stores);
            props.navigation.goBack();
          }}
        />
      </View>
    );
  };

  const rightIconView = () => {
    return (
      <View style={{ opacity: pinCode.length == 6 ? 1 : 0.5 }}>
        <TouchableOpacity
          activeOpacity={1}
          disabled={pinCode.length != 6}
          onPress={() => {
            _setStores([]);
            fetchStorePickup(pinCode);
          }}
        >
          <SearchSendIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderInputWithValidation = () => {
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <TextInputComponent
          value={_pinCode}
          onChangeText={(pincode) => fetchStorePickup(pincode)}
          maxLength={6}
          textInputprops={{
            ...(!isValidPinCode(_pinCode) ? { selectionColor: '#e50000' } : {}),
            autoFocus: true,
          }}
          inputStyle={[
            styles.inputStyle,
            !isValidPinCode(_pinCode) ? { borderBottomColor: '#e50000' } : {},
          ]}
          conatinerstyles={{ paddingBottom: 0 }}
          placeholder={'Enter pin code'}
          autoCorrect={false}
          icon={rightIconView()}
        />
        {storePickUpLoading && (
          <ActivityIndicator color="green" size="large" style={{ marginTop: 24 }} />
        )}
        {!storePickUpLoading && _pinCode.length == 6 && _stores.length == 0 && (
          <Text
            style={{
              paddingTop: 24,
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              color: '#0087ba',
            }}
          >
            Sorry! We’re working hard to get to this area! In the meantime, you can either pick up
            from a nearby store, or change the pincode.
          </Text>
        )}

        {!isValidPinCode(pinCode) ? (
          <Text style={styles.inputValidationStyle}>{'Invalid Pincode'}</Text>
        ) : null}
      </View>
    );
  };

  const renderStoreDriveWayPickupView = () => {
    return (
      !!_stores.length && <StoreDriveWayPickupView onPress={() => setShowDriveWayPopup(true)} />
    );
  };

  const renderCardTitle = () => {
    if (!storePickUpLoading && _pinCode.length == 6 && _stores.length > 0) {
      return (
        <>
          <Text style={styles.heading}>{'Stores In This Region'}</Text>
          <View style={styles.separator} />
        </>
      );
    }
  };

  const renderRadioButtonList = () => {
    return (
      <FlatList
        bounces={false}
        data={_stores || []}
        extraData={globalLoading}
        renderItem={({ item, index }) => (
          <RadioSelectionItem
            key={item.storeid}
            title={`${item.storename}\n${item.address}`}
            isSelected={selectedStore === item.storeid}
            onPress={() => {
              CommonLogEvent('STORE_PICKUP_SCENE', `Selected store Id is ${item.storeid}`);
              setSelectedStore(item.storeid);
            }}
            containerStyle={{
              marginTop: 16,
            }}
            hideSeparator={index == _stores.length - 1}
          />
        )}
      />
    );
  };

  const renderStorePickupCard = () => {
    return (
      <View style={styles.cardStyle}>
        {renderInputWithValidation()}
        {renderStoreDriveWayPickupView()}
        <View style={{ padding: 16, paddingTop: 29 }}>
          {!globalLoading && (
            <>
              {renderCardTitle()}
              {renderRadioButtonList()}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'STORE PICK UP'}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false}>{renderStorePickupCard()}</ScrollView>
        {renderBottomButton()}
      </SafeAreaView>
      {!!showDriveWayPopup && (
        <StoreDriveWayPickupPopup
          store={_stores.find((item) => item.storeid == selectedStore)!}
          onPressOkGotIt={() => setShowDriveWayPopup(false)}
        />
      )}
    </View>
  );
};
