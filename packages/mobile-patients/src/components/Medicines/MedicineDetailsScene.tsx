import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { MedicineRxIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  getMedicineDetailsApi,
  MedicineProduct,
  MedicineProductDetails,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { aphConsole } from '@aph/mobile-patients/src/helpers/helperFunctions';
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
  noteContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 15,
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
  const isOutOfStock = !medicineDetails!.is_in_stock;
  const medicineName = medicineDetails.name;

  useEffect(() => {
    getMedicineDetailsApi(sku)
      .then(({ data }) => {
        setmedicineDetails(data.productdp[0] || {});
        setLoading(false);
      })
      .catch((err) => {
        aphConsole.log('MedicineDetailsScene err', err);
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
          onPress={() => props.navigation.navigate(AppRoutes.MobileHelp)}
          title="NEED HELP"
          style={styles.bottomButtonStyle}
          titleTextStyle={{ color: '#fc9916' }}
        />
        <View style={{ width: 16 }} />
        <Button
          onPress={() => onAddCartItem(medicineDetails)}
          title={
            loading
              ? 'ADD TO CART'
              : isMedicineAddedToCart
              ? 'ADDED TO CART'
              : isOutOfStock
              ? 'OUT OF STOCK'
              : 'ADD TO CART'
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
          <View style={styles.noteContainerStyle}>
            <Text style={styles.noteText}>This medicine requires doctor’s prescription</Text>
            <MedicineRxIcon />
          </View>
          <View style={styles.separator} />
        </>
      );
    }
  };

  const renderTitleAndDescriptionList = () => {
    return medicineOverview.map((data, index, array) => {
      const desc = data.CaptionDesc || '';
      let trimmedDesc = desc.charAt(0) == '.' ? desc.slice(1).trim() : desc;

      if (data.Caption == 'HOW IT WORKS' || data.Caption == 'USES') {
        trimmedDesc = `${medicineName} ${trimmedDesc}`;
      }

      const splitByEntities = trimmedDesc.split('&amp;lt;br /&amp;gt;');
      trimmedDesc = splitByEntities
        .map((item) => {
          let _item = item.trim().replace('. ', '');
          if (_item.charAt(0) == '.') {
            _item = _item.substring(1);
          }
          return _item || null;
        })
        .filter((item) => item)
        .join('\n');

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

  const renderBasicDetails = () => {
    if (!loading) {
      let composition = '';
      const description = medicineDetails.name;
      const pack = medicineDetails.mou;
      const price = medicineDetails.price;
      const pharmaOverview = medicineDetails!.PharmaOverview[0] || {};
      const doseForm = pharmaOverview.Doseform;

      const _composition = {
        generic: pharmaOverview.generic
          ? pharmaOverview.generic.indexOf('+') > -1
            ? pharmaOverview.generic.split('+').map((item) => item.trim())
            : [pharmaOverview.generic]
          : [],
        unit: pharmaOverview.Unit
          ? pharmaOverview.Unit.indexOf('+') > -1
            ? pharmaOverview.Unit.split('+').map((item) => item.trim())
            : [pharmaOverview.Unit]
          : [],
        strength:
          pharmaOverview.Strength || pharmaOverview.Strengh
            ? (pharmaOverview.Strength || pharmaOverview.Strengh).indexOf('+') > -1
              ? (pharmaOverview.Strength || pharmaOverview.Strengh)
                  .split('+')
                  .map((item) => item.trim())
              : [pharmaOverview.Strength || pharmaOverview.Strengh]
            : [],
      };
      composition = [...Array.from({ length: _composition.generic.length })]
        .map(
          (_, index) =>
            `${_composition.generic[index]}-${_composition.strength[index]}${_composition.unit[index]}`
        )
        .join('+');

      return (
        <>
          {!!composition && (
            <View>
              <Text style={styles.heading}>{'Composition'.toUpperCase()}</Text>
              <Text style={[styles.description, { marginBottom: 16 }]}>{composition}</Text>
            </View>
          )}
          {!!doseForm && (
            <View>
              <Text style={styles.heading}>{'Dose Form'.toUpperCase()}</Text>
              <Text style={[styles.description, { marginBottom: 16 }]}>{doseForm}</Text>
            </View>
          )}
          {!!description && (
            <View>
              <Text style={styles.heading}>{'Description'.toUpperCase()}</Text>
              <Text style={[styles.description, { marginBottom: 16 }]}>{description}</Text>
            </View>
          )}
          {!!price && (
            <View>
              <Text style={styles.heading}>{'Price'.toUpperCase()}</Text>
              <Text style={[styles.description, { marginBottom: 16 }]}>Rs. {price.toFixed(2)}</Text>
            </View>
          )}
          {!!pack && (
            <View>
              <Text style={styles.heading}>{'Pack'.toUpperCase()}</Text>
              <Text style={[styles.description, { marginBottom: 0 }]}>{pack}</Text>
            </View>
          )}
          {!loading && medicineOverview.length != 0 && <View style={styles.separator} />}
        </>
      );
    }
  };

  const _title = props.navigation.getParam('title');
  const shouldTrim = _title.length > 18 ? '...' : '';
  const formattedTile = `${_title}${shouldTrim}`.substr(0, 25).toUpperCase();

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header
        leftIcon="backArrow"
        onPressLeftIcon={() => props.navigation.goBack()}
        title={formattedTile}
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

      {/* {!loading && medicineOverview.length == 0 && (
        <View style={{ flex: 1 }}>
          <View style={styles.cardStyle}>
            {renderNote()}
            <Card
              cardContainer={[
                styles.noDataCard,
                { marginTop: medicineDetails!.is_prescription_required == '1' ? -10 : 5 },
              ]}
              heading={'Uh oh! :('}
              description={'No Data Found!'}
              descriptionTextStyle={{ fontSize: 14 }}
              headingTextStyle={{ fontSize: 14 }}
            />
          </View>
        </View>
      )} */}

      {!loading && (
        <ScrollView bounces={false}>
          <View style={styles.cardStyle}>
            {renderNote()}
            {renderBasicDetails()}
            {renderTitleAndDescriptionList()}
          </View>
        </ScrollView>
      )}

      {renderBottomButtons()}
    </SafeAreaView>
  );
};
