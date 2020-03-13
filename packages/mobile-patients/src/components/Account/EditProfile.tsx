import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  DropdownGreen,
  More,
  EditIcon,
  EditProfilePlaceHolder,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  DeviceHelper,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  ADD_NEW_PROFILE,
  DELETE_PROFILE,
  EDIT_PROFILE,
  UPLOAD_FILE,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  addNewProfile,
  addNewProfileVariables,
} from '@aph/mobile-patients/src/graphql/types/addNewProfile';
import {
  deleteProfile,
  deleteProfileVariables,
} from '@aph/mobile-patients/src/graphql/types/deleteProfile';
import {
  editProfile,
  editProfileVariables,
} from '@aph/mobile-patients/src/graphql/types/editProfile';
import { getPatientByMobileNumber_getPatientByMobileNumber_patients } from '@aph/mobile-patients/src/graphql/types/getPatientByMobileNumber';
import { Gender, Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { uploadFile, uploadFileVariables } from '@aph/mobile-patients/src/graphql/types/uploadFile';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import { Text } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';
import { useUIElements } from '../UIElementsProvider';
import { getRelations } from '../../helpers/helperFunctions';
import AsyncStorage from '@react-native-community/async-storage';

const styles = StyleSheet.create({
  yellowTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    padding: 16,
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 12,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    ...theme.viewStyles.text('M', 15, theme.colors.APP_GREEN),
  },
  stickyBottomStyle: {
    height: 'auto',
  },
  bottonButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    paddingTop: 14,
    paddingBottom: 20,
  },
  bottomButtonStyle: {
    flex: 1,
  },
  bottomWhiteButtonStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
  },
  bottomWhiteButtonTextStyle: {
    color: theme.colors.APP_YELLOW,
  },
  buttonSeperatorStyle: {
    width: 16,
  },
  buttonViewStyle: {
    width: '30%',
    marginRight: 16,
    backgroundColor: 'white',
  },
  selectedButtonViewStyle: {
    backgroundColor: theme.colors.APP_GREEN,
  },
  buttonTitleStyle: {
    color: theme.colors.APP_GREEN,
  },
  selectedButtonTitleStyle: {
    color: theme.colors.WHITE,
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 18, '#01475b'),
  },
  profilePicContainer: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
    marginTop: -60,
  },
  profileImageContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    resizeMode: 'contain',
    position: 'absolute',
  },
  editIcon: {
    width: 26,
    height: 26,
    bottom: 0,
    right: 0,
    position: 'absolute',
  },
});

type profile = {
  id?: string;
  email?: string;
  firstName: string;
  lastName: string;
  relation: Relation | undefined;
  gender: Gender | undefined;
  uhid?: string;
  dateOfBirth?: Date;
  photoUrl?: string;
  allergies?: string;
  number?: string;
};

type genderOptions = {
  name: Gender;
  title: string;
};

const GenderOptions: genderOptions[] = [
  {
    name: Gender.MALE,
    title: 'Male',
  },
  {
    name: Gender.FEMALE,
    title: 'Female',
  },
  // {
  //   name: Gender.OTHER,
  //   title: 'Other',
  // },
];

type RelationArray = {
  key: Relation;
  title: string;
};

const relationArray1: RelationArray[] = [
  { key: Relation.ME, title: 'Self' },
  {
    key: Relation.FATHER,
    title: 'Father',
  },
  {
    key: Relation.MOTHER,
    title: 'Mother',
  },
  {
    key: Relation.HUSBAND,
    title: 'Husband',
  },
  {
    key: Relation.WIFE,
    title: 'Wife',
  },
  {
    key: Relation.BROTHER,
    title: 'Brother',
  },
  {
    key: Relation.SISTER,
    title: 'Sister',
  },
  {
    key: Relation.COUSIN,
    title: 'Cousin',
  },
  {
    key: Relation.OTHER,
    title: 'Other',
  },
];

export interface EditProfileProps extends NavigationScreenProps {
  isEdit: boolean;
  isPoptype?: boolean;
}
{
}

export const EditProfile: React.FC<EditProfileProps> = (props) => {
  const relationArray: RelationArray[] = getRelations() || relationArray1;
  const isEdit = props.navigation.getParam('isEdit');
  const isPoptype = props.navigation.getParam('isPoptype');
  const { width, height } = Dimensions.get('window');
  const { currentPatient, allCurrentPatients, setCurrentPatientId } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();

  const [deleteProfile, setDeleteProfile] = useState<boolean>(false);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<
    getPatientByMobileNumber_getPatientByMobileNumber_patients
  >(props.navigation.getParam('profileData'));
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [date, setDate] = useState<Date>();
  const [gender, setGender] = useState<Gender>();
  const [relation, setRelation] = useState<RelationArray>();
  const [email, setEmail] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [bottomPopUp, setBottomPopUp] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<boolean>(false);

  const { isIphoneX } = DeviceHelper();
  const client = useApolloClient();

  const isSatisfyingNameRegex = (value: string) =>
    value == ' '
      ? false
      : value == '' || /^[a-zA-Z]+((['’ ][a-zA-Z])?[a-zA-Z]*)*$/.test(value)
      ? true
      : false;

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const _setFirstName = (value: string) => {
    if (/^[a-zA-Z'’ ]*$/.test(value)) {
      setFirstName(value);
    } else {
      return false;
    }
  };
  const _setLastName = (value: string) => {
    if (/^[a-zA-Z'’ ]*$/.test(value)) {
      setLastName(value);
    } else {
      return false;
    }
  };

  const isChanged =
    profileData &&
    firstName === profileData.firstName &&
    lastName === profileData.lastName &&
    Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD') === profileData.dateOfBirth &&
    gender === profileData.gender &&
    relation &&
    relation.key === profileData.relation &&
    email === profileData.emailAddress &&
    photoUrl === profileData.photoUrl;

  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName || '');
      setLastName(profileData.lastName || '');
      setDate(new Date(profileData.dateOfBirth!));
      setGender(profileData!.gender!);
      setRelation(relationArray.find((relation) => relation.key === profileData.relation));
      setEmail(profileData.emailAddress || '');
      setPhotoUrl(profileData.photoUrl || '');
    }
  }, []);

  const deleteConfirmation = () => {
    showAphAlert!({
      title: 'Hi!',
      description: 'Are you sure you want to delete this profile ?',
      children: (
        <View
          style={{
            flexDirection: 'row',
            marginHorizontal: 20,
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginVertical: 18,
          }}
        >
          <Button
            style={{
              flex: 1,
              marginRight: 16,
            }}
            title={'NO'}
            onPress={() => {
              hideAphAlert!();
            }}
          />
          <Button
            style={{ flex: 1 }}
            title={'YES'}
            onPress={() => {
              hideAphAlert!();
              deleteUserProfile();
            }}
          />
        </View>
      ),
    });
  };

  const deleteUserProfile = () => {
    setLoading && setLoading(true);
    if (currentPatient!.id !== profileData.id) {
      if (profileData.relation !== Relation.ME) {
        client
          .mutate<deleteProfile, deleteProfileVariables>({
            mutation: DELETE_PROFILE,
            variables: {
              patientId: profileData.id,
            },
          })
          .then((data) => {
            setLoading && setLoading(false);
            getPatientApiCall();
            props.navigation.goBack();
            setLoading && setLoading(true);
            // props.navigation.pop(2);
            // props.navigation.push(AppRoutes.ManageProfile, {
            //   mobileNumber: props.navigation.getParam('mobileNumber'),
            // });
          })
          .catch((e) => {
            setLoading && setLoading(false);
            showAphAlert!({
              title: 'Network Error!',
              description: 'Please try again later.',
            });
            CommonBugFender('EditProfile_deleteUserProfile', e);
          });
        // .finally(() => {
        //   setLoading && setLoading(false);
        // });
      } else {
        setLoading && setLoading(false);
        showAphAlert!({
          title: `Alert`,
          description: `Self profile can't be deleted`,
        });
      }
    } else {
      setLoading && setLoading(false);
      showAphAlert!({
        title: `Alert`,
        description: `This profile can't be deleted as it is selected as default`,
      });
    }
  };

  const updateUserProfile = () => {
    setLoading && setLoading(true);
    if (!isChanged) {
      client
        .mutate<editProfile, editProfileVariables>({
          mutation: EDIT_PROFILE,
          variables: {
            editProfileInput: {
              id: profileData.id,
              photoUrl: photoUrl,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              relation: (relation && relation.key!) || Relation.ME,
              gender: gender ? gender : Gender.OTHER,
              dateOfBirth: Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              emailAddress: email.trim(),
            },
          },
        })
        .then((data) => {
          setLoading && setLoading(false);
          if (relation && relation.key === Relation.ME && profileData.relation !== Relation.ME) {
            setCurrentPatientId(profileData!.id);
            AsyncStorage.removeItem('selectUserId');
            // AsyncStorage.setItem('selectUserId', profileData!.id);
          }
          getPatientApiCall();
          props.navigation.goBack();
          setLoading && setLoading(true);
          // props.navigation.pop(2);
          // props.navigation.push(AppRoutes.ManageProfile, {
          //   mobileNumber: props.navigation.getParam('mobileNumber'),
          // });
        })
        .catch((e) => {
          setLoading && setLoading(false);
          showAphAlert!({
            title: 'Network Error!',
            description: 'Please try again later.',
          });
          CommonBugFender('EditProfile_updateUserProfile', e);
        });
      // .finally(() => {
      //   // setLoading && setLoading(false);
      // });
    } else {
      setLoading && setLoading(false);
      props.navigation.goBack();
    }
  };

  const newProfile = () => {
    setLoading && setLoading(true);
    client
      .mutate<addNewProfile, addNewProfileVariables>({
        mutation: ADD_NEW_PROFILE,
        variables: {
          PatientProfileInput: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth: Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            gender: gender ? gender : Gender.OTHER,
            relation: (relation && relation.key) || Relation.ME,
            emailAddress: email.trim(),
            photoUrl: photoUrl,
            mobileNumber: props.navigation.getParam('mobileNumber'),
          },
        },
      })
      .then((data) => {
        setLoading && setLoading(false);
        getPatientApiCall();
        props.navigation.goBack();
        setLoading && setLoading(true);
        // if (relation!.key === Relation.ME) {
        //   setCurrentPatientId(data!.data!.addNewProfile!.patient!.id);
        //   AsyncStorage.setItem('selectUserId', profileData!.id);
        // }
        // isPoptype
        //   ? (props.navigation.goBack(), getPatientApiCall())
        //   : (props.navigation.pop(2),
        //     props.navigation.push(AppRoutes.ManageProfile, {
        //       mobileNumber: props.navigation.getParam('mobileNumber'),
        //     }));
      })
      .catch((e) => {
        setLoading && setLoading(false);
        showAphAlert!({
          title: 'Network Error!',
          description: 'Please try again later.',
        });
        CommonBugFender('EditProfile_newProfile', e);
      });
    // .finally(() => {
    //   setLoading && setLoading(false);
    // });
  };

  const renderUploadSelection = () => {
    return (
      <UploadPrescriprionPopup
        isProfileImage={true}
        heading="Upload Profile Picture"
        isVisible={uploadVisible}
        hideTAndCs
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE FROM GALLERY',
        }}
        onClickClose={() => {
          setUploadVisible(false);
        }}
        onResponse={(type, response) => {
          console.log('profile data', type, response);
          response.forEach((item) =>
            client
              .mutate<uploadFile, uploadFileVariables>({
                mutation: UPLOAD_FILE,
                fetchPolicy: 'no-cache',
                variables: {
                  fileType: item.fileType,
                  base64FileInput: item.base64,
                },
              })
              .then((data) => {
                console.log(data);
                data!.data!.uploadFile && setPhotoUrl(data!.data!.uploadFile!.filePath!);
                setUploadVisible(false);
              })
              .catch((e) => {
                CommonBugFender('EditProfile_renderUploadSelection', e);
              })
          );
          setUploadVisible(false);
        }}
      />
    );
  };

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={isEdit ? 'EDIT PROFILE' : 'ADD NEW PROFILE'}
        rightComponent={null}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderProfileImage = () => {
    return (
      <View style={styles.profilePicContainer}>
        <View style={styles.profileImageContainer}>
          {photoUrl && photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/) ? (
            <Image
              style={styles.profileImage}
              source={{
                uri: photoUrl,
              }}
              resizeMode={'contain'}
            />
          ) : (
            <EditProfilePlaceHolder style={styles.profileImage} />
          )}
        </View>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setUploadVisible(true);
          }}
          style={styles.editIcon}
        >
          <EditIcon style={styles.editIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDatePicker = () => {
    return (
      <View>
        <View style={{ marginTop: -5 }}>
          <View style={{ paddingTop: 0, paddingBottom: 10 }}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.placeholderViewStyle}
              onPress={() => {
                Keyboard.dismiss();
                setIsDateTimePickerVisible(true);
              }}
            >
              <Text
                style={[
                  styles.placeholderTextStyle,
                  ,
                  date !== undefined ? null : styles.placeholderStyle,
                ]}
              >
                {date !== undefined ? Moment(date).format('DD/MM/YYYY') : 'dd/mm/yyyy'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <DatePicker
          date={date}
          isDateTimePickerVisible={isDateTimePickerVisible}
          handleDatePicked={(date) => {
            setDate(date);
            setIsDateTimePickerVisible(false);
            Keyboard.dismiss();
          }}
          hideDateTimePicker={() => {
            setIsDateTimePickerVisible(false);
            Keyboard.dismiss();
          }}
        />
      </View>
    );
  };

  const renderGender = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginBottom: 10,
          paddingHorizontal: 2,
        }}
      >
        {GenderOptions.map((option) => (
          <Button
            key={option.name}
            title={option.title}
            style={[
              styles.buttonViewStyle,
              gender === option.name ? styles.selectedButtonViewStyle : null,
            ]}
            titleTextStyle={
              gender === option.name ? styles.selectedButtonTitleStyle : styles.buttonTitleStyle
            }
            onPress={() => setGender(option.name)}
          />
        ))}
      </View>
    );
  };

  const onRelationSelect = (
    selected: { key: string; value: string | number },
    presentRelation: string
  ) => {
    const isSelfRelation =
      allCurrentPatients &&
      allCurrentPatients!.map((item) => {
        return item.relation === Relation.ME;
      });
    console.log(presentRelation, 'presentRelation');

    const isValid = isSelfRelation!.find((i) => i === true) === undefined;

    if (isValid || selected.key !== Relation.ME || presentRelation == Relation.ME) {
      setRelation({
        key: selected.key as Relation,
        title: selected.value.toString(),
      });
    }
    // } else if (presentRelation == Relation.ME||) {
    //   setBottomPopUp(false);
    // }
    else {
      showAphAlert!({
        title: 'Apollo',
        description: "'Self' is already choosen for another profile.",
      });
    }
  };

  const renderRelation = () => {
    const relationsData = relationArray.map((i) => {
      return { key: i.key, value: i.title };
    });

    return (
      <MaterialMenu
        options={relationsData}
        selectedText={relation && relation.key.toString()}
        menuContainerStyle={{ alignItems: 'flex-end', marginLeft: width / 2 - 95 }}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 16, '#00b38e'),
          alignSelf: 'flex-start',
        }}
        bottomPadding={{ paddingBottom: 20 }}
        onPress={(selectedRelation) =>
          onRelationSelect(selectedRelation, (profileData && profileData.relation!) || '')
        }
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text
              style={[
                styles.placeholderTextStyle,
                ,
                relation !== undefined ? null : styles.placeholderStyle,
              ]}
            >
              {relation !== undefined ? relation.title : 'Who is this to you?'}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  const renderForm = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          padding: 16,
          marginTop: 64,
          marginHorizontal: 20,
        }}
      >
        {renderProfileImage()}
        <TextInputComponent
          label={'Full Name'}
          value={`${firstName}`}
          onChangeText={(fname) => _setFirstName(fname)}
          placeholder={'First Name'}
        />
        <TextInputComponent
          value={`${lastName}`}
          onChangeText={(lname) => _setLastName(lname)}
          placeholder={'Last Name'}
        />
        <TextInputComponent label={'Date Of Birth'} noInput={true} />
        {renderDatePicker()}
        <TextInputComponent label={'Gender'} noInput={true} />
        {renderGender()}
        <TextInputComponent label={'Relation'} noInput={true} />
        {renderRelation()}
        <TextInputComponent
          label={'Email Address'}
          value={`${email}`}
          onChangeText={(email) => setEmail(email)}
          placeholder={'name@email.com'}
        />
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomStyle} defaultBG>
        <View style={styles.bottonButtonContainer}>
          <Button
            onPress={() => props.navigation.goBack()}
            title={'CANCEL'}
            style={styles.bottomWhiteButtonStyle}
            titleTextStyle={styles.bottomWhiteButtonTextStyle}
          />
          <View style={styles.buttonSeperatorStyle} />
          <View style={styles.bottomButtonStyle}>
            <Button
              onPress={() => {
                // setFirstName(firstName.trim());
                // setLastName(lastName.trim());
                // setEmail(email.trim());
                // console.log(
                //   firstName.length,
                //   firstName,
                //   'fname',
                //   isSatisfyingNameRegex(firstName),
                //   !firstName && isSatisfyingNameRegex(firstName),
                //   firstName && isSatisfyingNameRegex(firstName),
                //   !firstName && !isSatisfyingNameRegex(firstName)
                // );

                let validationMessage = '';
                if (!(firstName && isSatisfyingNameRegex(firstName.trim()))) {
                  validationMessage = 'Enter valid first name';
                } else if (!(lastName && isSatisfyingNameRegex(lastName.trim()))) {
                  validationMessage = 'Enter valid last name';
                } else if (!date) {
                  validationMessage = 'Enter valid date of birth';
                } else if (!gender) {
                  validationMessage = 'Select a gender';
                } else if (!relation) {
                  validationMessage = 'Select a valid relation';
                } else if (!(email === '' || (email && isSatisfyingEmailRegex(email.trim())))) {
                  validationMessage = 'Enter valid email';
                }
                if (validationMessage) {
                  showAphAlert && showAphAlert({ title: 'Alert!', description: validationMessage });
                  // Alert.alert('Error', validationMessage);
                } else {
                  isEdit ? updateUserProfile() : newProfile();
                }
              }}
              title={'SAVE'}
              style={styles.bottomButtonStyle}
            />
          </View>
        </View>
      </StickyBottomComponent>
    );
  };

  const renderDeleteButton = () => {
    return (
      <View
        style={{
          position: 'absolute',
          height: height,
          width: width,
          flex: 1,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setDeleteProfile(false);
          }}
        >
          <View
            style={{
              margin: 0,
              height: height,
              width: width,
              backgroundColor: 'transparent',
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setDeleteProfile(false);
                deleteConfirmation();
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  width: 145,
                  height: 45,
                  marginLeft: width - 165,
                  ...Platform.select({
                    ios: {
                      marginTop: isIphoneX ? height * 0.1 : height * 0.08,
                    },
                    android: {
                      marginTop: height * 0.05,
                    },
                  }),
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...theme.viewStyles.shadowStyle,
                }}
              >
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 16, '#02475b'),
                    backgroundColor: 'white',
                    textAlign: 'center',
                  }}
                >
                  Delete Profile
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {renderUploadSelection()}
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        <KeyboardAvoidingView behavior={undefined} style={{ flex: 1 }}>
          <ScrollView bounces={false} style={{ backgroundColor: '#f7f8f5' }}>
            {renderForm()}
            <View style={{ height: 100 }} />
          </ScrollView>
          {renderButtons()}
        </KeyboardAvoidingView>
      </SafeAreaView>
      {deleteProfile && isEdit && renderDeleteButton()}
      {loading && <Spinner />}
    </View>
  );
};
