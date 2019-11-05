import React from 'react';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  View,
  Text,
  Image,
  SafeAreaView,
  BackHandler,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import { theme } from '@aph/mobile-patients/src/theme/theme';

const styles = StyleSheet.create({
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  profileImageStyle: { width: 80, height: 80, borderRadius: 40 },
  imageView: {
    marginRight: 16,
  },
});

type ArrayTest = {
  id: number;
  title: string;
  referredBy: string;
  gender: string;
  age: string;
  //   descripiton: string;
  uhid: string;
  dob: string;
  image: ImageSourcePropType;
};

export interface ManageProfileProps extends NavigationScreenProps {}

export const ManageProfile: React.FC<ManageProfileProps> = (props) => {
  const arrayTest: ArrayTest[] = [
    {
      id: 1,
      title: `Surj Gupta`,
      referredBy: 'SELF',
      gender: 'MALE',
      age: '31',
      uhid: 'APD1.0010783329',
      dob: ' 27 Nov, 1987',
      image: require('@aph/mobile-patients/src/images/doctor/rahul.png'),
    },
    {
      id: 2,
      title: 'Preeti Gupta',
      referredBy: 'WIFE',
      gender: 'FEMALE',
      age: '29',
      //   descripiton: 'WIFE   |   FEMALE   |   29',
      uhid: ' APD1.0010783329',
      dob: '18 Nov, 1989',
      image: require('@aph/mobile-patients/src/images/doctor/rakhi.png'),
    },
  ];

  const backDataFunctionality = async () => {
    BackHandler.removeEventListener('hardwareBackPress', backDataFunctionality);
    props.navigation.goBack();
    return false;
  };
  const renderHeader = () => {
    return (
      <View>
        <Header
          container={{ borderBottomWidth: 0 }}
          title={'MANAGE PROFILES'}
          leftIcon="backArrow"
          onPressLeftIcon={() => backDataFunctionality()}
        />
      </View>
    );
  };

  const renderProfilesDetails = () => {
    return (
      <View>
        {arrayTest.map((serviceTitle, i) => (
          <View key={i} style={{}}>
            <TouchableOpacity
              activeOpacity={1}
              key={i}
              // onPress={() => {
              //     props.navigation.navigate(i == 0 ? AppRoutes.YourCart : AppRoutes.TestsCart, {
              //         isComingFromConsult,
              //     });
              // }}
            >
              <View
                style={{
                  ...viewStyles.cardViewStyle,
                  ...viewStyles.shadowStyle,
                  padding: 16,
                  marginHorizontal: 20,
                  backgroundColor: colors.WHITE,
                  flexDirection: 'row',
                  height: 145,
                  //   marginTop: i === 0 ? 16 : 8,
                  marginBottom: 8,
                }}
                key={i}
              >
                <View style={styles.imageView}>
                  {/* {serviceTitle.photoUrl &&
                            serviceTitle.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/) && ( */}
                  <Image style={styles.profileImageStyle} source={serviceTitle.image} />
                  {/* )} */}
                </View>

                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      color: colors.LIGHT_BLUE,
                      textAlign: 'left',
                      ...fonts.IBMPlexSansSemiBold(18),
                      top: 8,
                      marginBottom: 8,
                    }}
                  >
                    {serviceTitle.title}
                  </Text>
                  <View style={styles.separatorStyle} />
                  <Text
                    style={{
                      color: '#0087ba',
                      textAlign: 'left',
                      ...fonts.IBMPlexSansMedium(12),
                    }}
                  >
                    {serviceTitle.referredBy} &nbsp; | &nbsp; {serviceTitle.gender} &nbsp;| &nbsp;
                    {serviceTitle.age}
                  </Text>
                  <View style={styles.separatorStyle} />
                  <Text
                    style={{
                      color: '#02475b',
                      textAlign: 'left',
                      ...fonts.IBMPlexSansMedium(12),
                    }}
                  >
                    UHID : {serviceTitle.uhid}
                  </Text>
                  <Text
                    style={{
                      color: '#02475b',
                      textAlign: 'left',
                      ...fonts.IBMPlexSansMedium(12),
                    }}
                  >
                    DOB :{serviceTitle.dob}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderBottomStickyComponent = () => {
    return (
      <StickyBottomComponent defaultBG>
        <Button
          title="ADD NEW PROFILE"
          style={{ flex: 1, marginHorizontal: 60 }}
          onPress={() => props.navigation.navigate(AppRoutes.AddAddress, { addOnly: true })}
        />
      </StickyBottomComponent>
    );
  };

  return (
    <SafeAreaView
      style={{
        ...theme.viewStyles.container,
      }}
    >
      {renderHeader()}
      <ScrollView bounces={false} style={{ marginTop: 20 }}>
        {renderProfilesDetails()}
      </ScrollView>
      {renderBottomStickyComponent()}
    </SafeAreaView>
  );
};
