import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, StyleSheet, ScrollView } from 'react-native';
import { FlatList, NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useReferralProgram } from '@aph/mobile-patients/src/components/ReferralProgramProvider';

interface TermsAndConditionItemType {
  id: number;
  condition: string;
}
export interface RefererTermsAndConditionProps extends NavigationScreenProps {}

export const RefererTermsAndCondition: React.FC<RefererTermsAndConditionProps> = (props) => {
  const { navigation } = props;
  const { refererTermsAndConditionData } = useReferralProgram();

  const renderTermsAndConditionSingleItem = (item: TermsAndConditionItemType | any) => {
    return (
      <View style={styles.listItemContainer}>
        <Text style={styles.listItemText}>
          <Text style={styles.listItemId}>
            {item.id}
            {'.  '}
          </Text>
          {item.condition}
        </Text>
      </View>
    );
  };
  const rednerTermsAndConditionList = () => {
    return (
      <View style={styles.listMainContainer}>
        <FlatList
          data={refererTermsAndConditionData}
          renderItem={({ item }) => renderTermsAndConditionSingleItem(item)}
          keyExtractor={(item: any) => item.id}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.SHERPA_BLUE} />
      <SafeAreaView style={styles.container}>
        <Header
          leftIcon="backArrow"
          title="Terms and Condition"
          onPressLeftIcon={() => navigation.goBack()}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <ScrollView>{rednerTermsAndConditionList()}</ScrollView>
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  listMainContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: 2,
  },
  listItemContainer: {
    marginBottom: 20,
  },
  listItemId: {},
  listItemText: {
    fontSize: 15,
    color: theme.colors.BLACK_COLOR,
    fontWeight: '600',
  },
});
