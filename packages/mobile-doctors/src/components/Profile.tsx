import { ProfileData } from 'app/src/components/ProfileSetup';
import { DoctorCard } from 'app/src/components/ui/DoctorCard';
import { Add, Send, Star } from 'app/src/components/ui/Icons';
import { SquareCardWithTitle } from 'app/src/components/ui/SquareCardWithTitle';
import { theme } from 'app/src/theme/theme';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
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
});

export interface ProfileProps {
  profileObject: ProfileData;
}

export const Profile: React.FC<ProfileProps> = (props) => {
  const [addshow, setAddShow] = useState<boolean>(false);

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
            source={{
              uri: props.profileObject.uri,
            }}
          />
          {props.profileObject.isStarDoctor ? <Star style={styles.starIconStyle}></Star> : null}
          <View style={{ flexDirection: 'column', marginLeft: 16 }}>
            <Text style={styles.drname}>
              {props.profileObject.firstName + ' ' + props.profileObject.lastName}
            </Text>
            <Text style={styles.drnametext}>
              {props.profileObject.designation} | {props.profileObject.experience} YRS
            </Text>
            <View style={styles.understatusline} />
          </View>
          {profileRow('Education', props.profileObject.education)}
          {profileRow('Speciality', props.profileObject.speciality)}
          {profileRow('Services', props.profileObject.services)}
          {profileRow('Awards', props.profileObject.awards)}
          {profileRow('Speaks', props.profileObject.languages)}
          {profileRow('MCI Number', props.profileObject.mcinumber)}
          {profileRow('In-person Consult Location', props.profileObject.inpersonconsult)}
        </View>
      </SquareCardWithTitle>

      <SquareCardWithTitle
        title={`Your Star Doctors Team (${props.profileObject.starDoctorTeam.length})`}
        containerStyle={{ marginTop: 20 }}
      >
        <View style={{ height: 16 }} />
        {props.profileObject.starDoctorTeam.map((starDoctor, i) => (
          <DoctorCard
            key={i}
            image={starDoctor.uri}
            doctorName={starDoctor.firstName}
            experience={starDoctor.experience}
            specialization={starDoctor.designation}
            education={starDoctor.education}
            location={starDoctor.services}
            inviteStatus={starDoctor.inviteStatus}
          />
        ))}
        {!addshow ? (
          <View style={{ flexDirection: 'row', margin: 20 }}>
            <Add />
            <TouchableOpacity onPress={() => setAddShow(!addshow)}>
              <Text
                style={{
                  fontFamily: 'IBMPlexSans',
                  fontSize: 14,
                  fontWeight: 'bold',
                  fontStyle: 'normal',
                  letterSpacing: 0,
                  color: '#fc9916',
                  marginLeft: 10,
                  marginTop: 2,
                }}
              >
                ADD DOCTOR
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: '#f0f4f5',
              flex: 1,
              margin: 20,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                margin: 20,
              }}
            >
              <Text style={styles.inputTextStyle}>Add a doctor to your team</Text>
              <View style={{ flexDirection: 'row' }}>
                <TextInput autoFocus style={styles.inputStyle} />
                <TouchableOpacity>
                  <Send />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SquareCardWithTitle>
    </View>
  );
};
