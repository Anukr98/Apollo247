import { ConsultationHoursCard } from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SelectableButton } from '../ui/SelectableButton';
import { SquareCardWithTitle } from '../ui/SquareCardWithTitle';
import { GetDoctorProfile_getDoctorProfile } from '@aph/mobile-doctors/src/graphql/types/getDoctorProfile';
import { format } from 'date-fns';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  consultTypeSelection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  consultDescText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.darkBlueColor(0.5),
    marginTop: 16,
    marginHorizontal: 20,
  },
});

export interface AvailabilityProps {
  profileData: GetDoctorProfile_getDoctorProfile;
}

export const Availability: React.FC<AvailabilityProps> = ({ profileData }) => {
  const [consultationType, setConsultationType] = useState({
    physical: profileData.consultationHours![0]!.availableForPhysicalConsultation,
    online: profileData.consultationHours![0]!.availableForVirtualConsultation,
  });

  const get12HrsFormat = (timeString: string /* 12:30 */) => {
    const hoursAndMinutes = timeString.split(':').map((i) => parseInt(i));
    return format(new Date(0, 0, 0, hoursAndMinutes[0], hoursAndMinutes[1]), 'h:mm a');
  };

  const fromatConsultationHours = (startTime: string, endTime: string /* input eg.: 15:15:30Z */) =>
    `${get12HrsFormat(startTime.replace('Z', ''))} - ${get12HrsFormat(endTime.replace('Z', ''))}`;

  return (
    <View style={styles.container}>
      {profileData!.profile!.isStarDoctor ? (
        <SquareCardWithTitle title="Consultation Type" containerStyle={{ marginTop: 16 }}>
          <Text style={styles.consultDescText}>
            What type of consults will you be available for?
          </Text>
          <View style={styles.consultTypeSelection}>
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
          </View>
        </SquareCardWithTitle>
      ) : null}
      <SquareCardWithTitle
        title="Consultation Hours"
        containerStyle={{ marginTop: 16, paddingBottom: 16 }}
      >
        {profileData!.consultationHours!.map((i, idx) => (
          <ConsultationHoursCard
            days={i!.days}
            timing={fromatConsultationHours(i!.startTime, i!.endTime)}
            isAvailableForOnlineConsultation={i!.availableForVirtualConsultation}
            isAvailableForPhysicalConsultation={i!.availableForPhysicalConsultation}
            key={idx}
            type="fixed"
          />
        ))}
      </SquareCardWithTitle>
    </View>
  );
};
