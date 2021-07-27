import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Platform,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import _ from 'lodash';
import { SearchInput } from '@aph/mobile-patients/src/components/ui/SearchInput';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  getPatientAllAppointments_getPatientAllAppointments_activeAppointments,
  getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_medicinePrescription,
} from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import {
  DoctorIcon,
  ChatBlueIcon,
  DoctorPlaceholderImage,
  CTLightGrayVideo,
  PhysicalConsultDarkBlueIcon,
  PreviousPrescriptionIcon,
  WhiteArrowRightIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { getPatinetAppointments_getPatinetAppointments_patinetAppointments } from '@aph/mobile-patients/src/graphql/types/getPatinetAppointments';
import moment from 'moment';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { ConsultOverlay } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultOverlay';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { ListItem } from 'react-native-elements';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  APPOINTMENT_STATE,
  STATUS,
  APPOINTMENT_TYPE,
  ConsultMode,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  postWebEngageEvent,
  g,
  followUpChatDaysCaseSheet,
  isPastAppointment,
  postWEGPatientAPIError,
} from '@aph/mobile-patients/src/helpers/helperFunctions';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  headerSearchInputShadow: {
    zIndex: 1,
    backgroundColor: theme.colors.WHITE,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  inputContainerStyle: {
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    ...theme.fonts.IBMPlexSansMedium(18),
    borderBottomWidth: 2,
    borderRadius: 0,
    backgroundColor: 'transparent',
    paddingLeft: Platform.OS === 'ios' ? 0 : -10,
    paddingTop: 0,
    color: theme.colors.SHERPA_BLUE,
    marginHorizontal: 10,
    paddingHorizontal: 0,
    paddingRight: 12,
  },
  buttonStyles: {
    height: 40,
    width: 180,
    marginTop: 16,
  },
  prepareForConsult: {
    ...theme.viewStyles.yellowTextStyle,
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'right',
    paddingHorizontal: 15,
    paddingTop: 11,
    paddingBottom: 16,
  },
  postConsultTextStyles1: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#02475b',
    opacity: 0.6,
    letterSpacing: 0.04,
    textAlign: 'right',
    paddingBottom: 16,
    fontWeight: '500',
  },
  postConsultTextStyles2: {
    ...theme.fonts.IBMPlexSansSemiBold(10),
    color: '#02475b',
    opacity: 0.6,
    letterSpacing: 0.04,
    textAlign: 'right',
    marginTop: 2,
    marginRight: 15,
    paddingLeft: 3,
  },
  fillVitalsForConsult: {
    ...theme.fonts.IBMPlexSansMedium(12),
    textAlign: 'right',
    lineHeight: 15.6,
    opacity: 0.6,
    color: '#02475B',
    letterSpacing: 0.04,
    paddingHorizontal: 15,
    paddingTop: 1,
    paddingBottom: 16,
  },
  pickAnotherSlotViewStyle: {
    backgroundColor: 'rgba(229,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    marginTop: 14,
  },
  doctorView: {
    marginHorizontal: 8,
    ...theme.viewStyles.cardViewStyle,
    marginVertical: 6, //16,
    borderRadius: 10,
  },
  availableView: {
    position: 'absolute',
    right: 0,
    top: 0,
    minWidth: 112,
  },
  imageView: {
    margin: 16,
    marginTop: 32,
    width: 60,
  },
  doctorNameStyles: {
    paddingTop: 40,
    paddingLeft: 0,
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingBottom: 11.5,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
  },
  consultTextStyles: {
    paddingVertical: 11.5,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  textConsultSubtextView: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    paddingBottom: -16,
    opacity: 1,
  },
  completedConsultViewStyle: {
    flexDirection: 'row',
    marginBottom: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  doctorImageStyle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'contain',
  },
  doctorImagePlaceholderStyle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  followUpTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#02475b',
    opacity: 0.6,
    marginBottom: 12,
    marginTop: 4,
    letterSpacing: 0.02,
  },
  onlineIconView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicineNameTextStyle: {
    ...theme.viewStyles.text('M', 12, '#FFFFFF', 1, 20, 0.04),
    paddingHorizontal: 6,
  },
  medicineCardViewStyle: {
    backgroundColor: '#0087BA',
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 3,
    marginTop: 7,
  },
});

export interface SearchAppointmentScreenProps
  extends NavigationScreenProps<{
    allAppointments: getPatientAllAppointments_getPatientAllAppointments_activeAppointments;
    onPressBack: () => void;
  }> {}

export const SearchAppointmentScreen: React.FC<SearchAppointmentScreenProps> = (props) => {
  const [searchText, setSearchText] = useState<string>('');
  const allAppointmentsParam = props.navigation.getParam('allAppointments') || [];
  const [allAppointments, setAllAppointments] = useState<
    getPatientAllAppointments_getPatientAllAppointments_activeAppointments[]
  >([]);
  const [searchAppointments, setSearchAppointments] = useState<
    getPatientAllAppointments_getPatientAllAppointments_activeAppointments[]
  >([]);
  const [searchResultFound, setSearchResultFound] = useState(true);
  const [searchQuery, setSearchQuery] = useState({});
  const [
    appointmentItem,
    setAppoinmentItem,
  ] = useState<getPatientAllAppointments_getPatientAllAppointments_activeAppointments | null>();
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();

  useEffect(() => {
    setAllAppointments(allAppointmentsParam);
  }, []);
  const renderHeader = () => {
    return (
      <Header
        title={'SEARCH APPOINTMENTS'}
        leftIcon={'backArrow'}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => {
          props.navigation.state.params?.onPressBack &&
            props.navigation.state.params?.onPressBack();
          props.navigation.goBack();
        }}
      />
    );
  };

  const onSearchAppointments = (_searchText: string) => {
    setSearchText(_searchText);
    const searchAppointmentResult = allAppointments.filter((item) => {
      const itemData = `${item?.doctorInfo?.displayName?.toUpperCase()}${item?.doctorInfo?.specialty?.name?.toUpperCase()}`;
      const textData = _searchText?.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    if (searchText.length > 2) {
      setSearchAppointments(searchAppointmentResult);
    }
  };

  const renderSearchInput = () => {
    const rigthIconView = <></>;
    return (
      <View
        style={{
          paddingHorizontal: 0,
          backgroundColor: theme.colors.WHITE,
        }}
      >
        <SearchInput
          value={searchText}
          inputContainerStyle={styles.inputContainerStyle}
          autoFocus={true}
          onChangeText={(value) => {
            setSearchText(value);
            const search = _.debounce(onSearchAppointments, 300);
            setSearchQuery((prevSearch: any) => {
              if (prevSearch.cancel) {
                prevSearch.cancel();
              }
              return search;
            });
            search(value);
          }}
          _isSearchFocused={true}
          placeholder="Search by doctor name or speciality"
          _rigthIconView={rigthIconView}
          _itemsNotFound={false}
        />
      </View>
    );
  };

  const renderNoAppointments = () => {
    if (searchResultFound || searchAppointments?.length === 0) {
      return (
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            padding: 16,
            marginTop: 20,
            marginHorizontal: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text style={{ ...theme.viewStyles.text('M', 16, '#02475b', 1, 24, 0) }}>
              {string.home.book_appointment_question}
            </Text>
            <Button
              title={string.home.book_appointment}
              style={styles.buttonStyles}
              titleTextStyle={{ ...theme.viewStyles.text('B', 13, '#ffffff', 1, 24, 0) }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.DoctorSearch);
              }}
            />
          </View>
          <DoctorIcon />
        </View>
      );
    }
  };

  const postConsultCardEvents = (
    type: 'Card Click' | 'Continue Consult' | 'Chat with Doctor' | 'Fill Medical Details',
    data: getPatinetAppointments_getPatinetAppointments_patinetAppointments
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.CONSULT_CARD_CLICKED]
      | WebEngageEvents[WebEngageEventName.CONTINUE_CONSULT_CLICKED]
      | WebEngageEvents[WebEngageEventName.FILL_MEDICAL_DETAILS] = {
      'Doctor Name': g(data, 'doctorInfo', 'fullName')!,
      'Speciality ID': g(data, 'doctorInfo', 'specialty', 'id')!,
      'Speciality Name': g(data, 'doctorInfo', 'specialty', 'name')!,
      'Doctor Category': g(data, 'doctorInfo', 'doctorType')!,
      'Consult Date Time': moment(g(data, 'appointmentDateTime')).toDate(),
      'Consult Mode': g(data, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      'Hospital Name': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name')!,
      'Hospital City': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'city')!,
      'Consult ID': g(data, 'id')!,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(
      type == 'Card Click'
        ? WebEngageEventName.CONSULT_CARD_CLICKED
        : type == 'Continue Consult'
        ? WebEngageEventName.CONTINUE_CONSULT_CLICKED
        : WebEngageEventName.FILL_MEDICAL_DETAILS,
      eventAttributes
    );
  };

  const renderConsultationCard = (
    item: getPatientAllAppointments_getPatientAllAppointments_activeAppointments,
    index: number
  ) => {
    let tomorrowDate = moment(new Date())
      .add(1, 'days')
      .format('DD MMM');

    const getConsultationSubTexts = () => {
      return !item?.isConsultStarted
        ? string.common.fillVitalsText
        : !item?.isJdQuestionsComplete
        ? string.common.gotoConsultRoomJuniorDrText
        : string.common.gotoConsultRoomText || '';
    };

    const getAppointmentStatusText = () => {
      if (item?.status === STATUS.CANCELLED) {
        return 'Cancelled';
      } else if (item?.status === STATUS.COMPLETED) {
        return 'Completed';
      } else if (item?.appointmentState === APPOINTMENT_STATE.RESCHEDULE) {
        return 'Rescheduled';
      } else if (item?.isFollowUp === 'true') {
        return 'Follow Up Appointment';
      } else {
        return null;
      }
    };
    let appointmentDateTomarrow = moment(item.appointmentDateTime).format('DD MMM');
    const caseSheet = followUpChatDaysCaseSheet(item.caseSheet);
    const caseSheetChatDays = g(caseSheet, '0' as any, 'followUpAfterInDays');
    const followUpAfterInDays =
      caseSheetChatDays || caseSheetChatDays === '0'
        ? caseSheetChatDays === '0'
          ? 2
          : Number(caseSheetChatDays) + 1
        : 8;
    const appointmentDateTime = moment
      .utc(item.appointmentDateTime)
      .local()
      .format('YYYY-MM-DD HH:mm:ss');
    const minutes = moment.duration(moment(appointmentDateTime).diff(new Date())).asMinutes();
    const title =
      minutes > 0 && minutes <= 15
        ? `${Math.ceil(minutes)} MIN${Math.ceil(minutes) > 1 ? 'S' : ''}`
        : tomorrowDate == appointmentDateTomarrow
        ? 'TOMORROW, ' + moment(appointmentDateTime).format('h:mm A')
        : moment(appointmentDateTime).format(
            appointmentDateTime.split(' ')[0] === new Date().toISOString().split('T')[0]
              ? 'h:mm A'
              : 'DD MMM, h:mm A'
          );
    const isActive = minutes > 0 && minutes <= 15 ? true : false;
    const dateIsAfterconsult = moment(appointmentDateTime).isAfter(moment(new Date()));
    const doctorHospitalName =
      g(item, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name')! ||
      'Physical Consultation';
    const day1 = moment(appointmentDateTime)
      .startOf('day')
      .add(followUpAfterInDays, 'days'); // since we're calculating as EOD
    const day2 = moment(new Date());
    day1.diff(day2, 'days'); // 1
    const numberDaysToConsultText =
      '(' + day1.diff(day2, 'days') + (day1.diff(day2, 'days') == 1 ? ' day left)' : ' days left)');
    const pastAppointmentItem = isPastAppointment(item?.caseSheet, item);
    const medicinePrescription = g(caseSheet, '0' as any, 'medicinePrescription');
    const getMedicines = (
      medicines: (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_medicinePrescription | null)[]
    ) =>
      medicines
        ? medicines
            .filter((i) => i?.medicineName)
            .map((i) => i?.medicineName)
            .join(', ')
        : null;
    const followUpMedicineNameText = getMedicines(medicinePrescription!);
    const renderPastConsultationButtons = () => {
      const onPressPastAppointmentViewDetails = () => {
        item.appointmentType === 'ONLINE'
          ? props.navigation.navigate(AppRoutes.ChatRoom, {
              data: item,
              callType: '',
              prescription: '',
              disableChat: item.doctorInfo && pastAppointmentItem,
              fromSearchAppointmentScreen: true,
            })
          : props.navigation.navigate(AppRoutes.DoctorDetails, {
              doctorId: g(item, 'doctorId') || '',
            });
      };
      const cancelConsulations = getAppointmentStatusText() === 'Cancelled';
      return (
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 16,
            flex: 1,
            justifyContent: cancelConsulations ? 'flex-end' : 'space-between',
          }}
        >
          {cancelConsulations ? null : (
            <TouchableOpacity activeOpacity={1} onPress={onPressPastAppointmentViewDetails}>
              <Text
                style={[
                  styles.prepareForConsult,
                  {
                    paddingBottom: -16,
                  },
                ]}
              >
                {'VIEW DETAILS'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setAppoinmentItem(item);
              setdisplayoverlay(true);
            }}
          >
            <Text
              style={[
                styles.prepareForConsult,
                {
                  paddingBottom: -16,
                },
              ]}
            >
              {cancelConsulations ? 'BOOK AGAIN' : 'BOOK FOLLOW UP'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };

    const renderTextConsultButton = () => {
      const onPressTextConsult = () => {
        postConsultCardEvents('Chat with Doctor', item);
        CommonLogEvent(AppRoutes.Consult, 'Prepare for Consult clicked');
        props.navigation.navigate(AppRoutes.ChatRoom, {
          data: item,
          callType: '',
          prescription: '',
          disableChat: item.doctorInfo && pastAppointmentItem,
          fromSearchAppointmentScreen: true,
        });
      };
      return (
        <View>
          <TouchableOpacity activeOpacity={1} onPress={onPressTextConsult}>
            <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
              <ChatBlueIcon style={{ width: 20, height: 20, marginTop: 12 }} />
              <Text
                style={[
                  styles.prepareForConsult,
                  {
                    paddingBottom: -16,
                    paddingLeft: 8,
                  },
                ]}
              >
                {'TEXT CONSULT'}
              </Text>
            </View>
            {day1.diff(day2, 'days') > 0 ? (
              <View style={styles.textConsultSubtextView}>
                <Text style={styles.postConsultTextStyles1}>
                  {'You can follow up with the doctor via text '}
                </Text>

                <Text style={styles.postConsultTextStyles2}>{numberDaysToConsultText}</Text>
              </View>
            ) : (
              <View style={{ height: 16 }} />
            )}
          </TouchableOpacity>
        </View>
      );
    };

    const renderCompletedConsultButtons = () => {
      return (
        <View style={styles.completedConsultViewStyle}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setAppoinmentItem(item);
              setdisplayoverlay(true);
            }}
          >
            <Text
              style={[
                styles.prepareForConsult,
                {
                  paddingBottom: -16,
                },
              ]}
            >
              {'BOOK FOLLOW UP'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              CommonLogEvent(AppRoutes.Consult, 'Prepare for Consult clicked');
              props.navigation.navigate(AppRoutes.DoctorDetails, {
                doctorId: g(item, 'doctorId') || '',
              });
            }}
          >
            <Text
              style={[
                styles.prepareForConsult,
                {
                  paddingBottom: -16,
                },
              ]}
            >
              {'VIEW DETAILS'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };

    const renderActiveUpcomingConsultButton = () => {
      const onPressActiveUpcomingButtons = () => {
        postConsultCardEvents(
          item.isConsultStarted ? 'Continue Consult' : 'Fill Medical Details',
          item
        );
        CommonLogEvent(AppRoutes.Consult, 'Prepare for Consult clicked');
        if (item.doctorInfo && !pastAppointmentItem) {
          CommonLogEvent(AppRoutes.Consult, 'Chat Room Move clicked');
          props.navigation.navigate(AppRoutes.ChatRoom, {
            data: item,
            callType: '',
            prescription: '',
            fromSearchAppointmentScreen: true,
          });
        }
      };
      return (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            activeOpacity={1}
            style={{ flex: 1 }}
            onPress={onPressActiveUpcomingButtons}
          >
            <Text
              style={[
                styles.prepareForConsult,
                {
                  opacity: 1,
                  paddingBottom: 0,
                },
              ]}
            >
              {item.isConsultStarted
                ? string.common.continueConsult
                : string.common.prepareForConsult}
            </Text>
            <Text style={styles.fillVitalsForConsult}>{getConsultationSubTexts()}</Text>
          </TouchableOpacity>
        </View>
      );
    };

    const renderPickAnotherButton = () => {
      const onPressPickAnotherSlot = () => {
        CommonLogEvent(AppRoutes.Consult, 'Consult RESCHEDULE clicked');
        if (item.doctorInfo) {
          item.appointmentType === 'ONLINE'
            ? props.navigation.navigate(AppRoutes.AppointmentOnlineDetails, {
                data: item,
                from: 'notification',
              })
            : props.navigation.navigate(AppRoutes.AppointmentDetails, {
                data: item,
                from: 'notification',
              });
        }
      };
      return (
        <>
          <View style={styles.pickAnotherSlotViewStyle}>
            <Text style={{ ...theme.viewStyles.text('M', 12, '#890000', 1, 18, 0.04) }}>
              {string.common.pickAnotherSlotText}
            </Text>
          </View>
          <TouchableOpacity activeOpacity={1} onPress={onPressPickAnotherSlot}>
            <Text style={styles.prepareForConsult}>PICK ANOTHER SLOT</Text>
          </TouchableOpacity>
        </>
      );
    };

    const onPressDoctorCardClick = () => {
      postConsultCardEvents('Card Click', item);
      CommonLogEvent(AppRoutes.Consult, `Consult ${item.appointmentType} clicked`);
      if (item.doctorInfo && !pastAppointmentItem) {
        item.appointmentType === 'ONLINE'
          ? props.navigation.navigate(AppRoutes.AppointmentOnlineDetails, {
              data: item,
              from: 'Consult',
            })
          : props.navigation.navigate(AppRoutes.AppointmentDetails, {
              data: item,
              from: 'Consult',
            });
      }
    };

    const renderDoctorImage = () => {
      return (
        <View style={styles.imageView}>
          {!!g(item, 'doctorInfo', 'thumbnailUrl') ? (
            <Image
              style={styles.doctorImageStyle}
              source={{ uri: item.doctorInfo!.thumbnailUrl! }}
              resizeMode={'contain'}
            />
          ) : (
            <DoctorPlaceholderImage
              style={styles.doctorImagePlaceholderStyle}
              resizeMode={'contain'}
            />
          )}
        </View>
      );
    };

    return (
      <View>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.doctorView]}
          onPress={onPressDoctorCardClick}
        >
          <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  position: 'absolute',
                  left: 18,
                  top: 6,
                  ...theme.viewStyles.text(
                    'M',
                    10,
                    getAppointmentStatusText() === 'Cancelled' ? '#DB0404' : '#0087BA',
                    1,
                    13
                  ),
                }}
              >
                {getAppointmentStatusText()}
              </Text>
              {item.isFollowUp == 'true' ? (
                <CapsuleView
                  title={item.appointmentType}
                  style={styles.availableView}
                  isActive={isActive}
                />
              ) : (
                <CapsuleView title={title} style={styles.availableView} isActive={isActive} />
              )}
              {renderDoctorImage()}
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={styles.doctorNameStyles} numberOfLines={1}>
                  {item.doctorInfo ? `${item.doctorInfo.displayName}` : ''}
                </Text>
                {item.isFollowUp == 'true' ? (
                  <Text style={styles.followUpTextStyle}>
                    {moment(appointmentDateTime).format('DD MMM YYYY')}
                  </Text>
                ) : (
                  <Text style={styles.doctorSpecializationStyles}>
                    {item.doctorInfo && item.doctorInfo.specialty
                      ? item.doctorInfo.specialty.name.toUpperCase()
                      : ''}
                    {item.doctorInfo
                      ? ` | ${item.doctorInfo.experience} YR${
                          Number(item.doctorInfo.experience) > 1 ? 'S' : ''
                        }`
                      : ''}
                  </Text>
                )}
                <View style={styles.separatorStyle} />
                <View style={styles.onlineIconView}>
                  <Text style={styles.consultTextStyles}>
                    {item.appointmentType === 'ONLINE' ? 'Online Consultation' : doctorHospitalName}
                  </Text>
                  {item.appointmentType === 'ONLINE' ? (
                    <CTLightGrayVideo style={{ marginTop: 13, height: 19, width: 19 }} />
                  ) : (
                    <PhysicalConsultDarkBlueIcon
                      style={{ marginTop: 13, height: 14.4, width: 12 }}
                    />
                  )}
                </View>
              </View>
            </View>
            <View style={[styles.separatorStyle, { marginHorizontal: 16 }]} />
            {item?.isFollowUp === 'true' && followUpMedicineNameText ? (
              <View style={{ marginHorizontal: 16, marginTop: 6 }}>
                <Text style={{ ...theme.viewStyles.text('M', 12, '#02475B', 1, 20, 0.03) }}>
                  {'Previous Prescription'}
                </Text>
                <ListItem
                  title={followUpMedicineNameText}
                  titleProps={{ numberOfLines: 1 }}
                  titleStyle={styles.medicineNameTextStyle}
                  pad={0}
                  containerStyle={styles.medicineCardViewStyle}
                  leftAvatar={<PreviousPrescriptionIcon style={{ height: 24, width: 22.5 }} />}
                  rightAvatar={<WhiteArrowRightIcon style={{ height: 24, width: 24 }} />}
                />
              </View>
            ) : null}
            {item.status == STATUS.PENDING ||
            item.status == STATUS.IN_PROGRESS ||
            item.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
            item.status == STATUS.NO_SHOW ||
            item.status == STATUS.CALL_ABANDON ? (
              <View>
                {item.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
                item.status == STATUS.NO_SHOW ||
                item.status == STATUS.CALL_ABANDON
                  ? renderPickAnotherButton()
                  : pastAppointmentItem
                  ? renderPastConsultationButtons()
                  : renderActiveUpcomingConsultButton()}
              </View>
            ) : pastAppointmentItem ? (
              renderPastConsultationButtons()
            ) : item.appointmentType === 'ONLINE' ? (
              renderTextConsultButton()
            ) : (
              renderCompletedConsultButtons()
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderConsultations = () => {
    return (
      <FlatList
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{
          padding: 12,
          paddingTop: 0,
          marginTop: 20,
        }}
        ListFooterComponent={() => <View style={{ height: 20 }} />}
        data={searchText?.length > 2 ? searchAppointments : []}
        bounces={false}
        removeClippedSubviews={true}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={renderNoAppointments()}
        renderItem={({ item, index }) => renderConsultationCard(item, index)}
      />
    );
  };

  const renderConsultOverlay = () => {
    return (
      displayoverlay &&
      appointmentItem && (
        <ConsultOverlay
          mainContainerStyle={{ maxHeight: height - 200 }}
          setdisplayoverlay={() => setdisplayoverlay(false)}
          navigation={props.navigation}
          doctor={appointmentItem?.doctorInfo || null}
          patientId={currentPatient ? currentPatient.id : ''}
          clinics={appointmentItem?.doctorInfo?.doctorHospital || []}
          doctorId={appointmentItem?.doctorId}
          appointmentId={appointmentItem?.id}
          consultModeSelected={ConsultMode.ONLINE}
          externalConnect={null}
          availableMode={ConsultMode.BOTH}
          callSaveSearch={'true'}
        />
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      <View style={styles.headerSearchInputShadow}>
        {renderHeader()}
        {renderSearchInput()}
      </View>
      {renderConsultations()}
      {renderConsultOverlay()}
    </SafeAreaView>
  );
};
