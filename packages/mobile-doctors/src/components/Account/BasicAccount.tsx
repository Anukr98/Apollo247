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
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

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
    {
      label: strings.account.my_stats,
      navigation: AppRoutes.MyStats,
      icon: <SmartPrescription />,
      navigationParams: {},
    },
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
        <Text
          style={{
            color: '#02475b',
            ...theme.fonts.IBMPlexSansSemiBold(18),
            marginLeft: 20,
            marginTop: 12,
          }}
        >
          {strings.common.dr} {getDoctorDetails.firstName} {getDoctorDetails.lastName}
        </Text>
      </View>
    );
  };
  const renderMciNumberData = (getDoctorDetails: GetDoctorDetails_getDoctorDetails) => {
    if (!getDoctorDetails.registrationNumber) return null;
    return (
      <View style={{ backgroundColor: '#ffffff' }}>
        <Text
          style={{
            color: '#0087ba',
            ...theme.fonts.IBMPlexSansMedium(12),
            marginLeft: 20,
            marginTop: 2,
            marginBottom: 12,
          }}
        >
          {strings.account.mci_num} : {getDoctorDetails.registrationNumber}
        </Text>
      </View>
    );
  };

  const renderData = () => {
    return (
      <View style={{ marginTop: 16 }}>
        {arrayData.map((item) => (
          <View style={[styles.cardContainer]}>
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate(item.navigation, item.navigationParams);
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 10,
                  marginTop: 10,
                  marginLeft: 20,
                  alignItems: 'center',
                }}
              >
                {item.icon}
                <Text style={styles.headingText}>{item.label}</Text>
                <View style={{ alignItems: 'flex-end', flex: 1, marginRight: 20 }}>
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
                  <View
                    style={{
                      backgroundColor: '#ffffff',
                      shadowColor: '#000000',
                      shadowOffset: {
                        width: 0,
                        height: 5,
                      },
                      shadowRadius: 10,
                      shadowOpacity: 0.2,
                      elevation: 5,
                    }}
                  >
                    {renderProfileData(doctorDetails)}
                    {renderMciNumberData(doctorDetails)}
                  </View>
                  {renderData()}
                </>
              )
            )}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};
