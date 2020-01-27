import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  Afternoon,
  EditIconNew,
  Invoice,
  Location,
  ManageProfileIcon,
  NotificaitonAccounts,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  DELETE_DEVICE_TOKEN,
  GET_MEDICINE_ORDERS_LIST,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  deleteDeviceToken,
  deleteDeviceTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/deleteDeviceToken';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import { g, getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  AsyncStorage,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
} from '../../graphql/types/GetMedicineOrdersList';
import { TabHeader } from '../ui/TabHeader';
import { AppConfig } from '../../strings/AppConfig';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  topView: {
    backgroundColor: theme.colors.WHITE,
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
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);
  const [profileDetails, setprofileDetails] = useState<
    GetCurrentPatients_getCurrentPatients_patients | null | undefined
  >(currentPatient);
  const { signOut, getPatientApiCall } = useAuth();

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

  const {
    data: orders,
    error: ordersError,
    loading: ordersLoading,
    refetch: ordersRefetch,
  } = useQuery<GetMedicineOrdersList, GetMedicineOrdersListVariables>(GET_MEDICINE_ORDERS_LIST, {
    variables: { patientId: currentPatient && currentPatient.id },
    fetchPolicy: 'cache-first',
  });

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
    signOut();
    AsyncStorage.setItem('userLoggedIn', 'false');
    AsyncStorage.setItem('multiSignUp', 'false');
    AsyncStorage.setItem('signUp', 'false');
    AsyncStorage.setItem('selectUserId', '');
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.Login })],
      })
    );
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
      .catch((e: string) => {
        try {
          console.log('deleteDeviceTokenerror', e);
          setshowSpinner(false);
          onPressLogout();
        } catch {}
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
              height: 200,
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
                style={{ width: '100%', minHeight: imgHeight, height: 'auto' }}
                resizeMode={'contain'}
              />
            ) : (
              <Image
                source={require('@aph/mobile-patients/src/components/ui/icons/no-photo-icon-round.png')}
                style={{ top: 10, height: 140, width: '100%' }}
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
        containerStyle={[containerStyle, { position: 'absolute', width: '100%' }]}
        navigation={props.navigation}
      />
    );
  };

  const renderRows = () => {
    return (
      <View>
        <ListCard
          container={{ marginTop: 14 }}
          title={'Manage Profiles'}
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
          onPress={() =>
            props.navigation.navigate(AppRoutes.YourOrdersScene, {
              orders: (g(orders, 'getMedicineOrdersList', 'MedicineOrdersList') || []).filter(
                (item) =>
                  !(
                    (item!.medicineOrdersStatus || []).length == 1 &&
                    (item!.medicineOrdersStatus || []).find((item) => !item!.hideStatus)
                  )
              ),
              header: 'MY ORDERS',
              refetch: ordersRefetch,
              error: ordersError,
              loading: ordersLoading,
            })
          }
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
          <NeedHelpAssistant navigation={props.navigation} />
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
        </ScrollView>
      </SafeAreaView>
      {networkStatus && <NoInterNetPopup onClickClose={() => setNetworkStatus(false)} />}
      {showSpinner && <Spinner />}
    </View>
  );
};
