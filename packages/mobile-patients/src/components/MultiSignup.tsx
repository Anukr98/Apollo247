import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DropdownGreen, Mascot } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  AsyncStorage,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MenuProvider } from 'react-native-popup-menu';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth, useAllCurrentPatients } from '../hooks/authHooks';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  updatePatientVariables,
  updatePatient,
} from '@aph/mobile-patients/src/graphql/types/updatePatient';
import { UPDATE_PATIENT } from '@aph/mobile-patients/src/graphql/profiles';
import { Mutation } from 'react-apollo';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    backgroundColor: theme.colors.WHITE,
    paddingTop: 2,
  },
  mascotStyle: {
    position: 'absolute',
    top: -32,
    right: 20,
    height: 64,
    width: 64,
    zIndex: 2,
    elevation: 2,
  },
  idTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.INPUT_TEXT,
  },
  nameTextStyle: {
    paddingTop: 15,
    paddingBottom: 8,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
  },
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
    paddingVertical: 8,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 7,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
});

type currentProfiles = {
  firstName: string;
  id: string;
  lastName: string;
  mobileNumber: string;
  gender: string;
  uhid: string;
  relation?: string;
};

type updatePateint = {
  id: string;
  relation: Relation | null;
};

export interface MultiSignupProps extends NavigationScreenProps {}

export const MultiSignup: React.FC<MultiSignupProps> = (props) => {
  const [relationIndex, setRelationIndex] = useState<number>(0);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const { analytics, signOut } = useAuth();
  const [profiles, setProfiles] = useState<any>([]);
  const [discriptionText, setDiscriptionText] = useState<string>('');
  const [showText, setShowText] = useState<boolean>(false);
  const [verifyingPhoneNumber, setVerifyingPhoneNumber] = useState<boolean>(false);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

  useEffect(() => {
    setProfiles(allCurrentPatients ? allCurrentPatients : []);
    AsyncStorage.setItem('multiSignUp', 'true');
  }, [allCurrentPatients]);

  useEffect(() => {
    analytics.setCurrentScreen(AppRoutes.MultiSignup);
    setProfiles(allCurrentPatients ? allCurrentPatients : []);
    const length =
      profiles &&
      (profiles.length == 1 ? profiles.length + ' account' : profiles.length + ' accounts');
    const baseString =
      'We have found ' +
      length +
      ' registered with this mobile number. Please tell us who is who ? :)';
    setDiscriptionText(baseString);

    if (length !== 'undefined accounts') {
      setShowText(true);
      console.log('length', length);
    }
    console.log('discriptionText', discriptionText);
    console.log('allCurrentPatients', allCurrentPatients);
  }, [currentPatient, allCurrentPatients, analytics, profiles, discriptionText, showText]);

  const renderUserForm = (styles: any, allCurrentPatients: currentProfiles, i: number) => {
    return (
      <View>
        <View
          style={{
            marginTop: 12,
            borderRadius: 5,
            backgroundColor: '#f7f8f5',
            padding: 16,
            paddingBottom: 6,
          }}
        >
          <View style={{ flex: 1 }}></View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottomColor: 'rgba(2,71,91, 0.3)',
              borderBottomWidth: 0.5,
              paddingBottom: 8,
            }}
          >
            <Text style={styles.idTextStyle}>{i + 1}.</Text>
            <Text style={styles.idTextStyle}>{allCurrentPatients.uhid}</Text>
          </View>
          <Text style={styles.nameTextStyle}>
            {allCurrentPatients.firstName} {allCurrentPatients.lastName}
          </Text>
          <Text style={styles.idTextStyle}>{allCurrentPatients.gender} | 01 January 1987</Text>
          <View style={{ marginTop: 10 }}>
            <View style={{ paddingTop: 5, paddingBottom: 10 }}>
              <TouchableOpacity
                // style={styles.placeholderViewStyle}
                onPress={() => {
                  setShowPopup(true);
                  setRelationIndex(i);
                }}
              >
                <View style={styles.placeholderViewStyle}>
                  <Text
                    style={[
                      styles.placeholderTextStyle,
                      allCurrentPatients.relation ? null : styles.placeholderStyle,
                    ]}
                  >
                    {allCurrentPatients.relation ? allCurrentPatients.relation : 'Relation'}
                  </Text>
                  <DropdownGreen size="sm" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  const isDisabled = () => {
    const filteredProfiles = profiles.filter((obj: object) => obj.relation);
    if (profiles.length === filteredProfiles.length) {
      return false;
    }
    return true;
  };

  type options = {
    name: string;
    value: string;
  };

  const Options: options[] = [
    {
      name: 'Me',
      value: 'ME',
    },
    {
      name: 'Mother',
      value: 'MOTHER',
    },
    {
      name: 'Father',
      value: 'FATHER',
    },
    {
      name: 'Sister',
      value: 'SISTER',
    },
    {
      name: 'Wife',
      value: 'WIFE',
    },
    {
      name: 'Husband',
      value: 'HUSBAND',
    },
    {
      name: 'Son',
      value: 'SON',
    },
    {
      name: 'Daughter',
      value: 'DAUGHTER',
    },
    {
      name: 'Other',
      value: 'OTHER',
    },
  ];

  const Popup = () => (
    <TouchableOpacity
      style={{
        paddingVertical: 9,
        position: 'absolute',
        width: width,
        height: height,
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 3,
        backgroundColor: 'transparent',
      }}
      onPress={() => setShowPopup(false)}
    >
      <View
        style={{
          width: 160,
          borderRadius: 10,
          backgroundColor: 'white',
          marginRight: 20,
          shadowColor: '#808080',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 5,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        {Options.map((menu) => (
          <View style={styles.textViewStyle}>
            <Text
              style={styles.textStyle}
              onPress={() => {
                profiles[relationIndex].relation = menu.name;
                const result = profiles.filter((obj) => {
                  return obj.relation == 'Me';
                });

                if (result.length > 1) {
                  profiles[relationIndex].relation = '';
                  Alert.alert('Apollo', 'Me is already choosen for another profile.');
                }
                console.log('result', result);
                console.log('result length', result.length);

                setProfiles(profiles);
                setShowPopup(false);
              }}
            >
              {menu.name}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderButtons = () => {
    return (
      <StickyBottomComponent>
        <Mutation<updatePatient, updatePatientVariables> mutation={UPDATE_PATIENT}>
          {(mutate, { loading, data, error }) => (
            <Button
              style={{ width: '100%', flex: 1, marginHorizontal: 40 }}
              title={'SUBMIT'}
              disabled={isDisabled()}
              onPress={async () => {
                setVerifyingPhoneNumber(true);

                profiles.forEach(async (profile: any) => {
                  const patientsDetails: updatePateint = {
                    id: profile.id || '',
                    relation: profile.relation.toUpperCase() || '',
                  };
                  console.log('patientsDetails', patientsDetails);
                  mutate({
                    variables: {
                      patientInput: patientsDetails,
                    },
                  });
                });
              }}
            >
              {data
                ? (setVerifyingPhoneNumber(false),
                  console.log('data', data.updatePatient.patient),
                  signOut(),
                  // setCurrentPatient(data.updatePatient.patient),
                  // setAllCurrentPatients([data.updatePatient.patient]),
                  AsyncStorage.setItem('userLoggedIn', 'true'),
                  AsyncStorage.setItem('multiSignUp', 'false'),
                  AsyncStorage.setItem('gotIt', 'false'),
                  props.navigation.navigate(AppRoutes.TabBar))
                : null}
              {/* {loading ? setVerifyingPhonenNumber(false) : setVerifyingPhonenNumber(false)} */}
              {error
                ? (setVerifyingPhoneNumber(false),
                  Alert.alert('Apollo', error.message),
                  console.log('updatePatient error', error),
                  AsyncStorage.setItem('userLoggedIn', 'false'),
                  AsyncStorage.setItem('multiSignUp', 'false'),
                  AsyncStorage.setItem('signUp', 'false'),
                  props.navigation.replace(AppRoutes.Login))
                : null}
            </Button>
          )}
        </Mutation>
      </StickyBottomComponent>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <MenuProvider customStyles={{ menuProviderWrapper: { flex: 1 } }}>
          <KeyboardAwareScrollView style={styles.container} bounces={false}>
            <View style={{ justifyContent: 'center', marginTop: 20, marginLeft: 20 }}>
              <ApolloLogo />
            </View>

            <Card
              cardContainer={{
                marginHorizontal: 0,
                marginTop: 20,
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.4,
              }}
              heading={string.login.welcome_text}
              description={showText ? discriptionText : string.login.multi_signup_desc}
              descriptionTextStyle={{ paddingBottom: 50 }}
            >
              <View style={styles.mascotStyle}>
                <Mascot />
              </View>
              {profiles.map((allCurrentPatients: currentProfiles, i: number) => (
                <View key={i}>{renderUserForm(styles, allCurrentPatients, i)}</View>
              ))}
              <View style={{ height: 80 }} />
            </Card>
          </KeyboardAwareScrollView>
          {renderButtons()}
        </MenuProvider>
        {showPopup && Popup()}
      </SafeAreaView>
      {verifyingPhoneNumber ? (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0, 0.2)',
            alignSelf: 'center',
            justifyContent: 'center',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            elevation: 3,
            zIndex: 3,
          }}
        >
          <ActivityIndicator animating={verifyingPhoneNumber} size="large" color="green" />
        </View>
      ) : null}
    </View>
  );
};
