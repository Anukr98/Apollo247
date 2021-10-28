import React from 'react';
import { View, Text, StatusBar, StyleSheet, Image, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '../ui/Header';

export interface EarnedPointsProps extends NavigationScreenProps {}

export const EarnedPoints: React.FC<EarnedPointsProps> = (props) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
        <Header
          leftIcon="backArrow"
          title="Refer And Earn"
          onPressLeftIcon={() => props.navigation.navigate('ConsultRoom')}
          container={{
            borderColor: 'transparent',
          }}
          titleStyle={{
            fontSize: 18,
          }}
        />
        <View style={styles.earned_main_container}>
          <Text style={styles.erd_mainHeading}>Congratulations!</Text>
          <View style={styles.erd_trophy_maincontainer}>
            <View style={styles.erd_trophy_container}>
              <Image
                source={require('@aph/mobile-patients/src/images/referAndEarn/trophy1.webp')}
                style={{}}
                resizeMode="cover"
              />
            </View>
          </View>
          <View style={styles.erd_otherTextContainer}>
            <Text style={styles.erd_giftedHeading}>Your friend gift you</Text>
            <Text style={styles.erd_totalGifted}>100 HC</Text>
            <TouchableOpacity
              style={styles.erd_reedemBtn}
              onPress={() => {
                props.navigation.navigate('TabBar');
              }}
            >
              <Text style={styles.erd_reedemBtnText}>Reedem Points</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.erd_whyChooseApolloContainer}>
          <Text style={styles.erd_wca_title}>Why choose Apollo 247?</Text>
          <View style={styles.erd_wca_imageTextContainer}>
            <View style={styles.erd_wca_imageTextSubContainer}>
              <View style={styles.erd_wca_img_container}>
                <Image
                  source={require('@aph/mobile-patients/src/images/referAndEarn/fast-delivery1.webp')}
                  style={styles.shareImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.erd_wca_imgTitle}>Delivery in 2 hours</Text>
            </View>
            <View style={styles.erd_wca_imageTextSubContainer}>
              <View style={styles.erd_wca_img_container}>
                <Image
                  source={require('@aph/mobile-patients/src/images/referAndEarn/doctor1.webp')}
                  style={styles.shareImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.erd_wca_imgTitle}>Consult doctor in 15 mins</Text>
            </View>
            <View style={styles.erd_wca_imageTextSubContainer}>
              <View style={styles.erd_wca_img_container}>
                <Image
                  source={require('@aph/mobile-patients/src/images/referAndEarn/flask1.webp')}
                  style={styles.shareImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.erd_wca_imgTitle}>Lab test at home</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  shareImage: {},
  erd_wca_imgTitle: {
    textAlign: 'center',
    marginTop: 15,
    color: '#02475B',
    fontSize: 13,
    fontWeight: '600',
  },
  erd_wca_img_container: {
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 5,
  },
  erd_wca_imageTextSubContainer: {
    width: 100,
    alignItems: 'center',
  },
  erd_wca_imageTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  erd_wca_title: {
    marginTop: 20,
    fontSize: 18,
    color: '#02475B',
    fontWeight: '600',
  },
  erd_whyChooseApolloContainer: {
    backgroundColor: '#E8EDF0',
    flex: 1,
    alignItems: 'center',
  },
  erd_reedemBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  erd_reedemBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FC9916',
    width: 200,
    height: 40,
    marginTop: 20,
    borderRadius: 5,
  },
  erd_totalGifted: {
    marginTop: 5,
    fontSize: 20,
    color: '#02475B',
    fontWeight: '700',
  },
  erd_giftedHeading: {
    marginTop: 20,
    fontSize: 20,
    color: '#02475B',
  },
  erd_otherTextContainer: {
    alignItems: 'center',
  },
  erd_trophy_container: {
    backgroundColor: '#DCF0FF',
    borderRadius: 100,
    padding: 9,
  },
  erd_trophy_maincontainer: {
    marginTop: 30,
  },
  erd_mainHeading: {
    fontSize: 22,
    color: '#02475B',
    fontWeight: '600',
  },
  earned_main_container: {
    backgroundColor: '#fff',
    marginVertical: 5,
    alignItems: 'center',
    paddingVertical: 25,
    flex: 1.5,
  },
});
