import React, { useEffect, useState } from 'react';
import { NavigatorSDK, $Generator } from 'praktice-navigator-react-native-sdk';
// import { Generator } from 'praktice-navigator-react-native-sdk';
import { NavigationScreenProps } from 'react-navigation';
import { SafeAreaView, View, Text } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import Moment from 'moment';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface CustomComponentProps extends NavigationScreenProps {}

export const CustomComponent: React.FC<CustomComponentProps> = (props) => {
  const onSubmitClick = async () => {
    const ss = await $Generator({ type: 'showSpeciality' });
    console.log(ss, 'ssssss');
    let speciality = '';
    if (ss && ss.specialists && ss.specialists.length) {
      console.log(ss.specialists[0].speciality);
      speciality = ss.specialists[0].speciality;
    }
    props.navigation.navigate(AppRoutes.DoctorSearch, {
      searchText: speciality,
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

export interface SymptomCheckerProps extends NavigationScreenProps {}

export const SymptomChecker: React.FC<SymptomCheckerProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const [userName, setuserName] = useState<string>('');

  useEffect(() => {
    if (currentPatient && currentPatient.firstName) {
      setuserName(currentPatient.firstName);
    }
  }, [currentPatient, userName, props.navigation.state.params]);

  const patientAge = currentPatient
    ? { patientAge: Math.round(Moment().diff(currentPatient.dateOfBirth, 'years', true)) }
    : {};

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={`${userName.toUpperCase()}’S SYMPTOMS`}
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />

        <NavigatorSDK
          clientId="4A8C9CCC-C5A3-11E9-9A19-8C85900A8328"
          showDocBtn={() => <CustomComponent navigation={props.navigation} />}
          patientGender={
            currentPatient && currentPatient.gender === Gender.MALE ? 'male' : 'female'
          }
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
