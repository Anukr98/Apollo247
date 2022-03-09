import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { StoreDriveWayPickupView } from '@aph/mobile-patients/src/components/Medicines/StoreDriveWayPickupView';
import { SearchSendIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { Store } from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

export interface StorePickupCardProps {
  pincode: string;
  onChangePincode: (pincode: string) => void;
  onPressKnowMore: () => void;
  onPressRightIcon: () => void;
  onSelectStore: (storeID: string) => void;
  loading: boolean;
}

export const StorePickupCard: React.FC<StorePickupCardProps> = (props) => {
  const {
    pincode,
    onChangePincode,
    onPressKnowMore,
    onPressRightIcon,
    loading,
    onSelectStore,
  } = props;
  const { storeId, stores, setStoreId } = useShoppingCart();
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);

  const rightIcon = () => {
    return (
      <View style={{ opacity: isValidPinCode(pincode) && pincode.length == 6 ? 1 : 0.5 }}>
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={pincode.length != 6}
          onPress={onPressRightIcon}
        >
          <SearchSendIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPincodeInput = () => {
    return (
      <View style={{ marginHorizontal: 15 }}>
        <TextInputComponent
          value={`${pincode}`}
          maxLength={6}
          onChangeText={(pincode) => onChangePincode(pincode)}
          placeholder={'Enter Pincode'}
          icon={rightIcon()}
        />
      </View>
    );
  };

  const store = (store: Store) => {
    return (
      <RadioSelectionItem
        key={store.storeid}
        title={`${store.storename}\n${store.address}`}
        isSelected={storeId === store.storeid}
        onPress={() => onSelectStore(store.storeid)}
        containerStyle={{ marginTop: 16 }}
      />
    );
  };

  const renderSeperator = () => {
    return <View style={styles.seperator}></View>;
  };

  const renderStores = () => {
    return (
      <View style={{ marginHorizontal: 15, marginTop: 30 }}>
        <Text style={styles.storesHeader}>{'Stores In This Region'}</Text>
        {renderSeperator()}
        {!loading ? (
          stores.length ? (
            stores.map((item) => {
              return store(item);
            })
          ) : (
            <Text style={styles.noStoreMsg}>{string.medicine_cart.PickupStoreUnavailable}</Text>
          )
        ) : (
          <ActivityIndicator
            style={{ marginTop: 25 }}
            animating={true}
            size="large"
            color="green"
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <ScrollView>
        {renderPincodeInput()}
        <StoreDriveWayPickupView onPress={onPressKnowMore} />
        {renderStores()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 20,
  },
  storesHeader: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#02475B',
    paddingBottom: 8,
  },
  noStoreMsg: {
    paddingTop: 10,
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    color: '#0087ba',
  },
  seperator: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.4)',
  },
});
