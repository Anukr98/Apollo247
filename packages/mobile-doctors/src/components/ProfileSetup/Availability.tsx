import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SelectableButton } from '../ui/SelectableButton';
import { SquareCardWithTitle } from '../ui/SquareCardWithTitle';
import { DummyQueryResult, DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { ConsultationHoursCard } from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  consultTypeSelection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  consultDescText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    opacity: 0.5,
    color: '#02475b',
    marginTop: 16,
    marginHorizontal: 16,
  },
  addConsultationText: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: '#fc9916',
    paddingVertical: 23,
    marginHorizontal: 16,
  },
});

export interface AvailabilityProps {
  profileData: DoctorProfile;
}

export const Availability: React.FC<AvailabilityProps> = ({ profileData }) => {
  const [consultationType, setConsultationType] = useState({ physical: false, online: false });
  return (
    <View style={styles.container}>
      {profileData!.profile.isStarDoctor ? (
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
        {profileData!.consultationHours.map((i, idx) => {
          return (
            <ConsultationHoursCard
              days={i.days}
              timing={i.timings}
              isAvailableForOnlineConsultation={i.availableForVirtualConsultation}
              isAvailableForPhysicalConsultation={i.availableForPhysicalConsultation}
              key={idx}
              type="fixed"
            />
          );
        })}
      </SquareCardWithTitle>
      <Text style={styles.addConsultationText}>+{'  '}ADD CONSULTATION HOURS</Text>
    </View>
  );
};
