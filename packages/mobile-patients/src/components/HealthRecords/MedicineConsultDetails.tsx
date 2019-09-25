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
import { Button } from '../ui/Button';
import RNFetchBlob from 'react-native-fetch-blob';
import { Spinner } from '../ui/Spinner';
import { useShoppingCart, ShoppingCartItem } from '../ShoppingCartProvider';
import { CartItem, getMedicineDetailsApi } from '../../helpers/apiCalls';
import { AppRoutes } from '../NavigatorContainer';
import moment from 'moment';
import { useAllCurrentPatients } from '../../hooks/authHooks';

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
  const [loading, setLoading] = useState<boolean>(false);
  const data = props.navigation.state.params ? props.navigation.state.params.data : {};
  console.log(data, 'data');
  const me = props.navigation.state.params ? props.navigation.state.params.medicineDate : {};
  console.log(me, 'me');
  const url = props.navigation.state.params ? props.navigation.state.params.PrescriptionUrl : {};
  console.log(url, 'url');
  var arr = url.split(',');
  console.log(arr[0], 'arr');
  console.log(arr.length, 'arrlength');
  const { addCartItem, addEPrescription } = useShoppingCart();
  const { currentPatient } = useAllCurrentPatients();

  const addToCart = () => {
    if (!data.medicineSku) {
      Alert.alert('Alert', 'Item not available.');
      return;
    }
    setLoading(true);
    getMedicineDetailsApi(data.medicineSku)
      .then(({ data: { productdp } }) => {
        setLoading(false);
        console.log({ data: productdp && productdp[0] });
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
        setLoading(false);
        console.log(err, 'MedicineDetailsScene err');
        Alert.alert('Alert', 'No medicines found.');
      });
  };

  const saveimageIos = (url: any) => {
    console.log(url, 'saveimageIos');
    if (Platform.OS === 'ios') {
      Linking.openURL(url).catch((err) => console.error('An error occurred', err));
    }
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
        console.log(resuts, 'WRITE_EXTERNAL_STORAGE');
      }
      if (
        resuts[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log(resuts, 'READ_EXTERNAL_STORAGE');
      }
      if (resuts) {
        console.log(resuts, 'READ_EXTERNAL_STORAGE');
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
                    console.log('pdf url', url);
                    if (!url || url === '[object Object]') {
                      Alert.alert('No Image');
                    } else {
                      for (var i = 0; i < arr.length; i++) {
                        console.log('urllrr', arr[i]);
                        if (Platform.OS === 'ios') {
                          try {
                            CameraRoll.saveToCameraRoll(arr[i]);
                            Alert.alert('Download Completed');
                          } catch {}
                        }
                        let dirs = RNFetchBlob.fs.dirs;
                        console.log('dirs', dirs);
                        setLoading(true);
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
                            setLoading(false);
                            // the temp file path
                            console.log('The file saved to res ', res);
                            console.log('The file saved to ', res.path());
                            console.log('arr[i] ', arr[i]);
                            //saveimageIos(arr[0]);
                            if (Platform.OS === 'ios') {
                              try {
                                CameraRoll.saveToCameraRoll(arr[i]);
                              } catch {}
                            }

                            // RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
                            // RNFetchBlob.ios.openDocument(res.path());
                            Alert.alert('Download Complete');
                            Platform.OS === 'ios'
                              ? RNFetchBlob.ios.previewDocument(res.path())
                              : RNFetchBlob.android.actionViewIntent(res.path(), 'application/pdf');
                          })
                          .catch((err) => {
                            console.log('error ', err);
                            setLoading(false);
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
                  // flex: 1,
                  width: '100%',
                  height: 425,
                }}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
        {/* {url == null ? null : (
          <Image
            style={{
              width: 327,
              height: 344,
              marginLeft: 16,
              marginRight: 16,
              marginTop: 30,
              alignSelf: 'center',
            }}
            source={{ uri: url }}
          />
        )} */}

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
            disabled={data.medicineSku == null ? true : false}
            onPress={() => {
              addToCart();
            }}
          />
        </View>
        {loading && <Spinner />}
      </SafeAreaView>
    </View>
  );
};
