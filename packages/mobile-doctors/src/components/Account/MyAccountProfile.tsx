import { AccountStarTeam } from '@aph/mobile-doctors/src/components/Account/AccountStarTem';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  BackArrow,
  RoundChatIcon,
  RoundIcon,
  Star,
  UserPlaceHolder,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import {
  REMOVE_DELEGATE_NUMBER,
  UPDATE_DELEGATE_NUMBER,
} from '@aph/mobile-doctors/src/graphql/profiles';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import { RemoveDelegateNumber } from '@aph/mobile-doctors/src/graphql/types/RemoveDelegateNumber';
import {
  UpdateDelegateNumber,
  UpdateDelegateNumberVariables,
} from '@aph/mobile-doctors/src/graphql/types/UpdateDelegateNumber';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';

const styles = StyleSheet.create({
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
    width: '100%',
    marginBottom: 16,
    resizeMode: 'contain',
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
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
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
  const [phoneNumber, setPhoneNumber] = useState<string>(
    (profileData.delegateNumber || '').substring(3)
  );
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const { doctorDetails, setDoctorDetails } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showHelpModel, setshowHelpModel] = useState(false);

  const delegateNumberUpdate = (phoneNumber: string) => {
    console.log('delegateNumberUpdate', phoneNumber);
    if (phoneNumber.length == 0) {
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
          // Alert.alert(strings.common.error, errorMessage);
          Alert.alert(strings.common.uh_oh, strings.common.oops_msg);
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
            Alert.alert(strings.alerts.successfully_updated_delegate_num);
            props.navigation.goBack();
          }
        })
        .catch((e) => {
          setIsLoading(false);
          CommonBugFender('Updated_Delegate_Number_MyaccountProfile', e);
          const error = JSON.parse(JSON.stringify(e));
          const errorMessage = error && error.message;
          console.log('Error occured while adding Delegate Number', errorMessage, error);
          // Alert.alert(strings.common.error, errorMessage);
          Alert.alert(strings.common.uh_oh, strings.common.oops_msg);
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
    `${(speciality || '').toUpperCase()}     |   ${experience} ${strings.common.yrs}`;

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
        headerText={strings.account.my_profile.toUpperCase()}
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => setshowHelpModel(true),
          },
        ]}
      />
    );
  };

  const isPhoneNumberValid = (number: string) => {
    const isValidNumber = /^[6-9]{1}\d{0,9}$/.test(number);
    return isValidNumber;
  };
  const validateAndSetPhoneNumber = (number: string) => {
    if (/^\d+$/.test(number) || number == '') {
      setPhoneNumber(number);

      setPhoneNumberIsValid(isPhoneNumberValid(number));
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
        }}
      >
        <View style={{ marginTop: 4 }}>
          <RoundChatIcon />
        </View>
        <View style={{ marginLeft: 14 }}>
          <Text>
            <Text style={styles.descriptionview}>{strings.common.call}</Text>
            <Text
              style={{
                color: '#fc9916',
                ...theme.fonts.IBMPlexSansSemiBold(16),
                lineHeight: 22,
              }}
            >
              {' '}
              {strings.common.toll_free_num}{' '}
            </Text>
            <Text style={styles.descriptionview}>{strings.account.to_make_changes}</Text>
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
          {strings.account.enter_mobile_num_to_access_ac}
        </Text>

        <View
          style={[
            phoneNumber == '' || phoneNumberIsValid ? styles.inputValidView : styles.inputValidView,
            { marginBottom: 16 },
          ]}
        >
          <TextInput
            style={styles.inputStyle}
            keyboardType="numeric"
            maxLength={10}
            value={phoneNumber}
            onChangeText={(phoneNumber) => validateAndSetPhoneNumber(phoneNumber)}
            editable={true}
          />
        </View>
      </View>
    );
  };

  const renderButtonsView = () => {
    return (
      <View style={{ backgroundColor: '#f0f4f5' }}>
        <View style={styles.footerButtonsContainer}>
          <Button
            title={strings.buttons.cancel}
            titleTextStyle={styles.buttonTextStyle}
            variant="white"
            onPress={() => props.navigation.pop()}
            style={[styles.buttonsaveStyle, { marginRight: 16 }]}
          />
          <Button
            title={strings.buttons.save}
            style={styles.buttonendStyle}
            onPress={() => delegateNumberUpdate(phoneNumber)}
          />
        </View>
      </View>
    );
  };

  const renderNeedHelpModal = () => {
    return showHelpModel ? <NeedHelpCard onPress={() => setshowHelpModel(false)} /> : null;
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {showHeaderView()}
      <KeyboardAwareScrollView bounces={false}>
        <ScrollView bounces={false}>
          <SquareCardWithTitle title={strings.account.your_profile}>
            <View style={styles.cardView}>
              <View
                style={{ overflow: 'hidden', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
              >
                {profileData.photoUrl ? (
                  <Image style={styles.imageview} source={{ uri: profileData.photoUrl }} />
                ) : (
                  <UserPlaceHolder style={styles.imageview} />
                )}
              </View>
              {profileData.doctorType == 'STAR_APOLLO' ? (
                <Star style={styles.starIconStyle}></Star>
              ) : null}
              <View style={styles.columnContainer}>
                <Text style={[styles.drname]} numberOfLines={1}>
                  {`${strings.common.dr} ${profileData.firstName} ${profileData.lastName}`}
                </Text>
                <Text style={styles.drnametext}>
                  {formatSpecialityAndExperience(
                    profileData.specialty!.name,
                    profileData.experience || ''
                  )}
                </Text>
                <View style={styles.understatusline} />
              </View>
              {profileRow(strings.account.education, profileData.qualification || '')}
              {profileRow(strings.account.speciality, g(profileData, 'specialty', 'name') || '')}
              {profileRow(strings.account.services, profileData.specialization || '')}
              {profileRow(
                strings.account.awards,
                (profileData.awards || '')
                  .replace('&amp;', '&')
                  .replace(/<\/?[^>]+>/gi, '')
                  .trim()
              )}
              {profileRow(
                strings.account.speaks,
                (profileData.languages || '').split(',').join(', ')
              )}
              {profileRow(strings.account.mci_num, profileData.registrationNumber)}
              {profileRow(strings.account.in_person_consult_loc, getFormattedLocation())}
            </View>
            {profileData.doctorType == 'STAR_APOLLO' ? (
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
                }}
              >
                {strings.account.secretay_login}
              </Text>
              {renderMobilePhoneView()}
              {renderHelpView()}
              {isLoading ? <Loader flex1 /> : null}
              {renderButtonsView()}
            </View>
          </SquareCardWithTitle>
        </ScrollView>
      </KeyboardAwareScrollView>
      {renderNeedHelpModal()}
    </SafeAreaView>
  );
};
