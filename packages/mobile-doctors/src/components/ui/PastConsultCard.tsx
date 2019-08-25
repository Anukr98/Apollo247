import { CapsuleView } from '@aph/mobile-doctors/src/components/ui/CapsuleView';
import { Audio, Video } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Appointments } from '@aph/mobile-doctors/src/helpers/commonTypes';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme/theme';
import { colors } from '@aph/mobile-doctors/src/theme/colors';
import { TagCard } from '@aph/mobile-doctors/src/components/ui/TagCard';

const styles = StyleSheet.create({
  containerStyle: {
    marginTop: 6,
    marginRight: 20,
    marginBottom: 20,
    borderRadius: 4,
  },
  imageView: {
    margin: 12,
    alignContent: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
  },
  doctorNameStyles: {
    flex: 1,
    // paddingTop: 12,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
  },

  iconview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seperatorline: {
    flexDirection: 'row',
    marginTop: 1,
    borderBottomColor: '#02475b',
    borderBottomWidth: 1,
    marginRight: 16,
    opacity: 0.05,
  },
  newtagWrapperStyle: {
    position: 'absolute',
    top: 4,
    left: 0,
    zIndex: 1,
    shadowColor: colors.CARD_SHADOW_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
});

export interface CalendarCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  doctorname?: string;
  timing?: string;
  image?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  wayOfContact: 'clinic' | 'video';
}

export const PastConsultCard: React.FC<CalendarCardProps> = (props) => {
  const containerStyle = {
    borderWidth: 1,
    backgroundColor: '#ffffff',
    shadowColor: colors.CARD_SHADOW_COLOR,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 5,
    borderColor: '#fff',
  };
  return (
    <TouchableOpacity activeOpacity={1} style={{ flex: 1 }}>
      <View style={[styles.containerStyle, containerStyle, props.containerStyle]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={styles.imageView}>
            <Image
              source={require('../../images/doctor/rahul.png')}
              style={{ height: 44, width: 44 }}
            />
          </View>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={styles.iconview}>
              <Text style={styles.doctorNameStyles} numberOfLines={1}>
                {props.doctorname}
              </Text>
              <View style={{ marginTop: 0 /*12*/, marginHorizontal: 15 }}>
                {props.wayOfContact == 'video' ? <Video /> : <Audio />}
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
