import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { searchPickupStoresApi, Store } from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { aphConsole } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { StoreDriveWayPickupView } from './StoreDriveWayPickupView';
import { StoreDriveWayPickupPopup } from './StoreDriveWayPickupPopup';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SearchSendIcon } from '../ui/Icons';

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

export interface StorePickupSceneProps extends NavigationScreenProps {
  pincode: string;
  stores: Store[];
}
{
}

export const StorePickupScene: React.FC<StorePickupSceneProps> = (props) => {
  const [storePickUpLoading, setStorePickUpLoading] = useState<boolean>(false);
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);
  const { storeId, setStoreId, pinCode, setStores, stores, setPinCode } = useShoppingCart();
  const [selectedStore, setSelectedStore] = useState<string>(storeId || '');
  const [showDriveWayPopup, setShowDriveWayPopup] = useState<boolean>(false);

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
            CommonBugFender('StorePickupScene_searchPickupStoresApi', e);
            aphConsole.log({ e });
            setStorePickUpLoading(false);
          });
      } else {
        setStoreId && setStoreId('');
        setSelectedStore('');
        setStores && setStores([]);
      }
    }
  };

  const renderBottomButton = () => {
    const foundStoreIdIndex = stores.findIndex(({ storeid }) => storeid == selectedStore);
    return (
      <View style={styles.bottonButtonContainer}>
        <Button
          disabled={!(foundStoreIdIndex > -1)}
          title="DONE"
          onPress={() => {
            setStoreId && setStoreId(selectedStore);
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
            setStores!([]);
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
          value={pinCode}
          onChangeText={(pincode) => fetchStorePickup(pincode)}
          maxLength={6}
          textInputprops={{
            ...(!isValidPinCode(pinCode) ? { selectionColor: '#e50000' } : {}),
            autoFocus: true,
          }}
          inputStyle={[
            styles.inputStyle,
            !isValidPinCode(pinCode) ? { borderBottomColor: '#e50000' } : {},
          ]}
          conatinerstyles={{ paddingBottom: 0 }}
          placeholder={'Enter pin code'}
          autoCorrect={false}
          icon={rightIconView()}
        />
        {storePickUpLoading && (
          <ActivityIndicator color="green" size="large" style={{ marginTop: 24 }} />
        )}
        {!storePickUpLoading && pinCode.length == 6 && stores.length == 0 && (
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
      !!stores.length &&
      !!selectedStore && <StoreDriveWayPickupView onPress={() => setShowDriveWayPopup(true)} />
    );
  };

  const renderCardTitle = () => {
    if (!storePickUpLoading && pinCode.length == 6 && stores.length > 0) {
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
        data={stores || []}
        renderItem={({ item, index }) => (
          <RadioSelectionItem
            key={item.storeid}
            title={`${item.storename}\n${item.address}`}
            isSelected={selectedStore === item.storeid}
            onPress={() => {
              CommonLogEvent('STORE_PICKUP_SCENE', `Selected store Id is ${item.storeid}`);
              setSelectedStore(item.storeid);
              // setShowDriveWayPopup(true);
            }}
            containerStyle={{
              marginTop: 16,
            }}
            hideSeparator={index == stores.length - 1}
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
          {renderCardTitle()}
          {renderRadioButtonList()}
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
      {showDriveWayPopup && !!selectedStore && (
        <StoreDriveWayPickupPopup
          store={stores.find((item) => item.storeid == selectedStore)!}
          onPressOkGotIt={() => setShowDriveWayPopup(false)}
        />
      )}
    </View>
  );
};
