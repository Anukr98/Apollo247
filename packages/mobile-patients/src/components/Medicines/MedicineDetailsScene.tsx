import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { DropdownGreen, MedicineRxIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  getDeliveryTime,
  getMedicineDetailsApi,
  getSubstitutes,
  MedicineProduct,
  MedicineProductDetails,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { aphConsole } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  WebView,
} from 'react-native';
import {
  NavigationState,
  SceneMap,
  SceneRendererProps,
  TabBar,
  TabView,
} from 'react-native-tab-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    margin: 20,
    padding: 16,
  },
  mainView: {
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 20,
    ...theme.viewStyles.shadowStyle,
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  labelStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
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
    marginHorizontal: 20,
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...theme.viewStyles.lightSeparatorStyle,
  },
  noteContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteText: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, 0.6, 20, 0.04),
    // ...theme.fonts.IBMPlexSansMedium(12),
    // color: theme.colors.LIGHT_BLUE,
    // opacity: 0.6,
    // letterSpacing: 0.04,
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
  bottomView: {
    flex: 1,
    // shadowColor: theme.colors.WHITE,
    // shadowOffset: { width: 0, height: -5 },
    // shadowOpacity: 1,
    // shadowRadius: 10,
    // elevation: 2,
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
    height: 80,
    marginLeft: 20,
    borderRadius: 40,
    ...theme.viewStyles.shadowStyle,
    backgroundColor: theme.colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorImage: {
    width: 56,
    height: 56,
  },
  tabbar: {
    backgroundColor: theme.colors.CARD_BG,
    ...theme.viewStyles.shadowStyle,
    // shadowRadius: 0
    shadowOffset: { width: 0, height: 0 },
  },
  tab: {
    // width: 50,
  },
  indicator: {
    height: 4,
    backgroundColor: theme.colors.APP_GREEN,
  },
  label: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: theme.colors.LIGHT_BLUE,
    // fontWeight: '400',
  },
});

type State = NavigationState<{
  key: string;
  title: string;
}>;

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
  const [selectedTab, setselectedTab] = useState<number>(0);
  const [deliveryTime, setdeliveryTime] = useState<string>('');
  const [deliveryError, setdeliveryError] = useState<string>('');
  const [selectedQuantity, setselectedQuantity] = useState<string | number>(1);
  const [pincode, setpincode] = useState<string>('');
  const [showDeliverySpinner, setshowDeliverySpinner] = useState<boolean>(false);

  const _medicineOverview =
    medicineDetails!.PharmaOverview &&
    medicineDetails!.PharmaOverview[0] &&
    medicineDetails!.PharmaOverview[0].Overview;
  const medicineOverview = typeof _medicineOverview == 'string' ? [] : _medicineOverview || [];

  const sku = props.navigation.getParam('sku');
  console.log(sku, 'skusku');

  const { addCartItem, cartItems } = useShoppingCart();
  const isMedicineAddedToCart = cartItems.findIndex((item) => item.id == sku) != -1;
  const isOutOfStock = !medicineDetails!.is_in_stock;
  const medicineName = medicineDetails.name;

  const routes = [
    { key: 'Overview', title: 'Overview' },
    { key: 'Side Effects', title: 'Side Effects' },
    { key: 'Usage', title: 'Usage' },
    { key: 'Drug Warnings', title: 'Drug Warnings' },
  ];
  useEffect(() => {
    getMedicineDetailsApi(sku)
      .then(({ data }) => {
        console.log(data, 'getMedicineDetailsApi');
        setmedicineDetails((data && data.productdp && data.productdp[0]) || {});
        setLoading(false);
      })
      .catch((err) => {
        aphConsole.log('MedicineDetailsScene err', err);
        setApiError(!!err);
        setLoading(false);
      });
    fetchSubstitutes();
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

  const fetchDeliveryTime = () => {
    setshowDeliverySpinner(true);
    getDeliveryTime({
      postalcode: pincode,
      ordertype: 'pharma',
      lookup: [
        {
          sku: sku,
          qty: 1,
        },
      ],
    })
      .then((res) => {
        try {
          console.log('resresres', res);
          if (res && res.data) {
            if (typeof res.data === 'object' && Array.isArray(res.data.tat)) {
              res.data.tat.length && setdeliveryTime(res.data.tat[0].deliverydate);
            } else if (typeof res.data === 'string') {
              setdeliveryError(res.data);
            }
          }
        } catch (error) {
          Alert.alert(error);
        }
        setshowDeliverySpinner(false);
      })
      .catch((err) => {
        console.log(err, 'err');
        Alert.alert(err);
        setshowDeliverySpinner(false);
      });
  };

  const fetchSubstitutes = () => {
    getSubstitutes(sku)
      .then((res) => {
        console.log('getSubstitutes', res);
      })
      .catch((err) => console.log(err, 'err'));
  };

  const renderBottomButtons = () => {
    return (
      <StickyBottomComponent style={{ height: 'auto' }} defaultBG>
        {isOutOfStock ? (
          <View
            style={{ paddingVertical: 16, alignItems: 'center', flex: 1, marginHorizontal: 60 }}
          >
            <Text
              style={[
                theme.viewStyles.text('SB', 14, '#890000', 1, undefined, 0.35),
                { alignItems: 'center', paddingBottom: 16 },
              ]}
            >
              Out Of Stock
            </Text>
            <Button
              title={'NOTIFY WHEN IN STOCK'}
              style={{ backgroundColor: theme.colors.WHITE }}
              titleTextStyle={{ color: '#fc9916' }}
            />
          </View>
        ) : (
          <View style={styles.bottomView}>
            <View
              style={{
                flexDirection: 'row',
                height: 50,
                alignItems: 'center',
                ...theme.viewStyles.lightSeparatorStyle,
                marginHorizontal: 20,
              }}
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <MaterialMenu
                  onPressQuantity={(selectedQuantity) => setselectedQuantity(selectedQuantity)}
                  selectedQuantity={selectedQuantity}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingRight: 8,
                      borderRightWidth: 0.5,
                      borderRightColor: 'rgba(2, 71, 91, 0.2)',
                    }}
                  >
                    <Text style={theme.viewStyles.text('SB', 14, '#02475b', 1, 24, 0.35)}>
                      QTY : {selectedQuantity}
                    </Text>
                    <DropdownGreen />
                  </View>
                </MaterialMenu>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text
                  style={[
                    theme.viewStyles.text('SB', 14, '#02475b', 1, 24, 0.35),
                    { fontWeight: 'bold' },
                  ]}
                >
                  Rs. {medicineDetails.price}
                </Text>
              </View>
            </View>
            <View style={styles.bottonButtonContainer}>
              <Button
                onPress={() => onAddCartItem(medicineDetails)}
                title={
                  loading
                    ? 'ADD TO CART'
                    : isMedicineAddedToCart
                    ? 'ADDED TO CART'
                    : // : isOutOfStock
                      // ? 'OUT OF STOCK'
                      'ADD TO CART'
                }
                disabled={isMedicineAddedToCart || isOutOfStock}
                style={styles.bottomButtonStyle}
                titleTextStyle={{ color: '#fc9916' }}
              />
              <View style={{ width: 16 }} />
              <Button
                onPress={() => props.navigation.navigate(AppRoutes.MobileHelp)}
                title="BUY NOW"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </StickyBottomComponent>
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
          {/* <View style={styles.separator} /> */}
        </>
      );
    } else {
      return <View style={[styles.separatorStyle, { marginTop: 4 }]} />;
    }
  };

  const renderTopView = () => {
    const _title = props.navigation.getParam('title');

    return (
      <View style={styles.mainView}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorNameStyle}>{medicineDetails.name}</Text>
            {renderBasicDetails()}
          </View>
          <View>
            {!!medicineDetails.image ? (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.imageView}
                onPress={() =>
                  props.navigation.navigate(AppRoutes.ImageSliderScreen, {
                    images: [AppConfig.Configuration.IMAGES_BASE_URL + medicineDetails.image],
                    heading: medicineDetails.name,
                  })
                }
              >
                <Image
                  source={{ uri: AppConfig.Configuration.IMAGES_BASE_URL + medicineDetails.image }}
                  style={styles.doctorImage}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        {renderNote()}
        {medicineOverview.length === 0 && renderInfo()}
      </View>
    );
  };

  const FirstRoute = (props: any) => {
    console.log(props.route.key, 'props');
    let description = props.route.key;
    switch (props.route.key) {
      case 'Overview':
        description =
          medicineDetails.PharmaOverview && medicineDetails.PharmaOverview.length
            ? medicineDetails.PharmaOverview[0].Overview
            : ''; //'Overview';
        break;
      case 'Side Effects':
        description = 'Side Effects';
        break;
      case 'Usage':
        description = 'Usage';
        break;
      case 'Drug Warnings':
        description = 'Drug Warnings';
        break;
    }
    return (
      <View
        style={[
          {
            backgroundColor: theme.colors.WHITE,
            flex: 1,
            padding: 20,
            ...theme.viewStyles.shadowStyle,
          },
        ]}
      >
        <View>
          <Text
            style={{
              color: theme.colors.SKY_BLUE,
              ...theme.fonts.IBMPlexSansMedium(14),
              lineHeight: 22,
            }}
          >
            {description}
          </Text>
        </View>
      </View>
    );
  };

  const renderTabBar = (props: SceneRendererProps & { navigationState: State }) => (
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
          Overview: FirstRoute,
          'Side Effects': FirstRoute,
          Usage: FirstRoute,
          'Drug Warnings': FirstRoute,
        })}
        renderTabBar={renderTabBar}
        onIndexChange={(index) => setselectedTab(index)}
      />
    );
  };
  const renderInfo = () => {
    if (medicineDetails.description)
      return (
        <View>
          <Text
            style={{
              ...theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE, 1),
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 17,
            }}
          >
            Product Information
          </Text>
          <View
            style={[
              {
                backgroundColor: theme.colors.WHITE,
                flex: 1,
                padding: 20,
                ...theme.viewStyles.shadowStyle,
              },
            ]}
          >
            <View>
              <Text
                style={{
                  color: theme.colors.SKY_BLUE,
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 22,
                }}
              >
                {medicineDetails.description}
              </Text>
              {/* <WebView
                source={{
                  html: `<p style="color:#0087ba;font-size:12;font-family:IBMPlexSans-Medium;">${medicineDetails.description +
                    'helllooooooo&nbps;hiiiiiiii'}</p>`,
                }}
                style={{
                  backgroundColor: 'red',
                  width: '100%',
                  height: 100,
                }}
              /> */}
            </View>
          </View>
        </View>
      );
  };

  const renderSubstitutes = () => {
    return (
      <View>
        <View style={styles.labelViewStyle}>
          <Text style={styles.labelStyle}>SUBSTITUTE DRUGS — 09</Text>
        </View>
        <View style={styles.cardStyle}>
          <Text>name</Text>
        </View>
      </View>
    );
  };

  const renderDeliveryView = () => {
    console.log(deliveryTime, 'deliveryTime');
    return (
      <View>
        <View style={styles.labelViewStyle}>
          <Text style={styles.labelStyle}>CHECK DELIVERY TIME</Text>
        </View>
        <View
          style={[
            styles.cardStyle,
            {
              margin: 20,
              padding: 0,
            },
          ]}
        >
          <View
            style={{
              padding: 16,
              paddingBottom: 3,
              paddingTop: 10,
            }}
          >
            <TextInputComponent
              placeholder={'Enter Pin Code'}
              value={pincode}
              onChangeText={(pincode) => {
                if (/^\d+$/.test(pincode) || pincode == '') {
                  setpincode(pincode);
                  setdeliveryError('');
                  setdeliveryTime('');
                }
              }}
              maxLength={6}
              keyboardType="numeric"
            />
            <View
              style={{
                position: 'absolute',
                right: 16,
                top: 16,
              }}
            >
              <Text
                style={[
                  theme.viewStyles.yellowTextStyle,
                  { opacity: pincode.length === 6 ? 1 : 0.21 },
                ]}
                onPress={() => (pincode.length === 6 ? fetchDeliveryTime() : {})}
                suppressHighlighting={pincode.length !== 6}
              >
                CHECK
              </Text>
            </View>
            {!!deliveryError && (
              <Text
                style={{
                  ...theme.viewStyles.text('M', 12, theme.colors.INPUT_FAILURE_TEXT, 1, 24),
                  // paddingVertical: 10,
                }}
              >
                {deliveryError}
              </Text>
            )}
            {!!deliveryTime && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                }}
              >
                <Text style={theme.viewStyles.text('M', 14, '#01475b', 1, 24, 0)}>
                  Delivery Time
                </Text>
                <Text
                  style={[
                    theme.viewStyles.text('M', 14, '#01475b', 1, 24, 0),
                    { fontWeight: 'bold' },
                  ]}
                >
                  By {moment(deliveryTime.split(' ')[0]).format('Do MMM YYYY')}
                </Text>
              </View>
            )}
          </View>
          {showDeliverySpinner && <Spinner style={{ borderRadius: 10 }} />}
        </View>
      </View>
    );
  };

  // const renderTitleAndDescriptionList = () => {
  //   return medicineOverview
  //     .filter((item) => item.CaptionDesc)
  //     .map((data, index, array) => {
  //       const desc = data.CaptionDesc || '';
  //       let trimmedDesc = desc.charAt(0) == '.' ? desc.slice(1).trim() : desc;

  //       if (data.Caption == 'HOW IT WORKS' || data.Caption == 'USES') {
  //         trimmedDesc = `${medicineName} ${trimmedDesc}`;
  //       }

  //       trimmedDesc = trimmedDesc
  //         .replace(/&amp;deg;/g, '°')
  //         .replace(/&#039;/g, "'")
  //         .replace(/&amp;lt;br \/&amp;gt;. /g, '\n')
  //         .replace(/&amp;lt;br \/&amp;gt;/g, '\n');

  //       trimmedDesc = trimmedDesc
  //         .split('\n')
  //         .filter((item) => item)
  //         .join('\n');

  //       return (
  //         <View key={index}>
  //           <Text style={styles.heading}>{data.Caption}</Text>
  //           <Text
  //             style={[styles.description, index == array.length - 1 ? { marginBottom: 0 } : {}]}
  //           >
  //             {trimmedDesc}
  //           </Text>
  //         </View>
  //       );
  //     });
  // };

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
        <KeyboardAwareScrollView
          bounces={false}
          // keyboardShouldPersistTaps={''}
          // keyboardDismissMode={'on-drag'}
          // removeClippedSubviews={false}
        >
          {renderTopView()}
          {medicineOverview.length > 0 && renderTabs()}
          {renderSubstitutes()}
          {renderDeliveryView()}
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
          <View style={{ height: 130 }} />
        </KeyboardAwareScrollView>
      )}
      {!loading && renderBottomButtons()}
    </SafeAreaView>
  );
};
