import { DoctorCard } from '@aph/mobile-doctors/src/components/ui/DoctorCard';
import { Add, Send, Star } from '@aph/mobile-doctors/src/components/ui/Icons';
import { SquareCardWithTitle } from '@aph/mobile-doctors/src/components/ui/SquareCardWithTitle';
import { getDoctorsForStarDoctorProgram } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { Doctor, DummyQueryResult } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';

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
    opacity: 0.3,
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
    ...theme.viewStyles.whiteRoundedCornerCard,
    margin: 16,
    overflow: 'hidden',
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

export interface ProfileProps {
  profileData: DummyQueryResult['data']['getDoctorProfile'];
}

export const Profile: React.FC<ProfileProps> = ({ profileData }) => {
  const [addshow, setAddShow] = useState<boolean>(false);
  const [doctorSearchText, setDoctorSearchText] = useState<string>('');
  const [filteredStarDoctors, setFilteredStarDoctors] = useState<Doctor[]>([]);
  const [isShowAddDoctorButton, setIsShowAddDoctorButton] = useState<boolean>(false);
  const [isSuggestionExist, setIsSuggestionExist] = useState<boolean>(false);

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
    getDoctorsForStarDoctorProgram.data.getDoctorsForStarDoctorProgram!(
      searchText.replace('Dr. ', '')
    )
      .then((_data) => {
        const _f = _data.map((i) => i.profile);
        console.log('flitered array', _data, _f);
        setFilteredStarDoctors(_f);
      })
      .catch((e) => {
        Alert.alert('Error occured');
      });
  };

  const onPressDoctorSearchListItem = (text: string) => {
    Keyboard.dismiss();
    setIsSuggestionExist(true);
    setDoctorSearchText(text);
    setFilteredStarDoctors([]);
    setIsShowAddDoctorButton(true);
  };

  const profileRow = (title: string, description: string) => {
    if (!description) return null;
    return (
      <View style={{ flexDirection: 'column', marginLeft: 16 }}>
        <Text style={styles.education}>{title}</Text>
        <Text style={styles.educationtext}>{description}</Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <SquareCardWithTitle title="Your Profile" containerStyle={{ marginTop: 16 }}>
        <View style={styles.cardView}>
          <Image
            style={styles.imageview}
            // source={{
            //   uri: profileData!.profile.photoUrl,
            // }}
            source={require('../../src/images/doctor/doctor.png')}
          />
          {profileData!.profile.isStarDoctor ? <Star style={styles.starIconStyle}></Star> : null}
          <View style={{ flexDirection: 'column', marginLeft: 16 }}>
            <Text style={styles.drname}>
              {profileData!.profile.firstName + ' ' + profileData!.profile.lastName}
            </Text>
            <Text style={styles.drnametext}>
              {profileData!.profile.speciality.toUpperCase() +
                '    ' +
                ' | ' +
                '  ' +
                +profileData!.profile.experience +
                ''}
              YRS
            </Text>
            <View style={styles.understatusline} />
          </View>
          {profileRow('Education', profileData!.profile.education)}
          {profileRow('Speciality', profileData!.profile.speciality)}
          {profileRow('Services', profileData!.profile.services)}
          {profileRow('Awards', profileData!.profile.awards)}
          {profileRow('Speaks', profileData!.profile.languages)}
          {profileRow('MCI Number', profileData!.profile.registrationNumber)}
          {profileRow('In-person Consult Location', 'Homeocare Hospital,Hyderabad')}
        </View>
      </SquareCardWithTitle>

      <SquareCardWithTitle
        title={`Your Star Doctors Team (${profileData!.starDoctorTeam.length})`}
        containerStyle={{ marginTop: 20 }}
      >
        <View style={{ height: 16 }} />
        {profileData!.starDoctorTeam.map((starDoctor: any, i: number) => (
          <DoctorCard
            key={i}
            image={starDoctor.uri}
            doctorName={starDoctor.firstName + ' ' + starDoctor.lastName}
            experience={starDoctor.experience}
            specialization={'GENERAL PHYSICIAN '} //{starDoctor.designation}
            education={'MBBS, Internal Medicine'} //{starDoctor.education}
            location={'Apollo Hospitals, Jubilee Hills'} //{starDoctor.services}
            inviteStatus={starDoctor.inviteStatus}
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
                  <TouchableOpacity
                    onPress={() => {
                      setIsShowAddDoctorButton(false);
                      setDoctorSearchText('');
                      setIsSuggestionExist(false);
                    }}
                  >
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
    </View>
  );
};
