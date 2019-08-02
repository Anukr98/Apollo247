import { DoctorCard } from '@aph/mobile-doctors/src/components/ProfileSetup/DoctorCard';
import { Add, Send, Up, Down } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import {
  ADD_DOCTOR_TO_STAR_DOCTOR_PROGRAM,
  GET_DOCTORS_FOR_STAR_DOCTOR_PROGRAM,
  REMOVE_DOCTOR_FROM_STAR_DOCTOR_PROGRAM,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  addDoctorToStartDoctorProgram,
  addDoctorToStartDoctorProgramVariables,
} from '@aph/mobile-doctors/src/graphql/types/addDoctorToStartDoctorProgram';
import { GetDoctorProfile_getDoctorProfile } from '@aph/mobile-doctors/src/graphql/types/getDoctorProfile';
import {
  GetDoctorsForStarDoctorProgram,
  GetDoctorsForStarDoctorProgramVariables,
  GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram,
} from '@aph/mobile-doctors/src/graphql/types/getDoctorsForStarDoctorProgram';
import { INVITEDSTATUS } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  removeDoctorFromStartDoctorProgram,
  removeDoctorFromStartDoctorProgramVariables,
} from '@aph/mobile-doctors/src/graphql/types/removeDoctorFromStartDoctorProgram';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { getDoctorsForStarDoctorProgram as getDoctorsForStarDoctorProgramData } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { Dropdown } from 'react-native-material-dropdown';

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
});

export interface StarDoctorsTeamProps {
  profileData: GetDoctorProfile_getDoctorProfile;
}

export const StarDoctorsTeam: React.FC<StarDoctorsTeamProps> = ({ profileData: _profileData }) => {
  const [addshow, setAddShow] = useState<boolean>(false);
  const [doctorSearchText, setDoctorSearchText] = useState<string>('Search Doctor');
  const [filteredStarDoctors, setFilteredStarDoctors] = useState<
    (GetDoctorsForStarDoctorProgram_getDoctorsForStarDoctorProgram['profile'] | null)[] | null
  >([]);
  const [isShowAddDoctorButton, setIsShowAddDoctorButton] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState(_profileData);
  const client = useApolloClient();

  const filterDoctors = (searchText: boolean) => {
    console.log('searchText', searchText);
    setIsShowAddDoctorButton(!isShowAddDoctorButton);
    if (searchText) {
      // do api call
      // client
      //   .query<GetDoctorsForStarDoctorProgram, GetDoctorsForStarDoctorProgramVariables>({
      //     query: GET_DOCTORS_FOR_STAR_DOCTOR_PROGRAM,
      //     variables: { searchString: searchText.replace('Dr. ', '') },
      //   })
      getDoctorsForStarDoctorProgramData.data.getDoctorsForStarDoctorProgram!('')
        .then((_data) => {
          console.log('flitered array', _data);
          // const doctorProfile =
          //   (_data.data.getDoctorsForStarDoctorProgram &&
          //     _data.data.getDoctorsForStarDoctorProgram.map((i) => i!.profile)) ||
          //   [];
          const doctorProfile = _data.map((i: DoctorProfile) => i.profile);
          setFilteredStarDoctors(doctorProfile);
        })
        .catch((e) => {
          console.log('Error occured while searching for Doctors', e);
          //Alert.alert('Error', 'Error occured while searching for Doctors');
        });
    } else {
      setFilteredStarDoctors([]);
    }
  };

  const onPressDoctorSearchListItem = (text: string) => {
    Keyboard.dismiss();
    addDoctorToProgram(text);
    setDoctorSearchText(text);
    setFilteredStarDoctors([]);
    setIsShowAddDoctorButton(true);
  };

  const addDoctorToProgram = (name: string) => {
    setIsShowAddDoctorButton(false);
    setDoctorSearchText('');
    setIsLoading(true);
    client
      .mutate<addDoctorToStartDoctorProgram, addDoctorToStartDoctorProgramVariables>({
        mutation: ADD_DOCTOR_TO_STAR_DOCTOR_PROGRAM,
        variables: { starDoctorId: '1', doctorId: '2' },
      })
      .then((_data) => {
        setIsLoading(false);
        // Note: This is for demo/testing purpose only, do real implementation after real API
        const array = [...profileData.starDoctorTeam!];
        array.push({
          ...profileData.starDoctorTeam![0]!,
          id: Math.random().toString(36),
          firstName: name.replace('Dr. ', ''),
          lastName: '',
          inviteStatus: INVITEDSTATUS.ACCEPTED,
        });
        setProfileData({ ...profileData, starDoctorTeam: array });
        setDoctorSearchText('Search Doctor');
      })
      .catch((e) => {
        setIsLoading(false);
        console.log('Error occured while adding Doctor', e);
        Alert.alert('Error occured while adding Doctor');
      });
  };

  const removeDoctorFromProgram = (id: string) => {
    const array = [...profileData.starDoctorTeam!];
    setProfileData({ ...profileData, starDoctorTeam: array.filter((i) => i!.id !== id) });

    client
      .mutate<removeDoctorFromStartDoctorProgram, removeDoctorFromStartDoctorProgramVariables>({
        mutation: REMOVE_DOCTOR_FROM_STAR_DOCTOR_PROGRAM,
        variables: { starDoctorId: id || '1', doctorId: '2' },
      })
      .then((_data) => {
        console.log(_data);
      })
      .catch((e) => {
        console.log('Error occured while removing Doctor', e);
        // Alert.alert('Error occured while removing Doctor');
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

  const renderSuggestionCard = () => (
    <View style={{ marginTop: 2 }}>
      {filteredStarDoctors!.length > 0 ? (
        <View
          style={{
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
          }}
        >
          {filteredStarDoctors!.map((item, i) => {
            const drName = `Dr. ${item!.firstName} ${item!.lastName}`;
            return (
              <TouchableOpacity
                onPress={() =>
                  onPressDoctorSearchListItem(`Dr. ${item!.firstName} ${item!.lastName}`)
                }
                style={{ marginHorizontal: 16 }}
                key={i}
              >
                {formatSuggestionsText(drName, doctorSearchText)}
                {i < filteredStarDoctors!.length - 1 ? (
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

  return (
    <SquareCardWithTitle
      title={`Your Star Doctors Team (${profileData!.starDoctorTeam!.length})`}
      containerStyle={{ marginTop: 20 }}
    >
      <View style={{ height: 16 }} />
      {profileData!.starDoctorTeam!.map((starDoctor, i) => (
        <DoctorCard
          onRemove={(id) => {
            removeDoctorFromProgram(id);
          }}
          doctorId={starDoctor!.id}
          key={i}
          image={starDoctor!.photoUrl || ''}
          doctorName={`${starDoctor!.firstName} ${starDoctor!.lastName}`}
          experience={starDoctor!.experience || ''}
          // specialization={'GENERAL PHYSICIAN '} //{starDoctor.designation}
          specialization={(starDoctor!.specialization || '').toUpperCase()}
          education={starDoctor!.education}
          location={'Apollo Hospitals, Jubilee Hills'} //{starDoctor.location}
          inviteStatus={
            starDoctor!.inviteStatus! == 'ACCEPTED'
              ? INVITEDSTATUS.ACCEPTED
              : INVITEDSTATUS.NOTAPPLICABLE
          }
        />
      ))}
      {isLoading && <ActivityIndicator style={{ marginBottom: 16 }} />}
      {!addshow ? (
        <View style={{ flexDirection: 'row', margin: 20, marginTop: 7 }}>
          <Add />
          <TouchableOpacity onPress={() => setAddShow(!addshow)}>
            <Text style={styles.addDoctorText}>ADD DOCTOR</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
                  {doctorSearchText}
                </Text>
                <View style={{ alignItems: 'flex-end', alignSelf: 'flex-end' }}>
                  {isShowAddDoctorButton ? (
                    <TouchableOpacity onPress={() => filterDoctors(isShowAddDoctorButton)}>
                      <Down />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => filterDoctors(isShowAddDoctorButton)} //setIsShowAddDoctorButton(!isShowAddDoctorButton)}
                    >
                      <Up />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.inputStyle}></View>
            </View>
          </View>
          <View style={{ top: 0 }}>{renderSuggestionCard()}</View>
        </View>
      )}
    </SquareCardWithTitle>
  );
};
