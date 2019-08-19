import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  ImageSourcePropType,
  TouchableOpacity,
  Dimensions,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { UserIntro } from '@aph/mobile-patients/src/components/ui/UserIntro';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { NavigationScreenProps } from 'react-navigation';
import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import {
  ArrowRight,
  CartIcon,
  NotificationIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
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
  const tabs = [{ title: 'Medicines' }, { title: 'Tests' }];

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [ShowPopop, setShowPopop] = useState<boolean>(false);

  const renderMedicines = () => {
    return (
      <View style={styles.separatorStyle}>
        {arrayTest.map((serviceTitle, i) => (
          <View key={i} style={{}}>
            <TouchableOpacity
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

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        <ScrollView style={{ flex: 1 }}>
          <View
            style={{
              height: 236,
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
              >
                <View
                  style={{
                    height: 83,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 20,
                  }}
                >
                  <View style={{ marginTop: 20 }}>
                    <ApolloLogo />
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 16 }}>
                    <CartIcon style={{ right: 20 }} />
                    <NotificationIcon />
                  </View>
                </View>
              </UserIntro>
            </View>
            <View
              style={{
                ...viewStyles.shadowStyle,
              }}
            >
              <TabsComponent
                style={{
                  marginTop: 192,
                  backgroundColor: colors.CARD_BG,
                }}
                data={tabs}
                onChange={(selectedTab: string) => setselectedTab(selectedTab)}
                selectedTab={selectedTab}
              />
            </View>
          </View>

          {tabs[0].title === selectedTab ? (
            <View>
              {renderMedicines()}
              <Text
                style={{
                  ...fonts.IBMPlexSansMedium(12),
                  color: 'rgba(2, 71, 91, 0.6)',
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
              <TouchableOpacity onPress={() => {}}>
                <View
                  style={{
                    ...viewStyles.cardViewStyle,
                    ...viewStyles.shadowStyle,
                    padding: 16,
                    marginHorizontal: 20,
                    flexDirection: 'row',
                    height: 56,
                    marginTop: 32,
                    marginBottom: 4,
                    alignItems: 'center',
                  }}
                >
                  <Image
                    style={{ height: 24, width: 24 }}
                    source={require('@aph/mobile-patients/src/images/medicine/ic_schedule.png')}
                  />
                  <Text
                    style={{
                      color: colors.SHERPA_BLUE,
                      ...fonts.IBMPlexSansMedium(17),
                      paddingHorizontal: 16,
                    }}
                  >
                    Your Med Subscriptions
                  </Text>
                  <View style={{ alignItems: 'flex-end', flex: 1 }}>
                    <ArrowRight />
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}}>
                <View
                  style={{
                    ...viewStyles.cardViewStyle,
                    padding: 16,
                    marginHorizontal: 20,
                    flexDirection: 'row',
                    height: 56,
                    marginTop: 4,
                    marginBottom: 32,
                    alignItems: 'center',
                  }}
                >
                  <Image
                    style={{ height: 24, width: 24 }}
                    source={require('@aph/mobile-patients/src/images/medicine/ic_tablets.png')}
                  />
                  <Text
                    style={{
                      color: colors.SHERPA_BLUE,
                      ...fonts.IBMPlexSansMedium(17),
                      paddingHorizontal: 16,
                    }}
                  >
                    Your Orders
                  </Text>
                  <View style={{ alignItems: 'flex-end', flex: 1 }}>
                    <ArrowRight />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            renderTests()
          )}
        </ScrollView>
      </SafeAreaView>
      {ShowPopop && (
        <UploadPrescriprionPopup
          onClickClose={() => setShowPopop(false)}
          getData={(images: []) => {
            console.log(images);
            setShowPopop(false);
            props.navigation.navigate(AppRoutes.UploadPrescription, { images });
          }}
          navigation={props.navigation}
        />
      )}
    </View>
  );
};
