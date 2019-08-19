import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { getProductDetails } from '../../helpers/apiCalls';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    margin: 20,
    padding: 16,
  },
  noteText: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
    letterSpacing: 0.04,
  },
  heading: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 20,
    marginBottom: 8,
  },
  description: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.04,
    lineHeight: 24,
    marginBottom: 16,
  },
  bottonButtonContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomButtonStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginTop: 17,
    marginBottom: 24,
  },
});

const array = [
  {
    title: 'How It Works',
    description:
      'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.',
  },
  {
    title: 'Important Information',
    description:
      'Any warnings related to medicine intake if there’s alcohol usage / pregnancy / breast feeding',
  },
  {
    title: 'Alternative Medicines',
    description: '1. Medicine a\n2. Medicine b\n3. Medicine c',
  },
  {
    title: 'Generic Salt Composition',
    description: '1. Salt a\n2. Salt b\n3. Salt c',
  },
  {
    title: 'Side Effects / Warnings',
    description: 'quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.',
  },
];

export interface MedicineDetailsSceneProps
  extends NavigationScreenProps<{
    sku: string;
    title: string;
  }> {}

export const MedicineDetailsScene: React.FC<MedicineDetailsSceneProps> = (props) => {
  useEffect(() => {
    const id = props.navigation.getParam('sku');
    getProductDetails(id)
      .then(({ data: { products } }) => {
        console.log(products);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const renderBottomButtons = () => {
    return (
      <View style={styles.bottonButtonContainer}>
        <Button
          title="CALL US"
          style={styles.bottomButtonStyle}
          titleTextStyle={{ color: '#fc9916' }}
        />
        <View style={{ width: 16 }} />
        <Button title="ADD TO CART" style={{ flex: 1 }} />
      </View>
    );
  };

  const renderNote = () => {
    return (
      <>
        <Text style={styles.noteText}>This medicine requires doctor’s prescription</Text>
        <View style={styles.separator} />
      </>
    );
  };

  const renderTitleAndDescriptionList = () => {
    // return array.map((i, index, array) => {
    return (
      <View>
        <Text style={styles.heading}>{array[0].title}</Text>
        <Text style={[styles.description]}>
          {medicineDetails ? medicineDetails.description : ''}
        </Text>
      </View>
    );
    // });
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header
        leftIcon="backArrow"
        onPressLeftIcon={() => props.navigation.goBack()}
        title={(props.navigation.getParam('title') || '').toUpperCase()}
        container={{ borderBottomWidth: 0 }}
      />
      <ScrollView bounces={false}>
        <View style={styles.cardStyle}>
          {renderNote()}
          {renderTitleAndDescriptionList()}
        </View>
        {renderBottomButtons()}
      </ScrollView>
    </SafeAreaView>
  );
};
