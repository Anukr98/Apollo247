import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DriveWayIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { searchPickupStoresApi } from '@aph/mobile-patients/src/helpers/apiCalls';

export interface KerbSidePickupProps {
  onPressProceed: () => void;
}

export const KerbSidePickup: React.FC<KerbSidePickupProps> = (props) => {
  const { onPressProceed } = props;
  const { serverCartItems, cartLocationDetails } = useShoppingCart();
  const [showStorePickupCard, setshowStorePickupCard] = useState<boolean>(true);

  useEffect(() => {
    if (cartLocationDetails?.pincode) fetchPickupStores(cartLocationDetails?.pincode);
  }, []);

  async function fetchPickupStores(pincode: string) {
    if (pincode.length == 6) {
      try {
        const response = await searchPickupStoresApi(pincode);
        const { data } = response;
        const { stores_count } = data;
        if (stores_count) {
          setshowStorePickupCard(true);
        } else {
          setshowStorePickupCard(false);
        }
      } catch (error) {}
    }
  }

  const renderText = () => {
    return (
      <View style={{ flex: 0.6, marginLeft: 15 }}>
        <Text style={styles.kerbSide}>KERB-SIDE PICKUP</Text>
        <Text style={styles.launched}>Newly Launched</Text>
        <Text style={styles.message}>
          Place order here & drive to your Apollo Pharmacy store near you. Our staff will bring your
          medicines out to your car
        </Text>
      </View>
    );
  };

  const renderImage = () => {
    return (
      <View style={{ flex: 0.4, alignItems: 'center', paddingHorizontal: 10 }}>
        <DriveWayIcon style={{ height: 34, width: 125, alignSelf: 'center' }} />
        <Text style={styles.self}>Self Pickup @ Store</Text>
        {renderButton()}
      </View>
    );
  };

  function isdisabled() {
    if (serverCartItems && serverCartItems?.length) {
      return false;
    } else {
      return true;
    }
  }

  const renderButton = () => {
    return (
      <Button
        disabled={isdisabled()}
        title="PROCEED"
        onPress={onPressProceed}
        style={styles.button}
        titleTextStyle={styles.buttonTitle}
      />
    );
  };
  return showStorePickupCard ? (
    <View style={styles.pickUpCard}>
      {renderText()}
      {renderImage()}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  pickUpCard: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 13,
    borderRadius: 10,
    marginBottom: 5,
    flexDirection: 'row',
    paddingTop: 17,
    paddingBottom: 10,
    marginTop: 20,
  },
  kerbSide: {
    ...theme.fonts.IBMPlexSansRegular(16),
    lineHeight: 21,
    color: '#01475B',
  },
  launched: {
    ...theme.fonts.IBMPlexSansRegular(11),
    lineHeight: 14,
    color: '#01475B',
    opacity: 0.7,
  },
  message: {
    ...theme.fonts.IBMPlexSansRegular(11),
    marginTop: 5,
    lineHeight: 14,
    color: '#01475B',
    textAlign: 'justify',
  },
  self: {
    ...theme.fonts.IBMPlexSansMedium(13),
    marginTop: 4,
    lineHeight: 17,
    color: '#01475B',
  },
  button: {
    height: 24,
    borderRadius: 5,
    marginTop: 5,
  },
  buttonTitle: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
  },
});
