import { Star, UserPlaceHolder } from '@aph/mobile-doctors/src/components/ui/Icons';
import { getPatientLog_getPatientLog_patientInfo } from '@aph/mobile-doctors/src/graphql/types/getPatientLog';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React from 'react';
import {
  ActivityIndicator,
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
import { Image as ImageNative } from 'react-native-elements';
import { theme } from '../../theme/theme';
import { isValidImageUrl } from '@aph/mobile-doctors/src/helpers/helperFunctions';

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 5,
    borderColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 6,
    // marginLeft: 20,
    // marginRight: 20,
    // marginTop: 20,
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
    flex: 1,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#02475b',
    // width: 111,
  },
  consultstyles: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#02475b',
    // lineHeight: 12,
    // marginRight: 51,
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
  imageStyle: {
    height: 58,
    width: 58,
    borderRadius: 29,
  },
  placeHolderLoading: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export interface CalendarCardProps {
  containerStyle?: StyleProp<ViewStyle>;
  doctorname?: getPatientLog_getPatientLog_patientInfo;
  timing?: string;
  image?: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  icon?: Element;
  consults?: string | null;
  lastconsult?: string;
  icon2?: Element;
  typeValue?: boolean;
  revenue?: string;
  onPress?: TouchableOpacityProps['onPress'];
  photoUrl?: string;
}

export const PatientCard: React.FC<CalendarCardProps> = (props) => {
  return (
    <TouchableOpacity style={[styles.containerStyle, props.containerStyle]} onPress={props.onPress}>
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={[styles.imageView, { marginTop: 15 }]}>
            {isValidImageUrl(props.photoUrl) ? (
              <ImageNative
                placeholderStyle={styles.placeHolderLoading}
                PlaceholderContent={
                  <ActivityIndicator animating={true} size="small" color="green" />
                }
                source={{ uri: props.photoUrl }}
                style={styles.imageStyle}
              />
            ) : (
              <UserPlaceHolder style={styles.imageStyle} />
            )}
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
              />
            ) : null}
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              // marginRight: 12,
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
            {props.lastconsult && (
              <View style={[styles.iconview, { marginTop: 7, marginBottom: 5 }]}>
                <Text style={styles.lastconsult} numberOfLines={1}>
                  {strings.consult.last_consult}: {props.lastconsult}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', marginBottom: 3 }}>
              {props.revenue && (
                <>
                  <Text style={styles.consultstyles}>
                    {strings.consult.total_revenue} {props.revenue || '-'}
                  </Text>
                  <View
                    style={{
                      height: 12,
                      borderRightWidth: 0.5,
                      borderColor: 'rgba(2, 71, 91, 0.6)',
                      marginHorizontal: 7,
                    }}
                  />
                </>
              )}
              <Text style={styles.consultstyles} numberOfLines={1}>
                {`${props.consults} ${strings.consult.consult}${
                  Number(props.consults) !== 1 ? 's' : ''
                }`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
