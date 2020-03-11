import AvailabilityStyles from '@aph/mobile-doctors/src/components/ProfileSetup/Availability.styles';
import { ConsultationHoursCard } from '@aph/mobile-doctors/src/components/ui/ConsultationHoursCard';
import { AddPlus, RoundChatIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { format } from 'date-fns';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SquareCardWithTitle } from '../ui/SquareCardWithTitle';

const styles = AvailabilityStyles;

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
          <Text style={styles.consultTypeText}>
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
        containerStyle={styles.squareCardContainer}
      >
        {profileData.consultHours!.map((i, idx) => (
          <ConsultationHoursCard
            days={i!.weekDay}
            timing={fromatConsultationHours(i!.startTime, i!.endTime)}
            consultMode={i!.consultMode}
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
        {/* <TouchableOpacity style={styles.addTouchable}>
          <AddPlus />
          <Text style={styles.addTextStyle}>{strings.account.add_consult_hours}</Text>
        </TouchableOpacity> */}
      </SquareCardWithTitle>
      <View style={styles.roundChaticon}>
        <View style={{ marginTop: 4 }}>
          <RoundChatIcon />
        </View>

        <View style={{ marginLeft: 14 }}>
          <Text>
            <Text style={styles.descriptionview}>{strings.common.call}</Text>
            <Text style={styles.tollfreeText}> {strings.common.toll_free_num} </Text>
            <Text style={styles.descriptionview}>{strings.account.to_make_changes}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};
