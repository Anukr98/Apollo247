import React from 'react';
import { NavigatorSDK, $Generator } from 'praktice-navigator-react-native-sdk';
// import { Generator } from 'praktice-navigator-react-native-sdk';
import { NavigationScreenProps } from 'react-navigation';
import { SafeAreaView, View, Text, Button } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';

export interface SymptomCheckerProps extends NavigationScreenProps {}

export const SymptomChecker: React.FC<SymptomCheckerProps> = (props) => {
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title="SURJ’S SYMPTOMS"
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <NavigatorSDK
          clientId="4A8C9CCC-C5A3-11E9-9A19-8C85900A8328"
          categoryComponent={CategoryComponent}
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
      { style: { fontFamily: 'IBMPlexSans-Medium', color: '#02475b', fontSize: 14 } },
    ],
  });

  const SymptomsList = $Generator({
    type: 'categoryList',
    component: Text,
    componentProps: [{ style: {} }],
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
