import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

export interface ReschedulePopUpProps extends NavigationScreenProps {
  setResheduleoverlay: (arg0: boolean) => void;
  patientId: string;
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  doctorId: string;
  isbelowthree: boolean;
  setdisplayoverlay: () => void;
  acceptChange: () => void;
  appadatetime: string;
  reschduleDateTime: any;
}
export const ReschedulePopUp: React.FC<ReschedulePopUpProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  console.log('doctor', props.doctor);
  console.log(
    'reschduleDateTime',
    props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0].availableSlot
  );
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, .8)',
        zIndex: 5,
      }}
    >
      <View style={{ paddingHorizontal: showSpinner ? 0 : 20 }}>
        <View
          style={{
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            onPress={() => props.setResheduleoverlay(false)}
            style={{
              marginTop: Platform.OS === 'ios' ? 38 : 14,
              backgroundColor: 'white',
              height: 28,
              width: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              marginRight: showSpinner ? 20 : 0,
            }}
          >
            <CrossPopup />
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              marginTop: 16,
              width: width - 40,
              height: 'auto',
              maxHeight: height - 98,
              padding: 0,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 56,
                backgroundColor: 'white',
                alignItems: 'center',
                ...theme.viewStyles.shadowStyle,
              }}
            >
              <Text
                style={{
                  color: 'rgba(2, 71, 91, 1)',
                  ...theme.fonts.IBMPlexSansMedium(16),
                  paddingTop: 18,
                  paddingBottom: 14,
                }}
              >
                Reschedule
              </Text>
            </View>
            <View>
              {props.isbelowthree ? (
                <Text
                  style={{
                    color: '#01475b',
                    ...theme.fonts.IBMPlexSansMedium(14),
                    lineHeight: 20,
                    letterSpacing: 0.35,
                    paddingTop: 20,
                    paddingHorizontal: 16,
                  }}
                >
                  {`We’re sorry that you have to reschedule.\nYou can reschedule up to 3 times for free.`}
                </Text>
              ) : (
                <Text
                  style={{
                    color: '#01475b',
                    ...theme.fonts.IBMPlexSansMedium(14),
                    lineHeight: 20,
                    letterSpacing: 0.35,
                    paddingTop: 20,
                    paddingHorizontal: 16,
                  }}
                >
                  {`Since you hace already rescheduled 3 times with Dr. ${props.doctor &&
                    props.doctor.firstName}, we will consider this a new paid appointment.`}
                </Text>
              )}

              <Text
                style={{
                  color: '#01475b',
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 20,
                  letterSpacing: 0.35,
                  paddingTop: 20,
                  paddingHorizontal: 16,
                }}
              >
                {`Next slot for Dr. ${props.doctor && props.doctor.firstName} is available on —`}
              </Text>
              <Text
                style={{
                  color: '#0087ba',
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 24,
                  letterSpacing: 0.4,
                  paddingTop: 16,
                  paddingHorizontal: 16,
                }}
              >
                {moment(
                  props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]
                    .availableSlot
                ).format(' DD MMMM YYYY HH:mm')}
              </Text>
              <View
                style={{
                  paddingHorizontal: 0,
                  marginTop: 42,
                  marginBottom: 16,
                  height: 40,
                  flexDirection: 'row',
                }}
              >
                <Button
                  title={'CHANGE SLOT'}
                  style={{
                    flex: 0.5,
                    marginLeft: 20,
                    marginRight: 8,
                    backgroundColor: 'white',
                  }}
                  titleTextStyle={{ color: '#fc9916' }}
                  onPress={() => props.setdisplayoverlay()}
                />
                <Button
                  title={'ACCEPT'}
                  style={{ flex: 0.5, marginRight: 20, marginLeft: 8 }}
                  onPress={() => {
                    props.acceptChange();
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
