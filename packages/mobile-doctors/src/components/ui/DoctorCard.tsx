import React from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  TouchableOpacityProps,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  doctorView: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: 'white',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    marginBottom: 12,
    borderRadius: 10,
  },
  imageView: {
    margin: 16,
    alignContent: 'center',
    justifyContent: 'center',
    height: 80,
    width: 80,
  },
  doctorNameStyles: {
    paddingTop: 15,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
  },
  imageremovestyles: {
    height: 24,
    width: 24,
    marginTop: 16,
    marginRight: 16,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.CARD_DESCRIPTION,
  },
  doctorLocation: {
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
  iconview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export interface doctorCardProps {
  available?: boolean;
  doctorName?: string;
  specialization?: string;
  image?: string;
  imageStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  experience?: string;
  education?: string;
  location?: string;
  time?: string;
  onPress?: TouchableOpacityProps['onPress'];
}

export const DoctorCard: React.FC<doctorCardProps> = (props) => {
  const rowData = props;
  return (
    <View style={styles.doctorView}>
      <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={styles.imageView}>
            <Image source={{ uri: rowData.image }} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.iconview}>
              <Text style={styles.doctorNameStyles}>{rowData.doctorName}</Text>
              <TouchableOpacity onPress={props.onPress}>
                <Image style={styles.imageremovestyles} source={require('./icons/remove.png')} />
              </TouchableOpacity>
            </View>

            <Text style={styles.doctorSpecializationStyles}>
              {rowData.specialization} | {rowData.experience} YRS
            </Text>
            <Text style={styles.educationTextStyles}>{rowData.education}</Text>
            <Text style={styles.doctorLocation}>{rowData.location}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
