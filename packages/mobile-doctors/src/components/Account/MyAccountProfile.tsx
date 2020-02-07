import { StarDoctorsTeam } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/StarDoctorsTeam';
import {
  Star,
  BackArrow,
  RoundIcon,
  RoundChatIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { AccountStarTeam } from '@aph/mobile-doctors/src/components/Account/AccountStarTem';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { useApolloClient } from 'react-apollo-hooks';
import {
  UpdateDelegateNumber,
  UpdateDelegateNumberVariables,
} from '@aph/mobile-doctors/src/graphql/types/UpdateDelegateNumber';
import {
  UPDATE_DELEGATE_NUMBER,
  REMOVE_DELEGATE_NUMBER,
} from '@aph/mobile-doctors/src/graphql/profiles';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';

import { RemoveDelegateNumber } from '@aph/mobile-doctors/src/graphql/types/RemoveDelegateNumber';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f7f7f7',
  },
  buttonendStyle: {
    width: '45%',
    height: 40,
    backgroundColor: '#fc9916',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.4,
    elevation: 2,
  },
  buttonsaveStyle: {
    width: '35%',
    height: 40,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowColor: '#000000',
    shadowRadius: 2,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  buttonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'center',
  },
  footerButtonsContainer: {
    // zIndex: -1,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    marginLeft: 10,
    marginRight: 10,
    marginHorizontal: 20,
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  understatusline: {
    width: '95%',
    backgroundColor: '#02475b',
    marginTop: 11,
    opacity: 0.1,
    marginBottom: 16,
    ...ifIphoneX(
      {
        height: 2,
      },
      {
        height: 1,
      }
    ),
  },
  education: {
    color: '#658f9b',
    fontFamily: 'IBMPlexSans',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  educationtext: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    marginBottom: 16,
    letterSpacing: 0.35,
    marginTop: 2,
  },
  cardView: {
    margin: 16,
    ...theme.viewStyles.whiteRoundedCornerCard,
  },
  imageview: {
    height: 141,
    marginBottom: 16,
  },
  drname: {
    ...theme.fonts.IBMPlexSansSemiBold(20),
    color: '#02475b',
  },
  drnametext: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: '#0087ba',
    lineHeight: 16,
    marginTop: 4,
  },
  starIconStyle: {
    position: 'absolute',
    right: 16,
    top: 141 - 28,
  },
  columnContainer: {
    flexDirection: 'column',
    marginLeft: 16,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
    lineHeight: 28,
    paddingBottom: Platform.OS === 'ios' ? 5 : 0,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '80%',
    color: theme.colors.INPUT_TEXT,
    paddingBottom: 4,
  },
  inputValidView: {
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    marginRight: 20,
    marginLeft: 20,
    paddingBottom: 0,
  },
  inputView: {
    borderBottomColor: theme.colors.INPUT_BORDER_FAILURE,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    paddingBottom: 0,
    marginRight: 0,
    marginLeft: 20,
  },
  bottomDescription: {
    lineHeight: 24,
    color: '#890000', //theme.colors.INPUT_FAILURE_TEXT,
    // opacity: 0.6,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
    marginLeft: 20,
  },
  bottomValidDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_SUCCESS_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
    marginLeft: 20,
  },

  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
    //marginTop: 20,
  },
});

export interface ProfileProps
  extends NavigationScreenProps<{
    ProfileData: GetDoctorDetails_getDoctorDetails;
  }> {
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const MyAccountProfile: React.FC<ProfileProps> = (props) => {
  const client = useApolloClient();
  const profileData = props.navigation.getParam('ProfileData');
  console.log('p', profileData);
  const [phoneNumber, setPhoneNumber] = useState<string>(profileData!.delegateNumber!.substring(3));
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const { doctorDetails, setDoctorDetails } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  console.log('doctorDetailsmy', doctorDetails);

  // useEffect(() => {
  //   let value = profileData!.delegateNumber!;
  //   // Remove all spaces
  //   let mobile = value.replace(/ /g, '');

  //   // If string starts with +, drop first 3 characters
  //   if (value.slice(0, 1) == '+') {
  //     mobile = mobile.substring(3);
  //   }
  //   console.log('mobile', mobile);
  //   setPhoneNumber(mobile);
  // });
  const delegateNumberUpdate = (phoneNumber: string) => {
    console.log('delegateNumberUpdate', phoneNumber);
    if (phoneNumber.length == 0) {
      // Alert.alert('Please add Delegate Number');
      setIsLoading(true);
      client
        .mutate<RemoveDelegateNumber>({
          mutation: REMOVE_DELEGATE_NUMBER,
          fetchPolicy: 'no-cache',
        })
        .then((_data) => {
          const result = _data.data!.removeDelegateNumber;
          console.log('updatedelegatenumber', result);
          if (result) {
            setIsLoading(false);
            const newDoctorDetails = {
              ...doctorDetails,
              ...{ delegateNumber: phoneNumber },
            } as GetDoctorDetails_getDoctorDetails;
            setDoctorDetails && setDoctorDetails(newDoctorDetails);
            props.navigation.push(AppRoutes.TabBar);
          }
        })
        .catch((e) => {
          setIsLoading(false);
          CommonBugFender('Removed_Delegate_Number_MyaccountProfile', e);
          const error = JSON.parse(JSON.stringify(e));
          const errorMessage = error && error.message;
          console.log('Error occured while adding Delegate Number', errorMessage, error);
          Alert.alert('Error', errorMessage);
        });
    } else {
      setIsLoading(true);
      client
        .mutate<UpdateDelegateNumber, UpdateDelegateNumberVariables>({
          mutation: UPDATE_DELEGATE_NUMBER,
          variables: { delegateNumber: '+91'.concat(phoneNumber) },
          fetchPolicy: 'no-cache',
        })
        .then((_data) => {
          const result = _data.data!.updateDelegateNumber;
          setIsLoading(false);
          console.log('updatedelegatenumber', result);
          setPhoneNumber('');
          if (result) {
            const newDoctorDetails = {
              ...doctorDetails,
              ...{ delegateNumber: phoneNumber },
            } as GetDoctorDetails_getDoctorDetails;
            setDoctorDetails && setDoctorDetails(newDoctorDetails);
            Alert.alert('Successfully Updated Delegate Number');
            props.navigation.goBack();
          }
        })
        .catch((e) => {
          setIsLoading(false);
          CommonBugFender('Updated_Delegate_Number_MyaccountProfile', e);
          const error = JSON.parse(JSON.stringify(e));
          const errorMessage = error && error.message;
          console.log('Error occured while adding Delegate Number', errorMessage, error);
          Alert.alert('Error', errorMessage);
        });
    }
  };
  const profileRow = (title: string, description: string) => {
    if (!description) return null;
    return (
      <View style={styles.columnContainer}>
        <Text style={styles.education}>{title}</Text>
        <Text style={styles.educationtext}>{description}</Text>
      </View>
    );
  };

  const formatSpecialityAndExperience = (speciality: string, experience: string) =>
    `${(speciality || '').toUpperCase()}     |   ${experience}YRS`;

  const getFormattedLocation = () => {
    let location = '';
    try {
      location = [
        profileData.doctorHospital[0].facility.streetLine1,
        profileData.doctorHospital[0].facility.streetLine2,
        profileData.doctorHospital[0].facility.streetLine3,
        profileData.doctorHospital[0].facility.city,
        profileData.doctorHospital[0].facility.state,
        profileData.doctorHospital[0].facility.country,
      ]
        // .filter((data) => console.log('data', data))
        .filter(Boolean)
        .join(', ');
    } catch (e) {
      CommonBugFender('Get_Formatted_Location_Myaccountprofile', e);
      console.log(e);
    }
    return location;
  };

  const showHeaderView = () => {
    return (
      <Header
        containerStyle={{ height: 50 }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText="My PROFILE"
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => props.navigation.push(AppRoutes.NeedHelpAppointment),
          },
        ]}
      />
    );
  };

  const isPhoneNumberValid = (number: string) => {
    const isValidNumber =
      // (number.replace(/^0+/, '').length !== 10 && number.length !== 0) ||
      !/^[6-9]{1}\d{0,9}$/.test(number) ? false : true;
    return isValidNumber;
  };
  const validateAndSetPhoneNumber = (number: string) => {
    if (/^\d+$/.test(number) || number == '') {
      setPhoneNumber(number);
      // if (number.length == 10) {
      setPhoneNumberIsValid(isPhoneNumberValid(number));
      // }
    } else {
      return false;
    }
  };

  const renderHelpView = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          marginLeft: 20,
          marginRight: 20,
          marginTop: 12,
          //marginBottom: 32,
        }}
      >
        <View style={{ marginTop: 4 }}>
          <RoundChatIcon />
        </View>
        <View style={{ marginLeft: 14 }}>
          <Text>
            <Text style={styles.descriptionview}>Call</Text>
            <Text
              style={{
                color: '#fc9916',
                ...theme.fonts.IBMPlexSansSemiBold(16),
                lineHeight: 22,
              }}
            >
              {' '}
              1800 - 3455 - 3455{' '}
            </Text>
            <Text style={styles.descriptionview}>to make any changes</Text>
          </Text>
        </View>
      </View>
    );
  };
  const renderMobilePhoneView = () => {
    return (
      <View
        style={{
          margin: 20,
          backgroundColor: '#ffffff',
          borderRadius: 5,
          shadowColor: '#000000',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowRadius: 10,
          shadowOpacity: 0.2,
          elevation: 5,
        }}
      >
        <Text
          style={{
            ...theme.fonts.IBMPlexSansMedium(16),
            color: '#01475b',
            marginRight: 12,
            marginLeft: 20,
            marginTop: 16,
            marginBottom: 18,
          }}
        >
          Enter the mobile number you’d like to assign access of your account to
        </Text>

        <View
          style={[
            phoneNumber == '' || phoneNumberIsValid ? styles.inputValidView : styles.inputValidView,
            { marginBottom: 16 },
          ]}
        >
          {/* <Text style={styles.inputTextStyle}>{string.LocalStrings.numberPrefix}</Text> */}
          <TextInput
            style={styles.inputStyle}
            keyboardType="numeric"
            maxLength={10}
            value={phoneNumber}
            onChangeText={(phoneNumber) => validateAndSetPhoneNumber(phoneNumber)}
            editable={true}
          />
        </View>
        {/* <Text
          style={
            phoneNumber == '' || phoneNumberIsValid
              ? styles.bottomValidDescription
              : styles.bottomDescription
          }
        >
          {phoneNumber == '' || phoneNumberIsValid
            ? string.LocalStrings.otp_sent_to
            : string.LocalStrings.wrong_number}
        </Text> */}
      </View>
    );
  };

  const renderButtonsView = () => {
    return (
      <View style={{ backgroundColor: '#f0f4f5' }}>
        <View style={styles.footerButtonsContainer}>
          <Button
            title="CANCEL"
            titleTextStyle={styles.buttonTextStyle}
            variant="white"
            onPress={() => props.navigation.pop()}
            style={[styles.buttonsaveStyle, { marginRight: 16 }]}
          />
          <Button
            title="SAVE"
            style={styles.buttonendStyle}
            onPress={() => delegateNumberUpdate(phoneNumber)}
          />
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <View>{showHeaderView()}</View>
      <KeyboardAwareScrollView bounces={false}>
        <ScrollView bounces={false}>
          <SquareCardWithTitle title="Your Profile">
            <View style={styles.cardView}>
              <View
                style={{ overflow: 'hidden', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
              >
                {profileData!.photoUrl ? (
                  // <Image
                  //   style={styles.imageview}
                  //   source={{
                  //     uri: profileData!.photoUrl,
                  //   }}
                  // />
                  <Image
                    style={styles.imageview}
                    source={require('@aph/mobile-doctors/src/images/doctor/doctor.png')}
                  />
                ) : (
                  <Image
                    style={styles.imageview}
                    source={require('@aph/mobile-doctors/src/images/doctor/doctor.png')}
                  />
                )}
              </View>
              {profileData!.doctorType == 'STAR_APOLLO' ? (
                <Star style={styles.starIconStyle}></Star>
              ) : null}
              <View style={styles.columnContainer}>
                <Text style={[styles.drname]} numberOfLines={1}>
                  {`Dr. ${profileData!.firstName} ${profileData!.lastName}`}
                </Text>
                <Text style={styles.drnametext}>
                  {formatSpecialityAndExperience(
                    profileData!.specialty.name,
                    profileData!.experience || ''
                  )}
                </Text>
                <View style={styles.understatusline} />
              </View>
              {profileRow('Education', profileData!.qualification!)}
              {profileRow('Speciality', profileData!.specialty.name!)}
              {profileRow('Services', profileData!.specialization || '')}
              {profileRow(
                'Awards',
                (profileData!.awards || '')
                  .replace('&amp;', '&')
                  .replace(/<\/?[^>]+>/gi, '')
                  .trim()
              )}
              {profileRow('Speaks', (profileData!.languages || '').split(',').join(', '))}
              {profileRow('MCI Number', profileData!.registrationNumber)}
              {profileRow('In-person Consult Location', getFormattedLocation())}
            </View>
            {profileData!.doctorType == 'STAR_APOLLO' ? (
              <AccountStarTeam
                profileData={profileData}
                scrollViewRef={props.scrollViewRef}
                onReload={props.onReload}
              />
            ) : null}
            <View>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(16),
                  letterSpacing: 0.06,
                  color: '#02475b',
                  marginLeft: 20,
                  // marginBottom: 18,
                }}
              >
                Secretary Login
              </Text>
              {renderMobilePhoneView()}
              {renderHelpView()}
              {isLoading ? <Loader flex1 /> : null}
              {renderButtonsView()}
            </View>
          </SquareCardWithTitle>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};
