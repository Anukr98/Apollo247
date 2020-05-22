import React from 'react';
import {
  BackHandler,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import {
  HandBlue,
  LinkUHIDStep1,
  LinkUHIDStep2first,
  LinkUHIDStep2second,
  LinkUHIDStep2third,
  LinkUHIDStep3,
  PrimaryUHIDIconBlue,
  LinkUHIDStep4first,
  LinkUHIDStep4second,
  LinkUHIDStep4third,
  LinkUHIDStep4fourth,
  Arrow1,
  Arrow2,
  Arrow3,
  Arrow4,
  Arrow5,
  DottedArrow1,
  DottedArrow2,
  DottedArrow3,
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
    margin: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  instructionText: {
    ...fonts.IBMPlexSansMedium(9),
    color: theme.colors.LIGHT_BLUE,
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
      <ScrollView bounces={false}>
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
              <Arrow1 style={{
                resizeMode: 'contain',
                height: 70,
                marginLeft: 70,
              }} />
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
                  top: 95,
                  backgroundColor: '#d8d8d8',
                  padding: 4,
                  borderRadius: 7,
                }}
              >
                <HandBlue style={{
                  width: 10,
                  height: 10,
                  position: 'absolute',
                  top: -13
                }} />
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
              <Text style={[styles.instructionText, { marginBottom: 12 }]}>is created.</Text>
              <View style={{ marginLeft: 8 }}>
                <Arrow2 style={{
                  resizeMode: 'contain',
                  position: 'absolute',
                  left: -40,
                }} />
                <Text style={styles.instructionText}>Select your other</Text>
                <Text style={styles.instructionText}>profiles to link to the</Text>
                <Text style={styles.instructionText}>the primary UHID.</Text>
              </View>
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
              paddingBottom: 20,
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
                  marginTop: 15,
                  display: 'flex',
                  flexDirection: 'row'
                }}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row'
                  }}>
                    <Arrow3 style={{
                      resizeMode: 'contain',
                      top: -10,
                    }} />
                  </View>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginLeft: 5,
                  }}>
                    <Text style={styles.instructionText}>Select the other profiles to link</Text>
                    <Text style={styles.instructionText}>to the primary UHID.</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.stepsHeading}>
            STEP 3 - How to access your other UHID’s linked to Primary UHID.
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                marginTop: 60,
                marginLeft: 20,
              }}
            >
              <Text style={styles.instructionText}>
                Click on the icon <PrimaryUHIDIconBlue
                  style={{
                    width: 10,
                    height: 10,
                  }} /> and view all your
              </Text>
              <Text style={styles.instructionText}>linked UHID.</Text>
              <Arrow4 style={{
                position: 'absolute',
                resizeMode: 'contain',
                width: 80,
                right: -10,
              }} />
            </View>
            <View>
              <LinkUHIDStep3 style={{
                resizeMode: 'contain',
                width: 115,
                height: 220,
                marginLeft: 20,
              }} />
            </View>
          </View>
          <Text style={styles.stepsHeading}>
            STEP 4 - How to Delink a UHID from Primary UHID.
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              margin: 20,
            }}
          >
            <View>
              <LinkUHIDStep4first style={{
                resizeMode: 'contain',
                width: 115,
                height: 220,
              }} />
              <Arrow5 style={{
                resizeMode: 'contain',
                height: 150,
                position: 'absolute',
                left: -25,
                top: 90
              }} />
              <DottedArrow1 style={{
                resizeMode: 'contain',
                position: 'absolute',
                top: 100,
                left: 120,
                width: 90,
              }} />
              <View style={{ marginLeft: 30 }}>
                <HandBlue style={{
                  resizeMode: 'contain',
                  width: 17,
                  height: 17,
                  position: 'absolute',
                  top: 15,
                  left: -20,
                }} />
                <Text style={[styles.instructionText, { marginTop: 20 }]}>Select any linked profile </Text>
                <Text style={styles.instructionText}>from above and click on </Text>
                <Text style={styles.instructionText}>Delink button.</Text>
              </View>
              <View>
                <LinkUHIDStep4third style={{
                  resizeMode: 'contain',
                  width: 115,
                  height: 220,
                  marginTop: 50,
                }} />
                <View style={{
                  position: 'absolute',
                  left: 130,
                  top: 70
                }}>
                  <Text style={styles.instructionText}>Other UHID is Delinked</Text>
                  <Text style={styles.instructionText}>from Primary UHID</Text>
                </View>
                <View
                  style={{
                    position: 'absolute',
                    top: 230,
                    left: 110
                  }}>
                  <DottedArrow3
                    style={{
                      resizeMode: 'stretch',
                      width: 100,
                      height: 7,
                    }}
                  />
                  <View style={{ left: 40 }}>
                    <Text style={styles.instructionText}>Back to</Text>
                    <Text style={styles.instructionText}>manage profile</Text>
                  </View>
                </View>
              </View>
            </View>
            <View>
              <View>
                <LinkUHIDStep4second style={{
                  resizeMode: 'contain',
                  width: 115,
                  height: 220,
                  marginTop: 50,
                }} />
                <View>
                  <Text style={[styles.instructionText, { marginLeft: 35, marginTop: 10 }]}>Reconfirmation</Text>
                  <DottedArrow2 style={{
                    resizeMode: 'stretch',
                    width: 120,
                    height: 70,
                    position: 'absolute',
                    left: -90
                  }} />
                </View>
              </View>
              <LinkUHIDStep4fourth style={{
                resizeMode: 'contain',
                width: 115,
                height: 220,
                marginTop: 100,
              }} />
            </View>

          </View>
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