import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { SectionHeader } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import React from 'react';
import {
  BackHandler,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const styles = StyleSheet.create({
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
});

type ArrayTest = {
  id: number;
  title: string;
  descripiton: string;
  image: ImageSourcePropType;
};

export interface MedAndTestCartProps
  extends NavigationScreenProps<{
    isComingFromConsult: boolean;
  }> {}

export const MedAndTestCart: React.FC<MedAndTestCartProps> = (props) => {
  const { cartItems } = useShoppingCart();
  const { cartItems: testCartItems } = useDiagnosticsCart();
  console.log('length : ' + cartItems.length);
  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    props.navigation.goBack();
    return false;
  };

  const arrayTest: ArrayTest[] = [
    {
      id: 1,
      title: `Medicines`,
      descripiton: cartItems.length > 0 ? `${cartItems.length} Items` : 'No Items',
      image: require('@aph/mobile-patients/src/images/medicine/ic_medicines.png'),
    },
    {
      id: 2,
      title: 'Tests',
      descripiton: testCartItems.length > 0 ? `${testCartItems.length} Items` : 'No Items',
      image: require('@aph/mobile-patients/src/images/medicine/ic_medicines.png'),
    },
  ];

  const renderHeader = () => {
    return (
      <View>
        <Header
          title={'YOUR CART'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => backDataFunctionality()}
          rightComponent={
            <TouchableOpacity
            // onPress={() => {
            //     setCancelAppointment(true);
            // }}
            >
              <More />
            </TouchableOpacity>
          }
        />
      </View>
    );
  };

  const renderMedicines = () => {
    const isComingFromConsult = props.navigation.getParam('isComingFromConsult');
    return (
      <View>
        {arrayTest.map((serviceTitle, i) => (
          <View key={i} style={{}}>
            <TouchableOpacity
              activeOpacity={1}
              key={i}
              onPress={() => {
                props.navigation.navigate(i == 0 ? AppRoutes.YourCart : AppRoutes.TestsCart, {
                  isComingFromConsult,
                });
              }}
            >
              <View
                style={{
                  ...viewStyles.cardViewStyle,
                  ...viewStyles.shadowStyle,
                  padding: 16,
                  marginHorizontal: 20,
                  backgroundColor: cartItems.length === 0 ? '#f0f1ec' : colors.WHITE,
                  flexDirection: 'row',
                  height: 88,
                  marginTop: i === 0 ? 16 : 8,
                  marginBottom: arrayTest.length === i + 1 ? 20 : 8,
                }}
                key={i}
              >
                <View style={{ flex: 1, justifyContent: 'space-between', paddingRight: 32 }}>
                  <Text
                    style={{
                      color: colors.LIGHT_BLUE,
                      lineHeight: 24,
                      textAlign: 'left',
                      ...fonts.IBMPlexSansMedium(17),
                    }}
                  >
                    {serviceTitle.title}
                  </Text>
                  <View style={styles.separatorStyle} />
                  <Text
                    style={{
                      color: colors.LIGHT_BLUE,
                      opacity: 0.6,
                      textAlign: 'left',
                      ...fonts.IBMPlexSansMedium(12),
                      lineHeight: 20,
                      letterSpacing: 0.04,
                    }}
                  >
                    {serviceTitle.descripiton}
                  </Text>
                </View>
                <View
                  style={{
                    width: 62,
                  }}
                >
                  <Image style={{ height: 56, width: 56 }} source={serviceTitle.image} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ ...theme.viewStyles.container }}>
      {renderHeader()}

      <ScrollView bounces={false} style={{ marginTop: 20 }}>
        <SectionHeader leftText={'SELECT A CART TO CHECKOUT'} />
        {renderMedicines()}
      </ScrollView>
    </SafeAreaView>
  );
};
