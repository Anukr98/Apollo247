import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, StyleSheet, ScrollView } from 'react-native';
import { FlatList, NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';

interface TermsAndConditionItemType {
  id: number;
  condition: string;
}
export interface RefererTermsAndConditionProps extends NavigationScreenProps {}

const renderTermsAndConditionSingleItem = (item: TermsAndConditionItemType) => {
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
        data={string.referAndEarn.refererTermsAndCondition}
        renderItem={({ item }) => renderTermsAndConditionSingleItem(item)}
        keyExtractor={(item: any) => item.id}
      />
    </View>
  );
};

export const RefererTermsAndCondition: React.FC<RefererTermsAndConditionProps> = (props) => {
  const { navigation } = props;
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
    backgroundColor: theme.colors.WHITE,
    marginTop: 2,
  },
  listItemContainer: {
    marginBottom: 20,
  },
  listItemId: {},
  listItemText: {
    fontSize: 15,
    color: theme.colors.LIGHT_BLUE,
    fontWeight: '600',
  },
});
