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
} from 'react-native';
import { Text } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';
import { DeviceHelper } from '../../FunctionHelpers/DeviceHelper';
import { ADD_NEW_PROFILE, DELETE_PROFILE, EDIT_PROFILE } from '../../graphql/profiles';
import { addNewProfile } from '../../graphql/types/addNewProfile';
import { deleteProfile, deleteProfileVariables } from '../../graphql/types/deleteProfile';
import { editProfile } from '../../graphql/types/editProfile';
import { Gender, Relation } from '../../graphql/types/globalTypes';
import { theme } from '../../theme/theme';
import { UploadPrescriprionPopup } from '../Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '../NavigatorContainer';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DatePicker';
import { Header } from '../ui/Header';
import { DropdownGreen, More, PatientDefaultImage, Plus } from '../ui/Icons';
import { MaterialMenu } from '../ui/MaterialMenu';
import { Spinner } from '../ui/Spinner';
import { StickyBottomComponent } from '../ui/StickyBottomComponent';
import { TextInputComponent } from '../ui/TextInputComponent';

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
  profileImageContainer: {
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    marginTop: -60,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    ...Platform.select({
      ios: {
        borderRadius: 45,
      },
      android: {
        borderRadius: 100,
      },
    }),
    position: 'absolute',
  },
  editIcon: {
    width: 28,
    height: 28,
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
  {
    name: Gender.OTHER,
    title: 'Other',
  },
];

type RelationArray = {
  key: Relation;
  title: string;
};

const relationArray: RelationArray[] = [
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
}
{
}

export const EditProfile: React.FC<EditProfileProps> = (props) => {
  const isEdit = props.navigation.getParam('isEdit');
  const { width, height } = Dimensions.get('window');
  const [deleteProfile, setDeleteProfile] = useState<boolean>(false);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<profile>(props.navigation.getParam('profileData'));
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [date, setDate] = useState<Date>();
  const [gender, setGender] = useState<Gender>();
  const [relation, setRelation] = useState<string>();
  const [email, setEmail] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { isIphoneX } = DeviceHelper();
  const client = useApolloClient();

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );
  const isValidProfile =
    firstName &&
    lastName &&
    date &&
    gender &&
    relation &&
    (isSatisfyingEmailRegex(email) || email === '');

  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName || '');
      setLastName(profileData.lastName || '');
      setDate(new Date(profileData.dateOfBirth!));
      setGender(profileData.gender);
      relationArray.map((relation) => {
        if (relation.key === profileData.relation) {
          setRelation(relation.title);
        }
      });
      setEmail(profileData.email || '');
      setPhotoUrl(profileData.photoUrl || '');
    }
  }, []);

  const deleteUserProfile = () => {
    setLoading(true);
    client
      .mutate<deleteProfile, deleteProfileVariables>({
        mutation: DELETE_PROFILE,
        variables: {
          patientId: profileData.id,
        },
      })
      .then((data) => {
        props.navigation.pop(2);
        props.navigation.push(AppRoutes.ManageProfile, {
          mobileNumber: props.navigation.getParam('mobileNumber'),
        });
      })
      .catch((e) => {
        Alert.alert('Alert', e.message);
        console.log(JSON.stringify(e), 'eeeee');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const updateUserProfile = () => {
    setLoading(true);
    let relationValue = Relation.ME;
    relationArray.map((i) => {
      if (i.title === relation) {
        relationValue = i.key;
      }
    });
    client
      .mutate<editProfile, any>({
        mutation: EDIT_PROFILE,
        variables: {
          editProfileInput: {
            id: profileData.id,
            photoUrl: photoUrl,
            firstName: firstName,
            lastName: lastName,
            relation: relationValue,
            gender: gender,
            dateOfBirth: Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            emailAddress: email,
          },
        },
      })
      .then((data) => {
        props.navigation.pop(2);
        props.navigation.push(AppRoutes.ManageProfile, {
          mobileNumber: props.navigation.getParam('mobileNumber'),
        });
      })
      .catch((e) => {
        Alert.alert('Alert', e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const newProfile = () => {
    setLoading(true);
    let relationValue = Relation.ME;
    relationArray.map((i) => {
      if (i.title === relation) {
        relationValue = i.key;
      }
    });
    client
      .mutate<addNewProfile, any>({
        mutation: ADD_NEW_PROFILE,
        variables: {
          PatientProfileInput: {
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            gender: gender,
            relation: relationValue,
            emailAddress: email,
            photoUrl: photoUrl,
            mobileNumber: props.navigation.getParam('mobileNumber'),
          },
        },
      })
      .then((data) => {
        props.navigation.pop(2);
        props.navigation.push(AppRoutes.ManageProfile, {
          mobileNumber: props.navigation.getParam('mobileNumber'),
        });
      })
      .catch((e) => {
        Alert.alert('Alert', e.message);
        console.log(JSON.stringify(e), 'eeeee');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderUploadSelection = () => {
    return (
      <UploadPrescriprionPopup
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
        onResponse={() => {
          Alert.alert('onResponse');
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
        rightComponent={
          isEdit ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                setDeleteProfile(true);
              }}
            >
              <More />
            </TouchableOpacity>
          ) : null
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderProfileImage = () => {
    return (
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
          <PatientDefaultImage style={styles.profileImage} />
        )}

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setUploadVisible(true);
          }}
          style={styles.editIcon}
        >
          <Plus style={styles.editIcon} />
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
          justifyContent: 'space-between',
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

  const renderRelation = () => {
    const relationsData = relationArray.map((i) => i.title);
    return (
      <MaterialMenu
        data={relationsData}
        selectedText={relation}
        menuContainer={{ alignItems: 'flex-end' }}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 16, '#00b38e'),
          alignSelf: 'flex-start',
        }}
        bottomPadding={{ paddingBottom: 20 }}
        onPress={(selectedRelation) => {
          setRelation(selectedRelation.toString());
        }}
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
              {relation !== undefined ? relation : 'Select who are these tests for'}
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
          onChangeText={(fname) => setFirstName(fname)}
          placeholder={'First Name'}
        />
        <TextInputComponent
          value={`${lastName}`}
          onChangeText={(lname) => setLastName(lname)}
          placeholder={'Last Name'}
        />
        <TextInputComponent label={'Date Of Birth'} noInput={true} />
        {renderDatePicker()}
        <TextInputComponent label={'Gender'} noInput={true} />
        {renderGender()}
        <TextInputComponent label={'Relation'} noInput={true} />
        {renderRelation()}
        <TextInputComponent
          label={'Email Address (Optional)'}
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
            onPress={() => {
              () => props.navigation.goBack();
            }}
            title={'CANCEL'}
            style={styles.bottomWhiteButtonStyle}
            titleTextStyle={styles.bottomWhiteButtonTextStyle}
          />
          <View style={styles.buttonSeperatorStyle} />
          <View style={styles.bottomButtonStyle}>
            <Button
              onPress={() => {
                isEdit ? updateUserProfile() : newProfile();
              }}
              disabled={!isValidProfile}
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
                deleteUserProfile();
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
        <ScrollView bounces={false} style={{ backgroundColor: '#f7f8f5' }}>
          {renderForm()}
          <View style={{ height: 120 }} />
        </ScrollView>
        {renderButtons()}
      </SafeAreaView>
      {deleteProfile && isEdit && renderDeleteButton()}
      {loading && <Spinner />}
    </View>
  );
};
