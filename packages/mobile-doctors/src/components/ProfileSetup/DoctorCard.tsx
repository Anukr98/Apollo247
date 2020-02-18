import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { InviteIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import React, { useState } from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { theme } from '../../theme/theme';
import { INVITEDSTATUS } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

const styles = StyleSheet.create({
  doctorView: {
    flex: 1,
    marginHorizontal: 20,
    ...theme.viewStyles.whiteRoundedCornerCard,
    shadowRadius: 5,
    marginBottom: 16,
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
    flex: 0.9,
  },
  invitetext: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: '#ff748e',
    marginBottom: 16,
    marginLeft: 8,
    marginTop: 2,
  },
  imageremovestyles: {
    height: 24,
    width: 24,
    marginTop: 16,
    marginRight: 20,
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
    color: '#658f9b',
    marginRight: 16,
  },

  educationTextStyles: {
    paddingTop: 12,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#658f9b',
  },
  iconview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  containerStyles: {
    height: 50,
    borderRadius: 10,
    ...theme.viewStyles.whiteRoundedCornerCard,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  titleTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#890000',
    textAlign: 'left',
    justifyContent: 'flex-start',
    marginLeft: -70,
  },
  removebuttonview: {
    right: 12,
    position: 'absolute',
    justifyContent: 'flex-end',
    marginTop: 40,
    backgroundColor: '#fff',
    marginLeft: 150,
  },
});

export interface doctorCardProps {
  doctorId?: string;
  inviteStatus?: INVITEDSTATUS;
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
  isMenuOpen?: boolean;
  onRemove?: (id: string) => void;
}

export const DoctorCard: React.FC<doctorCardProps> = (props) => {
  const [isMenuHidden, setisMenuHidden] = useState<boolean>(false);

  return (
    <View style={styles.doctorView}>
      <TouchableOpacity activeOpacity={1} onPress={() => isMenuHidden && setisMenuHidden(false)}>
        <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
          <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <View style={styles.imageView}>
                <Image source={require('../../images/doctor/rahul.png')} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.iconview}>
                  <Text style={styles.doctorNameStyles} numberOfLines={1}>
                    {strings.common.dr} {props.doctorName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setisMenuHidden(!isMenuHidden)}
                    style={{ flex: 0.2 }}
                  >
                    <Image
                      style={styles.imageremovestyles}
                      source={require('../../images/icons/remove.png')}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.doctorSpecializationStyles}>
                  {props.specialization ? props.specialization + ' | ' : ''}
                  {props.experience} {strings.common.yrs}
                </Text>
                <Text style={styles.educationTextStyles}>{props.education}</Text>
                <Text style={styles.doctorLocation}>{props.location}</Text>
              </View>
            </View>
          </View>
          {/* {props.inviteStatus == INVITEDSTATUS.ACCEPTED ? (
          <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <View style={styles.imageView}>
                <Image source={require('../../images/doctor/rahul.png')} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.iconview}>
                  <Text style={styles.doctorNameStyles}>Dr. {props.doctorName}</Text>
                  <TouchableOpacity onPress={() => setisMenuHidden(!isMenuHidden)}>
                    <Image
                      style={styles.imageremovestyles}
                      source={require('../../images/icons/remove.png')}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', marginTop: 19 }}>
                  <InviteIcon />
                  <Text style={styles.invitetext}>INVITED</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <View style={styles.imageView}>
                <Image source={require('../../images/doctor/rahul.png')} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.iconview}>
                  <Text style={styles.doctorNameStyles}>Dr. {props.doctorName}</Text>
                  <TouchableOpacity onPress={() => setisMenuHidden(!isMenuHidden)}>
                    <Image
                      style={styles.imageremovestyles}
                      source={require('../../images/icons/remove.png')}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.doctorSpecializationStyles}>
                  {props.specialization ? props.specialization + ' | ' : ''}
                  {props.experience} YRS
                </Text>
                <Text style={styles.educationTextStyles}>{props.education}</Text>
                <Text style={styles.doctorLocation}>{props.location}</Text>
              </View>
            </View>
          </View>
        )} */}
        </View>
        {isMenuHidden ? (
          <View style={styles.removebuttonview}>
            <Button
              onPress={() => {
                setisMenuHidden(false);
                props.onRemove(props.doctorId);
              }}
              title={strings.common.remove}
              titleTextStyle={styles.titleTextStyle}
              style={[styles.containerStyles]}
            />
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};
