import {
  View,
  Text,
  StyleSheet,
  ImageSourcePropType,
  StyleProp,
  ImageStyle,
  TextStyle,
  Image,
} from 'react-native';
import { theme } from '../../theme/theme';
import { AppImages } from '../../images/AppImages';
import { string } from '../../strings/string';

const styles = StyleSheet.create({
  doctorView: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: 'white',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 12,
    borderRadius: 10,
  },
  buttonView: {
    height: 44,
    marginTop: 16,
    backgroundColor: theme.colors.BUTTON_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.BUTTON_TEXT,
  },
  availableView: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: 10,
    backgroundColor: '#ff748e',
  },
  availableTextStyles: {
    color: 'white',
    textAlign: 'center',
    ...theme.fonts.IBMPlexSansSemiBold(9),
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  imageView: {
    margin: 16,
    alignContent: 'center',
    justifyContent: 'center',
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
    color: theme.colors.CARD_DESCRIPTION,
  },
  doctorLocation: {
    paddingTop: 2,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
  },
  consultViewStyles: {
    paddingHorizontal: 0,
    marginTop: 16,
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
  index: number;
  education: string;
  location: string;
  time: string;
};

export interface doctorCardProps {
  rowData: rowData;
}

export const DoctorCard: React.FC<doctorCardProps> = (props) => {
  const rowData = props.rowData;
  return (
    <View style={styles.doctorView}>
      <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          {rowData.available ? (
            <View style={styles.availableView}>
              <Text style={styles.availableTextStyles}>{string.LocalStrings.availableNow}</Text>
            </View>
          ) : null}
          <View style={styles.imageView}>
            <Image {...rowData.image} />
            {rowData.available ? (
              <Image
                {...AppImages.starDoctor}
                style={{ position: 'absolute', bottom: -10, left: 30 }}
              />
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
      </View>
    </View>
  );
};
