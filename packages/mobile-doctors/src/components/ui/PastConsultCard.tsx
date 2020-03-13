import { Audio, Video } from '@aph/mobile-doctors/src/components/ui/Icons';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '@aph/mobile-doctors/src/theme/colors';
import PastConsultCardStyles from '@aph/mobile-doctors/src/components/ui/PastConsultCard.styles';

const styles = PastConsultCardStyles;

export interface CalendarCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  doctorname?: string;
  timing?: string;
  image?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  wayOfContact?: 'clinic' | 'video';
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
