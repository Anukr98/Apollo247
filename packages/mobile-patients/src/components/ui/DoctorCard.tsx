import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import { Star } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import React from 'react';
import {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '../../theme/theme';

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
  consultViewStyles: {
    paddingHorizontal: 0,
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  separatorViewStyles: {
    backgroundColor: theme.colors.CARD_HEADER,
    opacity: 0.3,
    marginHorizontal: 16,
    height: 1,
  },
  consultTextStyles: {
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: theme.colors.SEARCH_CONSULT_COLOR,
    textAlign: 'center',
    paddingVertical: 12,
    lineHeight: 24,
  },
  educationTextStyles: {
    paddingTop: 12,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
});

type rowData = {
  available: boolean;
  doctorName: string;
  specialization: string;
  image: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  experience: string;
  education: string;
  location: string;
  time: string;
};

export interface DoctorCardProps extends NavigationScreenProps {
  rowData: rowData;
  displayButton?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const rowData = props.rowData;
  console.log(rowData, 'rowData');
  return (
    <TouchableOpacity
      style={[styles.doctorView, props.style]}
      onPress={() => props.navigation.navigate(AppRoutes.DoctorDetails)}
    >
      <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          {rowData.available ? (
            <CapsuleView title={string.common.availableNow} style={styles.availableView} />
          ) : null}
          <View style={styles.imageView}>
            {rowData.image}
            {rowData.available ? (
              <Star style={{ height: 28, width: 28, position: 'absolute', top: 66, left: 30 }} />
            ) : null}
          </View>
          <View>
            <Text style={styles.doctorNameStyles}>{rowData.doctorName}</Text>
            <Text style={styles.doctorSpecializationStyles}>
              {rowData.specialization} | {rowData.experience}
            </Text>
            <Text style={styles.educationTextStyles}>{rowData.education}</Text>
            <Text style={styles.doctorLocation}>{rowData.location}</Text>
          </View>
        </View>
        {props.displayButton && (
          <View style={{ overflow: 'hidden' }}>
            {rowData.available ? (
              <View style={styles.buttonView}>
                <Text style={styles.buttonText}>{rowData.time}</Text>
              </View>
            ) : (
              <View style={styles.consultViewStyles}>
                <View style={styles.separatorViewStyles} />
                <Text style={styles.consultTextStyles}>{rowData.time}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

DoctorCard.defaultProps = {
  displayButton: true,
};
