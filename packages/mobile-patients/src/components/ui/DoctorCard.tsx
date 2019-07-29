import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
// import { Star } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '../../theme/theme';
import { SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_doctors } from '@aph/mobile-patients/src/graphql/types/SearchDoctorAndSpecialty';

const styles = StyleSheet.create({
  doctorView: {
    flex: 1,
    marginHorizontal: 20,
    ...theme.viewStyles.cardViewStyle,
    marginBottom: 12,
    borderRadius: 10,
  },
  buttonView: {
    height: 44,
    backgroundColor: theme.colors.BUTTON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.BUTTON_TEXT,
  },
  availableView: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  imageView: {
    margin: 16,
  },
  doctorNameStyles: {
    paddingTop: 32,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
  },
  doctorLocation: {
    marginBottom: 16,
    paddingTop: 2,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
  educationTextStyles: {
    paddingTop: 12,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
});

// type rowData = {
//   availableForPhysicalConsultation: boolean;
//   availableForVirtualConsultation: boolean;
//   awards: string;
//   city: string;
//   education: string;
//   experience: string;
//   firstName: string;
//   id: string;
//   inviteStatus: string;
//   isProfileComplete: boolean;
//   isStarDoctor: boolean;
//   languages: string;
//   lastName: string;
//   mobileNumber: string;
//   onlineConsultationFees: string;
//   package: string;
//   photoUrl: string;
//   physicalConsultationFees: string;
//   registrationNumber: string;
//   services: string;
//   speciality: string;
//   specialization: string;
//   typeOfConsult: string;
//   availableIn: string;
// };

export interface DoctorCardProps extends NavigationScreenProps {
  rowData: SearchDoctorAndSpecialty_SearchDoctorAndSpecialty_doctors;
  displayButton?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const rowData = props.rowData;
  return (
    <TouchableOpacity
      style={[styles.doctorView, props.style]}
      onPress={() => props.navigation.navigate(AppRoutes.DoctorDetails, { doctorId: rowData.id })}
    >
      <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          {(rowData.availableForPhysicalConsultation || rowData.availableForVirtualConsultation) &&
          props.displayButton &&
          rowData.availableIn ? (
            <CapsuleView
              title={rowData.availableIn ? `AVAILABLE IN ${rowData.availableIn} MINS` : ''}
              style={styles.availableView}
              isActive={parseInt(rowData.availableIn) > 15 ? false : true}
            />
          ) : null}
          <View style={styles.imageView}>
            {/* {rowData.image} */}
            {rowData.photoUrl && (
              <Image
                style={{ width: 80, height: 80, borderRadius: 40 }}
                source={{ uri: rowData.photoUrl }}
              />
            )}

            {/* {rowData.isStarDoctor ? (
              <Star style={{ height: 28, width: 28, position: 'absolute', top: 66, left: 30 }} />
            ) : null} */}
          </View>
          <View>
            <Text style={styles.doctorNameStyles}>
              Dr. {rowData.firstName} {rowData.lastName}
            </Text>
            <Text style={styles.doctorSpecializationStyles}>
              {rowData.specialization!.toUpperCase()} | {rowData.experience} YRS
            </Text>
            <Text style={styles.educationTextStyles}>{rowData.education}</Text>
            <Text style={styles.doctorLocation}>{rowData.city}</Text>
          </View>
        </View>
        {props.displayButton && (
          <View style={{ overflow: 'hidden' }}>
            <View style={styles.buttonView}>
              <Text style={styles.buttonText}>{string.common.consult_now}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

DoctorCard.defaultProps = {
  displayButton: true,
};
