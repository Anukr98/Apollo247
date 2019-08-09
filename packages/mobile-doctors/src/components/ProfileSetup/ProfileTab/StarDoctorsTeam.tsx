import { DoctorCard } from '@aph/mobile-doctors/src/components/ProfileSetup/DoctorCard';
import { Add, Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import { MAKE_TEAM_DOCTOR_ACTIVE } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import {
  MakeTeamDoctorActive,
  MakeTeamDoctorActiveVariables,
} from '@aph/mobile-doctors/src/graphql/types/MakeTeamDoctorActive';
import {
  RemoveTeamDoctorFromStarTeam,
  RemoveTeamDoctorFromStarTeamVariables,
} from '@aph/mobile-doctors/src/graphql/types/RemoveTeamDoctorFromStarTeam';
import { DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Platform, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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

export const StarDoctorsTeam: React.FC<StarDoctorsTeamProps> = ({
  profileData: _profileData,
  scrollViewRef,
  onReload,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('Select Doctor');
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isSelectDoctorVisible, setSelectDoctorVisible] = useState<boolean>(false);
  // const [starDoctors, setFilteredStarDoctors] = useState<
  //   (GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram['profile'] | null)[] | null
  // >([]);
  // const [isLoading, setIsLoading] = useState(false);

  const client = useApolloClient();
  const [profileData, setProfileData] = useState(_profileData);
  const starDoctors = _profileData.starTeam!;

  const onSelectStarDoctor = (searchText: boolean) => {
    setDropdownOpen(!isDropdownOpen);
    scrollViewRef && scrollViewRef.scrollToEnd();
  };

  const onPressDoctorSearchListItem = (text: string) => {
    setDropdownOpen(false);
    setSelectedDoctor(text);
    addDoctorToProgram(text);
  };

  const addDoctorToProgram = (id: string) => {
    client
      .mutate<MakeTeamDoctorActive, MakeTeamDoctorActiveVariables>({
        mutation: MAKE_TEAM_DOCTOR_ACTIVE,
        variables: { associatedDoctor: id, starDoctor: profileData.id },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        const result = _data.data.makeTeamDoctorActive;
        console.log('addDoctorToProgram', result);
        if (result) {
          onReload();
        }
      })
      .catch((e) => {
        console.log('Error occured while adding Doctor', e);
        Alert.alert('Error', 'Error occured while adding Doctor');
      });
  };

  const removeDoctorFromProgram = (id: string) => {
    client
      .mutate<RemoveTeamDoctorFromStarTeam, RemoveTeamDoctorFromStarTeamVariables>({
        mutation: MAKE_TEAM_DOCTOR_ACTIVE,
        variables: { associatedDoctor: id, starDoctor: profileData.id },
        fetchPolicy: 'no-cache',
      })
      .then((_data) => {
        const result = _data.data.removeTeamDoctorFromStarTeam;
        console.log('removeDoctorFromProgram', result);
        if (result) {
          onReload();
        }
      })
      .catch((e) => {
        console.log('Error occured while removing Doctor', e);
        Alert.alert('Error', 'Error occured while removing Doctor');
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
      {starDoctors!.length > 0 ? (
        <View style={styles.dropDownCardStyle}>
          {starDoctors!.map((_doctor, i) => {
            const doctor = _doctor!.associatedDoctor!;
            const drName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
            return (
              <TouchableOpacity
                onPress={() =>
                  onPressDoctorSearchListItem(`Dr. ${doctor.firstName} ${doctor.lastName}`)
                }
                style={{ marginHorizontal: 16 }}
                key={i}
              >
                {formatSuggestionsText(drName, '')}
                {i < starDoctors!.length - 1 ? (
                  <View
                    style={{
                      marginTop: 8,
                      marginBottom: 7,
                      height: 1,
                      opacity: 0.1,
                    }}
                  ></View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );

  const renderStarDoctorCards = () => {
    return starDoctors.map((starDoctor, i) => (
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
        location={starDoctor!.associatedDoctor!.location || ''} //{starDoctor.location}
      />
    ));
  };

  const renderAddDoctor = () => {
    return (
      <View style={{ flexDirection: 'row', margin: 20, marginTop: 7 }}>
        <Add />
        <TouchableOpacity onPress={() => setSelectDoctorVisible(!isSelectDoctorVisible)}>
          <Text style={styles.addDoctorText}>ADD DOCTOR</Text>
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
            <Text style={styles.inputTextStyle}>Add a doctor to your team</Text>
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
    <SquareCardWithTitle
      title={`Your Star Doctors Team (${starDoctors.length})`}
      containerStyle={{ marginTop: 20 }}
    >
      <View style={{ height: 16 }} />
      {renderStarDoctorCards()}
      {/* {isLoading && <ActivityIndicator style={{ marginBottom: 16 }} />} */}
      {starDoctors!.filter((_doctor) => _doctor!.isActive).length == 0
        ? null
        : !isSelectDoctorVisible
        ? renderAddDoctor()
        : renderSelectDoctorField()}
    </SquareCardWithTitle>
  );
};
