import React, { useEffect, useState } from 'react';
import { NavigatorSDK, $Generator } from 'praktice-navigator-react-native-sdk';
// import { Generator } from 'praktice-navigator-react-native-sdk';
import { NavigationScreenProps } from 'react-navigation';
import { SafeAreaView, View, Text, Button } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

export const CustomComponent: React.FC<{}> = (props) => {
  const onSubmitClick = async () => {
    const ss = await $Generator({ type: 'showSpeciality' });
    console.log(ss, 'ssssss');
    // ss.then((e) => {
    //   console.log(e);
    // });
  };
  return <Button title={'show speciality'} onPress={onSubmitClick} />;
};

export interface SymptomCheckerProps extends NavigationScreenProps {}

export const SymptomChecker: React.FC<SymptomCheckerProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const [userName, setuserName] = useState<string>('');

  useEffect(() => {
    currentPatient && setuserName(currentPatient.firstName ? currentPatient.firstName : '');
    console.log('consult room', currentPatient);
  }, [currentPatient, userName, props.navigation.state.params]);

  // const onSubmitClick = async () => {
  //   const ss = await $Generator({ type: 'showSpeciality' });
  //   console.log(ss, 'ssssss');
  //   ss.then((e) => {
  //     console.log(e, 'eeee');
  //   });
  // };

  // const CustomShowDocComponent = $Generator({
  //   type: 'showSpeciality',
  //   componentProps: [
  //     {
  //       style: { fontFamily: 'IBMPlexSans-Medium', color: '#02475b', fontSize: 14 },
  //       onPress: () => {
  //         console.log('showSpeciality');
  //       },
  //     },
  //   ],
  // });

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title={`${userName.toUpperCase()}’S SYMPTOMS`}
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        {/* <Button title="click" onPress={onSubmitClick} /> */}

        <NavigatorSDK
          clientId="4A8C9CCC-C5A3-11E9-9A19-8C85900A8328"
          // categoryComponent={CategoryComponent}
          // showDocComponent={CustomComponent}
          showDocBtn={CustomComponent}
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
