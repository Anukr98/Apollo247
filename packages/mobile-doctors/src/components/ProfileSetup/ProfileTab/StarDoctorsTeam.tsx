import { DoctorCard } from '@aph/mobile-doctors/src/components/ProfileSetup/DoctorCard';
import { Add, Send } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import {
  ADD_DOCTOR_TO_STAR_DOCTOR_PROGRAM,
  GET_DOCTORS_FOR_STAR_DOCTOR_PROGRAM,
  REMOVE_DOCTOR_FROM_STAR_DOCTOR_PROGRAM,
} from '@aph/mobile-doctors/src/graphql/profiles';
import { getDoctorsForStarDoctorProgram } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    paddingBottom: 4,
    marginTop: 12,
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
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
  profileData: DoctorProfile;
}

export const StarDoctorsTeam: React.FC<StarDoctorsTeamProps> = ({ profileData }) => {
  const [addshow, setAddShow] = useState<boolean>(false);
  const [doctorSearchText, setDoctorSearchText] = useState<string>('');
  const [filteredStarDoctors, setFilteredStarDoctors] = useState<Doctor[]>([]);
  const [isShowAddDoctorButton, setIsShowAddDoctorButton] = useState<boolean>(false);

  const [isSuggestionExist, setIsSuggestionExist] = useState<boolean>(false);
  const client = useApolloClient();

  const filterDoctors = (searchText: string) => {
    if (isSuggestionExist) {
      setIsSuggestionExist(false);
      setIsShowAddDoctorButton(false);
    }
    setDoctorSearchText(searchText);
    console.log(searchText);
    if (searchText == '') {
      setFilteredStarDoctors([]);
      return;
    }
    // do api call
    // client
    //   .query({
    //     query: GET_DOCTORS_FOR_STAR_DOCTOR_PROGRAM,
    //     variables: { searchString: searchText.replace('Dr. ', '') },
    //   })
    getDoctorsForStarDoctorProgram.data.getDoctorsForStarDoctorProgram!(
      searchText.replace('Dr. ', '')
    )
      .then((_data: any) => {
        console.log('flitered array', _data);
        const doctorProfile = _data.map((i: DoctorProfile) => i.profile);
        setFilteredStarDoctors(doctorProfile);
      })
      .catch((e) => {
        console.log('Error occured while searching for Doctors', e);
        Alert.alert('Error', 'Error occured while searching for Doctors');
      });
  };

  const onPressDoctorSearchListItem = (text: string) => {
    Keyboard.dismiss();
    setIsSuggestionExist(true);
    setDoctorSearchText(text);
    setFilteredStarDoctors([]);
    setIsShowAddDoctorButton(true);
  };

  const addDoctorToProgram = () => {
    setIsShowAddDoctorButton(false);
    setDoctorSearchText('');
    setIsSuggestionExist(false);
    client
      .query({
        query: ADD_DOCTOR_TO_STAR_DOCTOR_PROGRAM,
        variables: { starDoctorId: '1', doctorId: '2' },
      })
      .then((_data: any | boolean) => {
        console.log(_data);
      })
      .catch((e: any) => {
        console.log('Error occured while adding Doctor', e);
        // Alert.alert('Error occured while adding Doctor');
      });
  };

  const removeDoctorFromProgram = (id: string) => {
    client
      .query({
        query: REMOVE_DOCTOR_FROM_STAR_DOCTOR_PROGRAM,
        variables: { starDoctorId: id, doctorId: '2' },
      })
      .then((_data: any | boolean) => {
        console.log(_data);
      })
      .catch((e: any) => {
        console.log('Error occured while removing Doctor', e);
        // Alert.alert('Error occured while removing Doctor');
      });
  };

  return (
    <SquareCardWithTitle
      title={`Your Star Doctors Team (${profileData!.starDoctorTeam.length})`}
      containerStyle={{ marginTop: 20 }}
    >
      <View style={{ height: 16 }} />
      {profileData!.starDoctorTeam.map((starDoctor: Doctor, i) => (
        <DoctorCard
          onRemove={(id) => {
            removeDoctorFromProgram(id);
          }}
          doctorId={starDoctor.id}
          key={i}
          image={starDoctor.photoUrl}
          doctorName={`${starDoctor.firstName} ${starDoctor.lastName}`}
          experience={starDoctor.experience}
          // specialization={'GENERAL PHYSICIAN '} //{starDoctor.designation}
          specialization={starDoctor.specialization}
          education={starDoctor.education}
          location={'Apollo Hospitals, Jubilee Hills'} //{starDoctor.location}
          inviteStatus={starDoctor.inviteStatus == 'accepted' ? 'accepted' : 'Not accepted'}
        />
      ))}
      {!addshow ? (
        <View style={{ flexDirection: 'row', margin: 20 }}>
          <Add />
          <TouchableOpacity onPress={() => setAddShow(!addshow)}>
            <Text style={styles.addDoctorText}>ADD DOCTOR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={{
            ...theme.viewStyles.whiteRoundedCornerCard,
            margin: 20,
            marginTop: 0,
            borderRadius: 10,
          }}
        >
          <View style={{ margin: 20 }}>
            <Text style={styles.inputTextStyle}>Add a doctor to your team</Text>
            <View style={{ flexDirection: 'row' }}>
              <TextInput
                maxLength={20}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                style={styles.inputStyle}
                value={doctorSearchText}
                onChange={(text) => filterDoctors(text.nativeEvent.text)}
              />
              {isShowAddDoctorButton ? (
                <TouchableOpacity onPress={addDoctorToProgram}>
                  <Send />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          {filteredStarDoctors.length > 0 ? (
            <View
              style={{
                paddingTop: 16,
                paddingBottom: 15,
                position: 'absolute',
                top: 0,
                zIndex: 2,
                marginTop: 85,
                width: '89%',
                alignSelf: 'center',
                justifyContent: 'flex-end',
                ...theme.viewStyles.whiteRoundedCornerCard,
              }}
            >
              {filteredStarDoctors.map((item, i) => {
                return (
                  <TouchableOpacity
                    onPress={() =>
                      onPressDoctorSearchListItem(`Dr. ${item.firstName} ${item.lastName}`)
                    }
                    style={{ marginHorizontal: 16 }}
                    key={i}
                  >
                    <Text
                      style={{
                        color: theme.colors.darkBlueColor(),
                        ...theme.fonts.IBMPlexSansMedium(18),
                      }}
                    >{`Dr. ${item.firstName} ${item.lastName}`}</Text>
                    {i < filteredStarDoctors.length - 1 ? (
                      <View
                        style={{
                          marginTop: 8,
                          marginBottom: 7,
                          height: 1,
                          opacity: 0.1,
                          borderStyle: 'solid',
                          borderWidth: 0.5,
                          borderColor: theme.colors.darkBlueColor(),
                        }}
                      ></View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>
      )}
    </SquareCardWithTitle>
  );
};
