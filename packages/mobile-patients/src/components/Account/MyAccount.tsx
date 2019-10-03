import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Location,
  NotificaitonAccounts,
  PatientDefaultImage,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  AsyncStorage,
  Dimensions,
  Platform,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { getNetStatus } from '../../helpers/helperFunctions';
import { BottomPopUp } from '../ui/BottomPopUp';
import { NoInterNetPopup } from '../ui/NoInterNetPopup';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  topView: {
    backgroundColor: theme.colors.WHITE,
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
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [scrollY] = useState(new Animated.Value(0));
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);
  const [profileDetails, setprofileDetails] = useState<
    GetCurrentPatients_getCurrentPatients_patients | null | undefined
  >(currentPatient);
  const { signOut, getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const headMov = scrollY.interpolate({
    inputRange: [0, 180, 181],
    outputRange: [0, -105, -105],
  });
  const headColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['white', 'white'],
  });
  const imgOp = scrollY.interpolate({
    inputRange: [0, 180, 181],
    outputRange: [1, 0, 0],
  });

  useEffect(() => {
    getNetStatus().then((status) => {
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
    });
  }, [currentPatient, profileDetails]);

  const renderDetails = () => {
    if (profileDetails)
      return (
        <View style={styles.topView}>
          <View style={styles.detailsViewStyle}>
            <Text style={styles.doctorNameStyles}>
              {profileDetails.firstName} {profileDetails.lastName}
            </Text>
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
                {Math.round(Moment().diff(profileDetails.dateOfBirth, 'years', true))}
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

  const handleScroll = () => {};

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: profileDetails ? `${profileDetails.firstName} ${profileDetails.lastName}` : '',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      // Alert(error.message);
    }
  };

  const onPressLogout = () => {
    signOut();
    AsyncStorage.setItem('userLoggedIn', 'false');
    AsyncStorage.setItem('multiSignUp', 'false');
    AsyncStorage.setItem('signUp', 'false');
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.Login })],
      })
    );
  };

  const renderAnimatedHeader = () => {
    return (
      <>
        <Animated.View
          style={{
            position: 'absolute',
            height: 160,
            width: '100%',
            top: Platform.OS === 'ios' ? 24 : 0,
            backgroundColor: headColor,
            justifyContent: 'flex-end',
            flexDirection: 'column',
            transform: [{ translateY: headMov }],
          }}
        >
          <View
            style={{
              height: 160,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {
              // profileDetails &&
              // profileDetails &&
              // profileDetails.photoUrl &&
              // profileDetails.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/) && (
              <Animated.Image
                source={require('../ui/icons/no-photo-icon-round.png')}
                style={{ top: 10, height: 140, width: 140, opacity: imgOp }}
                resizeMode={'contain'}
              />
              // <PatientPlaceholderImage
              //   style={{ top: 10, height: 140, width: 140, opacity: imgOp }}
              // />
              // )
              // <PatientDefaultImage
              //   style={{ top: 10, height: 140, width: 140 }}
              //   resizeMode={'contain'}
              // />
            }
          </View>
        </Animated.View>
        <Header
          container={{
            zIndex: 3,
            position: 'absolute',
            top: Platform.OS === 'ios' ? (height === 812 || height === 896 ? 40 : 20) : 0,
            left: 0,
            right: 0,
            height: 56,
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
          }}
          rightComponent={
            <TouchableOpacity activeOpacity={1} onPress={onPressLogout}>
              <Text>Logout</Text>
            </TouchableOpacity>
          }
        />
      </>
    );
  };

  const renderRows = () => {
    return (
      <View>
        <ListCard
          container={{ marginTop: 20 }}
          title={'Address Book'}
          leftIcon={<Location />}
          onPress={() => props.navigation.navigate(AppRoutes.AddressBook)}
        />
        {/* <ListCard title={'Invoices'} leftIcon={<Invoice />} /> */}
        <ListCard
          container={{ marginBottom: 32 }}
          title={'Notification Settings'}
          leftIcon={<NotificaitonAccounts />}
          onPress={() => props.navigation.navigate(AppRoutes.NotificationSettings)}
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
        <Animated.ScrollView
          bounces={false}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: 160,
          }}
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollY } },
              },
            ],
            { listener: handleScroll }
          )}
        >
          {profileDetails && renderDetails()}
          {renderRows()}
          <NeedHelpAssistant navigation={props.navigation} />
          <View style={{ height: 92 }}>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansBold(13),
                color: '#00b38e',
                textAlign: 'center',
                height: 92,
                width: width,
                paddingTop: 10,
              }}
            >
              QA V 1.0(26)
            </Text>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>

      {renderAnimatedHeader()}
      {networkStatus && <NoInterNetPopup onClickClose={() => setNetworkStatus(false)} />}
      {/* {networkStatus && (
        <BottomPopUp title={'Hi:)'} description="Please check your Internet connection!">
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setNetworkStatus(false);
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )} */}
      {showSpinner && <Spinner />}
    </View>
  );
};
