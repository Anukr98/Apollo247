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
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View, Image } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 20,
    paddingHorizontal: 20,
    ...theme.viewStyles.shadowStyle,
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  labelStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 3.5,
  },
  descriptionStyle: {
    paddingTop: 7.5,
    paddingBottom: 16,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
  },
  labelViewStyle: {
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  heading: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.light_label,
    letterSpacing: 0.35,
    marginBottom: 2,
  },
  description: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.LIGHT_BLUE,
    letterSpacing: 0.25,
    marginBottom: 8,
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
  imageView: {
    width: 80,
    marginLeft: 20,
  },
  doctorImage: {
    width: 80,
    height: 80,
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
  const [apiError, setApiError] = useState<boolean>(false);
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
        setmedicineDetails((data && data.productdp && data.productdp[0]) || {});
        setLoading(false);
      })
      .catch((err) => {
        aphConsole.log('MedicineDetailsScene err', err);
        setApiError(!!err);
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

  const renderTopView = () => {
    return (
      <View style={styles.mainView}>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorNameStyle}>Crocin Advance Tab</Text>
            {renderBasicDetails()}
          </View>
          <View style={styles.imageView}>
            {true ? <Image source={{ uri: '' }} style={styles.doctorImage} /> : null}
          </View>
        </View>
        <View style={[styles.separatorStyle, { marginTop: 4 }]} />
      </View>
    );
  };

  const FirstRoute = (props) => {
    console.log(props.route.key, 'props');

    return (
      <View style={[{ backgroundColor: theme.colors.WHITE, flex: 1, paddingVertical: 13 }]}>
        <View
          style={{
            marginHorizontal: 20,
            paddingTop: 15.5,
          }}
        >
          <Text
            style={{
              color: theme.colors.SHERPA_BLUE,
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
            }}
          >
            description
          </Text>
        </View>
      </View>
    );
  };
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={styles.indicator}
      style={styles.tabbar}
      tabStyle={styles.tab}
      labelStyle={styles.label}
    />
  );

  const renderTabs = () => {
    return (
      <TabView
        navigationState={{ index: selectedTab, routes }}
        renderScene={SceneMap({
          A: FirstRoute,
          B: FirstRoute,
        })}
        renderTabBar={renderTabBar}
        onIndexChange={(index) => setselectedTab(index)}
      />
    );
  };

  const renderTitleAndDescriptionList = () => {
    return medicineOverview
      .filter((item) => item.CaptionDesc)
      .map((data, index, array) => {
        const desc = data.CaptionDesc || '';
        let trimmedDesc = desc.charAt(0) == '.' ? desc.slice(1).trim() : desc;

        if (data.Caption == 'HOW IT WORKS' || data.Caption == 'USES') {
          trimmedDesc = `${medicineName} ${trimmedDesc}`;
        }

        trimmedDesc = trimmedDesc
          .replace(/&amp;deg;/g, '°')
          .replace(/&#039;/g, "'")
          .replace(/&amp;lt;br \/&amp;gt;. /g, '\n')
          .replace(/&amp;lt;br \/&amp;gt;/g, '\n');

        trimmedDesc = trimmedDesc
          .split('\n')
          .filter((item) => item)
          .join('\n');

        return (
          <View key={index}>
            <Text style={styles.heading}>{data.Caption}</Text>
            <Text
              style={[styles.description, index == array.length - 1 ? { marginBottom: 0 } : {}]}
            >
              {trimmedDesc}
            </Text>
          </View>
        );
      });
  };

  const formatComposition = (value: string) => {
    return value
      ? value.indexOf('+') > -1
        ? value.split('+').map((item) => item.trim())
        : [value]
      : [];
  };

  const renderBasicDetails = () => {
    if (!loading && !apiError) {
      let composition = '';
      const description = medicineDetails.name;
      const pack = medicineDetails.mou;
      const price = medicineDetails.price;
      const pharmaOverview =
        (medicineDetails!.PharmaOverview && medicineDetails!.PharmaOverview[0]) || {};
      const doseForm = pharmaOverview.Doseform;
      const manufacturer = medicineDetails.manufacturer || '';
      const _composition = {
        generic: formatComposition(pharmaOverview.generic),
        unit: formatComposition(pharmaOverview.Unit),
        strength: formatComposition(pharmaOverview.Strength || pharmaOverview.Strengh),
      };
      composition = [...Array.from({ length: _composition.generic.length })]
        .map(
          (_, index) =>
            `${_composition.generic[index]}-${_composition.strength[index]}${_composition.unit[index]}`
        )
        .join('+');

      const basicDetails: [string, string | number][] = [
        ['Manufacturer', manufacturer],
        ['Composition', composition],
        // ['Dose Form', doseForm],
        // ['Description', description],
        // ['Price', price],
        ['Pack Of', pack],
      ];

      return (
        <>
          {basicDetails.map(
            (item, i, array) =>
              !!item[1] && (
                <View key={i}>
                  <Text style={styles.heading}>{item[0]}</Text>
                  <Text style={[styles.description]}>{item[1]}</Text>
                </View>
              )
          )}
          {!loading && medicineOverview.length != 0 && <View style={styles.separator} />}
        </>
      );
    }
  };

  const _title = props.navigation.getParam('title');

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header
        leftIcon="backArrow"
        onPressLeftIcon={() => props.navigation.goBack()}
        title={'PRODUCT DETAIL'}
        titleStyle={{ marginHorizontal: 10 }}
        container={{ borderBottomWidth: 0, ...theme.viewStyles.shadowStyle }}
      />

      {loading && (
        <ActivityIndicator
          style={{ flex: 1, alignItems: 'center' }}
          animating={loading}
          size="large"
          color="green"
        />
      )}
      {!loading && (
        <ScrollView bounces={false}>
          {renderTopView()}
          {renderTabs()}

          {/* <View style={styles.cardStyle}>
            {renderNote()}
            {Object.keys(medicineDetails).length == 0 && (
              <Card
                cardContainer={[
                  styles.noDataCard,
                  { marginTop: medicineDetails!.is_prescription_required == '1' ? -10 : 5 },
                ]}
                heading={'Uh oh! :('}
                description={'Something went wrong.'}
                descriptionTextStyle={{ fontSize: 14 }}
                headingTextStyle={{ fontSize: 14 }}
              />
            )}
            {renderBasicDetails()}
            {renderTitleAndDescriptionList()}
          </View> */}
        </ScrollView>
      )}

      {renderBottomButtons()}
    </SafeAreaView>
  );
};
