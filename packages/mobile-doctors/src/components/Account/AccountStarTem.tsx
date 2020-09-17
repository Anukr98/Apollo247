import AccountStarTemStyles from '@aph/mobile-doctors/src/components/Account/AccountStarTem.styles';
import { DoctorCard } from '@aph/mobile-doctors/src/components/ProfileSetup/DoctorCard';
import { Add, Down, Up } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
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
  removeTeamDoctorFromStarTeam,
  removeTeamDoctorFromStarTeamVariables,
} from '@aph/mobile-doctors/src/graphql/types/RemoveTeamDoctorFromStarTeam';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React, { useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';

const styles = AccountStarTemStyles;

export interface StarDoctorsTeamProps {
  profileData: GetDoctorDetails_getDoctorDetails;
  scrollViewRef: KeyboardAwareScrollView | null;
  onReload: () => void;
}

export const AccountStarTeam: React.FC<StarDoctorsTeamProps> = ({
  profileData,
  scrollViewRef,
  onReload,
}) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('Select Doctor');
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isSelectDoctorVisible, setSelectDoctorVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const client = useApolloClient();
  const starDoctorsActive = profileData.starTeam
    ? profileData.starTeam.filter((doctor) => doctor && doctor.isActive)
    : [];
  const starDoctorsInActive = profileData.starTeam
    ? profileData.starTeam.filter((doctor) => doctor && !doctor.isActive)
    : [];

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
      .then(({ data }) => {
        setSelectedDoctor('Select Doctor');
        setIsLoading(false);
        console.log('addDoctorToProgram', data);
        if (data && data.makeTeamDoctorActive) {
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
        Alert.alert(strings.common.uh_oh, strings.common.oops_msg);
      });
  };

  const removeDoctorFromProgram = (id: string) => {
    console.log('removeDoctorFromProgram', id, profileData.id);

    setIsLoading(true);
    client
      .mutate<removeTeamDoctorFromStarTeam, removeTeamDoctorFromStarTeamVariables>({
        mutation: REMOVE_TEAM_DOCTOR_FROM_STAR_TEAM,
        variables: { associatedDoctor: id, starDoctor: profileData.id },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        setIsLoading(false);
        console.log('removeDoctorFromProgram', data);
        if (data && data.removeTeamDoctorFromStarTeam) {
          onReload();
        }
      })
      .catch((e) => {
        setIsLoading(false);
        CommonBugFender('Remove_Doctor_To_Program', e);
        const error = JSON.parse(JSON.stringify(e));
        const errorMessage = error && error.message;
        console.log('Error occured while removing Doctor', errorMessage, error);
        Alert.alert(strings.common.uh_oh, strings.common.oops_msg);
      });
  };

  const formatSuggestionsText = (text: string, searchKey: string) => {
    return (
      <Highlighter
        style={styles.highView}
        highlightStyle={styles.highText}
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
              {i < array!.length - 1 ? <View style={styles.formatView} /> : null}
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
          specialization={(
            g(profileData, 'specialty', 'specialistSingularTerm') ||
            g(profileData, 'specialty', 'name') ||
            ''
          ).toLocaleUpperCase()}
          education={starDoctor!.associatedDoctor!.qualification!}
          location={getFormattedLocation(starDoctor)}
        />
      );
    });
  };

  const renderAddDoctor = () => {
    return (
      <View style={styles.addDoctor}>
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
        <View style={styles.selectCard}>
          <View style={{ margin: 20 }}>
            <Text style={styles.inputTextStyle}>{strings.account.add_doct_to_your_team}</Text>
            <TouchableOpacity onPress={() => onSelectStarDoctor(isDropdownOpen)}>
              <View style={styles.rowView}>
                <Text style={styles.selectDoctor}>{selectedDoctor}</Text>
                <View style={styles.icon}>{!isDropdownOpen ? <Down /> : <Up />}</View>
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
