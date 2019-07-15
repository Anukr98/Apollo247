import React, { useState, useEffect } from 'react';
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
import { InviteIcon } from 'app/src/components/ui/Icons';
import { Button } from 'app/src/components/ui/Button';

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
    backgroundColor: '#ffffff',
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    color: '#890000',
  },
  titleTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: '#890000',
    textAlign: 'left',
    justifyContent: 'flex-start',
    marginLeft: -70,
  },
  removebuttonview: {
    position: 'absolute',
    justifyContent: 'flex-end',
    marginTop: 40,
    backgroundColor: '#fff',
    marginLeft: 150,
  },
});

export interface doctorCardProps {
  inviteStatus?: boolean;
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
  const [isMenuHidden, setisMenuHidden] = useState<boolean>(false);

  const rowData = props;

  return (
    <View style={styles.doctorView}>
      <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
        {rowData.inviteStatus ? (
          <View style={{ flex: 1, marginLeft: 16 }}>
            <View style={styles.iconview}>
              <Text style={styles.doctorNameStyles}>{rowData.doctorName}</Text>

              <TouchableOpacity onPress={() => setisMenuHidden(!isMenuHidden)}>
                <Image
                  style={styles.imageremovestyles}
                  source={require('../../images/icons/remove.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <InviteIcon />
              <Text style={styles.invitetext}>INVITED</Text>
            </View>
          </View>
        ) : (
          <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
              <View style={styles.imageView}>
                <Image source={{ uri: rowData.image }} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.iconview}>
                  <Text style={styles.doctorNameStyles}>{rowData.doctorName}</Text>
                  <TouchableOpacity onPress={() => setisMenuHidden(!isMenuHidden)}>
                    <Image
                      style={styles.imageremovestyles}
                      source={require('../../images/icons/remove.png')}
                    />
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
        )}
      </View>
      {isMenuHidden ? (
        <View style={styles.removebuttonview}>
          <Button
            title="Remove"
            titleTextStyle={styles.titleTextStyle}
            style={[styles.containerStyles]}
          />
        </View>
      ) : null}
    </View>
  );
};
