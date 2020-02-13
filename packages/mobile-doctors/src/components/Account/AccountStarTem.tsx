import { DoctorCard } from '@aph/mobile-doctors/src/components/ProfileSetup/DoctorCard';
import { Add, Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import {
  MAKE_TEAM_DOCTOR_ACTIVE,
  REMOVE_TEAM_DOCTOR_FROM_STAR_TEAM,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  GetDoctorDetails_getDoctorDetails,
  GetDoctorDetails_getDoctorDetails_starTeam,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import {
  MakeTeamDoctorActive,
  MakeTeamDoctorActiveVariables,
} from '@aph/mobile-doctors/src/graphql/types/MakeTeamDoctorActive';
import {
  RemoveTeamDoctorFromStarTeam,
  RemoveTeamDoctorFromStarTeamVariables,
} from '@aph/mobile-doctors/src/graphql/types/RemoveTeamDoctorFromStarTeam';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Platform, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';

const styles = StyleSheet.create({
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
  addDoctorText: {
    fontFamily: 'IBMPlexSans',
    fontSize: 14,
    fontWeight: 'bold',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#fc9916',
    marginLeft: 10,
    marginTop: 2,
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
});

export interface StarDoctorsTeamProps {
  profileData: GetDoctorDetails_getDoctorDetails;
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const AccountStarTeam: React.FC<StarDoctorsTeamProps> = ({
  profileData: _profileData,
  scrollViewRef,
  onReload,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('Select Doctor');
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isSelectDoctorVisible, setSelectDoctorVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const client = useApolloClient();
  const [profileData, setProfileData] = useState(_profileData);
  const starDoctors = _profileData.starTeam!;
  const starDoctorsActive = _profileData.starTeam!.filter((doctor) => doctor!.isActive);
  const starDoctorsInActive = _profileData.starTeam!.filter((doctor) => !doctor!.isActive);

  const onSelectStarDoctor = (searchText: boolean) => {
    setDropdownOpen(!isDropdownOpen);
    scrollViewRef && scrollViewRef.scrollToEnd();
  };

  const onPressDoctorSearchListItem = (text: string, id: string) => {
    setDropdownOpen(false);
    setSelectedDoctor(text);
    addDoctorToProgram(id);
  };

  const addDoctorToProgram = (id: string) => {
    setIsLoading(true);
    client
      .mutate<MakeTeamDoctorActive, MakeTeamDoctorActiveVariables>({
        mutation: MAKE_TEAM_DOCTOR_ACTIVE,
        variables: { associatedDoctor: id, starDoctor: profileData.id },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        setSelectedDoctor('Select Doctor');
        setIsLoading(false);
        const result = _data.data!.makeTeamDoctorActive;
        console.log('addDoctorToProgram', result);
        if (result) {
          onReload();
        }
      })
      .catch((e) => {
        CommonBugFender('Add_Doctor_To_Program', e);
        setSelectedDoctor('Select Doctor');
        setIsLoading(false);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while adding Doctor', errorMessage, error);
        Alert.alert(strings.common.error, errorMessage);
      });
  };

  const removeDoctorFromProgram = (id: string) => {
    console.log('removeDoctorFromProgram', id, profileData.id);

    setIsLoading(true);
    client
      .mutate<RemoveTeamDoctorFromStarTeam, RemoveTeamDoctorFromStarTeamVariables>({
        mutation: REMOVE_TEAM_DOCTOR_FROM_STAR_TEAM,
        variables: { associatedDoctor: id, starDoctor: profileData.id },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        setIsLoading(false);
        const result = _data!.data!.removeTeamDoctorFromStarTeam;
        console.log('removeDoctorFromProgram', result);
        if (result) {
          onReload();
        }
      })
      .catch((e) => {
        setIsLoading(false);
        CommonBugFender('Remove_Doctor_To_Program', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while removing Doctor', errorMessage, error);
        Alert.alert(strings.common.error, errorMessage);
      });
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
        {starDoctorsInActive!.map((_doctor, i, array) => {
          const doctor = _doctor!.associatedDoctor!;
          const drName = `${strings.common.dr} ${doctor.firstName} ${doctor.lastName}`;
          return (
            <TouchableOpacity
              onPress={() =>
                onPressDoctorSearchListItem(
                  `${strings.common.dr} ${doctor.firstName} ${doctor.lastName}`,
                  _doctor!.associatedDoctor!.id
                )
              }
              style={{ marginHorizontal: 16 }}
              key={i}
            >
              {formatSuggestionsText(drName, '')}
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

  const getFormattedLocation = (d: GetDoctorDetails_getDoctorDetails_starTeam | null) => {
    let location = '';
    try {
      return (location =
        [
          d!.associatedDoctor!.doctorHospital[0].facility.streetLine1,
          d!.associatedDoctor!.doctorHospital[0].facility.streetLine2,
          d!.associatedDoctor!.doctorHospital[0].facility.streetLine3,
          d!.associatedDoctor!.doctorHospital[0].facility.city,
          d!.associatedDoctor!.doctorHospital[0].facility.state,
          d!.associatedDoctor!.doctorHospital[0].facility.country,
        ]
          .filter(Boolean) //.filter((data) => !data)
          .join(',') || '');
    } catch (e) {
      CommonBugFender('Get_Formatted_Location', e);
      console.log('e', e);
    }
    console.log('location', location);
    return location;
  };

  const renderStarDoctorCards = () => {
    return starDoctorsActive.map((starDoctor, i) => {
      return (
        <DoctorCard
          onRemove={(id) => {
            removeDoctorFromProgram(id);
          }}
          doctorId={starDoctor!.associatedDoctor!.id}
          key={i}
          image={starDoctor!.associatedDoctor!.photoUrl || ''}
          doctorName={`${starDoctor!.associatedDoctor!.firstName || ''} ${starDoctor!
            .associatedDoctor!.lastName || ''}`}
          experience={starDoctor!.associatedDoctor!.experience || ''}
          specialization={profileData.specialty.name.toLocaleUpperCase()} //{(starDoctor!.associatedDoctor!.qualification || '').toUpperCase()}
          education={starDoctor!.associatedDoctor!.qualification!}
          // location={'Apollo Hospitals, Jubilee Hills'} //{starDoctor.location}
          location={getFormattedLocation(starDoctor)}
        />
      );
    });
  };

  const renderAddDoctor = () => {
    return (
      <View style={{ flexDirection: 'row', margin: 20, marginTop: 7 }}>
        <Add />
        <TouchableOpacity onPress={() => setSelectDoctorVisible(!isSelectDoctorVisible)}>
          <Text style={styles.addDoctorText}>{strings.buttons.add_doct}</Text>
        </TouchableOpacity>
      </View>
    );
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
            //marginBottom: 0,
          }}
        >
          <View style={{ margin: 20 }}>
            <Text style={styles.inputTextStyle}>{strings.account.add_doct_to_your_team}</Text>
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
  return (
    <View>
      {isLoading ? <Loader fullScreen /> : null}
      <SquareCardWithTitle
        title={`${strings.account.your_star_doct_team} (${starDoctorsActive.length})`}
        containerStyle={{ backgroundColor: '' }}
      >
        <View style={{ height: 16 }} />
        {renderStarDoctorCards()}
        {starDoctorsInActive.length == 0
          ? null
          : !isSelectDoctorVisible
          ? renderAddDoctor()
          : renderSelectDoctorField()}
      </SquareCardWithTitle>
    </View>
  );
};
