import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  permissionHandler,
  storagePermissions,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import DeviceInfo from 'react-native-device-info';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  dataSavedUserID,
  g,
  getNetStatus,
  isValidSearch,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  getAge,
  takeToHomePage,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import RNFetchBlob from 'rn-fetch-blob';
import {
  ActivityIndicator,
  Text,
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
  Linking,
  Clipboard,
  BackHandler,
} from 'react-native';
import { Apollo247Icon, ShareYellowDocIcon, ShareIcon, Apollo247, Copy } from '../ui/Icons';
import { useApolloClient } from 'react-apollo-hooks';
import QRCode from 'react-native-qrcode-svg';
import HTML from 'react-native-render-html';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  buildVaccineApolloClient,
  vaccinationADMINBaseUrl,
  vaccineBookingPDFBaseUrl,
} from '../Vaccination/VaccinationApolloClient';
import {
  DOSE_NUMBER,
  PAYMENT_TYPE,
  VACCINE_BOOKING_SOURCE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  GET_VACCINATION_APPOINMENT_DETAILS,
  CANCEL_VACCINATION_APPOINTMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetAppointmentDetails,
  GetAppointmentDetailsVariables,
} from '../../graphql/types/GetAppointmentDetails';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { renderVaccineDetailShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';

import moment from 'moment';
import {
  CancelAppointment,
  CancelAppointmentVariables,
} from '../../graphql/types/cancelAppointment';
import { GET_VACCINE_BOOKING_LIMIT } from '@aph/mobile-patients/src/graphql/profiles';

import {
  GetBenefitAvailabilityInfoByCMSIdentifier,
  GetBenefitAvailabilityInfoByCMSIdentifierVariables,
} from '../../graphql/types/GetBenefitAvailabilityInfoByCMSIdentifier';

import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Spinner } from '../ui/Spinner';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

const styles = StyleSheet.create({
  detailTitle: {
    ...theme.viewStyles.text('R', 14, theme.colors.SHERPA_BLUE),
    flex: 3,
  },
  detailValue: {
    ...theme.viewStyles.text('B', 14, theme.colors.SHERPA_BLUE),
    flex: 4,
  },
  detailSubInfo: {
    ...theme.viewStyles.text('L', 12, '#000', 0.5),
    marginTop: 5,
    marginRight: 20,
  },
  confirmationDetailContainer: {
    marginHorizontal: 20,
  },
  successTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 28, '#00B38E'),
    marginTop: 14,
  },
  cancelledTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 28, '#890000'),
    marginTop: 14,
  },
  bookingConfirmationStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('R', 16, '#02475B'),
    marginBottom: 0,
    marginTop: 6,
  },

  orderDetailsStyle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE),
    marginBottom: 17,
  },
  statusStripContainerSuccess: {
    marginVertical: 15,
    backgroundColor: '#00B38E40',
    flexDirection: 'row',
    marginLeft: -20,
    marginRight: -20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 6,
    paddingBottom: 6,
  },
  statusStripLabel: {
    ...theme.viewStyles.text('M', 14, '#02475B'),
    flex: 3,
  },
  statusStripValue: {
    ...theme.viewStyles.text('M', 14, '#02475B'),
    flex: 4,
  },

  userDetailHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },

  userDetailHeaderTitle: {
    marginVertical: 2,
    ...theme.viewStyles.text('M', 14, '#0087BA'),
  },
  userDetailHeaderSubTitle: {
    marginVertical: 2,
    ...theme.viewStyles.text('R', 12, '#01475B'),
  },
  bold: {
    fontWeight: 'bold',
  },
  separatorStyle: {
    height: 0.5,
    width: '110%',
    marginTop: 11,
    backgroundColor: '#D6CEE3',
  },
  qrCodeContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    marginTop: 10,
  },
  alternatePhoneNumberContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
  },
  phoneInput: { paddingBottom: 5, marginTop: 10 },
  phoneInputContainer: { marginBottom: 10 },
  resendSMSContainer: {
    marginTop: 23,
    marginHorizontal: 21,
  },
  yellowCTA: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: theme.colors.APP_YELLOW,
  },
  resendContainer: {
    alignSelf: 'flex-end',
  },
  resendText: {
    ...theme.viewStyles.text('R', 14, '#01475B'),
  },
  actionFooterContainer: {
    marginHorizontal: 18,
    marginTop: 24,
    marginBottom: 200,
  },
  actionFooterCTAContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionFooterCTA: {
    width: '60%',
    alignSelf: 'center',
  },
  registerOnCowin: {
    alignSelf: 'center',
    marginVertical: 16,
  },
  tncText: {
    ...theme.viewStyles.text('R', 14, '#95B1B7'),
  },
  errorTitle: {
    margin: 5,
    ...theme.viewStyles.text('M', 14, '#01475B'),
  },
  errorInfo: {
    ...theme.viewStyles.text('R', 12, '#01475B'),
    margin: 5,
  },
  qrCodeLinkContainer: {
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 16,
  },
  qrCodeLinkText: {
    ...theme.viewStyles.text('R', 10, '#01475B'),
    textAlign: 'center',
  },
  importantInfoContainer: {
    margin: 20,
    borderWidth: 1,
    borderColor: '#00B38E',
    borderRadius: 8,
    padding: 10,
  },
  importantHeader: { ...theme.viewStyles.text('B', 16, '#02475B', 1, 30, 0.35), marginBottom: 10 },
  importantSubHeader: {
    ...theme.viewStyles.text('SB', 15, '#00B38E', 1, 18, 0.35),
    marginBottom: 10,
  },
  impInstructionContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  impInstructionHeading: {
    ...theme.viewStyles.text('SB', 16, '#02475B', 1, 25, 0.35),
    marginBottom: 10,
  },
  impInstructionsText: {
    ...theme.viewStyles.text('R', 14, '#02475B', 1, 18, 0.35),
  },
  homepageCta: {
    ...theme.viewStyles.text('B', 14, '#FC9916', 1, 25, 0.35),
    textAlign: 'center',
    marginBottom: 10,
  },
  generatePDFContainer: {
    marginVertical: 10,
    marginHorizontal: 16,
    alignContent: 'flex-end',
  },
  generatePDFCta: {
    ...theme.viewStyles.text('B', 14, '#FC9916', 1, 25, 0.35),
    alignSelf: 'flex-end',
  },
  headerBannerContainer: {
    height: 260,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  apollo247Icon: {
    width: 48,
    height: 48,
    marginTop: 10,
    marginLeft: 20,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  copyIcon: {
    width: 12,
    height: 12,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
});

const BOOKING_STATUS = {
  BOOKED: 'BOOKED',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
};
export interface VaccineBookingConfirmationScreenProps extends NavigationScreenProps<{}> {
  appointmentId: string;
  displayId: number;
}

export const VaccineBookingConfirmationScreen: React.FC<VaccineBookingConfirmationScreenProps> = (
  props
) => {
  const appointmentId = props.navigation.getParam('appointmentId');
  const [displayId, setDisplayId] = useState<number>(props.navigation.getParam('displayId'));
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [resendSMSPhoneNumber, setResendSMSPhoneNumber] = useState('');
  const [bookingInfo, setBookingInfo] = useState<any>();
  const [qrCodeLink, setQRCodeLink] = useState<any>();

  const [isCorporateUser, setCorporateUser] = useState<boolean>(false);
  const cancellationThreshholdPreVaccination =
    AppConfig.Configuration.Cancel_Threshold_Pre_Vaccination || 12;
  const [bookingStartTime, setBookingStartTime] = useState<any>();

  const { showAphAlert, hideAphAlert } = useUIElements();

  const { authToken } = useAuth();
  const apolloVaccineClient = buildVaccineApolloClient(authToken);
  const client = useApolloClient();

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    takeToHomePage(props);
    return true;
  };

  const fetchVaccineBookingDetails = () => {
    setLoading(true);
    apolloVaccineClient
      .query<GetAppointmentDetails>({
        query: GET_VACCINATION_APPOINMENT_DETAILS,
        variables: {
          appointment_id: appointmentId,
        },
        fetchPolicy: 'no-cache',
        context: { headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() } },
      })
      .then((response) => {
        setBookingInfo(response?.data?.GetAppointmentDetails?.response);
        setDisplayId(response?.data?.GetAppointmentDetails?.response?.display_id || 0);
        setBookingStartTime(
          response?.data?.GetAppointmentDetails?.response?.resource_session_details?.start_date_time
        );

        setCorporateUser(
          response?.data?.GetAppointmentDetails?.response?.resource_session_details?.resource_detail
            ?.is_corporate_site || false
        );
      })
      .catch((error) => {})
      .finally(() => {
        setLoading(false);
      });
  };

  const cancelVaccination = () => {
    setLoading(true);
    apolloVaccineClient
      .mutate<CancelAppointment, CancelAppointmentVariables>({
        mutation: CANCEL_VACCINATION_APPOINTMENT,
        variables: {
          appointment_id: appointmentId,
          display_id: displayId,
        },
        fetchPolicy: 'no-cache',
        context: { headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() } },
      })
      .then((response) => {
        if (response.data?.CancelAppointment.success) {
          //successfully cancelled
          if (bookingInfo?.payment_type == PAYMENT_TYPE.IN_APP_PURCHASE) {
            let message =
              'Your booking has been cancelled. Your refund against Booking #' +
              displayId +
              ' has  been initiated from our end. It takes 4-5 working days for processing.';
            showAphAlert!({
              title: 'Hi ,',
              description: message,
            });
          }

          fetchVaccineBookingDetails();
          postBookingCancellationEvent();
        } else {
          showAphAlert!({
            title: string.vaccineBooking.error_title,
            description: string.vaccineBooking.error_cancel_message,
          });
        }
      })
      .catch((error) => {
        showAphAlert!({
          title: string.vaccineBooking.error_title,
          description: string.vaccineBooking.error_cancel_message,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const postBookingCancellationEvent = () => {
    try {
      const eventAttributes = {
        Source: VACCINE_BOOKING_SOURCE.MOBILE,
        'Customer ID': bookingInfo?.patient_info?.id,
        'Cancelled By': 'User',
        'Booking Id': bookingInfo?.display_id,
        'Vaccination Hospital': bookingInfo?.resource_session_details?.resource_detail?.name,
        'Vaccination City': bookingInfo?.resource_session_details?.resource_detail?.city,
        'Vaccination Site':
          (bookingInfo?.resource_session_details?.resource_detail?.name || '') +
          (bookingInfo?.resource_session_details?.resource_detail?.street_line1 || '') +
          (bookingInfo?.resource_session_details?.resource_detail?.street_line2 || '') +
          (bookingInfo?.resource_session_details?.resource_detail?.street_line3 || '') +
          ' , ' +
          (bookingInfo?.resource_session_details?.resource_detail?.city || '') +
          ' , ' +
          (bookingInfo?.resource_session_details?.resource_detail?.state || ''),
        'Customer First Name': bookingInfo?.patient_info?.firstName.trim(),
        'Customer Last Name': bookingInfo?.patient_info?.lastName.trim(),
        'Customer UHID': bookingInfo?.patient_info?.uhid,
        'Mobile Number': bookingInfo?.patient_info?.mobileNumber,
        'Date Time': moment(bookingInfo?.resource_session_details?.start_date_time).toDate(),
        Date: moment(bookingInfo?.resource_session_details?.start_date_time).format('DD MMM,YYYY'),
        Slot: bookingInfo?.resource_session_details?.session_name,
        'Time Slot': bookingInfo?.resource_session_details?.session_name,
        Dose: bookingInfo?.dose_number,
      };

      postWebEngageEvent(WebEngageEventName.VACCINATION_CANCELLATION, eventAttributes);
    } catch (error) {}
  };

  const showAlertMessage = (title: string, message: string) => {
    showAphAlert &&
      showAphAlert({
        title: title,
        unDismissable: true,
        description: message,
        onPressOk: () => {
          hideAphAlert!();
        },
      });
  };

  const showCancelationAlert = () => {
    var startTime = moment(bookingStartTime);
    var nowTime = moment(new Date());
    var duration = moment.duration(startTime.diff(nowTime)).asHours();

    if (duration < cancellationThreshholdPreVaccination) {
      //cannot cancel
      let message = '';
      if (isCorporateUser) {
        message =
          'Cancellation is not allowed on this booking as you have surpassed the cancellation period. \nCancellation is only allowed till ' +
          cancellationThreshholdPreVaccination +
          ' hours before the scheduled vaccination slot time.';
      } else {
        message =
          'Cancellation & refund is not allowed on this booking as you have surpassed the cancellation period. \nCancellation is only allowed till ' +
          cancellationThreshholdPreVaccination +
          ' hours before the scheduled vaccination slot time.';
      }

      showAlertMessage('Oops! ', message);
    } else {
      //can cancel
      showAphAlert!({
        title: 'Hi, ',
        description: 'Are you sure you want to cancel your booking?',
        CTAs: [
          {
            text: 'Yes',
            onPress: () => {
              hideAphAlert!();
              cancelVaccination();
            },
            type: 'white-button',
          },
          {
            text: 'No',
            onPress: () => {
              hideAphAlert!();
            },
            type: 'orange-button',
          },
        ],
      });
    }
  };

  useEffect(() => {
    fetchVaccineBookingDetails();

    setQRCodeLink(vaccinationADMINBaseUrl + 'booking-confirmation/' + displayId);
  }, []);

  const renderHeader = (props) => {
    return (
      <Header
        leftIcon="backArrow"
        title=" "
        rightComponent={renderCancelHeaderCTA(bookingInfo)}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

  const renderCancelHeaderCTA = (bookingInfo: any) => {
    if (
      bookingInfo?.status == BOOKING_STATUS.CANCELLED ||
      bookingInfo?.status == BOOKING_STATUS.REJECTED ||
      bookingInfo?.status == BOOKING_STATUS.COMPLETED
    ) {
      return null;
    }
    return (
      <TouchableOpacity
        onPress={() => {
          showCancelationAlert();
        }}
      >
        <Text style={styles.yellowCTA}>{string.vaccineBooking.cancel_booking}</Text>
      </TouchableOpacity>
    );
  };

  const renderHeaderBanner = () => {
    return (
      <View
        style={[
          styles.headerBannerContainer,
          {
            backgroundColor:
              bookingInfo?.status == BOOKING_STATUS.CANCELLED ||
              bookingInfo?.status == BOOKING_STATUS.REJECTED
                ? '#edc6c2'
                : '#00B38E40',
          },
        ]}
      >
        <Apollo247Icon style={styles.apollo247Icon} />

        <View style={styles.qrCodeContainer}>
          <QRCode
            value={qrCodeLink}
            size={200}
            backgroundColor="transparent"
            logoBackgroundColor="#fff"
          />

          <TouchableOpacity
            style={styles.qrCodeLinkContainer}
            onPress={() => {
              try {
                Clipboard.setString(qrCodeLink);
                showAlertMessage('Copied! ', 'Link ' + qrCodeLink + ' copied to clipboard.');
              } catch (error) {}
            }}
          >
            <Text style={styles.qrCodeLinkText}>{qrCodeLink}</Text>
            <Copy style={styles.copyIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBookingDetailsMatrixItem = (title: string, value: string) => {
    return (
      <View style={{ flexDirection: 'row', marginVertical: 3 }}>
        <Text style={styles.detailTitle}>{title}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  const renderStatusStrip = () => {
    return (
      <View
        style={[
          styles.statusStripContainerSuccess,
          {
            backgroundColor:
              bookingInfo?.status == BOOKING_STATUS.CANCELLED ||
              bookingInfo?.status == BOOKING_STATUS.REJECTED
                ? '#edc6c2'
                : '#00B38E40',
          },
        ]}
      >
        <Text style={styles.statusStripLabel}>Status</Text>
        <Text style={styles.statusStripValue}>{bookingInfo?.status}</Text>
      </View>
    );
  };

  // Intentionally kept for future case
  const renderResendSMS = () => {
    return (
      <View style={styles.resendSMSContainer}>
        <Text style={styles.orderDetailsStyle}>
          {string.vaccineBooking.resend_vaccine_booking_sms}
        </Text>
        <Text style={styles.resendText}>{string.vaccineBooking.resend_confirmation_message}</Text>
        <TextInputComponent
          placeholder={'Enter alternate phone number'}
          value={resendSMSPhoneNumber}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(text: string) => _setResendPhoneNumber(text)}
          inputStyle={styles.phoneInput}
          conatinerstyles={styles.phoneInputContainer}
        />

        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.resendContainer}>
          <Text style={styles.yellowCTA}>SEND</Text>
        </TouchableOpacity>

        <View style={[styles.separatorStyle, { width: '100%' }]} />
      </View>
    );
  };

  //Intentionally Kept for future
  const _setResendPhoneNumber = (value: string) => {
    const trimmedValue = (value || '').trim();
    // setEmail(trimmedValue);
    // setEmailValidation(isSatisfyingEmailRegex(trimmedValue));
  };

  const renderConfirmationDetails = () => {
    return (
      <View style={styles.confirmationDetailContainer}>
        {bookingInfo?.status == BOOKING_STATUS.BOOKED ? (
          <Text style={styles.successTextStyle}>SUCCESS! </Text>
        ) : null}

        {bookingInfo?.status == BOOKING_STATUS.CANCELLED ? (
          <Text style={styles.cancelledTextStyle}>CANCELLED! </Text>
        ) : null}

        <Text style={styles.bookingConfirmationStyle}>
          Your booking has been {bookingInfo?.status.toLowerCase()}.
        </Text>

        {renderUserDetailHeader()}

        <Text style={styles.orderDetailsStyle}>{string.vaccineBooking.appointment_details}</Text>

        {bookingInfo?.display_id
          ? renderBookingDetailsMatrixItem(
              string.vaccineBooking.booking_number,
              bookingInfo?.display_id
            )
          : null}
        {renderBookingDetailsMatrixItem(
          string.vaccineBooking.site,
          (bookingInfo?.resource_session_details?.resource_detail?.name || '') +
            (bookingInfo?.resource_session_details?.resource_detail?.street_line1 || '') +
            (bookingInfo?.resource_session_details?.resource_detail?.street_line2 || '') +
            (bookingInfo?.resource_session_details?.resource_detail?.street_line3 || '') +
            ' , ' +
            (bookingInfo?.resource_session_details?.resource_detail?.city || '') +
            ' , ' +
            (bookingInfo?.resource_session_details?.resource_detail?.state || '')
        )}

        {renderBookingDetailsMatrixItem(
          string.vaccineBooking.station,
          bookingInfo?.resource_session_details?.station_name || '-'
        )}

        {bookingInfo?.resource_session_details?.start_date_time
          ? renderBookingDetailsMatrixItem(
              string.vaccineBooking.date_of_vaccination,
              moment(bookingInfo?.resource_session_details?.start_date_time).format('DD MMM, YYYY')
            )
          : null}
        {renderBookingDetailsMatrixItem(
          string.vaccineBooking.slot_title,
          bookingInfo?.resource_session_details?.session_name
        )}
        {renderBookingDetailsMatrixItem(string.vaccineBooking.dose_title, bookingInfo?.dose_number)}

        {bookingInfo?.resource_session_details?.vaccine_type
          ? renderBookingDetailsMatrixItem(
              string.vaccineBooking.vaccine_type,
              bookingInfo?.resource_session_details?.vaccine_type
            )
          : null}

        {bookingInfo?.resource_session_details?.selling_price
          ? renderBookingDetailsMatrixItem(
              string.vaccineBooking.amount,
              '₹' + bookingInfo?.resource_session_details?.selling_price
            )
          : null}

        {renderBookingDetailsMatrixItem(
          string.vaccineBooking.mode,
          bookingInfo?.payment_type == PAYMENT_TYPE.IN_APP_PURCHASE
            ? 'Payment'
            : bookingInfo?.payment_type
        )}

        {renderStatusStrip()}

        <View style={[styles.separatorStyle, { width: '100%' }]} />
      </View>
    );
  };

  const renderUserDetailHeader = () => {
    return (
      <View style={styles.userDetailHeaderContainer}>
        <Text style={styles.userDetailHeaderTitle}>
          {bookingInfo?.patient_info?.firstName + ' ' + bookingInfo?.patient_info?.lastName},{' '}
          {bookingInfo?.patient_info?.gender}, {bookingInfo?.patient_info?.age}
        </Text>
        <Text style={styles.userDetailHeaderSubTitle}>
          UHID Number:<Text style={styles.bold}> {bookingInfo?.patient_info?.uhid} </Text>
        </Text>

        <View style={styles.separatorStyle} />
      </View>
    );
  };

  const renderError = () => {
    return (
      <View style={{ justifyContent: 'center', marginTop: 100, padding: 20 }}>
        <Apollo247 />
        <Text style={styles.errorTitle}>
          Oops, couldn't get the details for this booking. Please recheck internet connectio and try
          again.
        </Text>
        <Text style={styles.errorInfo}>Booking ID : {appointmentId}</Text>
        <Text style={styles.errorInfo}>Display ID :{displayId} </Text>

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props.navigation.goBack();
          }}
          style={styles.registerOnCowin}
        >
          <Text style={styles.yellowCTA}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderImportantInfo = () => {
    return (
      <View style={styles.importantInfoContainer}>
        <Text style={styles.importantHeader}>Important: Next Step</Text>
        <Text style={styles.importantSubHeader}>{string.vaccineBooking.govt_guidlines_text_1}</Text>
        <Text style={theme.viewStyles.text('R', 13, '#02475B', 1, 19, 0.35)}>
          {'\u25CF  '}
          {string.vaccineBooking.govt_guidlines_text_2}
        </Text>
        <Text style={theme.viewStyles.text('R', 13, '#02475B', 1, 19, 0.35)}>
          {'\u25CF  '}
          {string.vaccineBooking.govt_guidlines_text_3}
        </Text>
        <Button
          title={'REGISTER ON COWIN'}
          style={[styles.actionFooterCTA, { marginTop: 15 }]}
          onPress={() => {
            //Linking.openURL(string.vaccineBooking.cowin_url).catch((err) => {});
            props.navigation.navigate(AppRoutes.CowinRegistration);
          }}
          disabled={bookingInfo?.status == BOOKING_STATUS.CANCELLED ? true : false}
        />
      </View>
    );
  };

  const renderInstructionForTheDayBlock = () => {
    return (
      <View style={styles.impInstructionContainer}>
        <Text style={styles.impInstructionHeading}>
          {string.vaccineBooking.instruction_heading}
        </Text>
        <Text style={[styles.impInstructionsText, { marginBottom: 10 }]}>
          {string.vaccineBooking.instruction_sub_heading}
        </Text>
        {string.vaccineBooking.instuction_document_list?.map((value: string) => {
          return (
            <Text style={styles.impInstructionsText}>
              {'\u25CF  '}
              {value}
            </Text>
          );
        })}
        <Text style={[styles.impInstructionsText, { marginVertical: 10 }]}>
          For detailed list of instructions and FAQs,{' '}
          <Text
            onPress={() => {
              Linking.openURL(string.vaccineBooking.vaccination_instruction_url).catch((err) => {});
            }}
            style={theme.viewStyles.text('SB', 14, '#FC9916', 1, 18, 0.35)}
          >
            CLICK HERE
          </Text>
        </Text>
        <Text
          onPress={() => {
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
              })
            );
          }}
          style={styles.homepageCta}
        >
          GO TO HOMEPAGE
        </Text>
      </View>
    );
  };

  const generatePDF = async (htmlText: any) => {
    let options = {
      html: htmlText,
      fileName: 'apollo_vaccine_booking_' + displayId,
      directory: 'Download',
    };

    let file = await RNHTMLtoPDF.convert(options);
    return file;
  };

  const fetchHTMLText = () => {
    setPdfLoading(true);

    fetch(vaccineBookingPDFBaseUrl + bookingInfo?.id)
      .then((resp) => {
        return resp.text();
      })
      .then((text) => {
        setPdfLoading(true);
        generatePDF(text)
          .then((file) => {
            showAphAlert!({
              title: 'Great !',
              description: string.vaccineBooking.success_generate_pdf,
              showCloseIcon: true,
              onCloseIconPress: () => {
                hideAphAlert!();
              },
              CTAs: [
                {
                  text: 'OPEN',
                  onPress: () => {
                    try {
                      hideAphAlert!();
                      Platform.OS === 'ios'
                        ? RNFetchBlob.ios.previewDocument(file.filePath)
                        : RNFetchBlob.android.actionViewIntent(file.filePath, 'application/pdf');
                    } catch (error) {
                      showAphAlert!({
                        title: 'Oops !',
                        description: "Can't open file .",
                      });
                    }
                  },
                },
              ],
            });
          })
          .catch((error) => {
            showAphAlert!({
              title: 'Oops !',
              description: string.vaccineBooking.unable_to_generate_pdf,
            });
          })
          .finally(() => {
            setPdfLoading(false);
          });
      })
      .catch((error) => {
        setPdfLoading(false);
        showAphAlert!({
          title: 'Oops !',
          description: string.vaccineBooking.unable_to_generate_pdf,
        });
      })
      .finally(() => {});
  };

  const renderGeneratePDFCTA = () => {
    return (
      <TouchableOpacity
        style={styles.generatePDFContainer}
        onPress={() => {
          setTimeout(() => {
            if (Platform.OS === 'android') {
              storagePermissions(() => {
                fetchHTMLText();
              });
            } else {
              fetchHTMLText();
            }
          }, 100);
        }}
      >
        <Text style={styles.generatePDFCta}> {string.vaccineBooking.booking_detail_pdf}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[theme.viewStyles.container, { backgroundColor: '#fff' }]}>
        {renderHeader(props)}
        {loading ? (
          renderVaccineDetailShimmer()
        ) : bookingInfo == undefined ? (
          renderError()
        ) : (
          <>
            <ScrollView>
              {renderHeaderBanner()}
              {renderConfirmationDetails()}
              {renderGeneratePDFCTA()}

              {/* Intententionally kept for future case  */}
              {/* {bookingInfo?.status != BOOKING_STATUS.CANCELLED ? renderResendSMS() : null} */}

              {renderImportantInfo()}
              {renderInstructionForTheDayBlock()}
            </ScrollView>
          </>
        )}
        {pdfLoading ? <Spinner /> : null}
      </SafeAreaView>
    </View>
  );
};