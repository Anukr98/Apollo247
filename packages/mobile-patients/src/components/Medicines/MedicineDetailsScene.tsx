import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  getMedicineDetailsApi,
  MedicineProduct,
  MedicineProductDetails,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    margin: 20,
    padding: 16,
  },
  noteText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
    letterSpacing: 0.04,
  },
  heading: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 20,
    marginBottom: 8,
  },
  description: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.04,
    lineHeight: 24,
    marginBottom: 16,
  },
  bottonButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  bottomButtonStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginTop: 17,
    marginBottom: 24,
  },
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
});

export interface MedicineDetailsSceneProps
  extends NavigationScreenProps<{
    sku: string;
    title: string;
  }> {}

export const MedicineDetailsScene: React.FC<MedicineDetailsSceneProps> = (props) => {
  const [medicineDetails, setmedicineDetails] = useState<MedicineProductDetails>(
    {} as MedicineProductDetails
  );
  const [loading, setLoading] = useState(true);
  const _medicineOverview =
    medicineDetails!.PharmaOverview &&
    medicineDetails!.PharmaOverview[0] &&
    medicineDetails!.PharmaOverview[0].Overview;
  const medicineOverview = typeof _medicineOverview == 'string' ? [] : _medicineOverview || [];
  const sku = props.navigation.getParam('sku');
  const { addCartItem, cartItems } = useShoppingCart();
  const isMedicineAddedToCart = cartItems.findIndex((item) => item.id == sku) != -1;
  const isOutOfStock = medicineDetails!.status != 1;

  useEffect(() => {
    getMedicineDetailsApi(sku)
      .then(({ data }) => {
        console.log({ data: data.productdp[0] || {} });
        setmedicineDetails(data.productdp[0] || {});
        setLoading(false);
      })
      .catch((err) => {
        console.log(err, 'MedicineDetailsScene err');
        setLoading(false);
      });
  }, []);

  const onAddCartItem = ({ sku, mou, name, price, is_prescription_required }: MedicineProduct) => {
    addCartItem &&
      addCartItem({
        id: sku,
        mou,
        name,
        price,
        prescriptionRequired: is_prescription_required == '1',
        quantity: 1,
      });
    props.navigation.goBack();
  };

  const renderBottomButtons = () => {
    return (
      <View style={styles.bottonButtonContainer}>
        <Button
          title="CALL US"
          style={styles.bottomButtonStyle}
          titleTextStyle={{ color: '#fc9916' }}
        />
        <View style={{ width: 16 }} />
        <Button
          onPress={() => onAddCartItem(medicineDetails)}
          title={
            isMedicineAddedToCart ? 'ADDED TO CART' : isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'
          }
          disabled={isMedicineAddedToCart || isOutOfStock}
          style={{ flex: 1 }}
        />
      </View>
    );
  };

  const renderNote = () => {
    if (medicineDetails!.is_prescription_required == '1') {
      return (
        <>
          <Text style={styles.noteText}>This medicine requires doctor’s prescription</Text>
          <View style={styles.separator} />
        </>
      );
    }
  };

  const renderTitleAndDescriptionList = () => {
    return medicineOverview.map((data, index, array) => {
      const desc = data.CaptionDesc || '';
      const trimmedDesc = desc.charAt(0) == '.' ? desc.slice(1).trim() : desc;
      return (
        <View key={index}>
          <Text style={styles.heading}>{data.Caption}</Text>
          <Text style={[styles.description, index == array.length - 1 ? { marginBottom: 0 } : {}]}>
            {trimmedDesc}
          </Text>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header
        leftIcon="backArrow"
        onPressLeftIcon={() => props.navigation.goBack()}
        title={(props.navigation.getParam('title') || '').toUpperCase()}
        container={{ borderBottomWidth: 0 }}
      />

      {loading && (
        <ActivityIndicator
          style={{ flex: 1, alignItems: 'center' }}
          animating={loading}
          size="large"
          color="green"
        />
      )}

      {!loading && medicineOverview.length == 0 && (
        <View style={{ flex: 1 }}>
          <Card
            cardContainer={styles.noDataCard}
            heading={'Uh oh! :('}
            description={'No Data Found!'}
            descriptionTextStyle={{ fontSize: 14 }}
            headingTextStyle={{ fontSize: 14 }}
          />
        </View>
      )}

      {!loading && medicineOverview.length > 0 && (
        <ScrollView bounces={false}>
          <View style={styles.cardStyle}>
            {renderNote()}
            {renderTitleAndDescriptionList()}
          </View>
        </ScrollView>
      )}

      {renderBottomButtons()}
    </SafeAreaView>
  );
};
