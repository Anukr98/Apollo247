import React from 'react';
import {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme/theme';
import DoctorCardStyles from '@aph/mobile-doctors/src/components/ui/DoctorCard.styles';
import FastImage from 'react-native-fast-image';

const styles = DoctorCardStyles;

export interface CalendarCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  doctorname?: string;
  timing?: string;
  image?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  todayvale?: string;
  consults?: string;
  lastconsult?: string;
  onPress?: TouchableOpacityProps['onPress'];
}

export const DoctorCard: React.FC<CalendarCardProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <TouchableOpacity onPress={props.onPress}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={[styles.imageView, { marginTop: 15 }]}>
            <FastImage
              source={require('../../images/doctor/rahul.png')}
              style={{ height: 58, width: 58 }}
            />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              marginRight: 12,
              marginBottom: 8,
              marginTop: 16,
              marginLeft: 12,
            }}
          >
            <View style={styles.iconview}>
              <Text style={styles.doctorNameStyles}>{props.doctorname}</Text>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(8),
                  color: '#01475b',
                  opacity: 0.6,
                  textAlign: 'right',
                }}
              >
                {props.todayvale}
              </Text>
            </View>

            <View style={[styles.iconview, { marginTop: 8.5 }]}>
              <Text style={styles.lastconsult} numberOfLines={1}>
                {props.lastconsult}
              </Text>
              <View
                style={{
                  width: 22,
                  height: 22,
                  backgroundColor: '#ff748e',
                  borderRadius: 11,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={styles.consultstyles} numberOfLines={1}>
                  {props.consults}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
