import BasicAccountStyles from '@aph/mobile-doctors/src/components/Account/BasicAccount.styles';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import {
  AvailabilityIcon,
  FeeIcon,
  Profile,
  RightIcon,
  Settings,
  SmartPrescription,
  UserPlaceHolder,
  Link,
  Logout,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  NavigationScreenProps,
  ScrollView,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { getBuildEnvironment, g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { string } from '@aph/mobile-doctors/src/strings/string';
import AsyncStorage from '@react-native-community/async-storage';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { useApolloClient } from 'react-apollo-hooks';
import {
  deleteDoctorDeviceToken,
  deleteDoctorDeviceTokenVariables,
} from '@aph/mobile-doctors/src/graphql/types/deleteDoctorDeviceToken';
import { DELETE_DOCTOR_DEVICE_TOKEN } from '@aph/mobile-doctors/src/graphql/profiles';
import { clearUserData } from '@aph/mobile-doctors/src/helpers/localStorage';
import {
  postWebEngageEvent,
  setScreenName,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-doctors/src/helpers/WebEngageHelper';
import FastImage from 'react-native-fast-image';

const { width } = Dimensions.get('window');
const styles = BasicAccountStyles;

export interface MyAccountProps extends NavigationScreenProps {
  goToItem?: string;
}

interface menuItemType {
  label: string;
  navigation?: AppRoutes;
  icon: JSX.Element;
  navigationParams: {
    ProfileData: GetDoctorDetails_getDoctorDetails | null;
  };
  isDataDependent: boolean;
  onPress?: () => void;
  goToName?: string;
}

export const BasicAccount: React.FC<MyAccountProps> = (props) => {
  const scrollViewRef = useRef<KeyboardAwareScrollView | null>();
  const { doctorDetails, getDoctorDetailsApi, clearFirebaseUser } = useAuth();
  const client = useApolloClient();
  const { setLoading } = useUIElements();
  const goToItem = props.navigation.getParam('goToItem');

  useEffect(() => {
    if (!doctorDetails) {
      getDoctorDetailsApi &&
        getDoctorDetailsApi()
          .then((res) => setLoading && setLoading(false))
          .catch((error) => {
            setLoading && setLoading(false);
            CommonBugFender('Get_Doctor_DetailsApi', error);
          });
    }
  }, [doctorDetails, getDoctorDetailsApi]);

  const arrayData: menuItemType[] = [
    // {
    //   label: strings.account.my_stats,
    //   navigation: AppRoutes.MyStats,
    //   icon: <SmartPrescription />,
    //   navigationParams: {},
    // },
    {
      label: strings.account.my_profile,
      navigation: AppRoutes.MyAccountProfile,
      icon: <Profile />,
      navigationParams: { ProfileData: doctorDetails },
      isDataDependent: true,
      goToName: 'profile',
    },
    {
      label: strings.account.availability,
      navigation: AppRoutes.MyAvailability,
      icon: <AvailabilityIcon />,
      navigationParams: { ProfileData: doctorDetails },
      isDataDependent: true,
      goToName: 'availability',
    },
    {
      label: strings.account.fees,
      navigation: AppRoutes.MyFees,
      icon: <FeeIcon />,
      navigationParams: { ProfileData: doctorDetails },
      isDataDependent: true,
      goToName: 'fees',
    },
    {
      label: strings.account.smart_prescr,
      navigation: AppRoutes.SmartPrescription,
      icon: <SmartPrescription />,
      navigationParams: { ProfileData: doctorDetails },
      isDataDependent: true,
      goToName: 'smartPrescription',
    },
    {
      label: strings.account.settings,
      navigation: AppRoutes.MyAccount,
      icon: <Settings />,
      navigationParams: { ProfileData: doctorDetails },
      isDataDependent: false,
      goToName: 'settings',
    },
    {
      label: strings.account.logout,
      onPress: () => {
        deleteDeviceToken();
      },
      icon: <Logout />,
      navigationParams: { ProfileData: doctorDetails },
      isDataDependent: false,
    },
  ];

  useEffect(() => {
    if (doctorDetails) {
      if (goToItem) {
        const isRouteExisting = arrayData.findIndex((item) => item.goToName == goToItem);
        if (isRouteExisting > -1) {
          onPressofMenuItem(arrayData[isRouteExisting]);
        } else if (goToItem === 'sharelink') {
          props.navigation.navigate(AppRoutes.SharingScreen);
        }
        props.navigation.setParams({ goToItem: '' });
      }
    }
  }, [goToItem, doctorDetails]);

  const deleteDeviceToken = async () => {
    const deviceToken = JSON.parse((await AsyncStorage.getItem('deviceToken')) || '');
    setLoading && setLoading(true);
    client
      .mutate<deleteDoctorDeviceToken, deleteDoctorDeviceTokenVariables>({
        mutation: DELETE_DOCTOR_DEVICE_TOKEN,
        variables: {
          doctorId: doctorDetails && doctorDetails.id,
          deviceToken: deviceToken,
        },
      })
      .then((data) => {
        Promise.all([clearFirebaseUser && clearFirebaseUser(), clearUserData()])
          .then(() => {
            setLoading && setLoading(false);
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: AppRoutes.Login })],
              })
            );
          })
          .catch((e) => {
            setLoading && setLoading(false);
            console.log(e);
            Alert.alert(strings.common.error, strings.login.signout_error);
          });
      })
      .catch((error) => {
        setLoading && setLoading(false);
        Alert.alert(strings.common.error, strings.login.signout_error);
      });
  };
  const renderProfileData = (getDoctorDetails: GetDoctorDetails_getDoctorDetails | null) => {
    if ((getDoctorDetails && !getDoctorDetails.firstName) || getDoctorDetails === null) return null;
    return (
      <View>
        <Text style={styles.profile} numberOfLines={1}>
          {getDoctorDetails.displayName}
        </Text>
      </View>
    );
  };
  const renderMciNumberData = (getDoctorDetails: GetDoctorDetails_getDoctorDetails | null) => {
    if ((getDoctorDetails && !getDoctorDetails.registrationNumber) || getDoctorDetails === null)
      return null;
    return (
      <View style={{ backgroundColor: '#ffffff' }}>
        <Text style={styles.mci}>
          {strings.account.mci_num} : {getDoctorDetails.registrationNumber}
        </Text>
      </View>
    );
  };

  const onPressofMenuItem = (item: menuItemType) => {
    if (item.isDataDependent && doctorDetails === null) {
      return;
    }
    if (item.navigation) {
      setScreenName(item.label);
      if (item.label === strings.account.settings) {
        postWebEngageEvent(WebEngageEventName.DOCTOR_CLICKED_SETTINGS, {
          'Doctor Mobile number': g(doctorDetails, 'mobileNumber') || '',
          'Doctor name': g(doctorDetails, 'fullName') || '',
        } as WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED_SETTINGS]);
        getDoctorDetailsApi && getDoctorDetailsApi();
      }
      props.navigation.navigate(item.navigation, item.navigationParams);
    } else if (item.onPress) {
      item.onPress();
    }
  };

  const renderData = () => {
    return (
      <View style={{ marginVertical: 16 }}>
        {arrayData.map((item) => (
          <View style={[styles.cardContainer]}>
            <TouchableOpacity
              onPress={() => {
                onPressofMenuItem(item);
              }}
            >
              <View style={styles.iconview}>
                {item.icon}
                <Text style={styles.headingText}>{item.label}</Text>
                <View style={styles.righticon}>
                  <RightIcon />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };
  const renderShareLink = () => {
    return (
      <View style={styles.shareLinkContainer}>
        <Text style={styles.shareHeaderText}>{string.account.share_heading}</Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props.navigation.navigate(AppRoutes.SharingScreen);
          }}
          style={styles.linkIconContainer}
        >
          <Link />
          <Text style={styles.shareText}>{string.account.share_text}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={theme.viewStyles.container}>
      <ScrollView style={theme.viewStyles.container} bounces={false}>
        <SafeAreaView style={theme.viewStyles.container}>
          <View style={{ flex: 1 }}>
            {doctorDetails && doctorDetails.photoUrl ? (
              <FastImage
                style={styles.imageStyle}
                source={{
                  uri: doctorDetails.photoUrl,
                }}
                resizeMode="contain"
              />
            ) : (
              <UserPlaceHolder style={styles.imageStyle} />
            )}
            <View style={styles.shadow}>
              {renderProfileData(doctorDetails)}
              {renderMciNumberData(doctorDetails)}
              {renderShareLink()}
            </View>
            {renderData()}
            <View style={{ marginVertical: 20 }}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansBold(13),
                  color: '#00b38e',
                  textAlign: 'center',
                }}
              >
                {`${getBuildEnvironment()} - v ${
                  Platform.OS === 'ios'
                    ? AppConfig.Configuration.iOS_Version
                    : AppConfig.Configuration.Android_Version
                }`}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};
