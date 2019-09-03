import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { searchPickupStoresApi, Store } from '../../helpers/apiCalls';
import { useShoppingCart } from '../ShoppingCartProvider';

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
    padding: 16,
  },
});

export interface StorePickupSceneProps extends NavigationScreenProps {
  pincode: string;
  stores: Store[];
}
{
}

export const StorePickupScene: React.FC<StorePickupSceneProps> = (props) => {
  const [storePinCode, setStorePinCode] = useState<string>('');
  const [storePickUpList, setStorePickUpList] = useState<Store[]>([]);
  const [storePickUpLoading, setStorePickUpLoading] = useState<boolean>(false);
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);
  const { storeId, setStoreId } = useShoppingCart();
  const pincode = props.navigation.getParam('pincode');
  const stores = props.navigation.getParam('stores');

  useEffect(() => {
    pincode && setStorePinCode(pincode);
    stores && setStorePickUpList(stores);
  }, []);

  const fetchStorePickup = (pincode: string) => {
    if (isValidPinCode(pincode)) {
      setStorePinCode(pincode);
      if (pincode.length == 6) {
        setStorePickUpLoading(true);
        searchPickupStoresApi(pincode)
          .then(({ data: { Stores, stores_count } }) => {
            setStorePickUpLoading(false);
            setStorePickUpList(stores_count > 0 ? Stores : []);
          })
          .catch((e) => {
            console.log({ e });
            setStorePickUpLoading(false);
          });
      } else {
        setStorePickUpList([]);
      }
    }
  };

  const renderBottomButton = () => {
    const foundStoreIdIndex = storePickUpList.findIndex(({ storeid }) => storeid == storeId);
    return (
      <View style={styles.bottonButtonContainer}>
        <Button
          disabled={!(foundStoreIdIndex > -1)}
          title="DONE"
          onPress={() => props.navigation.goBack()}
        />
      </View>
    );
  };

  const renderInputWithValidation = () => {
    return (
      <View style={{ paddingBottom: 24 }}>
        <TextInputComponent
          value={storePinCode}
          onChangeText={(pincode) => fetchStorePickup(pincode)}
          maxLength={6}
          textInputprops={{
            ...(!isValidPinCode(storePinCode) ? { selectionColor: '#e50000' } : {}),
            autoFocus: true,
          }}
          inputStyle={[
            styles.inputStyle,
            !isValidPinCode(storePinCode) ? { borderBottomColor: '#e50000' } : {},
          ]}
          conatinerstyles={{ paddingBottom: 0 }}
          placeholder={'Enter pin code'}
          autoCorrect={false}
        />
        {storePickUpLoading && <ActivityIndicator color="green" size="large" />}
        {!storePickUpLoading && storePinCode.length == 6 && storePickUpList.length == 0 && (
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

        {!isValidPinCode(storePinCode) ? (
          <Text style={styles.inputValidationStyle}>{'Invalid Pincode'}</Text>
        ) : null}
      </View>
    );
  };

  const renderCardTitle = () => {
    if (!storePickUpLoading && storePinCode.length == 6 && storePickUpList.length > 0) {
      return (
        <>
          <Text style={styles.heading}>{'Stores In This Region'}</Text>
          <View style={styles.separator} />
        </>
      );
    }
  };

  const renderRadioButtonList = () => {
    return storePickUpList.map((store, index, array) => (
      <RadioSelectionItem
        key={store.storeid}
        title={`${store.storename}\n${store.address}`}
        isSelected={storeId === store.storeid}
        onPress={() => {
          setStoreId && setStoreId(store.storeid);
        }}
        containerStyle={{
          marginTop: 16,
        }}
        hideSeparator={index == array.length - 1}
      />
    ));
  };

  const renderStorePickupCard = () => {
    return (
      <View style={styles.cardStyle}>
        {renderInputWithValidation()}
        {renderCardTitle()}
        {renderRadioButtonList()}
      </View>
    );
  };

  return (
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
  );
};
