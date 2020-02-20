import { ConsultationHoursCard } from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard';
import { AddPlus, RoundChatIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SquareCardWithTitle } from '../ui/SquareCardWithTitle';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  // consultTypeSelection: {
  //   flexDirection: 'row',
  //   marginHorizontal: 20,
  //   marginTop: 12,
  //   marginBottom: 20,
  // },
  consultDescText: {
    ...theme.fonts.IBMPlexSans(14),
    color: theme.colors.darkBlueColor(0.5),
    marginTop: 16,
    marginHorizontal: 20,
  },
  descriptionview: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#0087ba',
    lineHeight: 24,
    //marginTop: 20,
  },
});

export interface AvailabilityProps {
  profileData: GetDoctorDetails_getDoctorDetails;
}

export const Availability: React.FC<AvailabilityProps> = ({ profileData }) => {
  // const [consultationType, setConsultationType] = useState({
  //   physical: profileData.consultHours![0]!.consultMode,
  //   online: profileData.consultHours![0]!.consultMode,
  // });
  console.log(profileData, 'profileData');

  const get12HrsFormat = (timeString: string /* 12:30 */) => {
    const hoursAndMinutes = timeString.split(':').map((i) => parseInt(i, 10));
    return format(new Date(0, 0, 0, hoursAndMinutes[0], hoursAndMinutes[1]), 'h:mm a');
  };

  const fromatConsultationHours = (startTime: string, endTime: string /* input eg.: 15:15:30Z */) =>
    `${get12HrsFormat(startTime.replace('Z', ''))} - ${get12HrsFormat(endTime.replace('Z', ''))}`;

  return (
    <View style={styles.container}>
      {profileData.delegateNumber ? (
        <SquareCardWithTitle title="Consultation Type" containerStyle={{ marginTop: 0 }}>
          <Text style={styles.consultDescText}>{strings.account.what_type_of_consult}</Text>
          <Text
            style={{
              marginLeft: 20,
              marginTop: 8,
              ...theme.fonts.IBMPlexSansMedium(16),
              color: '#02475b',
              marginBottom: 20,
              textTransform: 'capitalize',
            }}
          >
            {strings.common.physical}, {strings.common.online}
          </Text>
          {/* <View style={styles.consultTypeSelection}>
            <SelectableButton
              containerStyle={{ marginRight: 20 }}
              onChange={(isChecked) => {
                if (!isChecked && !consultationType.online) {
                  return;
                } else {
                  setConsultationType({ ...consultationType, physical: isChecked });
                }
              }}
              title="Physical"
              isChecked={consultationType.physical}
            />
            <SelectableButton
              onChange={(isChecked) => {
                if (!isChecked && !consultationType.physical) {
                  return;
                } else {
                  setConsultationType({ ...consultationType, online: isChecked });
                }
              }}
              title="Online"
              isChecked={consultationType.online}
            />
          </View> */}
        </SquareCardWithTitle>
      ) : null}
      <SquareCardWithTitle
        title={strings.account.consult_hours}
        containerStyle={{ marginTop: 16, paddingBottom: 16 }}
      >
        {profileData.consultHours!.map((i, idx) => (
          <ConsultationHoursCard
            days={i!.weekDay}
            timing={fromatConsultationHours(i!.startTime, i!.endTime)}
            isAvailableForOnlineConsultation={i!.consultMode.toLocaleLowerCase()}
            //isAvailableForPhysicalConsultation={i!.consultType}
            key={idx}
            type="fixed"
          />
        ))}

        {/* <View
          style={{
            ...theme.viewStyles.whiteRoundedCornerCard,
            marginTop: 16,
            paddingHorizontal: 16,
            paddingVertical: 20,
          }}
        >
          <Text style={styles.consultDescText}>Enter your preferred consult hours</Text>
        </View> */}
        <TouchableOpacity
          style={{ flexDirection: 'row', marginTop: 18, marginLeft: 20, alignItems: 'center' }}
        >
          <AddPlus />
          <Text
            style={{
              ...theme.viewStyles.yellowTextStyle,
              fontSize: 14,
              marginLeft: 8,
            }}
          >
            {strings.account.add_consult_hours}
          </Text>
        </TouchableOpacity>
      </SquareCardWithTitle>
      <View style={{ margin: 20, flexDirection: 'row', marginBottom: -10 }}>
        <View style={{ marginTop: 4 }}>
          <RoundChatIcon />
        </View>

        <View style={{ marginLeft: 14 }}>
          <Text>
            <Text style={styles.descriptionview}>{strings.common.call}</Text>
            <Text
              style={{ color: '#fc9916', ...theme.fonts.IBMPlexSansSemiBold(16), lineHeight: 22 }}
            >
              {' '}
              {strings.common.toll_free_num}{' '}
            </Text>
            <Text style={styles.descriptionview}>{strings.account.to_make_changes}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};
