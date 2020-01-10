import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
// import { NavigatorSDK, $Generator } from 'praktice-navigator-react-native-sdk';
import { $Generator, NavigatorSDK } from '@praktice/navigator-react-native-sdk';
import Moment from 'moment';
import React, { useEffect, useState } from 'react';
import { BackHandler, Dimensions, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { useUIElements } from './UIElementsProvider';

export interface CustomComponentProps extends NavigationScreenProps {}
const styles = StyleSheet.create({
  nameTextStyle: {
    paddingTop: 2,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansSemiBold(13),
    letterSpacing: 0.5,
  },
  nameTextContainerStyle: {
    maxWidth: '60%',
    flexDirection: 'row',
  },
});
export const CustomComponent: React.FC<CustomComponentProps> = (props) => {
  const Consult = props.navigation.state.params ? props.navigation.state.params.Consult : '';
  console.log(Consult, 'Consultval');
  const onSubmitClick = async () => {
    CommonLogEvent(AppRoutes.SymptomChecker, 'Show doctors clicked');
    const ss = await $Generator({ type: 'showSpeciality' });

    let specialities = [];
    if (ss && ss.specialists && ss.specialists.length > 0) {
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
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [showList, setShowList] = useState<boolean>(false);

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
      currentPatient && setProfile(currentPatient!);
    }
  }, [currentPatient]);

  useEffect(() => {
    showAlert();
  }, []);

  const showAlert = () => {
    showAphAlert!({
      title: 'Hi!',
      description: 'who is the patient today?',
      ctaContainerStyle: { marginTop: 50 },
      CTAs: [
        {
          text: 'MYSELF',
          onPress: () => {
            hideAphAlert!();
          },
        },
        {
          type: 'white-button',
          text: 'SOMWONE ELSE',
          onPress: () => {
            setShowList(true);
            hideAphAlert!();
          },
        },
      ],
    });
  };

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

  // const patientAge = { patientAge: '' };
  // const patientGender = { patientGender: '' };

  const patientAge =
    currentPatient && currentPatient.dateOfBirth
      ? { patientAge: Math.round(Moment().diff(currentPatient.dateOfBirth, 'years', true)) || 0 }
      : {};
  const patientGender =
    currentPatient &&
    currentPatient.gender &&
    (currentPatient.gender === Gender.MALE || currentPatient.gender === Gender.FEMALE)
      ? {
          patientGender: currentPatient.gender === Gender.MALE ? 'male' : 'female',
        }
      : {};
  console.log(patientGender, patientAge, 'patientAge');

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
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
          titleComponent={
            <ProfileList
              showList={showList}
              unsetloaderDisplay={true}
              navigation={props.navigation}
              listContainerStyle={{ marginLeft: 0 }}
              saveUserChange={true}
              childView={
                <View
                  style={[
                    {
                      flexGrow: 1,
                      flexDirection: 'row',
                      paddingRight: 8,
                      borderRightWidth: 0,
                      borderRightColor: 'rgba(2, 71, 91, 0.2)',
                      backgroundColor: theme.colors.WHITE,
                      alignSelf: 'center',
                      alignContent: 'center',
                      justifyContent: 'center',
                    },
                    styles.nameTextContainerStyle,
                  ]}
                >
                  <Text style={styles.nameTextStyle} numberOfLines={1}>
                    {(currentPatient && currentPatient!.firstName!.toUpperCase()) || ''}
                  </Text>
                  <Text style={styles.nameTextStyle}>{`’S SYMPTOMS`}</Text>
                  <DropdownGreen />
                </View>
              }
              // selectedProfile={profile}
              setDisplayAddProfile={() => {}}
            ></ProfileList>
          }
        />
        <NavigatorSDK
          clientId={AppConfig.Configuration.PRAKTISE_API_KEY}
          showDocBtn={() => <CustomComponent navigation={props.navigation} />}
          {...patientGender}
          {...patientAge}
        />
      </SafeAreaView>
      {/* {displayAddProfile && (
        <AddProfile
          setdisplayoverlay={setDisplayAddProfile}
          setProfile={(profile) => {
            setProfile(profile);
          }}
        />
      )} */}
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
