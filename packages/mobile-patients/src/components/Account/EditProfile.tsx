import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  DropdownGreen,
  EditIcon,
  EditProfilePlaceHolder,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  postWebEngageEvent,
  getAge,
  g,
  getUserType,
  getCleverTapCircleMemberValues,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
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
  BackHandler,
} from 'react-native';
import { Text, Overlay } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';
import { useUIElements } from '../UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getRelations } from '../../helpers/helperFunctions';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import { useShoppingCart } from '../ShoppingCartProvider';
import { getUniqueId } from 'react-native-device-info';
import { CleverTapEventName } from '../../helpers/CleverTapEvents';

const screenWidth = Dimensions.get('window').width;

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
    marginTop: -30,
    paddingLeft: screenWidth > 370 ? 0 : 8,
  },
  importantTextStyle: {
    flex: 1,
    marginTop: -58,
    marginLeft: -8,
  },
  editErrorPopupOverlayStyle: {
    ...theme.viewStyles.cardViewStyle,
    height: 146,
    width: 219,
  },
  uhTextStyle: {
    ...theme.viewStyles.text('SB', 18, '#02475B', 1, 23),
  },
  editAlertTextStyle: {
    ...theme.viewStyles.text('M', 14, '#0087BA', 1, 20),
    marginTop: 8,
  },
  editAlertViewStyle: {
    marginLeft: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  addNewMemberButtonStyle: {
    marginTop: 8,
  },
  addNewMemeberTextStyle: {
    ...theme.viewStyles.text('B', 13, '#FC9916', 1, 24),
  },
  newProfileOverlayStyle: {
    ...theme.viewStyles.cardViewStyle,
    width: '90%',
    height: 'auto',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  newProfileAlertViewStyle: {
    marginLeft: 25,
    paddingBottom: 0,
    marginTop: 6,
    marginRight: 16,
  },
  genderPreviewTextStyle: {
    ...theme.viewStyles.text('M', 14, '#A4A4A4', 1, 20, 0.35),
    marginBottom: 9,
  },
  newProfilePopupHeaderContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  newProfileConfirmationTextStyle: {
    ...theme.viewStyles.text('M', 14, '#0087BA', 1, 20, 0.35),
    marginBottom: 3,
    marginTop: 13,
  },
  labelPreviewTextStyle: {
    ...theme.viewStyles.text('M', 14, '#A4A4A4', 1, 20, 0.35),
    marginBottom: 3,
  },
  previewTextStyle: { ...theme.viewStyles.text('M', 18, '#01475B', 1, 24, 0.4) },
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
  screenName?: string;
  isForVaccination: boolean;
}
{
}

export const EditProfile: React.FC<EditProfileProps> = (props) => {
  const [selectedGenderRelationArray, setSelectedGenderRelationArray] = useState<RelationArray[]>(
    getRelations() || relationArray1
  );
  const relationArray: RelationArray[] = getRelations() || selectedGenderRelationArray;
  const isEdit = props.navigation.getParam('isEdit');
  const screenName = props.navigation.getParam('screenName');
  const { width, height } = Dimensions.get('window');
  const { currentPatient, allCurrentPatients, setCurrentPatientId } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [isEditProfile, setIsEditProfile] = useState(isEdit);
  const [deleteProfile, setDeleteProfile] = useState<boolean>(false);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [editErrorPopupVisible, setEditErrorPopupVisible] = useState(false);
  const [newProfileConfirmPopupVisible, setNewProfileConfirmPopupVisible] = useState(false);
  const [showSelectedRelation, setShowSelectedRelation] = useState<boolean>(false);
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
  const { pharmacyCircleAttributes } = useShoppingCart();
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

  const isSatisfyEmailRegex = (value: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);

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
      setRelation(relationArray.find((relation) => relation.key === profileData.relation));
      setShowSelectedRelation(true);
      setGender(profileData!.gender!);
      setEmail(profileData.emailAddress || '');
      setPhotoUrl(profileData.photoUrl || '');
    }
  }, []);

  useEffect(() => {
    if (!profileData) {
      if (gender == Gender.MALE) {
        setRelation(undefined);
        const maleRelationArray: RelationArray[] = [
          { key: Relation.ME, title: 'Self' },
          {
            key: Relation.FATHER,
            title: 'Father',
          },
          {
            key: Relation.SON,
            title: 'Son',
          },
          {
            key: Relation.HUSBAND,
            title: 'Husband',
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
            key: Relation.GRANDFATHER,
            title: 'Grandfather',
          },
          {
            key: Relation.GRANDSON,
            title: 'Grandson',
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
        setSelectedGenderRelationArray(maleRelationArray);
      } else if (gender == Gender.FEMALE) {
        setRelation(undefined);
        const femaleRelationArray: RelationArray[] = [
          { key: Relation.ME, title: 'Self' },
          {
            key: Relation.MOTHER,
            title: 'Mother',
          },
          {
            key: Relation.DAUGHTER,
            title: 'Daughter',
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
            key: Relation.GRANDMOTHER,
            title: 'Grandmother',
          },
          {
            key: Relation.GRANDDAUGHTER,
            title: 'Granddaughter',
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
        setSelectedGenderRelationArray(femaleRelationArray);
      }
    } else {
      if (gender == Gender.MALE) {
        showSelectedRelation ? setShowSelectedRelation(false) : setRelation(undefined);
        const maleRelationArray: RelationArray[] = [
          { key: Relation.ME, title: 'Self' },
          {
            key: Relation.FATHER,
            title: 'Father',
          },
          {
            key: Relation.SON,
            title: 'Son',
          },
          {
            key: Relation.HUSBAND,
            title: 'Husband',
          },
          {
            key: Relation.GRANDFATHER,
            title: 'Grandfather',
          },
          {
            key: Relation.GRANDSON,
            title: 'Grandson',
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
        setSelectedGenderRelationArray(maleRelationArray);
      } else if (gender == Gender.FEMALE) {
        showSelectedRelation ? setShowSelectedRelation(false) : setRelation(undefined);
        const femaleRelationArray: RelationArray[] = [
          { key: Relation.ME, title: 'Self' },
          {
            key: Relation.MOTHER,
            title: 'Mother',
          },
          {
            key: Relation.DAUGHTER,
            title: 'Daughter',
          },
          {
            key: Relation.WIFE,
            title: 'Wife',
          },
          {
            key: Relation.GRANDMOTHER,
            title: 'Grandmother',
          },
          {
            key: Relation.GRANDDAUGHTER,
            title: 'Granddaughter',
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
        setSelectedGenderRelationArray(femaleRelationArray);
      }
    }
  }, [gender]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', _onPressLeftIcon);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', _onPressLeftIcon);
    };
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
          })
          .catch((e) => {
            setLoading && setLoading(false);
            showAphAlert!({
              title: 'Network Error!',
              description: 'Please try again later.',
            });
            CommonBugFender('EditProfile_deleteUserProfile', e);
          });
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
          }
          getPatientApiCall();
          props.navigation.goBack();
        })
        .catch((e) => {
          setLoading && setLoading(false);
          showAphAlert!({
            title: 'Network Error!',
            description: 'Please try again later.',
          });
          CommonBugFender('EditProfile_updateUserProfile', e);
        });
    } else {
      setLoading && setLoading(false);
      props.navigation.goBack();
    }
  };
  const selectUser = (selectedUser: any) => {
    try {
      AsyncStorage.setItem('selectUserId', selectedUser!.id);
      AsyncStorage.setItem('isNewProfile', 'yes');
      AsyncStorage.setItem('selectUserUHId', selectedUser!.uhid);
    } catch (error) {}
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
        getPatientApiCall().then(() => {
          if (screenName === string.consult) {
            const { navigation } = props;
            navigation.goBack();
          }
        });
        if (screenName === string.symptomChecker.symptomTracker) {
          const { navigation } = props;
          navigation.goBack();
          navigation.state.params!.goBackCallback(data.data!.addNewProfile.patient);
        } else {
          props.navigation.goBack();
          props.navigation.state.params?.onNewProfileAdded &&
            props.navigation.state.params?.onNewProfileAdded({
              added: true,
              id: data.data!.addNewProfile?.patient?.id,
              profileData: data?.data?.addNewProfile?.patient,
            });
        }
        selectUser(data.data!.addNewProfile.patient);
      })
      .catch((e) => {
        setLoading && setLoading(false);
        showAphAlert!({
          title: 'Network Error!',
          description: 'Please try again later.',
        });
        CommonBugFender('EditProfile_newProfile', e);
      });
  };

  const renderUploadSelection = () => {
    return (
      <UploadPrescriprionPopup
        type={'Non-cart'}
        isVisible={uploadVisible}
        isProfileImage={true}
        heading="Upload Profile Picture"
        hideTAndCs
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE FROM GALLERY',
        }}
        onClickClose={() => {
          setUploadVisible(false);
        }}
        onResponse={(type, response) => {
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

  const _onPressLeftIcon = () => {
    props.navigation.goBack();
    props.navigation.state.params?.onPressBackButton &&
      props.navigation.state.params?.onPressBackButton();
    return true;
  };

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={isEditProfile ? 'EDIT PROFILE' : 'ADD NEW FAMILY MEMBER'}
        rightComponent={null}
        onPressLeftIcon={_onPressLeftIcon}
      />
    );
  };

  const renderProfileImage = () => {
    return (
      <View style={styles.profilePicContainer}>
        <View style={styles.profileImageContainer}>
          {photoUrl &&
          photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jpeg|JPEG)/) ? (
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
                !isEditProfile && setIsDateTimePickerVisible(true);
                isEditProfile && setEditErrorPopupVisible(true);
              }}
            >
              <Text
                style={[
                  styles.placeholderTextStyle,
                  ,
                  date !== undefined ? null : styles.placeholderStyle,
                  isEditProfile && styles.placeholderStyle,
                ]}
              >
                {date !== undefined ? Moment(date).format('DD/MM/YYYY') : 'dd/mm/yyyy'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <DatePicker
          date={
            date ||
            moment()
              .subtract(25, 'years')
              .toDate()
          }
          isDateTimePickerVisible={isDateTimePickerVisible}
          handleDatePicked={(date) => {
            setIsDateTimePickerVisible(false);
            setDate(date);
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
        {GenderOptions.map((option) => {
          return (
            isEditProfile &&
            gender === option.name && (
              <Button
                key={option.name}
                title={option.title}
                style={[
                  styles.buttonViewStyle,
                  gender === option.name
                    ? { backgroundColor: 'rgba(0, 179, 142,0.5)', elevation: 0 }
                    : null,
                ]}
                titleTextStyle={
                  gender === option.name ? styles.selectedButtonTitleStyle : styles.buttonTitleStyle
                }
                onPress={() => {
                  setGender(option.name);
                  setEditErrorPopupVisible(true);
                }}
              />
            )
          );
        })}
        {GenderOptions.map((option) => {
          return (
            !isEditProfile && (
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
            )
          );
        })}
      </View>
    );
  };

  const _onBackdropEditErrorPopupPress = () => {
    setEditErrorPopupVisible(!editErrorPopupVisible);
  };

  const renderEditErrorPopup = () => {
    return (
      <Overlay
        isVisible={editErrorPopupVisible}
        onBackdropPress={_onBackdropEditErrorPopupPress}
        overlayBackgroundColor={'#F7F8F5'}
        transparent={true}
        overlayStyle={styles.editErrorPopupOverlayStyle}
      >
        <View style={styles.editAlertViewStyle}>
          <Text style={styles.uhTextStyle}>{'Uh oh! :('}</Text>
          <Text style={styles.editAlertTextStyle}>
            {'You cannot edit Name, Age, \nDate of Birth and Gender!'}
          </Text>
          <TouchableOpacity
            style={styles.addNewMemberButtonStyle}
            activeOpacity={1}
            onPress={() => {
              setIsEditProfile(false);
              setPhotoUrl('');
              _setFirstName('');
              _setLastName('');
              setDate(undefined);
              setGender(undefined);
              setRelation(undefined);
              setEmail('');
              _onBackdropEditErrorPopupPress();
            }}
          >
            <Text style={styles.addNewMemeberTextStyle}>{'ADD NEW MEMBER'}</Text>
          </TouchableOpacity>
        </View>
      </Overlay>
    );
  };

  const _onBackdropNewProfileConfirmPopupPress = () => {
    setNewProfileConfirmPopupVisible(!newProfileConfirmPopupVisible);
  };

  const renderLabelAndText = (label: string, text: string) => {
    return (
      <View style={{ marginTop: 22 }}>
        <Text style={styles.labelPreviewTextStyle}>{label}</Text>
        <Text style={styles.previewTextStyle}>{text}</Text>
      </View>
    );
  };

  const renderGenderPreview = () => {
    return (
      <View style={{ marginTop: 21 }}>
        <Text style={styles.genderPreviewTextStyle}>{'Gender'}</Text>
        <Button
          title={gender == Gender.MALE ? 'Male' : 'Female'}
          style={[styles.buttonViewStyle, styles.selectedButtonViewStyle, { height: 44 }]}
          titleTextStyle={styles.selectedButtonTitleStyle}
        />
      </View>
    );
  };

  const renderEditAndConfirmButtons = () => {
    return (
      <View style={styles.bottonButtonContainer}>
        <Button
          onPress={() => {
            _onBackdropNewProfileConfirmPopupPress();
          }}
          title={'EDIT'}
          style={styles.bottomWhiteButtonStyle}
          titleTextStyle={styles.bottomWhiteButtonTextStyle}
        />
        <View style={styles.buttonSeperatorStyle} />
        <View style={styles.bottomButtonStyle}>
          <Button
            onPress={() => {
              setNewProfileConfirmPopupVisible(false);
              newProfile();
              cleverTapEventForClickOnConfirm();
            }}
            title={'CONFIRM'}
            style={styles.bottomButtonStyle}
          />
        </View>
      </View>
    );
  };

  const renderNewProfileConfirmationPopup = () => {
    return (
      <Overlay
        isVisible={newProfileConfirmPopupVisible}
        onBackdropPress={_onBackdropNewProfileConfirmPopupPress}
        overlayBackgroundColor={'#FFF'}
        windowBackgroundColor={'rgba(0,0,0,0.8)'}
        transparent={true}
        overlayStyle={styles.newProfileOverlayStyle}
      >
        <>
          <Header
            container={styles.newProfilePopupHeaderContainerStyle}
            title={'New Member Details'}
            titleStyle={{ ...theme.viewStyles.text('M', 16, '#02475B', 1, 21) }}
          />
          <ScrollView bounces={false} style={{ backgroundColor: '#fff' }}>
            <View style={styles.newProfileAlertViewStyle}>
              {renderLabelAndText('Full Name', `${firstName.trim()} ${lastName.trim()}`)}
              {renderLabelAndText('Date Of Birth', Moment(date).format('DD/MM/YYYY'))}
              {renderGenderPreview()}
              {renderLabelAndText('Relation', (relation && relation.key.toString()) || '')}
              {email ? renderLabelAndText('Email Address (Optional)', email) : null}
              <View style={{ backgroundColor: '#CECECE', height: 0.8, marginTop: 15 }} />
              <Text style={styles.newProfileConfirmationTextStyle}>
                {string.common.new_profile_confirmation_text}
              </Text>
              {renderEditAndConfirmButtons()}
            </View>
          </ScrollView>
        </>
      </Overlay>
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

    const isValid = isSelfRelation!.find((i) => i === true) === undefined;

    if (isValid || selected.key !== Relation.ME || presentRelation == Relation.ME) {
      setRelation({
        key: selected.key as Relation,
        title: selected.value.toString(),
      });
    } else {
      showAphAlert!({
        title: 'Apollo',
        description: "'Self' is already choosen for another profile.",
      });
    }
  };

  const renderRelation = () => {
    const relationsData = selectedGenderRelationArray.map((i) => {
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
    const inputStyle = {
      color: theme.colors.placeholderTextColor,
    };
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          padding: 16,
          marginTop: 64,
          marginHorizontal: 20,
        }}
      >
        <Text
          style={[
            styles.importantTextStyle,
            { ...theme.viewStyles.text('M', isEditProfile ? 12 : 11.5, '#0087BA', 1, 16) },
          ]}
          numberOfLines={2}
        >
          {isEditProfile ? string.common.edit_profile_imp_text : string.common.add_profile_imp_text}
        </Text>
        {renderProfileImage()}
        <TextInputComponent
          label={'Full Name'}
          value={`${firstName}`}
          onPressNonEditableTextInput={() => setEditErrorPopupVisible(true)}
          editable={!isEditProfile}
          inputStyle={isEditProfile && inputStyle}
          onChangeText={(fname) => _setFirstName(fname)}
          placeholder={'First Name'}
        />
        <TextInputComponent
          value={`${lastName}`}
          onChangeText={(lname) => _setLastName(lname)}
          editable={!isEditProfile}
          inputStyle={isEditProfile && inputStyle}
          onPressNonEditableTextInput={() => setEditErrorPopupVisible(true)}
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
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
    );
  };

  const renderButtons = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomStyle} defaultBG>
        <View style={styles.bottonButtonContainer}>
          <Button
            onPress={_onPressLeftIcon}
            title={'CANCEL'}
            style={styles.bottomWhiteButtonStyle}
            titleTextStyle={styles.bottomWhiteButtonTextStyle}
          />
          <View style={styles.buttonSeperatorStyle} />
          <View style={styles.bottomButtonStyle}>
            <Button
              onPress={() => {
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
                } else if (!(email === '' || (email && isSatisfyEmailRegex(email.trim())))) {
                  validationMessage = 'Enter valid email2';
                }
                if (validationMessage) {
                  showAphAlert && showAphAlert({ title: 'Alert!', description: validationMessage });
                } else {
                  cleverTapEventForClickOnSave();
                  isEditProfile ? updateUserProfile() : setNewProfileConfirmPopupVisible(true);
                }

                if (props.navigation.state.params?.isForVaccination) {
                  sendVaccinationAddProfileEvent();
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

  const cleverTapEventForClickOnSave = () => {
    let eventAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Nav src': 'Profile Picture',
      'Circle Member':
        getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
        undefined,
      'Device Id': getUniqueId(),
    };
    postCleverTapEvent(CleverTapEventName.SAVE_MEMBER_PROFILE_CLICKED, eventAttributes);
  };

  const cleverTapEventForClickOnConfirm = () => {
    let eventAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Nav src': 'Profile Picture',
      'Circle Member':
        getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
        undefined,
      'Device Id': getUniqueId(),
    };
    postCleverTapEvent(CleverTapEventName.CONFIRM_MEMBER_PROFILE_CLICKED, eventAttributes);
  };

  const sendVaccinationAddProfileEvent = () => {
    if (isEditProfile) {
      return;
    }

    try {
      const eventAttributes = {
        'Patient ID': currentPatient?.id || '',
        'Patient First Name': currentPatient?.firstName.trim(),
        'Patient Last Name': currentPatient?.lastName.trim(),
        'Patient UHID': currentPatient?.uhid,
        'Patient Number': currentPatient?.mobileNumber,
        'Patient Gender': currentPatient?.gender,
        'Patient Age ': getAge(currentPatient?.dateOfBirth),
        'Source ': Platform.OS === 'ios' ? 'ios' : 'android',
      };
      postWebEngageEvent(WebEngageEventName.MEMBER_DETAILS_SAVED, eventAttributes);
    } catch (error) {}
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
                      marginTop: isIphoneX() ? height * 0.1 : height * 0.08,
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
            {renderEditErrorPopup()}
            {renderNewProfileConfirmationPopup()}
          </ScrollView>
          {renderButtons()}
        </KeyboardAvoidingView>
      </SafeAreaView>
      {deleteProfile && isEditProfile && renderDeleteButton()}
      {loading && <Spinner />}
    </View>
  );
};
