import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TouchableOpacityProps,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme/theme';
import { Star } from '@aph/mobile-doctors/src/components/ui/Icons';
import { type } from 'os';
import {
  getPatientLog,
  getPatientLog_getPatientLog_patientInfo,
} from '@aph/mobile-doctors/src/graphql/types/getPatientLog';

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
    width: 111,
  },
  consultstyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#02475b',
    lineHeight: 12,
    marginRight: 51,
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
    marginRight: 10,
    opacity: 0.05,
  },
  lastconsult: {
    opacity: 0.6,
    fontFamily: 'IBMPlexSans',
    fontSize: 10,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 14,
    letterSpacing: 0,
    color: '#02475b',
  },
});

export interface CalendarCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  doctorname?: getPatientLog_getPatientLog_patientInfo;
  timing?: string;
  image?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  icon?: Element;
  consults?: string;
  lastconsult?: string;
  icon2?: Element;
  typeValue?: boolean;
  onPress?: TouchableOpacityProps['onPress'];
}

export const PatientCard: React.FC<CalendarCardProps> = (props) => {
  return (
    <View style={[styles.containerStyle, props.containerStyle]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={[styles.imageView, { marginTop: 15 }]}>
          <Image
            source={require('../../images/doctor/rahul.png')}
            style={{ height: 58, width: 58 }}
          />
          {props.typeValue == true ? (
            <Star
              style={{
                position: 'absolute',
                height: 16,
                width: 16,
                top: 40,
                right: -10,
                // top: 141 - 28,
              }}
            ></Star>
          ) : null}
        </View>
        <TouchableOpacity onPress={props.onPress}>
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
              <Text style={styles.doctorNameStyles} numberOfLines={1}>
                {props.doctorname}
              </Text>
              <View style={{ marginBottom: 4 }}>{props.icon}</View>
            </View>
            <View style={styles.seperatorline}></View>
            <View style={[styles.iconview, { marginTop: 8.5 }]}>
              <Text style={styles.lastconsult} numberOfLines={1}>
                {props.lastconsult}
              </Text>
              <View
                style={{
                  height: 12,
                  borderWidth: 0.5,
                  borderColor: 'rgba(2, 71, 91, 0.6)',
                  //marginLeft: 15,
                  //marginTop: 10,
                }}
              ></View>
              <Text style={styles.consultstyles} numberOfLines={1}>
                {props.consults}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
