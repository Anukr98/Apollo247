import React, { useEffect, useState } from 'react';
import { NavigatorSDK, $Generator } from 'praktice-navigator-react-native-sdk';
// import { Generator } from 'praktice-navigator-react-native-sdk';
import { NavigationScreenProps, NavigationActions } from 'react-navigation';
import {
  SafeAreaView,
  View,
  Text,
  BackHandler,
  AsyncStorage,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import Moment from 'moment';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { StackActions } from 'react-navigation';
import { AppConfig } from '../strings/AppConfig';
import { CommonScreenLog, CommonLogEvent } from '../FunctionHelpers/DeviceHelper';
import { DropdownGreen } from './ui/Icons';
import { MaterialMenu } from './ui/MaterialMenu';
import { AddProfile } from '@aph/mobile-patients/src/components/ui/AddProfile';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { GetCurrentPatients_getCurrentPatients_patients } from '../graphql/types/GetCurrentPatients';
import { theme } from '../theme/theme';

export interface CustomComponentProps extends NavigationScreenProps {}
const styles = StyleSheet.create({
  viewName: {
    backgroundColor: theme.colors.WHITE,
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginTop: 5,
    marginHorizontal: 5,
  },
  hiTextStyle: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  descriptionTextStyle: {
    marginTop: 12,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  buttonStyles: {
    height: 40,
    width: 180,
    // paddingHorizontal: 26
    marginTop: 16,
  },
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingVertical: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
  },
  labelStyle: {
    paddingVertical: 16,
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  labelViewStyle: {
    marginHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  cardContainerStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: Platform.OS === 'ios' ? 174 : 184,
    zIndex: 3,
    elevation: 5,
  },
  doctorView: {
    marginHorizontal: 8,
    ...theme.viewStyles.cardViewStyle,
    marginVertical: 6, //16,
    borderRadius: 10,
  },
  availableView: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 112,
  },
  imageView: {
    margin: 16,
    marginTop: 32,
    width: 60,
  },
  doctorNameStyles: {
    paddingTop: 40,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingBottom: 11.5,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
  },
  consultTextStyles: {
    paddingVertical: 11.5,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  prepareForConsult: {
    ...theme.viewStyles.yellowTextStyle,
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'right',
    paddingHorizontal: 15,
    paddingTop: 11,
    paddingBottom: 16,
  },
});
export const CustomComponent: React.FC<CustomComponentProps> = (props) => {
  const Consult = props.navigation.state.params ? props.navigation.state.params.Consult : '';

  console.log(Consult, 'Consultval');
  const onSubmitClick = async () => {
    CommonLogEvent(AppRoutes.SymptomChecker, 'Show doctors clicked');

    const ss = await $Generator({ type: 'showSpeciality' });

    let specialities = [];
    if (ss && ss.specialists && ss.specialists.length) {
      specialities = ss.specialists.map((item: { speciality: string }) => item.speciality.trim());
      console.log(specialities, 'specialities');
    }
    props.navigation.push(AppRoutes.DoctorSearchListing, {
      specialities: specialities,
      MoveDoctor: 'MoveDoctor',
    });
  };
  // return <Button title={'show speciality'} onPress={onSubmitClick} />;
  return (
    <Button
      title={'show doctors'}
      onPress={onSubmitClick}
      style={{
        // flex: 1,
        width: 'auto',
        marginHorizontal: 60,
        marginBottom: 16,
        marginTop: 10,
      }}
      titleTextStyle={{
        textTransform: 'uppercase',
      }}
    />
  );
};

export interface SymptomCheckerProps extends NavigationScreenProps {
  ConsultRoom: string;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = (props) => {
  const [userName, setuserName] = useState<string>('');
  const { getPatientApiCall } = useAuth();
  const { width, height } = Dimensions.get('window');
  const { allCurrentPatients, setCurrentPatientId, currentPatient } = useAllCurrentPatients();
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
      currentPatient && setProfile(currentPatient!);
    }
  }, [currentPatient]);

  const navigateToPrev = async () => {
    console.log('navigateToPrev hardwareBackPress');
    BackHandler.removeEventListener('hardwareBackPress', navigateToPrev);
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      })
    );
    return false;
  };

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', navigateToPrev);
    });

    const willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', navigateToPrev);
    });

    return () => {
      didFocusSubscription && didFocusSubscription.remove();
      willBlurSubscription && willBlurSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (currentPatient && currentPatient.firstName) {
      setuserName(currentPatient.firstName);
    }
  }, [currentPatient, userName, props.navigation.state.params]);

  const patientAge =
    currentPatient && currentPatient.dateOfBirth
      ? { patientAge: Math.round(Moment().diff(currentPatient.dateOfBirth, 'years', true)) }
      : {};
  const patientGender =
    currentPatient &&
    currentPatient.gender &&
    (currentPatient.gender === Gender.MALE || currentPatient.gender === Gender.FEMALE)
      ? {
          patientGender: currentPatient.gender === Gender.MALE ? 'male' : 'female',
        }
      : {};

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={`${userName.toUpperCase()}’S SYMPTOMS`}
          leftIcon="backArrow"
          onPressLeftIcon={() => (
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
              })
            ),
            CommonLogEvent(AppRoutes.SymptomChecker, 'Go back clicked')
          )}
          titleStyle={{ marginLeft: 60 }}
          rightComponent={
            <View>
              <ProfileList
                saveUserChange={true}
                listContainerStyle={{ marginLeft: 0 }}
                childView={
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingRight: 8,
                      borderRightWidth: 0,
                      borderRightColor: 'rgba(2, 71, 91, 0.2)',
                      backgroundColor: theme.colors.WHITE,
                    }}
                  >
                    <View style={{ marginRight: 60 }}>
                      <DropdownGreen />
                    </View>
                  </View>
                }
                selectedProfile={profile}
                setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
              ></ProfileList>
            </View>
          }
        />
        <NavigatorSDK
          clientId={AppConfig.Configuration.PRAKTISE_API_KEY}
          showDocBtn={() => <CustomComponent navigation={props.navigation} />}
          {...patientGender}
          {...patientAge}
        />
      </SafeAreaView>
      {displayAddProfile && (
        <AddProfile
          setdisplayoverlay={setDisplayAddProfile}
          setProfile={(profile) => {
            setProfile(profile);
          }}
        />
      )}
    </View>
  );
};

export interface CategoryComponentProps extends NavigationScreenProps {}

export const CategoryComponent: React.FC<CategoryComponentProps> = (props) => {
  const CategoryTitle = $Generator({
    type: 'categoryTitle',
    component: Text,
    componentProps: [
      {
        style: { fontFamily: 'IBMPlexSans-Medium', color: '#02475b', fontSize: 14 },
        onPress: () => {
          console.log('componentProps');
        },
      },
    ],
  });

  const SymptomsList = $Generator({
    type: 'categoryList',
    component: Button,
    componentProps: [
      {
        style: {},
        onPress: () => {
          console.log('123456789');
        },
      },
    ],
    dataInProp: 'title',
  });

  return (
    <View>
      <CategoryTitle />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <View>
          <SymptomsList />
        </View>
      </View>
    </View>
  );
};
