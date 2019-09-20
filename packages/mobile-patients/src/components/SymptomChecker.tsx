import React, { useEffect, useState } from 'react';
import { NavigatorSDK, $Generator } from 'praktice-navigator-react-native-sdk';
// import { Generator } from 'praktice-navigator-react-native-sdk';
import { NavigationScreenProps, NavigationActions } from 'react-navigation';
import { SafeAreaView, View, Text } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import Moment from 'moment';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { StackActions } from 'react-navigation';
import { AppConfig } from '../strings/AppConfig';

export interface CustomComponentProps extends NavigationScreenProps {}

export const CustomComponent: React.FC<CustomComponentProps> = (props) => {
  const Consult = props.navigation.state.params ? props.navigation.state.params.Consult : '';
  console.log(Consult, 'Consultval');
  const onSubmitClick = async () => {
    const ss = await $Generator({ type: 'showSpeciality' });

    let speciality = '';
    if (ss && ss.specialists && ss.specialists.length) {
      console.log(ss.specialists[0].speciality);
      speciality = ss.specialists[0].speciality;
    }
    props.navigation.push(AppRoutes.DoctorSearch, {
      searchText: speciality,
      MoveDoctor: 'MoveDoctor',
    });
  };
  // return <Button title={'show speciality'} onPress={onSubmitClick} />;
  return (
    <Button
      title={'show speciality'}
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
  const { currentPatient } = useAllCurrentPatients();
  const [userName, setuserName] = useState<string>('');
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

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
          onPressLeftIcon={() =>
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
              })
            )
          }
        />
        <NavigatorSDK
          clientId={AppConfig.Configuration.PRAKTISE_API_KEY}
          showDocBtn={() => <CustomComponent navigation={props.navigation} />}
          {...patientGender}
          {...patientAge}
        />
      </SafeAreaView>
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
