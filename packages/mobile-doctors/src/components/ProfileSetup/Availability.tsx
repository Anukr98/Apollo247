import AvailabilityStyles from '@aph/mobile-doctors/src/components/ProfileSetup/Availability.styles';
import { ConsultationHoursCard } from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard';
import { HelpView } from '@aph/mobile-doctors/src/components/ui/HelpView';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { format } from 'date-fns';
import React from 'react';
import { Text, View } from 'react-native';
import { SquareCardWithTitle } from '../ui/SquareCardWithTitle';

const styles = AvailabilityStyles;

export interface AvailabilityProps {
  profileData: GetDoctorDetails_getDoctorDetails;
}

export const Availability: React.FC<AvailabilityProps> = ({ profileData }) => {
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
          <Text style={styles.consultTypeText}>
            {strings.common.physical}, {strings.common.online}
          </Text>
        </SquareCardWithTitle>
      ) : null}
      <SquareCardWithTitle
        title={strings.account.consult_hours}
        containerStyle={styles.squareCardContainer}
      >
        {profileData.consultHours!.map((i, idx) => (
          <ConsultationHoursCard
            days={i!.weekDay}
            timing={fromatConsultationHours(i!.startTime, i!.endTime)}
            consultMode={i!.consultMode}
            key={idx}
            type="fixed"
          />
        ))}
      </SquareCardWithTitle>
      <HelpView styles={{ marginBottom: -10 }} />
    </View>
  );
};
