import PatientDetailsPageStyles from '@aph/mobile-doctors/src/components/PatientDetailsPage.styles';
import { PastConsultCard } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/PastConsultCard';
import { BackArrow, UserPlaceHolder } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { GET_CASESHEET } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  GetCaseSheet,
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { getPatientLog_getPatientLog_patientLog_patientInfo } from '@aph/mobile-doctors/src/graphql/types/getPatientLog';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { g, isValidImageUrl } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';

const { width } = Dimensions.get('window');

const styles = PatientDetailsPageStyles;

export interface PatientsProps
  extends NavigationScreenProps<{
    patientId: string;
    ConsultsCount: string;
    PatientInfo: getPatientLog_getPatientLog_patientLog_patientInfo | null;
  }> {}

export const PatientDetailsPage: React.FC<PatientsProps> = (props) => {
  const client = useApolloClient();

  const [patientDetails, setPatientDetails] = useState<GetCaseSheet_getCaseSheet_patientDetails>();

  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [pastList, setPastList] = useState<
    (GetCaseSheet_getCaseSheet_pastAppointments | null)[] | null
  >([]);

  const PatientInfo = props.navigation.getParam('PatientInfo');
  const age =
    moment(new Date()).diff(patientDetails && patientDetails.dateOfBirth, 'years', true) || -1;

  useEffect(() => {
    console.log(PatientInfo, 'PatientInfoData');
    client
      .query<GetCaseSheet>({
        query: GET_CASESHEET,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: props.navigation.getParam('patientId') },
      })
      .then((data) => {
        try {
          const result = g(data, 'data', 'getCaseSheet');
          console.log(result, 'result');

          if (result) {
            if (result.patientDetails) {
              setPatientDetails(result.patientDetails);
            }
            const sortedActivities =
              result.pastAppointments &&
              result.pastAppointments.sort(
                (a: any, b: any) =>
                  moment(b.appointmentDateTime || b.appointmentDateTime)
                    .toDate()
                    .getTime() -
                  moment(a.appointmentDateTime || a.appointmentDateTime)
                    .toDate()
                    .getTime()
              );
            console.log(sortedActivities, 'sortedActivities');

            //setPastList(result.pastAppointments);
            setPastList(sortedActivities);
          }
          setshowSpinner(false);
        } catch (e) {
          console.log('e', e);
        }
      })
      .catch((e) => {
        const error = JSON.parse(JSON.stringify(e));
        CommonBugFender('Patient Details Case sheet', error);
        console.log('Error occured while fetching Doctor GetJuniorDoctorCaseSheet', error);
      });
  }, []);

  const renderPatientImage = () => {
    return (
      <View style={{ marginBottom: 20 }}>
        <View style={{ top: 10, marginLeft: 20, position: 'absolute', zIndex: 2 }}>
          <TouchableOpacity onPress={() => props.navigation.pop()}>
            <BackArrow />
          </TouchableOpacity>
        </View>
        {patientDetails && isValidImageUrl(patientDetails.photoUrl) ? (
          <Image
            source={{
              uri: (patientDetails && patientDetails.photoUrl) || '',
            }}
            style={{ height: width, width: width }}
            resizeMode={'contain'}
            placeholderStyle={{
              height: width,
              width: width,
              alignItems: 'center',
              backgroundColor: 'transparent',
            }}
            PlaceholderContent={<Spinner style={{ backgroundColor: 'transparent' }} />}
          />
        ) : (
          <UserPlaceHolder
            style={{
              height: 150,
              width: width,
              alignItems: 'center',
              backgroundColor: 'white',
              resizeMode: 'contain',
            }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {!showSpinner && (
        <SafeAreaView style={[theme.viewStyles.container]}>
          <ScrollView bounces={false}>
            {renderPatientImage()}
            <View style={[styles.shadowview, { marginTop: -20 }]}>
              <View style={{ flexDirection: 'row', marginTop: 12, marginHorizontal: 20 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      ...theme.fonts.IBMPlexSansSemiBold(18),
                      color: theme.colors.SHARP_BLUE,
                      marginBottom: 2,
                      marginRight: 15,
                    }}
                  >
                    {PatientInfo && PatientInfo.firstName}
                  </Text>
                </View>
                {PatientInfo && PatientInfo.uhid && (
                  <Text
                    style={{
                      ...theme.fonts.IBMPlexSansMedium(12),
                      color: 'rgba(2, 71, 91, 0.8)',
                      marginLeft: 14,
                      marginBottom: 8,
                    }}
                  >
                    {strings.case_sheet.uhid}: {PatientInfo.uhid}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(12),
                  color: theme.colors.LIGHT_BLUE,
                  marginBottom: 12,
                  marginLeft: 20,
                }}
              >
                {age > -1 ? Math.round(age).toString() : '-'}
                {PatientInfo && PatientInfo.gender ? `, ${PatientInfo.gender.charAt(0)} ` : ''}
                {PatientInfo && PatientInfo.addressList && PatientInfo.addressList.length > 0
                  ? `, ${PatientInfo.addressList[0].city}`
                  : ''}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(17),
                  lineHeight: 24,
                  color: '#01475b',
                  margin: 16,
                }}
              >
                {strings.case_sheet.past_consultations}
              </Text>
              <PastConsultCard
                data={pastList}
                navigation={props.navigation}
                patientDetails={patientDetails}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
      {showSpinner && <Spinner />}
    </View>
  );
};
