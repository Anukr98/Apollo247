import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  Afternoon,
  CurrencyIcon,
  EditIconNew,
  Invoice,
  Location,
  ManageProfileIcon,
  NeedHelpIcon,
  OneApollo,
  LinkedUhidIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DELETE_DEVICE_TOKEN } from '@aph/mobile-patients/src/graphql/profiles';
import {
  deleteDeviceToken,
  deleteDeviceTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/deleteDeviceToken';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { g, getNetStatus, statusBarHeight } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { postMyOrdersClicked } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import Moment from 'moment';
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
import WebEngage from 'react-native-webengage';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { TabHeader } from '@aph/mobile-patients/src/components/ui/TabHeader';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import codePush from 'react-native-code-push';
import { setTagalysConfig } from '@aph/mobile-patients/src/helpers/Tagalys';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  topView: {
    marginBottom: 8,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    // marginTop: 160,
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
    // bottom: 16,
    // right: 0,
    // position: 'absolute',
  },
  editIconstyles: {
    bottom: 16,
    right: 0,
    position: 'absolute',
    marginRight: 20,
    marginBottom: 17,
  },
  // noteIcon: {
  //   width: 24,
  //   height: 24,
  //   bottom: 0,
  //   right: 0,
  //   top: 0,
  //   position: 'absolute',
  // },
  // noteIconstyles: {
  //   // marginRight: 20,
  //   // marginBottom: 17,
  // },
  // cartIconstyles: {
  //   // marginRight: 24,
  // },
  // cartIcon: {
  //   width: 24,
  //   height: 24,
  //   // bottom: 0,
  //   // right: 24,
  //   // top: 0,
  //   // position: 'absolute',
  // },
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
  const [profileDetails, setprofileDetails] = useState<
    GetCurrentPatients_getCurrentPatients_patients | null | undefined
  >(currentPatient);
  const { signOut, getPatientApiCall } = useAuth();
  const { setSavePatientDetails, setAppointmentsPersonalized } = useAppCommonData();

  useEffect(() => {
    updateCodePushVersioninUi();
  }, []);

  const updateCodePushVersioninUi = async () => {
    try {
      const version = (await codePush.getUpdateMetadata())!.label;
      setCodePushVersion(version.replace('v', 'H'));
    } catch (error) {
      CommonBugFender(`${AppRoutes.MyAccount}_codePush.getUpdateMetadata`, error);
    }
  };

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
    // currentPatient && AsyncStorage.setItem('phoneNumber', currentPatient.mobileNumber.substring(3));
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
                {profileDetails.dateOfBirth
                  ? Math.round(
                      Moment().diff(profileDetails.dateOfBirth, 'years', true)
                    ).toString() || '-'
                  : '-'}
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
      AsyncStorage.setItem('userLoggedIn', 'false');
      AsyncStorage.setItem('multiSignUp', 'false');
      AsyncStorage.setItem('signUp', 'false');
      AsyncStorage.setItem('selectUserId', '');
      AsyncStorage.setItem('selectUserUHId', '');
      AsyncStorage.removeItem('phoneNumber');
      AsyncStorage.setItem('logginHappened', 'false');
      AsyncStorage.removeItem('deeplink');
      AsyncStorage.removeItem('deeplinkReferalCode');
      setSavePatientDetails && setSavePatientDetails('');
      setAppointmentsPersonalized && setAppointmentsPersonalized([]);
      signOut();
      setTagalysConfig(null);

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
      deviceToken: currentDeviceToken.deviceToken,
      patientId: currentPatient ? currentPatient && currentPatient.id : '',
    };
    console.log('deleteDeviceTokenInput', input);

    client
      .mutate<deleteDeviceToken, deleteDeviceTokenVariables>({
        mutation: DELETE_DEVICE_TOKEN,
        variables: input,
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        console.log('deleteDeviceTokendata', data);
        setshowSpinner(false);
        onPressLogout();
      })
      .catch((e) => {
        CommonBugFender('MyAccount_deleteDeviceToken', e);
        try {
          console.log('deleteDeviceTokenerror', e);
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
                // source={require('@aph/mobile-patients/src/components/ui/icons/no-photo-icon-round.png')}

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
                source={require('@aph/mobile-patients/src/components/ui/icons/no-photo-icon-round.png')}
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
    // console.log(`scrollOffset, ${event.nativeEvent.contentOffset.y}`);
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
        // hideHomeIcon={!(scrollOffset > 1)}
        containerStyle={[
          containerStyle,
          { position: 'absolute', top: statusBarHeight(), width: '100%' },
        ]}
        navigation={props.navigation}
      />
    );
  };

  const renderRows = () => {
    return (
      <View>
        <ListCard
          container={{ marginTop: 14 }}
          title={'Manage Family Members'}
          leftIcon={<ManageProfileIcon />}
          onPress={() =>
            props.navigation.navigate(AppRoutes.ManageProfile, {
              mobileNumber: profileDetails && profileDetails.mobileNumber,
            })
          }
        />
        <ListCard
          container={{ marginTop: 4 }}
          title={'Address Book'}
          leftIcon={<Location />}
          onPress={() => props.navigation.navigate(AppRoutes.AddressBook)}
        />
        <ListCard
          title={'My Orders'}
          leftIcon={<Invoice />}
          onPress={() => {
            postMyOrdersClicked('My Account', currentPatient);
            props.navigation.navigate(AppRoutes.YourOrdersScene);
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
          }}
        />
        <ListCard
          title={'OneApollo Membership'}
          leftIcon={<OneApollo style={{ height: 20, width: 26 }} />}
          onPress={() => {
            props.navigation.navigate(AppRoutes.OneApolloMembership);
          }}
        />
        <ListCard
          title={'Need Help'}
          leftIcon={<NeedHelpIcon />}
          onPress={() => {
            props.navigation.navigate(AppRoutes.MobileHelp);
          }}
        />
        {/* <ListCard
          // container={{ marginBottom: 32 }}
          container={{ marginTop: 4 }}
          title={'Notification Settings'}
          leftIcon={<NotificaitonAccounts />}
          onPress={() => props.navigation.navigate(AppRoutes.NotificationSettings)}
        /> */}
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
          {/* <NeedHelpAssistant
            navigation={props.navigation}
            onNeedHelpPress={() => {
              postWEGNeedHelpEvent(currentPatient, 'My Account');
            }}
          /> */}
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
