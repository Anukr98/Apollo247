import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Download,
  FileBig,
  MedicineRxIcon,
  PrescriptionThumbnail,
  ShareGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Alert,
  Linking,
  CameraRoll,
  PermissionsAndroid,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import RNFetchBlob from 'react-native-fetch-blob';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { getMedicineDetailsApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import moment from 'moment';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '../UIElementsProvider';

const styles = StyleSheet.create({
  imageView: {
    ...theme.viewStyles.cardViewStyle,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    backgroundColor: theme.colors.WHITE,
  },
  doctorNameStyle: {
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  timeStyle: {
    paddingBottom: 16,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.04,
    lineHeight: 20,
  },
  doctorDetailsStyle: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  labelStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  descriptionStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 24,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  labelTextStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingTop: 8,
    paddingBottom: 3,
  },
  valuesTextStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 20,
    ...theme.fonts.IBMPlexSansMedium(14),
    paddingBottom: 16,
  },
});

export interface RecordDetailsProps extends NavigationScreenProps {}

export const MedicineConsultDetails: React.FC<RecordDetailsProps> = (props) => {
  const { loading, setLoading } = useUIElements();

  const data = props.navigation.state.params ? props.navigation.state.params.data : {};
  console.log('a', data);

  const me = props.navigation.state.params ? props.navigation.state.params.medicineDate : {};
  const url = props.navigation.state.params ? props.navigation.state.params.PrescriptionUrl : {};
  var arr = url.split(',');
  const { addCartItem, addEPrescription } = useShoppingCart();
  const { currentPatient } = useAllCurrentPatients();

  const addToCart = () => {
    if (!data.medicineSKU) {
      Alert.alert('Alert', 'Item not available.');
      return;
    }
    setLoading && setLoading(true);
    getMedicineDetailsApi(data.medicineSKU)
      .then(({ data: { productdp } }) => {
        setLoading && setLoading(false);
        const medicineDetails = (productdp && productdp[0]) || {};
        const isInStock = medicineDetails.is_in_stock;
        if (!isInStock) {
          Alert.alert('Alert', 'This item is out of stock.');
          return;
        }
        addCartItem!({
          id: medicineDetails.sku,
          mou: medicineDetails.mou,
          price: medicineDetails.price,
          quantity: data.quantity,
          name: data.medicineName,
          prescriptionRequired: medicineDetails.is_prescription_required == '1',
        } as ShoppingCartItem);
        if (medicineDetails.is_prescription_required == '1') {
          addEPrescription!({
            id: data!.id,
            date: moment(me).format('DD MMMM YYYY'),
            doctorName: '',
            forPatient: (currentPatient && currentPatient.firstName) || '',
            medicines: `${data.medicineName}`,
            uploadedUrl: arr[0],
          });
        }

        props.navigation.navigate(AppRoutes.YourCart);
      })
      .catch((err) => {
        setLoading && setLoading(false);
        console.log(err, 'MedicineDetailsScene err');
        Alert.alert('Alert', 'No medicines found.');
      });
  };

  useEffect(() => {
    Platform.OS === 'android' && requestReadSmsPermission();
  });
  const requestReadSmsPermission = async () => {
    try {
      const resuts = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        resuts[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (
        resuts[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (resuts) {
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  return (
    <View
      style={{
        ...theme.viewStyles.container,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title="RECORD DETAILS"
          leftIcon="backArrow"
          rightComponent={
            <View style={{ flexDirection: 'row' }}>
              {/* <TouchableOpacity activeOpacity={1} style={{ marginRight: 20 }} onPress={() => {}}>
                <ShareGreen />
              </TouchableOpacity> */}
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  try {
                    if (!url || url === '[object Object]') {
                      Alert.alert('No Image');
                    } else {
                      for (var i = 0; i < arr.length; i++) {
                        if (Platform.OS === 'ios') {
                          try {
                            CameraRoll.saveToCameraRoll(arr[i]);
                            Alert.alert('Download Completed');
                            CommonLogEvent(
                              'MEDICINE_CONSULT_DETAILS',
                              'Download compelete for Prescription'
                            );
                          } catch {}
                        }
                        let dirs = RNFetchBlob.fs.dirs;

                        setLoading && setLoading(true);
                        RNFetchBlob.config({
                          fileCache: true,
                          addAndroidDownloads: {
                            useDownloadManager: true,
                            notification: false,
                            mime: 'application/pdf',
                            path: Platform.OS === 'ios' ? dirs.MainBundleDir : dirs.DownloadDir,
                            description: 'File downloaded by download manager.',
                          },
                        })
                          .fetch('GET', arr[i], {
                            //some headers ..
                          })
                          .then((res) => {
                            setLoading && setLoading(false);

                            if (Platform.OS === 'android') {
                              try {
                                Alert.alert('Download Complete');
                              } catch {}
                            }

                            Platform.OS === 'ios'
                              ? RNFetchBlob.ios.previewDocument(res.path())
                              : RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
                          })
                          .catch((err) => {
                            console.log('error ', err);
                            setLoading && setLoading(false);
                            // ...
                          });
                      }
                    }
                  } catch (error) {}
                }}
              >
                <Download />
              </TouchableOpacity>
            </View>
          }
          onPressLeftIcon={() => props.navigation.goBack()}
        />

        <View style={{ backgroundColor: '#f7f8f5' }}>
          <View style={{ marginLeft: 20, marginBottom: 8, marginTop: 17 }}>
            <MedicineRxIcon />
          </View>

          <View style={{ marginLeft: 20 }}>
            <Text
              style={{ ...theme.fonts.IBMPlexSansSemiBold(23), color: '#02475b', marginBottom: 4 }}
            >
              {data.medicineName}
            </Text>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(14),
                color: '#0087ba',
                letterSpacing: 0.04,
                marginBottom: 20,
              }}
            >
              {me}
            </Text>
          </View>
        </View>
        <ScrollView>
          {arr.map((item: string) => (
            <View style={{ marginHorizontal: 20, marginBottom: 15 }}>
              <Image
                source={{ uri: item }}
                style={{
                  width: '100%',
                  height: 425,
                }}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
        <View
          style={{
            marginLeft: 20,
            marginRight: 20,
            flex: 1,
            justifyContent: 'flex-end',
            marginBottom: 36,
          }}
        >
          <Button
            title="RE-ORDER MEDICINES"
            disabled={data.medicineSKU == null ? true : false}
            onPress={() => {
              addToCart();
              CommonLogEvent('MEDICINE_CONSULT_DETAILS', 'Add to cart');
            }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};
