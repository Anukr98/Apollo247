import AvailabilityStyles from '@aph/mobile-doctors/src/components/ProfileSetup/Availability.styles';
import { ConsultationHoursCard } from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard';
import { HelpView } from '@aph/mobile-doctors/src/components/ui/HelpView';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { format } from 'date-fns';
import React from 'react';
import { Text, View } from 'react-native';
import { SquareCardWithTitle } from '../ui/SquareCardWithTitle';
import moment from 'moment';

const styles = AvailabilityStyles;

export interface AvailabilityProps {
  profileData: GetDoctorDetails_getDoctorDetails;
}

export const Availability: React.FC<AvailabilityProps> = ({ profileData }) => {
  const fromatConsultationHours = (startTime: string, endTime: string /* input eg.: 15:15:30Z */) =>
    `${moment
      .utc(startTime, 'HH:mm')
      .local()
      .format('hh:mm A')} - ${moment
      .utc(endTime, 'HH:mm')
      .local()
      .format('hh:mm A')}`;

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
