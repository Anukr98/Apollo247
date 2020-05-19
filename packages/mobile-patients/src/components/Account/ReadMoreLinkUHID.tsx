import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import {
  LinkUHIDStep1,
  LinkUHIDStep2first,
  LinkUHIDStep2second,
  LinkUHIDStep2third,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';

const styles = StyleSheet.create({
  stepsHeading: {
    padding: 15,
    backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
    color: theme.colors.LIGHT_BLUE,
    ...fonts.IBMPlexSansMedium(15),
  },
  cardContainer: {
    ...viewStyles.cardViewStyle,
    ...viewStyles.shadowStyle,
    paddingTop: 16,
    paddingBottom: 16,
  },
  instructionText: {
    ...fonts.IBMPlexSansMedium(9),
    color: theme.colors.LIGHT_BLUE,
  },
  rightArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 8,
    borderRightWidth: 0,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: theme.colors.LIGHT_BLUE,
  },
  leftArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: theme.colors.LIGHT_BLUE,
  }
});

export interface ReadMoreLinkUHIDProps extends NavigationScreenProps { }

export const ReadMoreLinkUHID: React.FC<ReadMoreLinkUHIDProps> = (props) => {

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
      <ScrollView bounces={false} style={{ padding: 20 }}>
        <View style={styles.cardContainer}>
          <Text style={styles.stepsHeading}>
            STEP 1 - Select one of your own profile as a Primary UHID.
        </Text>
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: 10,
                top: 20,
              }}
            >
              <Text style={styles.instructionText}>Select a profile from manage</Text>
              <Text style={styles.instructionText}>profile section to make it as</Text>
              <Text style={styles.instructionText}>your primary UHID.</Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row'
                }}
              >
                <View
                  style={{
                    marginTop: 10,
                    marginLeft: 30,
                    width: 60,
                    height: 60,
                    borderColor: theme.colors.LIGHT_BLUE,
                    borderLeftWidth: 1,
                    borderBottomWidth: 1,
                  }}
                />
                <View
                  style={[
                    styles.rightArrow,
                    { top: 61 }
                  ]}
                />
              </View>
            </View>
            <View>
              <LinkUHIDStep1 style={{
                resizeMode: 'contain',
                width: 100,
                height: 220,
              }} />
              <View
                style={{
                  position: 'absolute',
                  left: 80,
                  top: 90,
                  backgroundColor: '#d8d8d8',
                  padding: 4,
                  borderRadius: 7,
                }}
              >
                <Text style={styles.instructionText}>Selected profile as Primary UHID</Text>
              </View>
            </View>
          </View>
          <Text style={styles.stepsHeading}>
            STEP 2 - How to link your own UHID’s(Profile) to your Primary UHID.
        </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 10,
            }}
          >
            <LinkUHIDStep2first style={{
              resizeMode: 'contain',
              width: 115,
              height: 220,
            }} />
            <LinkUHIDStep2second style={{
              resizeMode: 'contain',
              width: 115,
              height: 220,
            }} />
            <View
              style={{
                position: 'absolute',
                justifyContent: 'center',
                left: 130,
                top: 80,
              }}
            >
              <Text style={styles.instructionText}>Once primary UHID </Text>
              <Text style={[styles.instructionText, { marginBottom: 20 }]}>is created.</Text>
              <Text style={styles.instructionText}>Select your other</Text>
              <Text style={styles.instructionText}>profiles to link to the</Text>
              <Text style={styles.instructionText}>the primary UHID.</Text>
            </View>
          </View>
          <View
            style={{
              margin: 20,
              paddingBottom: 10,
              borderBottomWidth: 1,
              borderBottomColor: colors.DEFAULT_BACKGROUND_COLOR,
            }}
          >
            <Text
              style={{
                ...fonts.IBMPlexSansMedium(12),
                color: theme.colors.LIGHT_BLUE,
              }}
            >Simultaneously, you can link other profiles multiple UHID to their Primary UHID.</Text>
          </View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              // justifyContent: 'space-between',
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            <LinkUHIDStep2third style={{
              resizeMode: 'contain',
              width: 115,
              height: 220,
            }} />
            <View
              style={{
                paddingLeft: 20
              }}
            >
              <Text style={[
                styles.instructionText,
                { marginTop: 75 }
              ]}>Once primary UHID is created.</Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row'
                }}
              >
                <View style={{
                  marginTop: 15
                }}>
                  <>
                    <View style={styles.leftArrow} />
                  </>
                  <>
                    <Text style={styles.instructionText}>Select the other profiles to link</Text>
                    <Text style={styles.instructionText}>to the primary UHID.</Text>
                  </>
                </View>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView >
  )
};