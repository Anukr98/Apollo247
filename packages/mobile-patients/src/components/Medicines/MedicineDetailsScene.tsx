import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { getProductDetails } from '../../helpers/apiCalls';
import Axios from 'axios';

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    margin: 20,
    padding: 16,
  },
  noteText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
    letterSpacing: 0.04,
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
  const [medicineDetails, setmedicineDetails] = useState<{}>();

  useEffect(() => {
    const id = props.navigation.getParam('sku');
    console.log('fetchSearchData');
    Axios.get(`http://api.apollopharmacy.in/apollo_api.php?sku=${id}&type=product_desc`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer dp50h14gpxtqf8gi1ggnctqcrr0io6ms',
      },
    })
      .then((res) => {
        console.log(res, 'MedicineDetailsScene dt');
        if (res.data.products && res.data.products.length > 0)
          setmedicineDetails(res.data.products[0]);
      })
      .catch((err) => {
        console.log(err, 'MedicineDetailsScene err');
      });

    // getProductDetails(id)
    //   .then(({ data: { products } }) => {
    //     console.log(products);
    //   })
    //   .catch((e) => {
    //     console.log(e);
    //   });
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

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header
        leftIcon="backArrow"
        onPressLeftIcon={() => props.navigation.goBack()}
        title={(props.navigation.getParam('title') || '').toUpperCase()}
        container={{ borderBottomWidth: 0 }}
      />
      <ScrollView bounces={false}>
        <View style={styles.cardStyle}>{renderNote()}</View>
        {renderBottomButtons()}
      </ScrollView>
    </SafeAreaView>
  );
};
