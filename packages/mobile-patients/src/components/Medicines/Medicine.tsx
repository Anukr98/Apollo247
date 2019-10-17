import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  CartIcon,
  MedicineIcon,
  NotificationIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { UserIntro } from '@aph/mobile-patients/src/components/ui/UserIntro';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useShoppingCart, EPrescriptionDisableOption } from '../ShoppingCartProvider';
import { SelectEPrescriptionModal } from './SelectEPrescriptionModal';

const styles = StyleSheet.create({
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  labelView: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff748e',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
});

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type PickerImage = {
  path: string;
  size: number;
  data: null | string;
  width: number;
  height: number;
  mime: string;
  exif: null | object;
  cropRect: null | CropRect;
  filename: string;
  creationDate: string;
  modificationDate?: string;
};

type ArrayTest = {
  id: number;
  title: string;
  descripiton: string;
  image: ImageSourcePropType;
};

const arrayTest: ArrayTest[] = [
  {
    id: 1,
    title: `Do you have a\nprescription ready?`,
    descripiton: 'UPLOAD PRESCRIPTION',
    image: require('@aph/mobile-patients/src/images/medicine/ic_medicines.png'),
  },
  {
    id: 2,
    title: 'Need to find a medicine/alternative?',
    descripiton: 'SEARCH MEDICINE',
    image: require('@aph/mobile-patients/src/images/medicine/ic_medicines.png'),
  },
];
export interface MedicineProps extends NavigationScreenProps {}

export const Medicine: React.FC<MedicineProps> = (props) => {
  // const tabs = [{ title: 'Medicines' }, { title: 'Tests' }];
  const tabs = [{ title: 'Medicines' }];

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [ShowPopop, setShowPopop] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);

  const { cartItems } = useShoppingCart();
  const cartItemsCount = cartItems.length;

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderMedicines = () => {
    return (
      <View style={styles.separatorStyle}>
        {arrayTest.map((serviceTitle, i) => (
          <View key={i} style={{}}>
            <TouchableOpacity
              activeOpacity={1}
              key={i}
              onPress={() => {
                if (i === 0) {
                  setShowPopop(true);
                }
                if (i === 1) {
                  props.navigation.navigate(AppRoutes.SearchMedicineScene);
                }
              }}
            >
              <View
                style={{
                  ...viewStyles.cardViewStyle,
                  ...viewStyles.shadowStyle,
                  padding: 16,
                  marginHorizontal: 20,
                  backgroundColor: colors.WHITE,
                  flexDirection: 'row',
                  height: 112,
                  marginTop: i === 0 ? 32 : 8,
                  marginBottom: arrayTest.length === i + 1 ? 20 : 8,
                }}
                key={i}
              >
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      color: colors.LIGHT_BLUE,
                      lineHeight: 24,
                      textAlign: 'left',
                      ...fonts.IBMPlexSansMedium(17),
                    }}
                  >
                    {serviceTitle.title}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      color: '#fc9916',
                      textAlign: 'left',
                      ...fonts.IBMPlexSansBold(13),
                    }}
                  >
                    {serviceTitle.descripiton}
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: 12,
                    width: 88,
                  }}
                >
                  <Image style={{ height: 59, width: 72 }} source={serviceTitle.image} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderTests = () => {
    return null;
  };
  const renderTopView = () => {
    return (
      <View
        style={{
          height: 225 - 54,
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <UserIntro
            style={{
              height: 109,
            }}
            description={string.home.description}
          >
            <View
              style={{
                height: 83,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: 20,
              }}
            >
              <TouchableOpacity
                style={{ marginTop: 20 }}
                onPress={() => props.navigation.replace(AppRoutes.ConsultRoom)}
              >
                <ApolloLogo />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', marginTop: 16 }}>
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() =>
                    props.navigation.navigate(AppRoutes.YourCart, { isComingFromConsult: true })
                  }
                  style={{ right: 20 }}
                >
                  <CartIcon style={{}} />
                  {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
                </TouchableOpacity>
                <NotificationIcon />
              </View>
            </View>
          </UserIntro>
        </View>
        {/* <TabsComponent
          height={44}
          style={{
            marginTop: Platform.OS === 'ios' ? 181 : 191,
            backgroundColor: colors.CARD_BG,
            ...viewStyles.shadowStyle,
          }}
          data={tabs}
          onChange={(selectedTab: string) => {
            setselectedTab(selectedTab);
          }}
          selectedTab={selectedTab}
        /> */}
      </View>
    );
  };

  const renderPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          }
          props.navigation.navigate(AppRoutes.UploadPrescription, {
            ePrescriptionsProp: selectedEPres,
          });
        }}
        selectedEprescriptionIds={[]}
        isVisible={isSelectPrescriptionVisible}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderTopView()}
          {tabs[0].title === selectedTab ? (
            <View>
              {renderMedicines()}
              <Text
                style={{
                  ...fonts.IBMPlexSansMedium(12),
                  color: theme.colors.TEXT_LIGHT_BLUE,
                  paddingTop: 8,
                  paddingBottom: 20,
                  paddingHorizontal: 20,
                }}
              >
                Get all your medicines, certified using our 5-point system, within 2 hours.
              </Text>
              <Image
                source={require('@aph/mobile-patients/src/images/medicine/img_adbanner.png')}
                style={{ width: '100%' }}
              />
              {/* <ListCard
                container={{ marginTop: 32 }}
                title={'Your Med Subscriptions'}
                leftIcon={
                  <Image
                    style={{ height: 24, width: 24 }}
                    source={require('@aph/mobile-patients/src/images/medicine/ic_schedule.png')}
                  />
                }
              /> */}
              <ListCard
                onPress={() => props.navigation.navigate(AppRoutes.YourOrdersScene)}
                container={{ marginTop: 32, marginBottom: 32 }}
                title={'Your Orders'}
                leftIcon={<MedicineIcon />}
              />
            </View>
          ) : (
            renderTests()
          )}
        </ScrollView>
      </SafeAreaView>
      {renderPrescriptionModal()}
      <UploadPrescriprionPopup
        isVisible={ShowPopop}
        disabledOption="NONE"
        type="nonCartFlow"
        heading={'Upload Prescription(s)'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE\nFROM GALLERY',
          prescription: 'SELECT FROM\nE-PRESCRIPTION',
        }}
        onClickClose={() => setShowPopop(false)}
        onResponse={(selectedType, response) => {
          setShowPopop(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            if (response.length == 0) return;
            props.navigation.navigate(AppRoutes.UploadPrescription, {
              phyPrescriptionsProp: response,
            });
          } else {
            setSelectPrescriptionVisible(true);
          }
        }}
      />
    </View>
  );
};
