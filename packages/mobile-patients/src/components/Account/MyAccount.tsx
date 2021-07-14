import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  Afternoon,
  CurrencyIcon,
  EditIconNew,
  Invoice,
  LinkedUhidIcon,
  Location,
  ManageProfileIcon,
  MyMembershipIcon,
  NeedHelpIcon,
  Apollo247Icon,
  OneApollo,
  ArrowRight,
  Down,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TabHeader } from '@aph/mobile-patients/src/components/ui/TabHeader';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DELETE_DEVICE_TOKEN } from '@aph/mobile-patients/src/graphql/profiles';
import {
  deleteDeviceToken,
  deleteDeviceTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/deleteDeviceToken';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  g,
  getNetStatus,
  postAppsFlyerEvent,
  postFirebaseEvent,
  statusBarHeight,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { setTagalysConfig } from '@aph/mobile-patients/src/helpers/Tagalys';
import { postMyOrdersClicked } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import { differenceInYears, parse } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import codePush from 'react-native-code-push';
import WebEngage from 'react-native-webengage';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  SKIP_LOCATION_PROMPT,
  HEALTH_CREDITS,
} from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import { LOGIN_PROFILE } from '@aph/mobile-patients/src/utils/AsyncStorageKey';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  topView: {
    marginBottom: 8,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  detailsViewStyle: {
    margin: 20,
  },
  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 7,
    paddingTop: 0,
  },
  doctorSpecializationStyles: {
    paddingTop: 7,
    paddingBottom: 12,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  editIcon: {
    width: 40,
    height: 40,
  },
  editIconstyles: {
    bottom: 16,
    right: 0,
    position: 'absolute',
    marginRight: 20,
    marginBottom: 17,
  },
  aboutContainer: {
    marginLeft: 40,
    marginVertical: 12,
  },
  aboutTextItem: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
  },
});
type Appointments = {
  date: string;
  type: string;
  symptoms: string[];
};

const Appointments: Appointments[] = [
  {
    date: '27 June, 6:30 pm',
    type: 'ONLINE CONSULT',
    symptoms: ['FEVER', 'COUGH & COLD'],
  },
  {
    date: '09 April, 3:00 pm',
    type: 'CLINIC VISIT',
    symptoms: ['FEVER', 'COUGH & COLD'],
  },
];

export interface MyAccountProps extends NavigationScreenProps {}
export const MyAccount: React.FC<MyAccountProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const [codePushVersion, setCodePushVersion] = useState<string>('');
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);
  const [showAboutUsSection, setShowAboutUsSection] = useState<boolean>(false);
  const [profileDetails, setprofileDetails] = useState<
    GetCurrentPatients_getCurrentPatients_patients | null | undefined
  >(currentPatient);
  const { signOut, getPatientApiCall } = useAuth();
  const {
    setSavePatientDetails,
    setHdfcUserSubscriptions,
    setBannerData,
    setCircleSubscription,
    setPhrSession,
    setCorporateSubscriptions,
  } = useAppCommonData();
  const { setIsDiagnosticCircleSubscription, clearDiagnoticCartInfo } = useDiagnosticsCart();
  const {
    setIsCircleSubscription,
    setCircleMembershipCharges,
    setCircleSubscriptionId,
    setCorporateSubscription,
    corporateSubscription,
    circleSubscriptionId,
    hdfcSubscriptionId,
    clearCartInfo,
    isCircleExpired,
  } = useShoppingCart();

  useEffect(() => {
    updateCodePushVersioninUi();
  }, []);

  const updateCodePushVersioninUi = async () => {
    try {
      const version = (await codePush.getUpdateMetadata())?.label;
      version && setCodePushVersion(version.replace('v', 'H'));
    } catch (error) {
      CommonBugFender(`${AppRoutes.MyAccount}_codePush.getUpdateMetadata`, error);
    }
  };

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
    currentPatient && setprofileDetails(currentPatient);
  }, [currentPatient]);

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      if (!currentPatient || !currentPatient.uhid) {
        getPatientApiCall();
      }
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [props.navigation]);

  useEffect(() => {
    getNetStatus()
      .then((status) => {
        if (status) {
          if (currentPatient !== profileDetails) {
            setprofileDetails(currentPatient);
            setshowSpinner(false);
          }
          if (currentPatient === profileDetails) {
            setshowSpinner(false);
          }
        } else {
          setNetworkStatus(true);
          setshowSpinner(false);
        }
      })
      .catch((e) => {
        CommonBugFender('MyAccount_getNetStatus', e);
      });
  }, [currentPatient, profileDetails]);

  const getAge = (dob: string) => {
    const now = new Date();
    let age = parse(dob);
    return differenceInYears(now, age);
  };

  const renderDetails = () => {
    if (profileDetails)
      return (
        <View style={styles.topView}>
          <View style={styles.detailsViewStyle}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.doctorNameStyles}>
                {profileDetails.firstName} {profileDetails.lastName}
              </Text>
              {currentPatient && g(currentPatient, 'isUhidPrimary') ? (
                <LinkedUhidIcon
                  style={{
                    width: 22,
                    height: 20,
                    marginLeft: 5,
                    marginTop: Platform.OS === 'ios' ? 5 : 8,
                  }}
                  resizeMode={'contain'}
                />
              ) : null}
            </View>
            <View style={styles.separatorStyle} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={styles.doctorSpecializationStyles}>
                UHID: {profileDetails.uhid ? profileDetails.uhid : '-'}
              </Text>
              <Text style={styles.doctorSpecializationStyles}>
                {profileDetails.gender ? profileDetails.gender : '-'} |{' '}
                {profileDetails.dateOfBirth ? getAge(profileDetails.dateOfBirth) || '-' : '-'}
              </Text>
            </View>
            <View style={styles.separatorStyle} />
            <Text style={[styles.doctorSpecializationStyles, { textAlign: 'right' }]}>
              {profileDetails.mobileNumber}
            </Text>
          </View>
        </View>
      );
    return null;
  };

  const onPressLogout = () => {
    try {
      const webengage = new WebEngage();
      webengage.user.logout();
      postAppsFlyerEvent(AppsFlyerEventName.USER_LOGGED_OUT, {});
      postFirebaseEvent(FirebaseEventName.USER_LOGGED_OUT, {});
      AsyncStorage.setItem('userLoggedIn', 'false');
      AsyncStorage.setItem('multiSignUp', 'false');
      AsyncStorage.setItem('signUp', 'false');
      AsyncStorage.setItem('selectUserId', '');
      AsyncStorage.setItem('selectUserUHId', '');
      AsyncStorage.removeItem('phoneNumber');
      AsyncStorage.setItem('logginHappened', 'false');
      AsyncStorage.removeItem('deeplink');
      AsyncStorage.removeItem('deeplinkReferalCode');
      AsyncStorage.removeItem('isCircleMember');
      AsyncStorage.removeItem('saveTokenDeviceApiCall');
      AsyncStorage.removeItem(LOGIN_PROFILE);
      AsyncStorage.removeItem('PharmacyLocationPincode');
      AsyncStorage.setItem(SKIP_LOCATION_PROMPT, 'false');
      AsyncStorage.setItem(HEALTH_CREDITS, '');
      setSavePatientDetails && setSavePatientDetails('');
      setHdfcUserSubscriptions && setHdfcUserSubscriptions(null);
      setBannerData && setBannerData([]);
      setIsCircleSubscription && setIsCircleSubscription(false);
      setCircleMembershipCharges && setCircleMembershipCharges(0);
      setCircleSubscription && setCircleSubscription(null);
      setCorporateSubscriptions && setCorporateSubscriptions([]);
      signOut();
      setTagalysConfig(null);
      setCircleSubscriptionId && setCircleSubscriptionId('');
      setPhrSession?.('');
      AsyncStorage.removeItem('circlePlanSelected');
      AsyncStorage.removeItem('circleSubscriptionId');
      AsyncStorage.removeItem('isCorporateSubscribed');
      AsyncStorage.removeItem('VaccinationCmsIdentifier');
      AsyncStorage.removeItem('VaccinationSubscriptionId');
      AsyncStorage.removeItem('hasAgreedVaccineTnC');
      AsyncStorage.removeItem('circleSubscriptionId');
      clearCartInfo && clearCartInfo();
      clearDiagnoticCartInfo && clearDiagnoticCartInfo();
      setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
      props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: AppRoutes.Login })],
        })
      );
    } catch (error) {}
  };

  const client = useApolloClient();

  const deleteDeviceToken = async () => {
    setshowSpinner(true);

    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const currentDeviceToken = deviceToken ? JSON.parse(deviceToken) : '';

    const input = {
      deviceToken: currentDeviceToken,
      patientId: currentPatient ? currentPatient && currentPatient.id : '',
    };

    client
      .mutate<deleteDeviceToken, deleteDeviceTokenVariables>({
        mutation: DELETE_DEVICE_TOKEN,
        variables: input,
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        setshowSpinner(false);
        onPressLogout();
      })
      .catch((e) => {
        CommonBugFender('MyAccount_deleteDeviceToken', e);
        try {
          setshowSpinner(false);
          onPressLogout();
        } catch (err) {
          CommonBugFender('MyAccount_deleteDeviceToken_logout_try', err);
        }
      });
  };

  const [imgHeight, setImgHeight] = useState(120);
  const { width: winWidth } = Dimensions.get('window');
  const renderAnimatedHeader = () => {
    return (
      <>
        <View
          style={{
            backgroundColor: theme.colors.WHITE,
          }}
        >
          <View
            style={{
              minHeight: 200,
              alignItems: 'center',
              // justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {profileDetails &&
            profileDetails.photoUrl &&
            profileDetails.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/) ? (
              <Image
                source={{ uri: profileDetails.photoUrl }}
                onLoad={(value) => {
                  const { height, width } = value.nativeEvent.source;
                  setImgHeight(height * (winWidth / width));
                }}
                style={{ width: winWidth, height: winWidth }}
                resizeMode={'contain'}
              />
            ) : (
              <Image
                source={require('@aph/mobile-patients/src/components/ui/icons/no-photo-icon-round.webp')}
                style={{ top: 10, height: 200, width: '100%' }}
                resizeMode={'contain'}
              />
            )}
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              props.navigation.navigate(AppRoutes.EditProfile, {
                isEdit: true,
                profileData: currentPatient,
                mobileNumber: currentPatient && currentPatient!.mobileNumber,
              });
            }}
            style={styles.editIconstyles}
          >
            <EditIconNew style={styles.editIcon} />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const renderTopView = () => {
    const containerStyle: ViewStyle =
      scrollOffset > 1
        ? {
            shadowColor: '#808080',
            shadowOffset: { width: 0, height: 0 },
            zIndex: 1,
            shadowOpacity: 0.4,
            shadowRadius: 5,
            elevation: 5,
          }
        : {
            zIndex: 1,
            backgroundColor: 'transparent',
          };
    return (
      <TabHeader
        containerStyle={[
          containerStyle,
          { position: 'absolute', top: statusBarHeight(), width: '100%' },
        ]}
        navigation={props.navigation}
      />
    );
  };

  const fireProfileAccessedEvent = (type: string) => {
    const eventAttributes: FirebaseEvents[FirebaseEventName.PROFILE_ACCESSED] = {
      Type: type,
    };
    postAppsFlyerEvent(AppsFlyerEventName.PROFILE_ACCESSED, eventAttributes);
    postFirebaseEvent(FirebaseEventName.PROFILE_ACCESSED, eventAttributes);
  };

  const renderAboutApollo = () => {
    return (
      <View>
        {string.aboutApolloList.map((item, index) => {
          return (
            <TouchableOpacity
              style={[
                styles.aboutContainer,
                {
                  marginTop: index === 0 ? 20 : 12,
                },
              ]}
              key={index}
              onPress={() => {
                props.navigation.navigate(AppRoutes.CommonWebView, {
                  url: item.url,
                });
              }}
            >
              <Text style={styles.aboutTextItem}>{item.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderRows = () => {
    return (
      <View>
        <ListCard
          container={{ marginTop: 14 }}
          title={'Manage Family Members'}
          leftIcon={<ManageProfileIcon />}
          onPress={() => {
            props.navigation.navigate(AppRoutes.ManageProfile, {
              mobileNumber: profileDetails && profileDetails.mobileNumber,
            });
            fireProfileAccessedEvent('Manage Family Members');
          }}
        />
        <ListCard
          container={{ marginTop: 4 }}
          title={'Address Book'}
          leftIcon={<Location />}
          onPress={() => {
            props.navigation.navigate(AppRoutes.AddressBook);
            fireProfileAccessedEvent('Address Book');
          }}
        />
        <ListCard
          title={'My Orders'}
          leftIcon={<Invoice />}
          onPress={() => {
            postMyOrdersClicked('My Account', currentPatient);
            props.navigation.navigate(AppRoutes.MyOrdersScreen, {
              patientId: currentPatient.id,
              fromNotification: false,
            });
            fireProfileAccessedEvent('My Orders');
          }}
        />
        <ListCard
          title={'My Payments'}
          leftIcon={<CurrencyIcon />}
          onPress={() => {
            props.navigation.navigate(AppRoutes.MyPaymentsScreen, {
              patientId: currentPatient.id,
              fromNotification: false,
            });
            fireProfileAccessedEvent('My Payments');
          }}
        />
        <ListCard
          title={'OneApollo Memberships'}
          leftIcon={<OneApollo style={{ height: 20, width: 26 }} />}
          onPress={() => {
            props.navigation.navigate(AppRoutes.OneApolloMembership);
            fireProfileAccessedEvent('OneApollo Membership');
          }}
        />
        <ListCard
          title={'My Memberships'}
          leftIcon={<MyMembershipIcon style={{ height: 20, width: 26 }} />}
          onPress={() => {
            props.navigation.navigate(AppRoutes.MyMembership);
            fireProfileAccessedEvent('My Memberships');
          }}
        />
        <ListCard
          title={'Need Help'}
          leftIcon={<NeedHelpIcon />}
          onPress={() => {
            props.navigation.navigate(AppRoutes.MobileHelp);
            fireProfileAccessedEvent('Need Help');
          }}
        />
        <ListCard
          container={{ height: 'auto' }}
          title={'About Apollo 247'}
          leftIcon={<Apollo247Icon />}
          rightIcon={showAboutUsSection ? <Down /> : <ArrowRight />}
          onPress={() => setShowAboutUsSection(!showAboutUsSection)}
          children={showAboutUsSection ? renderAboutApollo() : null}
        />
        <ListCard
          container={{ marginBottom: 32 }}
          title={'Logout'}
          leftIcon={<Afternoon />}
          onPress={deleteDeviceToken}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        {renderTopView()}
        <ScrollView
          bounces={false}
          style={{ flex: 1 }}
          onScroll={handleScroll}
          scrollEventThrottle={20}
        >
          {renderAnimatedHeader()}
          {profileDetails && renderDetails()}
          {renderRows()}
          <View style={{ height: 92, marginBottom: 0 }}>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansBold(13),
                color: '#00b38e',
                textAlign: 'center',
                height: 92,
                width: width,
                paddingTop: 20,
              }}
            >
              {`${AppConfig.APP_ENV} - v ${
                Platform.OS === 'ios'
                  ? AppConfig.Configuration.iOS_Version
                  : AppConfig.Configuration.Android_Version
              }${codePushVersion ? `.${codePushVersion}` : ''}`}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
      {networkStatus && <NoInterNetPopup onClickClose={() => setNetworkStatus(false)} />}
      {showSpinner && <Spinner />}
    </View>
  );
};
