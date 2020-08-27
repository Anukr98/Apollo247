import { DoctorCard } from '@aph/mobile-doctors/src/components/ProfileSetup/DoctorCard';
import ProfileStyles from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/Profile.styles';
import { StarDoctorsTeam } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/StarDoctorsTeam';
import { Down, Star, Up, UserPlaceHolder } from '@aph/mobile-doctors/src/components/ui/Icons';
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
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';

const styles = ProfileStyles;

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
        <View style={styles.selectDoctorView}>
          <View style={{ margin: 20 }}>
            <Text style={styles.inputTextStyle}>{strings.account.Please_select_the_secretary}</Text>
            <TouchableOpacity onPress={() => onSelectStarDoctor(isDropdownOpen)}>
              <View style={styles.selectDoctor}>
                <Text style={styles.selectDoctText}>{selectedDoctor}</Text>
                <View style={styles.dropDownView}>{!isDropdownOpen ? <Down /> : <Up />}</View>
              </View>
            </TouchableOpacity>
            <View
              style={[styles.inputStyle, !isDropdownOpen ? { borderBottomColor: '#00b38e' } : {}]}
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
        style={styles.suggestionTextStyle}
        highlightStyle={styles.highlighstyle}
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
              {i < array!.length - 1 ? <View style={styles.doctorNameView} /> : null}
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
        // Alert.alert(strings.common.error, errorMessage);
        Alert.alert(strings.common.uh_oh, strings.common.oops_msg);
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
        // Alert.alert(strings.common.error, errorMessage);
        Alert.alert(strings.common.uh_oh, strings.common.oops_msg);
      });
  };
  return (
    <View style={styles.container}>
      <SquareCardWithTitle title={strings.account.your_profile} containerStyle={{ marginTop: 0 }}>
        <View style={styles.cardView}>
          <View style={styles.profileDateView}>
            <View style={styles.profileContainerStyle}>
              {profileData.photoUrl ? (
                <Image style={styles.imageview} source={{ uri: profileData.photoUrl }} />
              ) : (
                <UserPlaceHolder style={styles.imageview} />
              )}
            </View>
            {profileData.doctorType == 'STAR_APOLLO' ? (
              <Star style={styles.starIconStyle}></Star>
            ) : null}
          </View>
          <View style={styles.columnContainer}>
            <Text style={[styles.drname]} numberOfLines={1}>
              {`${strings.common.dr} ${profileData!.firstName} ${profileData!.lastName}`}
            </Text>
            <Text style={styles.drnametext}>
              {formatSpecialityAndExperience(
                g(profileData, 'specialty', 'specialistSingularTerm') ||
                  g(profileData, 'specialty', 'name') ||
                  '',
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
                    experience={'SECRETARY | 15'}
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
