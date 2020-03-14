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

const { width } = Dimensions.get('window');
const styles = BasicAccountStyles;

export interface MyAccountProps extends NavigationScreenProps {}

export const BasicAccount: React.FC<MyAccountProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<KeyboardAwareScrollView | null>();
  const { doctorDetails, getDoctorDetailsApi } = useAuth();

  const buildName = () => {
    switch (apiRoutes.graphql()) {
      case 'https://aph.dev.api.popcornapps.com//graphql':
        return 'DEV';
      case 'https://aph.staging.api.popcornapps.com//graphql':
        return 'QA';
      case 'https://aph.uat.api.popcornapps.com//graphql':
        return 'UAT';
      case 'https://aph.vapt.api.popcornapps.com//graphql':
        return 'VAPT';
      case 'https://api.apollo247.com//graphql':
        return 'PROD';
      case 'https://asapi.apollo247.com//graphql':
        return 'PRF';
      default:
        return '';
    }
  };

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
    },
    {
      label: strings.account.availability,
      navigation: AppRoutes.MyAvailability,
      icon: <AvailabilityIcon />,
      navigationParams: { ProfileData: doctorDetails },
    },
    {
      label: strings.account.fees,
      navigation: AppRoutes.MyFees,
      icon: <FeeIcon />,
      navigationParams: { ProfileData: doctorDetails },
    },
    {
      label: strings.account.smart_prescr,
      navigation: AppRoutes.SmartPrescription,
      icon: <SmartPrescription />,
      navigationParams: { ProfileData: doctorDetails },
    },
    {
      label: strings.account.settings,
      navigation: AppRoutes.MyAccount,
      icon: <Settings />,
      navigationParams: { ProfileData: doctorDetails },
    },
  ];

  const renderProfileData = (getDoctorDetails: GetDoctorDetails_getDoctorDetails) => {
    if (!getDoctorDetails.firstName) return null;
    return (
      <View>
        <Text style={styles.profile}>
          {strings.common.dr} {getDoctorDetails.firstName} {getDoctorDetails.lastName}
        </Text>
      </View>
    );
  };
  const renderMciNumberData = (getDoctorDetails: GetDoctorDetails_getDoctorDetails) => {
    if (!getDoctorDetails.registrationNumber) return null;
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

  return (
    <View style={theme.viewStyles.container}>
      <ScrollView bounces={false}>
        <SafeAreaView style={theme.viewStyles.container}>
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            ref={(ref) => (scrollViewRef.current = ref)}
            bounces={false}
          >
            {loading ? (
              <Spinner />
            ) : (
              !!doctorDetails && (
                <>
                  {doctorDetails.photoUrl ? (
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
                  </View>
                  {renderData()}
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
                      {`${buildName()} - v ${
                        Platform.OS === 'ios'
                          ? AppConfig.Configuration.iOS_Version
                          : AppConfig.Configuration.Android_Version
                      }`}
                    </Text>
                  </View>
                </>
              )
            )}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};
