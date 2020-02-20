import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme/theme';

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    borderColor: '#fff',
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    //marginBottom: 20,
  },
  imageView: {
    margin: 12,
    alignContent: 'center',
    justifyContent: 'center',
    height: 44,
    width: 44,
  },
  doctorNameStyles: {
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
  },
  consultstyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#ffffff',
    textAlign: 'right',
  },

  iconview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  lastconsult: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: '#01475b',
  },
});

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
            <Image
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
