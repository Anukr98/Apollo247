import React, { useState, useEffect } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Keyboard,
  Dimensions,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { Text } from 'react-native-elements';
import { theme } from '../../theme/theme';
import { Header } from '../ui/Header';
import { StickyBottomComponent } from '../ui/StickyBottomComponent';
import { Button } from '../ui/Button';
import { DeviceHelper } from '../../FunctionHelpers/DeviceHelper';
import { TextInputComponent } from '../ui/TextInputComponent';
import { DatePicker } from '../ui/DatePicker';
import Moment from 'moment';
import { MaterialMenu } from '../ui/MaterialMenu';
import {
  DropdownGreen,
  More,
  PatientDefaultImage,
  SearchSendIcon,
  DoctorPlaceholderImage,
  Plus,
} from '../ui/Icons';
import { UploadPrescriprionPopup } from '../Medicines/UploadPrescriprionPopup';
import { Relation, Gender } from '../../graphql/types/globalTypes';

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
  email: string;
  firstName: string;
  lastName: string;
  relation: string;
  gender: string;
  uhid?: string;
  dateOfBirth: string;
};

type genderOptions = {
  name: string;
};

const GenderOptions: genderOptions[] = [
  {
    name: 'Male',
  },
  {
    name: 'Female',
  },
  {
    name: 'Other',
  },
];

const relationArray = ['Self', 'Spouse', 'Child', 'Father', 'Mother', 'Other'];
export interface EditProfileProps extends NavigationScreenProps {
  isEdit: boolean;
}
{
}

export const EditProfile: React.FC<EditProfileProps> = (props) => {
  const isEdit = true; //props;
  const photoUrl = 'we';

  const { width, height } = Dimensions.get('window');
  const [deleteProfile, setDeleteProfile] = useState<boolean>(false);
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<profile>(props.navigation.getParam('userData'));
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [relation, setRelation] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const { isIphoneX } = DeviceHelper();

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
      setFirstName(profileData.firstName);
      setLastName(profileData.lastName);
      setDate(profileData.dateOfBirth);
      setGender(profileData.gender);
      setRelation(profileData.relation);
      setEmail(profileData.email);
    }
  }, []);

  const updateProfile = () => {
    const updatedData: profile = {
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: date,
      gender: gender,
      relation: relation,
      email: email,
    };
    if (profileData) {
      setProfileData({ ...profileData, ...updatedData });
    } else {
      setProfileData(updatedData);
    }
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
                  date !== '' ? null : styles.placeholderStyle,
                ]}
              >
                {date !== '' ? date : 'dd/mm/yyyy'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <DatePicker
          isDateTimePickerVisible={isDateTimePickerVisible}
          handleDatePicked={(date) => {
            const formatDate = Moment(date).format('DD/MM/YYYY');
            setDate(formatDate);
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
            title={option.name}
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
    return (
      <MaterialMenu
        data={relationArray}
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
                relation !== '' ? null : styles.placeholderStyle,
              ]}
            >
              {relation !== '' ? relation : 'Select who are these tests for'}
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
          <Button
            onPress={() => {
              updateProfile();
            }}
            disabled={!isValidProfile}
            title={'SAVE'}
            style={styles.bottomButtonStyle}
          />
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
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  width: 145,
                  height: 45,
                  marginLeft: width - 165,
                  marginTop: 64,
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
    </View>
  );
};
