import { ConsultationHoursCard } from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SelectableButton } from '../ui/SelectableButton';
import { SquareCardWithTitle } from '../ui/SquareCardWithTitle';
import { Add } from '@aph/mobile-doctors/src/components/ui/Icons';
import { getDoctorProfile_getDoctorProfile } from '@aph/mobile-doctors/src/graphql/types/getDoctorProfile';

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
  addConsultationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 23,
    marginHorizontal: 16,
  },
  addConsultationText: {
    marginLeft: 8,
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.BUTTON_BG,
  },
});

export interface AvailabilityProps {
  profileData: getDoctorProfile_getDoctorProfile;
}

export const Availability: React.FC<AvailabilityProps> = ({ profileData }) => {
  const [consultationType, setConsultationType] = useState({ physical: false, online: false });
  const get12HrsFormat = (timeString: string /* 12:30 */) => {
    const H = +timeString.substr(0, 2);
    const h = H % 12 || 12;
    const ampm = H < 12 ? 'AM' : 'PM';
    return h + timeString.substr(2, 3) + ' ' + ampm;
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
                setConsultationType({ ...consultationType, physical: isChecked });
              }}
              title="Physical"
              isChecked={consultationType.physical}
            />
            <SelectableButton
              onChange={(isChecked) => {
                setConsultationType({ ...consultationType, online: isChecked });
              }}
              title="Online"
              isChecked={consultationType.online}
            />
          </View>
        </SquareCardWithTitle>
      ) : null}
      <SquareCardWithTitle title="Consultation Hours" containerStyle={{ marginTop: 16 }}>
        {profileData!.consultationHours!.map((i, idx) => {
          return (
            <ConsultationHoursCard
              days={i!.days}
              timing={fromatConsultationHours(i!.startTime, i!.endTime)}
              isAvailableForOnlineConsultation={i!.availableForVirtualConsultation}
              isAvailableForPhysicalConsultation={i!.availableForPhysicalConsultation}
              key={idx}
              type="fixed"
            />
          );
        })}
        <View style={styles.addConsultationTextContainer}>
          <Add />
          <Text style={styles.addConsultationText}>ADD CONSULTATION HOURS</Text>
        </View>
      </SquareCardWithTitle>
    </View>
  );
};
