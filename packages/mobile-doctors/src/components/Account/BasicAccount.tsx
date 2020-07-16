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
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { apiRoutes } from '@aph/mobile-doctors/src/helpers/apiRoutes';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { getBuildEnvironment } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { string } from '@aph/mobile-doctors/src/strings/string';

const { width } = Dimensions.get('window');
const styles = BasicAccountStyles;

export interface MyAccountProps extends NavigationScreenProps {}

export const BasicAccount: React.FC<MyAccountProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<KeyboardAwareScrollView | null>();
  const { doctorDetails, getDoctorDetailsApi } = useAuth();

  useEffect(() => {
    if (!doctorDetails) {
      getDoctorDetailsApi &&
        getDoctorDetailsApi()
          .then((res) => setLoading(false))
          .catch((error) => {
            setLoading(false);
            CommonBugFender('Get_Doctor_DetailsApi', error);
          });
    }
  }, [doctorDetails, getDoctorDetailsApi]);

  const arrayData = [
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
    },
    {
      label: strings.account.availability,
      navigation: AppRoutes.MyAvailability,
      icon: <AvailabilityIcon />,
      navigationParams: { ProfileData: doctorDetails },
      isDataDependent: true,
    },
    {
      label: strings.account.fees,
      navigation: AppRoutes.MyFees,
      icon: <FeeIcon />,
      navigationParams: { ProfileData: doctorDetails },
      isDataDependent: true,
    },
    {
      label: strings.account.smart_prescr,
      navigation: AppRoutes.SmartPrescription,
      icon: <SmartPrescription />,
      navigationParams: { ProfileData: doctorDetails },
      isDataDependent: true,
    },
    {
      label: strings.account.settings,
      navigation: AppRoutes.MyAccount,
      icon: <Settings />,
      navigationParams: { ProfileData: doctorDetails },
      isDataDependent: false,
    },
  ];

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

  const renderData = () => {
    return (
      <View style={{ marginVertical: 16 }}>
        {arrayData.map((item) => (
          <View style={[styles.cardContainer]}>
            <TouchableOpacity
              onPress={() => {
                if (item.isDataDependent && doctorDetails === null) {
                  return;
                }
                props.navigation.navigate(item.navigation, item.navigationParams);
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
          {loading ? (
            <Spinner />
          ) : (
            <View style={{ flex: 1 }}>
              {doctorDetails && doctorDetails.photoUrl ? (
                <Image
                  style={styles.imageStyle}
                  source={{
                    uri: doctorDetails.photoUrl,
                  }}
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
              <View style={{ marginTop: 20 }}>
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
          )}
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};
