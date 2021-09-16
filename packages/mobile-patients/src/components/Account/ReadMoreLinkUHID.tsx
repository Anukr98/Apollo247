import React from 'react';
import { BackHandler, SafeAreaView, StyleSheet, View, Dimensions, Image } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';

const styles = StyleSheet.create({
  stepsHeading: {
    backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
    color: theme.colors.LIGHT_BLUE,
  },
  cardContainer: {
    ...viewStyles.cardViewStyle,
    ...viewStyles.shadowStyle,
    margin: 20,
  },
  instructionText: {
    ...fonts.IBMPlexSansMedium(9),
    color: theme.colors.LIGHT_BLUE,
  },
});

const readMoreImagePart1 = require('@aph/mobile-patients/src/components/ui/icons/read_more/read-more-part1.webp');
const readMoreImagePart2 = require('@aph/mobile-patients/src/components/ui/icons/read_more/read-more-part2.webp');
const readMoreImagePart3 = require('@aph/mobile-patients/src/components/ui/icons/read_more/read-more-part3.webp');
const readMoreImagePart4 = require('@aph/mobile-patients/src/components/ui/icons/read_more/read-more-part4.webp');

export interface ReadMoreLinkUHIDProps extends NavigationScreenProps {}

export const ReadMoreLinkUHID: React.FC<ReadMoreLinkUHIDProps> = (props) => {
  const { width } = Dimensions.get('window');

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
          title={'READ MORE'}
          leftIcon="backArrow"
          onPressLeftIcon={() => backDataFunctionality()}
        />
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{
        ...theme.viewStyles.container,
      }}
    >
      {renderHeader()}
      <ScrollView bounces={false}>
        <View style={styles.cardContainer}>
          <Image
            source={readMoreImagePart1}
            resizeMode="contain"
            style={{
              width: width - 40,
              height: width - 80,
            }}
          />
          <Image
            source={readMoreImagePart2}
            resizeMode="contain"
            style={{
              width: width - 40,
              height: width * 1.6,
            }}
          />
          <Image
            source={readMoreImagePart3}
            resizeMode="contain"
            style={{
              width: width - 40,
              height: width - 60,
            }}
          />
          <Image
            source={readMoreImagePart4}
            resizeMode="contain"
            style={{
              width: width - 40,
              height: width * 1.7,
            }}
          />
        </View>
        <Button
          title="OK"
          style={{
            width: '30%',
            paddingLeft: 15,
            paddingRight: 15,
            marginBottom: 30,
            marginTop: 30,
            alignSelf: 'center',
          }}
          titleTextStyle={{
            ...fonts.IBMPlexSansSemiBold(16),
          }}
          onPress={() => {
            props.navigation.goBack();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
