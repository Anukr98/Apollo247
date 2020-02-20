import { DoctorCard } from '@aph/mobile-doctors/src/components/ProfileSetup/DoctorCard';
import { StarDoctorsTeam } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/StarDoctorsTeam';
import { Down, Star, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import {
  ADD_SECRETARY,
  GET_SECRETARY_LIST,
  REMOVE_SECRETARY,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  addSecretary,
  addSecretaryVariables,
} from '@aph/mobile-doctors/src/graphql/types/addSecretary';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import {
  getSecretaryList,
  getSecretaryList_getSecretaryList,
} from '@aph/mobile-doctors/src/graphql/types/getSecretaryList';
import {
  removeSecretary,
  removeSecretaryVariables,
} from '@aph/mobile-doctors/src/graphql/types/removeSecretary';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f4f5',
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
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#02475b',
    opacity: 0.6,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '100%',
    color: theme.colors.INPUT_TEXT,
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
  },

  dropDownCardStyle: {
    marginTop: Platform.OS == 'android' ? -35 : -35,
    marginBottom: 26,
    paddingTop: 16,
    paddingBottom: 15,
    //position: Platform.OS == 'android' ? 'relative' : 'absolute',
    top: 0,
    zIndex: 2,
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'flex-end',
    ...theme.viewStyles.whiteRoundedCornerCard,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
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
});

export interface ProfileProps {
  profileData: GetDoctorDetails_getDoctorDetails;
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ profileData, scrollViewRef, onReload }) => {
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('Select Doctor');
  const [secretaryList, setSecretaryList] = useState<getSecretaryList_getSecretaryList[]>([]);

  const client = useApolloClient();

  useEffect(() => {
    client
      .query<getSecretaryList>({
        query: GET_SECRETARY_LIST,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        console.log(data, 'getSecretaryList');
        setSecretaryList(data.getSecretaryList!);
      })
      .catch((e: string) => {
        console.log('Error occured while getSecretaryList Doctor', e);
      });
  }, []);

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
    `${(speciality || '').toUpperCase()}     |   ${experience}${strings.common.yrs}`;

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
      CommonBugFender('Get_Formatted_Location_Profile', e);
      console.log(e);
    }
    return location;
  };

  const onSelectStarDoctor = (searchText: boolean) => {
    setDropdownOpen(!isDropdownOpen);
    scrollViewRef && scrollViewRef.scrollToEnd();
  };
  const renderSelectDoctorField = () => {
    return (
      <View>
        <View
          style={{
            ...theme.viewStyles.whiteRoundedCornerCard,
            margin: 20,
            marginTop: 0,
            borderRadius: 10,
          }}
        >
          <View style={{ margin: 20 }}>
            <Text style={styles.inputTextStyle}>{strings.account.Please_select_the_secretary}</Text>
            <TouchableOpacity onPress={() => onSelectStarDoctor(isDropdownOpen)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(16),
                    color: '#02475b',
                    opacity: 0.4,
                    marginTop: 10,
                    marginBottom: 9,
                  }}
                >
                  {selectedDoctor}
                </Text>
                <View style={{ alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                  {!isDropdownOpen ? <Down /> : <Up />}
                </View>
              </View>
            </TouchableOpacity>
            <View
              style={[
                styles.inputStyle,
                !isDropdownOpen ? { borderBottomColor: 'rgba(2, 71, 91, 0.6)' } : {},
              ]}
            />
          </View>
        </View>
        {isDropdownOpen ? <View style={{ top: 0 }}>{renderDropdownCard()}</View> : null}
      </View>
    );
  };
  const formatSuggestionsText = (text: string, searchKey: string) => {
    return (
      <Highlighter
        style={{
          color: theme.colors.darkBlueColor(),
          ...theme.fonts.IBMPlexSansMedium(18),
        }}
        highlightStyle={{
          color: theme.colors.darkBlueColor(),
          ...theme.fonts.IBMPlexSansBold(18),
        }}
        searchWords={[searchKey]}
        textToHighlight={text}
      />
    );
  };
  const renderDropdownCard = () => (
    <View style={{ marginTop: 2 }}>
      <View style={styles.dropDownCardStyle}>
        {secretaryList!.map((_doctor, i, array) => {
          return (
            <TouchableOpacity
              onPress={() => onPressDoctorSearchListItem(` ${_doctor.name} `, _doctor!.id)}
              style={{ marginHorizontal: 16 }}
              key={i}
            >
              {formatSuggestionsText(_doctor.name, '')}
              {i < array!.length - 1 ? (
                <View
                  style={{
                    marginTop: 8,
                    marginBottom: 7,
                    height: 1,
                    opacity: 0.1,
                  }}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
  const onPressDoctorSearchListItem = (text: string, id: string) => {
    setDropdownOpen(false);
    setSelectedDoctor(text);
    addDoctorToProgram(id);
  };
  const addDoctorToProgram = (id: string) => {
    client
      .mutate<addSecretary, addSecretaryVariables>({
        mutation: ADD_SECRETARY,
        variables: { secretaryId: id },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        setSelectedDoctor('Select Doctor');
        const result = _data.data!.addSecretary;
        console.log('addSecretary', result);
        if (result) {
          onReload();
        }
      })
      .catch((e) => {
        setSelectedDoctor('Select Doctor');
        CommonBugFender('addSecretary', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while adding Doctor', errorMessage, error);
        Alert.alert(strings.common.error, errorMessage);
      });
  };
  const removeSecretaryFromProgram = (id: string) => {
    console.log('removeSecretaryFromProgram', id, profileData.id);
    client
      .mutate<removeSecretary, removeSecretaryVariables>({
        mutation: REMOVE_SECRETARY,
        variables: { secretaryId: id },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        const result = _data!.data!.removeSecretary;
        console.log('removeSecretaryFromProgram', result);
        if (result) {
          onReload();
        }
      })
      .catch((e) => {
        CommonBugFender('Remove_Secretary_FromProgram', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while removeSecretaryFromProgram ', errorMessage, error);
        Alert.alert(strings.common.error, errorMessage);
      });
  };
  return (
    <View style={styles.container}>
      <SquareCardWithTitle title={strings.account.your_profile} containerStyle={{ marginTop: 0 }}>
        <View style={styles.cardView}>
          <View style={{ overflow: 'hidden', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
            {profileData!.photoUrl ? (
              <Image style={styles.imageview} source={{ uri: profileData!.photoUrl }} />
            ) : (
              <Image
                style={styles.imageview}
                source={require('../../../images/doctor/doctor.png')}
              />
            )}
          </View>
          {profileData!.doctorType == 'STAR_APOLLO' ? (
            <Star style={styles.starIconStyle}></Star>
          ) : null}
          <View style={styles.columnContainer}>
            <Text style={[styles.drname]} numberOfLines={1}>
              {`${strings.common.dr} ${profileData!.firstName} ${profileData!.lastName}`}
            </Text>
            <Text style={styles.drnametext}>
              {formatSpecialityAndExperience(
                profileData!.specialty!.name,
                profileData!.experience || ''
              )}
            </Text>
            <View style={styles.understatusline} />
          </View>
          {profileRow(strings.account.education, profileData!.qualification!)}
          {profileRow(strings.account.speciality, profileData!.specialty!.name!)}
          {profileRow(strings.account.services, profileData!.specialization || '')}
          {profileRow(
            strings.account.awards,
            (profileData!.awards || '')
              .replace('&amp;', '&')
              .replace(/<\/?[^>]+>/gi, '')
              .trim()
          )}
          {profileRow(strings.account.speaks, (profileData!.languages || '').split(',').join(', '))}
          {profileRow(strings.account.mci_num, profileData!.registrationNumber)}
          {profileRow(strings.account.in_person_consult_loc, getFormattedLocation())}
        </View>
      </SquareCardWithTitle>
      {profileData!.doctorType == 'STAR_APOLLO' ? (
        <StarDoctorsTeam
          profileData={profileData}
          scrollViewRef={scrollViewRef}
          onReload={onReload}
        />
      ) : null}
      <View style={{ margin: 16 }}>
        <SquareCardWithTitle
          title={strings.account.secretay_login}
          containerStyle={{ marginBottom: 10 }}
          textStyle={{ marginBottom: 10 }}
        >
          {profileData.doctorSecretary!
            ? profileData!.doctorType == 'STAR_APOLLO' || profileData!.doctorType == 'APOLLO'
              ? profileData.doctorSecretary! && (
                  <DoctorCard
                    doctorName={
                      profileData.doctorSecretary! && profileData.doctorSecretary!.secretary!.name
                    }
                    experience={'SECRETARY | 15 YRS'}
                    onRemove={(id) => {
                      removeSecretaryFromProgram(
                        profileData.doctorSecretary! && profileData.doctorSecretary!.secretary!.id
                      );
                    }}
                  />
                )
              : null
            : renderSelectDoctorField()}
        </SquareCardWithTitle>
      </View>
    </View>
  );
};
