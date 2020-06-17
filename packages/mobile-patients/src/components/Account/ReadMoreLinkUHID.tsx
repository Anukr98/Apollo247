import React from 'react';
import {
  BackHandler,
  SafeAreaView,
  StyleSheet,
  View,
  PixelRatio,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import {
  LinkUHIDReadMore,
} from '@aph/mobile-patients/src/components/ui/Icons';
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
  }
});

export interface ReadMoreLinkUHIDProps extends NavigationScreenProps { }

export const ReadMoreLinkUHID: React.FC<ReadMoreLinkUHIDProps> = (props) => {

  const pixelRatio = PixelRatio.get();
  const { height, width } = Dimensions.get("window");
  const heightPercent = Math.round((5 * height) / 100);

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
          <LinkUHIDReadMore
            style={{
              resizeMode: 'stretch',
              width: width - 40,
              height: (width - 40) * 5.4,
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
            alignSelf: 'center'
          }}
          titleTextStyle={{
            ...fonts.IBMPlexSansSemiBold(16)
          }}
          onPress={() => { props.navigation.goBack(); }}
        />
      </ScrollView>
    </SafeAreaView >
  )
};