import {
  PatientPlaceHolderImage,
  Block,
  CalendarIcon,
  RightIcon,
  Notification,
  Profile,
  AvailabilityIcon,
  FeeIcon,
  SmartPrescription,
  Settings,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { GET_DOCTOR_DETAILS } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  GetDoctorDetails,
  GetDoctorDetails_getDoctorDetails,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import React, { useEffect, useState, useRef } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Availability } from '@aph/mobile-doctors/src/components/ProfileSetup/Availability';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    borderRadius: 5,
    backgroundColor: theme.colors.CARD_BG,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  headingText: {
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansMedium(15),
    marginLeft: 20,
  },
});
export interface MyAccountProps extends NavigationScreenProps {}

export const BasicAccount: React.FC<MyAccountProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isReloading, setReloading] = useState<boolean>(false);
  const scrollViewRef = useRef<KeyboardAwareScrollView | null>();
  const { setDoctorDetails, isDelegateLogin, doctorDetails } = useAuth();

  const client = useApolloClient();

  useEffect(() => {
    setLoading(true);
    client
      .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS, fetchPolicy: 'no-cache' })
      .then((_data) => {
        const result = _data.data.getDoctorDetails;
        console.log('doctorDetails', _data!);
        setDoctorDetails && setDoctorDetails(result);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        console.log('Error occured while fetching Doctor', e);
      });
  }, []);

  const renderProfileData = (getDoctorDetails: any) => {
    console.log('getDoctorDetails', getDoctorDetails!.firstName);
    if (!getDoctorDetails!.firstName) return null;
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
          Dr. {getDoctorDetails!.firstName} {getDoctorDetails!.lastName}
        </Text>
      </View>
    );
  };
  const renderMciNumberData = (getDoctorDetails: any) => {
    console.log('getDoctorDetails', getDoctorDetails!.registrationNumber);
    if (!getDoctorDetails!.registrationNumber) return null;
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
          MCI Number : {getDoctorDetails!.registrationNumber}
        </Text>
      </View>
    );
  };

  const renderMyStatsView = () => {
    return (
      <View style={[styles.cardContainer]}>
        <TouchableOpacity
          onPress={() => {
            console.log('MyStats ');
            props.navigation.navigate(AppRoutes.MyStats);
          }}
        >
          <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 10, marginLeft: 20 }}>
            <SmartPrescription />
            <Text style={styles.headingText}>My Stats</Text>
            <View style={{ alignItems: 'flex-end', position: 'absolute', right: 20 }}>
              <RightIcon />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const renderMyProfileView = (data: GetDoctorDetails_getDoctorDetails) => {
    return (
      <View style={[styles.cardContainer]}>
        <TouchableOpacity
          onPress={() => {
            console.log('hi', data);
            props.navigation.navigate(AppRoutes.MyAccountProfile, { ProfileData: data });
          }}
        >
          <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 10, marginLeft: 20 }}>
            <Profile />
            <Text style={styles.headingText}>My Profile</Text>
            <View style={{ alignItems: 'flex-end', position: 'absolute', right: 20 }}>
              <RightIcon />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const renderAvailabilityView = (data: GetDoctorDetails_getDoctorDetails) => {
    return (
      <View style={[styles.cardContainer]}>
        <TouchableOpacity
          onPress={() => {
            console.log('hi', data);
            props.navigation.navigate(AppRoutes.MyAvailability, { ProfileData: data });
          }}
        >
          <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 10, marginLeft: 20 }}>
            <AvailabilityIcon />
            <Text style={styles.headingText}>Availability</Text>
            <View style={{ alignItems: 'flex-end', position: 'absolute', right: 20 }}>
              <RightIcon />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFeesView = (data: GetDoctorDetails_getDoctorDetails) => {
    return (
      <View style={[styles.cardContainer]}>
        <TouchableOpacity
          onPress={() => {
            console.log('hi', data);
            props.navigation.navigate(AppRoutes.MyFees, { ProfileData: data });
          }}
        >
          <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 10, marginLeft: 20 }}>
            <FeeIcon />
            <Text style={styles.headingText}>Fees</Text>
            <View style={{ alignItems: 'flex-end', position: 'absolute', right: 20 }}>
              <RightIcon />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const renderSmartPrescriptionView = (data: GetDoctorDetails_getDoctorDetails) => {
    return (
      <View style={[styles.cardContainer]}>
        {/* <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 10, marginLeft: 20 }}>
          <SmartPrescription />
          <Text style={styles.headingText}>Smart Prescription</Text>
          <View style={{ alignItems: 'flex-end', position: 'absolute', right: 20 }}>
            <RightIcon />
          </View>
        </View> */}
        <TouchableOpacity
          onPress={() => {
            console.log('smart prescr', data);
            props.navigation.navigate(AppRoutes.SmartPrescription, { ProfileData: data });
          }}
        >
          <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 10, marginLeft: 20 }}>
            <SmartPrescription />
            <Text style={styles.headingText}>Smart Prescription</Text>
            <View style={{ alignItems: 'flex-end', position: 'absolute', right: 20 }}>
              <RightIcon />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const renderSettingsView = () => {
    return (
      <View style={[styles.cardContainer]}>
        <TouchableOpacity onPress={() => props.navigation.push(AppRoutes.MyAccount)}>
          <View style={{ flexDirection: 'row', marginBottom: 10, marginTop: 10, marginLeft: 20 }}>
            <Settings />
            <Text style={styles.headingText}>Settings</Text>
            <View style={{ alignItems: 'flex-end', position: 'absolute', right: 20 }}>
              <RightIcon />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <ScrollView bounces={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            ref={(ref) => (scrollViewRef.current = ref)}
            bounces={false}
          >
            {loading ? (
              <View style={{ flex: 1, alignSelf: 'center', marginTop: height / 3 }}>
                <ActivityIndicator size="large" color="green" />
              </View>
            ) : (
              !!doctorDetails && (
                <>
                  {doctorDetails!.photoUrl ? (
                    <Image
                      style={{ height: 178, width: '100%' }}
                      source={{
                        uri: doctorDetails!.photoUrl,
                      }}
                    />
                  ) : (
                    <PatientPlaceHolderImage />
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
                  <View style={{ marginTop: 16 }}>
                    {renderMyStatsView()}
                    {renderMyProfileView(doctorDetails)}
                    {renderAvailabilityView(doctorDetails)}
                    {renderFeesView(doctorDetails)}
                    {renderSmartPrescriptionView(doctorDetails)}
                    {renderSettingsView()}
                  </View>
                </>
              )
            )}
          </KeyboardAwareScrollView>
        </SafeAreaView>
        {isReloading && <Loader fullScreen flex1 />}
      </ScrollView>
    </View>
  );
};
