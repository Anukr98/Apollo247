import React, { useState, useEffect } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Header } from '../ui/Header';
import { theme } from '../../theme/theme';
import {
  CheckUnselectedIcon,
  CheckedIcon,
  InPersonHeader,
  InPersonBlue,
  CTDoctor,
  CTCalender,
  CTPayment,
  CTVideo,
  CTPrescription,
  CTChat,
  OnlineHeader,
  CTPhone,
} from '../ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  nextAvailability,
  mhdMY,
  g,
  timeDiffFromNow,
  postWebEngageEvent,
} from '../../helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { ConsultMode } from '../../graphql/types/globalTypes';
import { AppRoutes } from '../NavigatorContainer';
import { useApolloClient } from 'react-apollo-hooks';
import { useUIElements } from '../UIElementsProvider';
import { PAST_APPOINTMENTS_COUNT } from '../../graphql/profiles';
import {
  getPastAppointmentsCount,
  getPastAppointmentsCountVariables,
} from '../../graphql/types/getPastAppointmentsCount';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { CommonBugFender } from '../../FunctionHelpers/DeviceHelper';
import moment from 'moment';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  ScrollViewStyle: {
    paddingBottom: 23,
  },
  shadowStyle: {
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 15 },
    zIndex: 1,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  headerTextContainer: {
    backgroundColor: theme.colors.WHITE,
    paddingTop: 8,
    paddingHorizontal: 25,
    paddingBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 14,
    marginHorizontal: 0,
    width: '100%',
    height: 46,
    backgroundColor: '#f0fffc',
  },
  checkboxTextStyle: {
    ...theme.viewStyles.text('SB', 12, theme.colors.SHERPA_BLUE),
    marginLeft: 8,
  },
  cardContainer: {
    backgroundColor: theme.colors.WHITE,
    marginTop: 21,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  cardHeaderStyle: {
    flexDirection: 'row',
    marginTop: 13,
    marginHorizontal: 16,
    paddingBottom: 9,
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  headingTextContainer: {
    flex: 1,
    marginLeft: 14,
    alignItems: 'flex-start',
    marginTop: 5,
  },
  priceTextStyle: {
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, undefined, 0.35),
    marginTop: 4,
  },
  timeTextStyle: {
    ...theme.viewStyles.text('B', 9, theme.colors.SHERPA_BLUE, 1, undefined, 0.5),
    marginTop: 6,
    marginLeft: 1,
    textTransform: 'uppercase',
  },
  timeText2Style: {
    ...theme.viewStyles.text('B', 9, theme.colors.CAPSULE_ACTIVE_BG, 1),
    marginTop: 6,
    marginLeft: 1,
    textTransform: 'uppercase',
  },
  stepsMainContainer: {
    marginTop: 9,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },
  buttonStyle: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.BUTTON_BG,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  buttonTextStyle: {
    ...theme.viewStyles.text('B', 13, theme.colors.WHITE, 1, 24),
    textTransform: 'uppercase',
  },
  stepsImageContainer: {
    alignItems: 'flex-start',
    marginRight: 12,
    height: '100%',
  },
});

export interface ConsultTypeScreenProps extends NavigationScreenProps {
  DoctorName: string;
  DoctorId: string;
  nextAppointemntOnlineTime: string;
  nextAppointemntInPresonTime: string;
  onlinePrice: string;
  InpersonPrice: string;
  ConsultType: ConsultMode;
}

type stepsObject = {
  image: Element;
  description: string;
  textColor?: string;
};
export const ConsultTypeScreen: React.FC<ConsultTypeScreenProps> = (props) => {
  const [consultedChecked, setConsultedChecked] = useState<boolean>(false);
  const DoctorName = props.navigation.getParam('DoctorName');
  const DoctorId = props.navigation.getParam('DoctorId');
  const chatDays = props.navigation.getParam('chatDays');
  const [hideCheckbox, setHideCheckbox] = useState<boolean>(false);
  const nextAppointemntOnlineTime = props.navigation.getParam('nextAppointemntOnlineTime');
  const nextAppointemntInPresonTime = props.navigation.getParam('nextAppointemntInPresonTime');
  const onlinePrice = props.navigation.getParam('onlinePrice');
  const InpersonPrice = props.navigation.getParam('InpersonPrice');
  const ConsultType = props.navigation.getParam('ConsultType');
  const params = props.navigation.getParam('params');
  const { setLoading } = useUIElements();
  const { currentPatientId, currentPatient } = useAllCurrentPatients();

  const callSaveSearch = props.navigation.getParam('callSaveSearch');

  // const client = useApolloClient();

  // useEffect(() => {
  //   if (DoctorId && currentPatientId) {
  //     setLoading && setLoading(true);
  //     client
  //       .query<getPastAppointmentsCount, getPastAppointmentsCountVariables>({
  //         query: PAST_APPOINTMENTS_COUNT,
  //         variables: {
  //           doctorId: DoctorId,
  //           patientId: currentPatientId || '',
  //         },
  //         fetchPolicy: 'no-cache',
  //       })
  //       .then((data) => {
  //         const count = g(data, 'data', 'getPastAppointmentsCount', 'count');
  //         console.log('getPastAppointmentsCount', data);
  //         if (count && count > 0) {
  //           setHideCheckbox(true);
  //         }
  //         setLoading && setLoading(false);
  //       })
  //       .catch((e) => {
  //         CommonBugFender('ConsultTypeScreen_getCount', e);
  //       });
  //   }
  // }, [DoctorId, client, currentPatientId, setLoading]);

  const renderHeader = () => {
    return (
      <Header
        leftIcon="backArrow"
        title="CONSULT TYPE"
        onPressLeftIcon={() => props.navigation.goBack()}
        container={styles.shadowStyle}
      />
    );
  };
  const renderDoctorName = () => {
    return (
      <View style={[styles.headerTextContainer, styles.shadowStyle]}>
        <Text style={theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE)}>
          {string.consultType.mainHeading}
        </Text>
        <Text style={theme.viewStyles.text('SB', 16, theme.colors.SKY_BLUE)}>
          {`${DoctorName}?`}
        </Text>
      </View>
    );
  };
  const renderCheckbox = () => {
    return (
      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          activeOpacity={1}
          style={{ marginLeft: 17 }}
          onPress={() => setConsultedChecked(!consultedChecked)}
        >
          {consultedChecked ? <CheckedIcon /> : <CheckUnselectedIcon />}
        </TouchableOpacity>
        <Text style={styles.checkboxTextStyle}>
          {string.consultType.checkBoxText.replace('{0}', DoctorName)}
        </Text>
      </View>
    );
  };

  const renderCard = (
    headingImage: Element,
    heading: string,
    question: string,
    price: string,
    time: string | null,
    steps: stepsObject[],
    onPress: () => void
  ) => {
    const timeDiff: Number = timeDiffFromNow(time || '');
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeaderStyle}>
          {headingImage}
          <View style={styles.headingTextContainer}>
            <Text style={theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE, 1, undefined, 0.02)}>
              {heading}
            </Text>
            {time && moment(time).isValid() ? (
              <Text style={timeDiff <= 15 ? styles.timeText2Style : styles.timeTextStyle}>
                {nextAvailability(time)}
              </Text>
            ) : null}
          </View>
          <Text style={styles.priceTextStyle}>{`Rs. ${price}`}</Text>
        </View>
        <View style={styles.stepsMainContainer}>
          <Text style={theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE, 1, 18)}>
            {question}
          </Text>
          {steps.map((i) => (
            <View style={styles.stepsContainer}>
              <View style={styles.stepsImageContainer}>{i.image}</View>
              <Text
                style={{
                  flex: 1,
                  ...theme.viewStyles.text(
                    'M',
                    12,
                    i.textColor ? i.textColor : theme.colors.CONSUTL_STEPS,
                    1,
                    18,
                    0
                  ),
                }}
              >
                {i.description}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity activeOpacity={1} onPress={onPress}>
          <View style={styles.buttonStyle}>
            <Text style={styles.buttonTextStyle}>{`${
              time && moment(time).isValid()
                ? nextAvailability(time, 'Consult')
                : string.common.book_apointment
            }`}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const postWebengaegConsultType = (consultType: 'Online' | 'In Person') => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_TYPE_SELECTION] = {
      'Consult Type': consultType,
      'Doctor ID': DoctorId,
      'Doctor Name': DoctorName,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.CONSULT_TYPE_SELECTION, eventAttributes);
  };
  const renderOnlineCard = () => {
    return renderCard(
      <OnlineHeader />,
      string.consultType.online.heading,
      string.consultType.online.question,
      onlinePrice,
      nextAppointemntOnlineTime,
      [
        { image: <CTDoctor />, description: string.consultType.online.point1 },
        { image: <CTCalender />, description: string.consultType.online.point2 },
        { image: <CTPayment />, description: string.consultType.online.point3 },
        {
          image: <CTPhone style={{ marginTop: 3 }} />,
          description: string.consultType.online.point4,
        },
        {
          image: <CTVideo />,
          description: string.consultType.online.point5,
          textColor: theme.colors.SKY_BLUE,
        },
        { image: <CTPrescription />, description: string.consultType.online.point6 },
        {
          image: <CTChat />,
          description: string.consultType.follow_up_chat_days_text.replace(
            '{0}',
            chatDays ? chatDays : '7'
          ),
          textColor: theme.colors.SKY_BLUE,
        },
      ],
      () => {
        props.navigation.navigate(AppRoutes.DoctorDetails, {
          doctorId: DoctorId,
          consultModeSelected: ConsultMode.ONLINE,
          externalConnect: null,
          callSaveSearch: callSaveSearch,
          ...params,
        });
        postWebengaegConsultType('Online');
      }
    );
  };

  const renderInPersonCard = () => {
    return renderCard(
      <InPersonHeader />,
      string.consultType.inperson.heading,
      string.consultType.inperson.question,
      InpersonPrice,
      nextAppointemntInPresonTime,
      [
        { image: <CTDoctor />, description: string.consultType.inperson.point1 },
        { image: <CTCalender />, description: string.consultType.inperson.point2 },
        { image: <CTPayment />, description: string.consultType.inperson.point3 },
        {
          image: <InPersonBlue />,
          description: string.consultType.inperson.point4,
          textColor: theme.colors.SKY_BLUE,
        },
        { image: <CTPrescription />, description: string.consultType.inperson.point5 },
        {
          image: <CTChat />,
          description: string.consultType.inperson.point6,
          textColor: theme.colors.SKY_BLUE,
        },
      ],
      () => {
        props.navigation.navigate(AppRoutes.DoctorDetails, {
          doctorId: DoctorId,
          consultModeSelected: ConsultMode.PHYSICAL,
          externalConnect: null,
          callSaveSearch: callSaveSearch,
          ...params,
        });
        postWebengaegConsultType('In Person');
      }
    );
  };
  // let ScrollViewRef: any;

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.mainContainer}>
        {renderHeader()}
        {renderDoctorName()}
        <ScrollView
          bounces={false}
          style={styles.mainContainer}
          contentContainerStyle={styles.ScrollViewStyle}
          // ref={(ref) => (ScrollViewRef = ref)}
          // onScroll={(event) => {
          //   console.log('event', event.nativeEvent.contentOffset.y);
          // }}
        >
          {/* {hideCheckbox ? null : renderCheckbox()} */}
          {[ConsultMode.ONLINE, ConsultMode.BOTH].includes(ConsultType) ? renderOnlineCard() : null}
          {[ConsultMode.PHYSICAL, ConsultMode.BOTH].includes(ConsultType)
            ? renderInPersonCard()
            : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
