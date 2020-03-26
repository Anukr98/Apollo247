import { CollapseCard } from '@aph/mobile-patients/src/components/CollapseCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Download,
  FileBig,
  MedicineRxIcon,
  PrescriptionThumbnail,
  ShareGreen,
  MedicalIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
  Linking,
  CameraRoll,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import RNFetchBlob from 'rn-fetch-blob';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { getMedicineDetailsApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import moment from 'moment';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useApolloClient } from 'react-apollo-hooks';
import { DownloadDocumentsInput } from '../../graphql/types/globalTypes';
import { DOWNLOAD_DOCUMENT } from '../../graphql/profiles';
import { downloadDocuments } from '../../graphql/types/downloadDocuments';
import { useUIElements } from '../UIElementsProvider';
import { RenderPdf } from '../ui/RenderPdf';
import { mimeType } from '../../helpers/mimeType';
import { Image } from 'react-native-elements';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import { postWebEngageEvent, g } from '../../helpers/helperFunctions';

const { width, height } = Dimensions.get('window');
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
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const data = props.navigation.state.params ? props.navigation.state.params.data : {};
  console.log('a', data);
  const [url, setUrls] = useState<string[]>([]);
  const me = props.navigation.state.params ? props.navigation.state.params.medicineDate : {};
  const blobURL: string = props.navigation.state.params
    ? props.navigation.state.params.PrescriptionUrl
    : {};
  var arr = url;

  const prismFile = props.navigation.state.params
    ? props.navigation.state.params.prismPrescriptionFileId
    : {};
  const { addCartItem, addEPrescription } = useShoppingCart();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  // console.log('prismPrescriptionFileId', prismFile.split(','));
  const [pdfUri, setPDFUri] = useState<string>('');
  const [pdfView, setPDFView] = useState<boolean>(false);

  useEffect(() => {
    // if (prismFile == null || prismFile == '') {
    //   Alert.alert('There is no prism filed ');
    // } else {
    const blobUrls = blobURL && blobURL.split(',');
    if (prismFile) {
      client
        .query<downloadDocuments>({
          query: DOWNLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables: {
            downloadDocumentsInput: {
              patientId: currentPatient && currentPatient.id,
              fileIds: prismFile && prismFile.split(','),
            },
          },
        })
        .then(({ data }) => {
          console.log(data, 'DOWNLOAD_DOCUMENT');
          let uploadUrlscheck = data.downloadDocuments.downloadPaths!.map(
            (item, index) =>
              item || (blobUrls && blobUrls.length <= index + 1 ? blobUrls[index] : '')
          );
          console.log(uploadUrlscheck, 'DOWNLOAD_DOCUMENTcmple');

          uploadUrlscheck && setUrls(uploadUrlscheck);
        })
        .catch((e) => {
          CommonBugFender('MedicineConsultDetails_downloadDocuments', e);
          console.log('Error occured', e);
        })
        .finally(() => {});
    } else if (blobUrls) {
      setUrls(blobUrls);
    }
  }, []);

  const addToCart = () => {
    if (data && !data.medicineSKU) {
      Alert.alert('Alert', 'Item not available.');
      return;
    }
    setLoading && setLoading(true);
    getMedicineDetailsApi(data && data.medicineSKU)
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
          specialPrice: medicineDetails.special_price
            ? typeof medicineDetails.special_price == 'string'
              ? parseInt(medicineDetails.special_price)
              : medicineDetails.special_price
            : undefined,
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
            prismPrescriptionFileId: prismFile,
          });
        }

        props.navigation.navigate(AppRoutes.YourCart);
      })
      .catch((err) => {
        CommonBugFender('MedicineConsultDetails_addToCart', err);
        setLoading && setLoading(false);
        console.log(err, 'MedicineDetailsScene err');
        Alert.alert('Alert', 'No medicines found.');
      });
  };

  useEffect(() => {
    Platform.OS === 'android' && requestReadSmsPermission();
  });

  const showMultiAlert = (files: { path: string; name: string }[]) => {
    if (files.length > 0) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Downloaded : ' + files[0].name,
        onPressOk: () => {
          hideAphAlert!();
          console.log('this file is opened', files);
          Platform.OS === 'ios'
            ? RNFetchBlob.ios.previewDocument(files[0].path)
            : RNFetchBlob.android.actionViewIntent(files[0].path, mimeType(files[0].path));
          showMultiAlert(files.slice(1, files.length));
        },
      });
    }
  };

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
      CommonBugFender('MedicineConsultDetails_requestReadSmsPermission_try', error);
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
            prismFile && (
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
                        console.log('download data', arr);
                        let dirs = RNFetchBlob.fs.dirs;
                        let fileDownloaded: { path: string; name: string }[] = [];
                        arr.forEach((item) => {
                          setLoading && setLoading(true);
                          let fileName: string =
                            item
                              .split('/')
                              .pop()!
                              .split('=')
                              .pop() || 'Document';
                          const downloadPath =
                            Platform.OS === 'ios'
                              ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + fileName
                              : dirs.DownloadDir + '/' + fileName;
                          RNFetchBlob.config({
                            fileCache: true,
                            path: downloadPath,
                            addAndroidDownloads: {
                              title: fileName,
                              useDownloadManager: true,
                              notification: true,
                              path: downloadPath,
                              mime: mimeType(downloadPath),
                              description: 'File downloaded by download manager.',
                            },
                          })
                            .fetch('GET', item, {
                              //some headers ..
                            })
                            .then((res) => {
                              setLoading && setLoading(false);
                              fileDownloaded.push({ path: res.path(), name: fileName });
                              if (fileDownloaded.length > 0) {
                                showMultiAlert(fileDownloaded);
                              }
                            })
                            .catch((err) => {
                              CommonBugFender('MedicineConsultDetails_DOWNLOAD', err);
                              console.log('error ', err);
                              setLoading && setLoading(false);
                            });
                        });
                        console.log(fileDownloaded, 'files download');
                      }
                    } catch (error) {
                      CommonBugFender('MedicineConsultDetails_DOWNLOAD_try', error);
                    }
                  }}
                >
                  <Download />
                </TouchableOpacity>
              </View>
            )
          }
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        {pdfView && (
          <RenderPdf
            uri={pdfUri}
            title={
              pdfUri
                .split('/')
                .pop()!
                .split('=')
                .pop() || 'Document'
            }
            isPopup={true}
            setDisplayPdf={() => {
              setPDFView(false);
            }}
            navigation={props.navigation}
          ></RenderPdf>
        )}
        <View style={{ backgroundColor: '#f7f8f5' }}>
          <View style={{ marginLeft: 20, marginBottom: 8, marginTop: 17 }}>
            <MedicineRxIcon />
          </View>

          <View style={{ marginLeft: 20 }}>
            <Text
              numberOfLines={1}
              style={{ ...theme.fonts.IBMPlexSansSemiBold(23), color: '#02475b', marginBottom: 4 }}
            >
              {data === data && !data.medicineSKU ? data : data && data.medicineName}
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
        <ScrollView style={{ marginTop: 20 }}>
          {arr.map((item: string) => {
            if (item.indexOf('.pdf') > -1) {
              return (
                <View style={{ marginHorizontal: 20, marginBottom: 15 }}>
                  <Button
                    title={
                      'Open File' +
                      (item.indexOf('fileName=') > -1 ? ': ' + item.split('fileName=').pop() : '')
                    }
                    onPress={
                      () => {
                        setPDFUri(item);
                        setPDFView(true);
                      }
                      // (
                      //   <RenderPdf
                      //     uri={item}
                      //     title={
                      //       item.indexOf('fileName=') > -1
                      //         ? item.split('fileName=').pop() || 'Document'
                      //         : 'Document'
                      //     }
                      //     isPopup={true}
                      //     navigation={props.navigation}
                      //   ></RenderPdf>
                      // )
                      // props.navigation.navigate(AppRoutes.RenderPdf, {
                      //   uri: item,
                      //   title: item.indexOf('fileName=') > -1 ? item.split('fileName=').pop() : '',
                      //   isPopup: true,
                      // })
                    }
                  ></Button>
                </View>
              );
            } else {
              return (
                <View style={{ marginHorizontal: 20, marginBottom: 15 }}>
                  <Image
                    placeholderStyle={{
                      height: 425,
                      width: '100%',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                    }}
                    PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
                    source={{ uri: item }}
                    style={{
                      width: '100%',
                      height: 425,
                    }}
                    resizeMode="contain"
                  />
                </View>
              );
            }
          })}
          <View style={{ height: 40 }}></View>
        </ScrollView>
        {data && (
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
              disabled={data && data.medicineSKU == null ? true : false}
              onPress={() => {
                addToCart();
                CommonLogEvent('MEDICINE_CONSULT_DETAILS', 'Add to cart');

                const eventAttributes: WebEngageEvents[WebEngageEventName.REORDER_MEDICINES] = {
                  'Patient Name': `${g(currentPatient, 'firstName')} ${g(
                    currentPatient,
                    'lastName'
                  )}`,
                  'Patient UHID': g(currentPatient, 'uhid'),
                  Relation: g(currentPatient, 'relation'),
                  Age: Math.round(moment().diff(currentPatient.dateOfBirth, 'years', true)),
                  Gender: g(currentPatient, 'gender'),
                  'Mobile Number': g(currentPatient, 'mobileNumber'),
                  'Customer ID': g(currentPatient, 'id'),
                };
                postWebEngageEvent(WebEngageEventName.REORDER_MEDICINES, eventAttributes);
              }}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};
