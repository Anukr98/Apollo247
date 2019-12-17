import { NavigationScreenProps } from 'react-navigation';
import { useShoppingCart } from '../ShoppingCartProvider';
import { TabsComponent } from '../ui/TabsComponent';
import { theme } from '../../theme/theme';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TextInputComponent } from '../ui/TextInputComponent';
import { searchPickupStoresApi, pinCodeServiceabilityApi } from '../../helpers/apiCalls';
import { RadioSelectionItem } from './RadioSelectionItem';
import { AppRoutes } from '../NavigatorContainer';
import { savePatientAddress_savePatientAddress_patientAddress } from '../../graphql/types/savePatientAddress';
import { useUIElements } from '../UIElementsProvider';
import { aphConsole, handleGraphQlError } from '../../helpers/helperFunctions';
import React, { useState } from 'react';

const styles = StyleSheet.create({
  yellowTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    padding: 16,
  },
  rowSpaceBetweenStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export interface StorePickupOrAddressSelectionViewProps extends NavigationScreenProps<{}> {}

export const StorePickupOrAddressSelectionView: React.FC<StorePickupOrAddressSelectionViewProps> = (
  props
) => {
  const {
    addresses,
    setDeliveryAddressId,
    deliveryAddressId,
    storeId,
    setStoreId,
    pinCode,
    setPinCode,
    stores,
    setStores,
  } = useShoppingCart();
  const { showAphAlert, setLoading } = useUIElements();

  const tabs = [{ title: 'Home Delivery' }, { title: 'Store Pick Up' }];
  const [selectedTab, setselectedTab] = useState<string>(storeId ? tabs[1].title : tabs[0].title);

  const [storePickUpLoading, setStorePickUpLoading] = useState<boolean>(false);
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);

  const fetchStorePickup = (pincode: string) => {
    if (isValidPinCode(pincode)) {
      setPinCode && setPinCode(pincode);
      if (pincode.length == 6) {
        setStorePickUpLoading(true);
        searchPickupStoresApi(pincode)
          .then(({ data: { Stores, stores_count } }) => {
            setStorePickUpLoading(false);
            setStores && setStores(stores_count > 0 ? Stores : []);
          })
          .catch((e) => {
            setStorePickUpLoading(false);
          });
      } else {
        setStores && setStores([]);
        setStoreId && setStoreId('');
      }
    }
  };

  const [checkingServicability, setCheckingServicability] = useState(false);

  const checkServicability = (address: savePatientAddress_savePatientAddress_patientAddress) => {
    setCheckingServicability(true);
    pinCodeServiceabilityApi(address.zipcode!)
      .then(({ data: { Availability } }) => {
        setCheckingServicability(false);
        if (Availability) {
          setDeliveryAddressId && setDeliveryAddressId(address.id);
        } else {
          showAphAlert!({
            title: 'Uh oh.. :(',
            description:
              'Sorry! We’re working hard to get to this area! In the meantime, you can either pick up from a nearby store, or change the pincode.',
          });
        }
      })
      .catch((e) => {
        aphConsole.log({ e });
        setCheckingServicability(false);
        handleGraphQlError(e);
      });
  };

  const renderStorePickup = () => {
    const selectedStoreIndex = stores.findIndex(({ storeid }) => storeid == storeId);
    const storesLength = stores.length;
    const spliceStartIndex =
      selectedStoreIndex == storesLength - 1 ? selectedStoreIndex - 1 : selectedStoreIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;
    const slicedStoreList = [...stores].slice(startIndex, startIndex + 2);

    return (
      <View style={{ margin: 16, marginTop: 20 }}>
        <TextInputComponent
          value={`${pinCode}`}
          maxLength={6}
          onChangeText={(pincode) => fetchStorePickup(pincode)}
          placeholder={'Enter Pincode'}
        />
        {storePickUpLoading && <ActivityIndicator color="green" size="large" />}
        {!storePickUpLoading && pinCode.length == 6 && stores.length == 0 && (
          <Text
            style={{
              paddingTop: 10,
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              color: '#0087ba',
            }}
          >
            Sorry! We’re working hard to get to this area! In the meantime, you can either pick up
            from a nearby store, or change the pincode.
          </Text>
        )}

        {slicedStoreList.map((store, index, array) => (
          <RadioSelectionItem
            key={store.storeid}
            title={`${store.storename}\n${store.address}`}
            isSelected={storeId === store.storeid}
            onPress={() => {
              setStoreId && setStoreId(store.storeid);
            }}
            containerStyle={{ marginTop: 16 }}
            hideSeparator={index == array.length - 1}
          />
        ))}
        <View>
          {stores.length > 2 && (
            <Text
              style={{ ...styles.yellowTextStyle, textAlign: 'right' }}
              onPress={() =>
                props.navigation.navigate(AppRoutes.StorPickupScene, {
                  pincode: pinCode,
                  stores: stores,
                })
              }
            >
              VIEW ALL
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderHomeDelivery = () => {
    const selectedAddressIndex = addresses.findIndex((address) => address.id == deliveryAddressId);
    const addressListLength = addresses.length;
    const spliceStartIndex =
      selectedAddressIndex == addressListLength - 1
        ? selectedAddressIndex - 1
        : selectedAddressIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;

    return (
      <View
        style={{ marginTop: 8, marginHorizontal: 16 }}
        pointerEvents={checkingServicability ? 'none' : 'auto'}
      >
        {checkingServicability ? (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              alignSelf: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="large" color="green" />
          </View>
        ) : null}
        {addresses.slice(startIndex, startIndex + 2).map((item, index, array) => {
          return (
            <RadioSelectionItem
              key={item.id}
              title={`${item.addressLine1}, ${item.addressLine2}\n${item.landmark}${
                item.landmark ? ',\n' : ''
              }${item.city}, ${item.state} - ${item.zipcode}`}
              isSelected={deliveryAddressId == item.id}
              onPress={() => {
                checkServicability(item);
              }}
              containerStyle={{ marginTop: 16 }}
              hideSeparator={index + 1 === array.length}
            />
          );
        })}
        <View style={styles.rowSpaceBetweenStyle}>
          <Text
            style={styles.yellowTextStyle}
            onPress={() => props.navigation.navigate(AppRoutes.AddAddress)}
          >
            ADD NEW ADDRESS
          </Text>
          <View>
            {addresses.length > 2 && (
              <Text
                style={styles.yellowTextStyle}
                onPress={() => props.navigation.navigate(AppRoutes.SelectDeliveryAddress)}
              >
                VIEW ALL
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderDelivery = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          marginHorizontal: 20,
          marginTop: 16,
          marginBottom: 24,
        }}
      >
        <TabsComponent
          style={{
            borderRadius: 0,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: 'rgba(2, 71, 91, 0.2)',
          }}
          data={tabs}
          onChange={(selectedTab: string) => {
            setselectedTab(selectedTab);
          }}
          selectedTab={selectedTab}
        />
        {selectedTab === tabs[0].title ? renderHomeDelivery() : renderStorePickup()}
      </View>
    );
  };

  return <>{renderDelivery()}</>;
};
