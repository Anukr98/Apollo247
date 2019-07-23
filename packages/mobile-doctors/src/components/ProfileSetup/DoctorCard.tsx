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
    marginRight: 12,
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
  doctorId: string;
  inviteStatus?: 'accepted' | 'Not accepted';
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
  onRemove: (id: string) => void;
}

export const DoctorCard: React.FC<doctorCardProps> = (props) => {
  const [isMenuHidden, setisMenuHidden] = useState<boolean>(false);

  return (
    <View style={styles.doctorView}>
      <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
        {props.inviteStatus == 'accepted' ? (
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
        )}
      </View>
      {isMenuHidden ? (
        <View style={styles.removebuttonview}>
          <Button
            onPress={() => props.onRemove(props.doctorId)}
            title="Remove"
            titleTextStyle={styles.titleTextStyle}
            style={[styles.containerStyles]}
          />
        </View>
      ) : null}
    </View>
  );
};
