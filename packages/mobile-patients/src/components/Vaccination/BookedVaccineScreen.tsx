import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import AsyncStorage from '@react-native-community/async-storage';
import { default as Moment, default as moment } from 'moment';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import DeviceInfo from 'react-native-device-info';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Props as BreadcrumbProps } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import {
  Text,
  Platform,
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { PAYMENT_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  GetAllUserSubscriptionsWithPlanBenefitsV2,
  GetAllUserSubscriptionsWithPlanBenefitsV2Variables,
} from '@aph/mobile-patients/src/graphql/types/GetAllUserSubscriptionsWithPlanBenefitsV2';

import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { renderVaccineBookingListShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { useApolloClient } from 'react-apollo-hooks';
import { postWebEngageEvent, getAge } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  AgentIcon,
  CurrencyIcon,
  Location,
  MaleIcon,
  FemaleIcon,
  SyringLarge,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  CalendarShow,
  CovidVaccine,
  NoVaccineBooking,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NavigationScreenProps } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { buildVaccineApolloClient } from '@aph/mobile-patients/src/components/Vaccination/VaccinationApolloClient';
import { GetAllAppointments } from '@aph/mobile-patients/src/graphql/types/GetAllAppointments';
import {
  GET_ALL_VACCINATION_APPOINTMENTS,
  GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetBenefitAvailabilityInfoByCMSIdentifier } from '@aph/mobile-patients/src/graphql/types/GetBenefitAvailabilityInfoByCMSIdentifier';
import { colors } from '../../theme/colors';

export interface BookedVaccineScreenProps
  extends NavigationScreenProps<{
    breadCrumb: BreadcrumbProps['links'];
    cmsIdentifier?: string;
    subscriptionId?: string;
    subscriptionInclusionId?: string;
    isCorporateSubscription?: boolean;
    isVaccineSubscription?: boolean;
    comingFrom?: string;
  }> {}

const styles = StyleSheet.create({
  orangeCTA: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: theme.colors.APP_YELLOW,
    alignSelf: 'flex-end',
  },
  noBookingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedContainer: {
    marginTop: 50,
  },
  poceedInfoText: {
    ...theme.viewStyles.text('M', 13, theme.colors.SHERPA_BLUE),
    textAlign: 'center',
    marginHorizontal: 32,
  },

  poceedErrorText: {
    ...theme.viewStyles.text('R', 13, '#890000'),
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 16,
  },
  proceedButton: {
    width: 300,
    marginTop: 16,
    marginHorizontal: 40,
    alignSelf: 'center',
    marginBottom: 24,
  },

  noBookingTitle: {
    marginTop: 25,
    ...theme.viewStyles.text('M', 20, '#646464'),
  },

  somethingWentWrong: {
    ...theme.viewStyles.text('R', 14, colors.RED),
    textAlign: 'center',
  },
  tryRefresh: {
    marginTop: 10,
    ...theme.viewStyles.text('M', 16, colors.APP_YELLOW),
  },

  noBookingDesc: {
    marginTop: 10,
    ...theme.viewStyles.text('R', 14, '#A8A9A4'),
    textAlign: 'center',
    marginHorizontal: 50,
  },

  reatilBookingDesc: {
    marginTop: 10,
    ...theme.viewStyles.text('M', 16, '#A8A9A4'),
    textAlign: 'center',
    marginHorizontal: 50,
  },

  bookingListContainer: {
    flex: 1,
    width: '100%',
    //paddingHorizontal: -100,
    //marginHorizontal: -100,
  },

  bookingItemCardContainer: {
    ...theme.viewStyles.cardViewStyle,
    paddingHorizontal: 21,
    paddingVertical: 23,
    marginTop: 7,
    marginHorizontal: 16,
    marginBottom: 7,
  },

  divider: {
    height: 0.5,
    marginVertical: 13,
    backgroundColor: '#D6CEE3',
  },
  bookedUserInfo: {
    marginLeft: 16,
    flex: 1,
  },
  bookedUserName: {
    ...theme.viewStyles.text('R', 18, theme.colors.SKY_BLUE),
    width: 300,
  },

  bookedUserPhone: {
    ...theme.viewStyles.text('R', 14, '#575F64'),
  },

  infoBlockTitle: {
    ...theme.viewStyles.text('R', 12, '#02475B', 0.5),
  },
  infoBlockSubTitleLarge: {
    ...theme.viewStyles.text('R', 16, '#02475B'),
    marginVertical: 2,
    maxWidth: 150,
  },
  infoBlockSubTitleSmall: {
    ...theme.viewStyles.text('R', 14, '#02475B'),
    marginVertical: 2,
    maxWidth: 150,
  },
  infoBlockDetailsContainer: {
    marginLeft: 9,
  },
  separator: {
    borderWidth: 0.5,
    borderColor: '#02475B',
    height: 1,
    width: '85%',
    opacity: 0.2,
    marginVertical: 20,
  },
  statusStripContainer: {
    marginRight: -21,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusStripText: {
    ...theme.viewStyles.text('M', 11, theme.colors.WHITE),
  },
});

export const BookedVaccineScreen: React.FC<BookedVaccineScreenProps> = (props) => {
  const cmsIdentifier = props.navigation.getParam('cmsIdentifier');
  const subscriptionId = props.navigation.getParam('subscriptionId');
  const subscriptionInclusionId = props.navigation.getParam('subscriptionInclusionId');

  const comingFrom = props.navigation.getParam('comingFrom');
  const [isCorporateSubscription, setCorporateSubscription] = useState<boolean>(
    props.navigation.getParam('isCorporateSubscription') || false
  );
  const [isVaccineSubscription, setVaccineSubscription] = useState<boolean>(
    props.navigation.getParam('isVaccineSubscription') || false
  );

  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const flatListRef = useRef<FlatList<any> | undefined | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [bookingList, setBookingList] = useState<any>([]);
  const [excludeProfileListIds, setExcludeProfileListIds] = useState<any>([]);
  const [remainingVaccineSlots, setRemainingVaccineSlots] = useState<number>(0);
  const [totalVaccineSlots, setTotalVaccineSlots] = useState<number>(-1);
  const [isSelfBookingDone, setSelfBookingDone] = useState<boolean>(false);

  const [showSomethingWentWrong, setShowSomethingWentWrong] = useState<boolean>(false);

  const [showRetailUserPage, setShowRetailUserPage] = useState<boolean>(false);

  const { showAphAlert, hideAphAlert } = useUIElements();
  const { authToken } = useAuth();

  const BOOKING_STATUS = {
    BOOKED: 'BOOKED',
    VERIFIED: 'VERIFIED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
  };

  const apolloVaccineClient = buildVaccineApolloClient(authToken);
  const client = useApolloClient();

  useEffect(() => {
    if (comingFrom === 'deeplink') fetchAllAppointments();
  }, []);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      AsyncStorage.getItem('verifyCorporateEmailOtpAndSubscribe').then((data) => {
        if (JSON.parse(data || 'false') === true) {
          setCorporateSubscription(true);
          setVaccineSubscription(true);
        }
        fetchAllAppointments();
        getUserSubscriptionsWithBenefits();
      });
    });

    return () => {
      didFocus && didFocus.remove();
    };
  }, []);

  useEffect(() => {
    setExcludeProfileListIds([]);
    let excludeProfileList: string[] = [];
    bookingList?.forEach((bookingItem: any) => {
      if (
        bookingItem?.status == BOOKING_STATUS.BOOKED ||
        bookingItem?.status == BOOKING_STATUS.VERIFIED
      ) {
        excludeProfileList.push(bookingItem?.patient_info?.uhid);
      }

      allCurrentPatients?.forEach((currentPatient: any) => {
        if (
          currentPatient?.uhid == bookingItem?.patient_info?.uhid &&
          currentPatient?.relation == 'ME'
        ) {
          if (
            bookingItem?.status == BOOKING_STATUS.BOOKED ||
            bookingItem?.status == BOOKING_STATUS.VERIFIED
          ) {
            setSelfBookingDone(true);
          }
        }
      });
    });
    setExcludeProfileListIds(excludeProfileList);
  }, [bookingList]);

  const fetchAllAppointments = () => {
    setLoading(true);
    setShowSomethingWentWrong(false);
    apolloVaccineClient
      .query<GetAllAppointments>({
        query: GET_ALL_VACCINATION_APPOINTMENTS,
        variables: {},
        fetchPolicy: 'no-cache',
        context: { headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() } },
      })
      .then((response) => {
        if (response?.data?.GetAllAppointments.success) {
          setBookingList(response?.data?.GetAllAppointments?.response);
        } else {
          setShowSomethingWentWrong(true);
        }
      })
      .catch((error) => {
        setShowSomethingWentWrong(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getUserSubscriptionsWithBenefits = () => {
    const mobile_number = g(currentPatient, 'mobileNumber');
    mobile_number &&
      client
        .query<
          GetAllUserSubscriptionsWithPlanBenefitsV2,
          GetAllUserSubscriptionsWithPlanBenefitsV2Variables
        >({
          query: GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
          variables: { mobile_number },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          const groupPlans = g(
            data,
            'data',
            'GetAllUserSubscriptionsWithPlanBenefitsV2',
            'response'
          );

          if (groupPlans) {
            Object.keys(groupPlans).forEach((plan_name) => {
              if (plan_name !== 'APOLLO' && plan_name !== 'HDFC') {
                groupPlans[plan_name]?.forEach((plan: any) => {
                  const benefits = plan.benefits;
                  if (benefits && benefits.length) {
                    benefits.forEach((item: any) => {
                      const ctaAction = g(item, 'cta_action');
                      if (
                        g(ctaAction, 'meta', 'action') === string.common.CorporateVaccineBenefit
                      ) {
                        setRemainingVaccineSlots(item?.attribute_type?.remaining);
                        setTotalVaccineSlots(item?.attribute_type?.total);
                      }
                    });
                  }
                });
              }
            });
          }
        })
        .catch((error) => {});
  };

  const goToPreviousScreen = () => {
    if (comingFrom === AppRoutes.VaccineTermsAndConditions) {
      props.navigation.pop(2);
    }
  };

  const renderHeader = (props) => {
    return (
      <Header
        leftIcon="backArrow"
        title={string.vaccineBooking.covid_vaccine_booking}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => props.navigation.goBack()}
        rightComponent={
          <View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                const helpSectionQueryId = AppConfig.Configuration.HELP_SECTION_CUSTOM_QUERIES;
                props.navigation.navigate(AppRoutes.NeedHelpQueryDetails, {
                  queryIdLevel1: helpSectionQueryId.vaccination,
                  sourcePage: 'Booked Vaccination',
                });
              }}
            >
              <Text style={styles.orangeCTA}>HELP</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  const renderNoBookings = () => {
    return (
      <View style={styles.noBookingContainer}>
        <NoVaccineBooking />
        <Text style={styles.noBookingTitle}>{string.vaccineBooking.title_no_booking}</Text>
        <Text style={styles.noBookingDesc}>{string.vaccineBooking.no_vaccination_booking}</Text>
        {renderNewBooking(false)}

        {showSomethingWentWrong ? (
          <View
            style={{
              flexDirection: 'column',
              alignSelf: 'center',
              marginTop: 60,
              alignItems: 'center',
            }}
          >
            <Text style={styles.somethingWentWrong}>Unable to see your booking? Try refresh!</Text>
            <TouchableOpacity
              onPress={() => {
                fetchAllAppointments();
              }}
            >
              <Text style={styles.tryRefresh}> REFRESH</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  const renderRetailVaccinationCTA = () => (
    <Button
      title={string.vaccineBooking.retail_vaccination_booking}
      style={styles.proceedButton}
      onPress={() => {
        fetchAllAppointments();
        setShowRetailUserPage(true);

        sendBookVaccinationBookingCTAEvent();
      }}
    />
  );

  const sendBookVaccinationBookingCTAEvent = () => {
    try {
      const eventAttributes = {
        'Patient ID': currentPatient?.id || '',
        'Patient First Name': currentPatient?.firstName.trim(),
        'Patient Last Name': currentPatient?.lastName.trim(),
        'Patient UHID': currentPatient?.uhid,
        'Patient Number': currentPatient?.mobileNumber,
        'Patient Gender': currentPatient?.gender,
        'Pateint Age ': getAge(currentPatient?.dateOfBirth),
        'Source ': Platform.OS === 'ios' ? 'ios' : 'android',
      };
      postWebEngageEvent(WebEngageEventName.VACCINATION_BOOKING_CLICKED, eventAttributes);
    } catch (error) {}
  };

  const renderEnrollCorporateCta = () => (
    <TouchableOpacity
      onPress={() => {
        try {
          props.navigation.navigate(AppRoutes.ActivateCorporateMembership);
        } catch (e) {}
      }}
    >
      <Text style={[styles.orangeCTA, { marginTop: 16 }]}>
        {' '}
        {string.vaccineBooking.enroll_corporate_cta_text}
      </Text>
    </TouchableOpacity>
  );

  const renderCorporateOrRetailChoiceView = () => {
    return (
      <View style={styles.noBookingContainer}>
        <Text style={styles.reatilBookingDesc}>
          {string.vaccineBooking.retail_customer_cowin_text}
        </Text>
        <SyringLarge
          style={{ width: 85, height: 85, marginHorizontal: 5, marginTop: 60, marginBottom: 70 }}
        />
        {renderRetailVaccinationCTA()}
        <View style={styles.separator}></View>
        <Text style={styles.noBookingDesc}>
          {string.vaccineBooking.retail_customer_corporate_text}
        </Text>
        {renderEnrollCorporateCta()}
      </View>
    );
  };

  const renderNewBooking = (checkForRemaininVaccineSlots: boolean) => {
    if (checkForRemaininVaccineSlots) {
      return (
        <View style={styles.proceedContainer}>
          <Button
            title={string.vaccineBooking.title_new_booking}
            style={styles.proceedButton}
            //disabled={checkBookSlotByFamilySlotAvaialbilty()}
            onPress={() => {
              try {
                goToPreviousScreen();
                props.navigation.navigate(AppRoutes.VaccineBookingScreen, {
                  cmsIdentifier: cmsIdentifier,
                  subscriptionId: subscriptionId,
                  subscriptionInclusionId: subscriptionInclusionId,
                  // excludeProfileListIds: excludeProfileListIds,
                  remainingVaccineSlots: remainingVaccineSlots,
                  isCorporateSubscription: isCorporateSubscription,
                });
                sendBookASlotCTAEvent();
              } catch (e) {}
            }}
          />
          {/* {checkBookSlotByFamilySlotAvaialbilty() ? (
            <Text style={styles.poceedErrorText}>
              Sorry! You have used up all your alloted booking slots. In case there has been some
              issue, you will have to cancel one of your bookings and make a new booking in its
              place. The second booking may not guarantee the same slot.{' '}
            </Text>
          ) : null} */}
        </View>
      );
    } else {
      return (
        <Button
          title={string.vaccineBooking.title_new_booking}
          style={styles.proceedButton}
          onPress={() => {
            try {
              goToPreviousScreen();
              props.navigation.navigate(AppRoutes.VaccineBookingScreen, {
                cmsIdentifier: cmsIdentifier,
                subscriptionId: subscriptionId,
                subscriptionInclusionId: subscriptionInclusionId,
                //excludeProfileListIds: excludeProfileListIds,
                remainingVaccineSlots: remainingVaccineSlots,
                isCorporateSubscription: isCorporateSubscription,
              });
              sendBookASlotCTAEvent();
            } catch (e) {}
          }}
        />
      );
    }
  };

  const sendBookASlotCTAEvent = () => {
    try {
      const eventAttributes = {
        'Patient ID': currentPatient?.id || '',
        'Patient First Name': currentPatient?.firstName.trim(),
        'Patient Last Name': currentPatient?.lastName.trim(),
        'Patient UHID': currentPatient?.uhid,
        'Patient Number': currentPatient?.mobileNumber,
        'Patient Gender': currentPatient?.gender,
        'Patient Age ': getAge(currentPatient?.dateOfBirth),
        'Source ': Platform.OS === 'ios' ? 'ios' : 'android',
      };
      postWebEngageEvent(WebEngageEventName.BOOK_A_SLOT_CLICKED, eventAttributes);
    } catch (error) {}
  };

  const checkBookSlotByFamilySlotAvaialbilty = () => {
    //check for isSelfBookingDone-- if yes --> then let the proceed
    //check for isSelfBookingDone-  if no --->then check for remainingSlots
    // if remainingSlots>0 then enable , else disable and show sorry message
    if (isSelfBookingDone) {
      if (remainingVaccineSlots > 0) {
        return false; //enable button
      } else {
        return true; //disable button
      }
    } else {
      return false; //enable button
    }
  };

  const renderDateAndSlotInfo = (bookingItem: any) => {
    return (
      <View style={{ flexDirection: 'row', flex: 1.5, marginVertical: 3 }}>
        <CalendarShow style={{ opacity: 0.5, width: 20, height: 20 }} />
        <View style={styles.infoBlockDetailsContainer}>
          <Text style={styles.infoBlockTitle}>{string.vaccineBooking.date_and_time_slot}</Text>
          {bookingItem?.resource_session_details?.start_date_time && (
            <Text style={styles.infoBlockSubTitleLarge}>
              {moment(bookingItem?.resource_session_details?.start_date_time).format(
                'DD MMM, YYYY'
              )}
            </Text>
          )}

          {bookingItem?.resource_session_details?.session_name && (
            <Text style={styles.infoBlockSubTitleSmall}>
              {bookingItem?.resource_session_details?.session_name}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderVaccineDetailsBlock = (bookingItem: any) => {
    return (
      <View style={{ flexDirection: 'row', flex: 1, marginVertical: 3 }}>
        <CovidVaccine style={{ width: 20, height: 20 }} />
        <View style={styles.infoBlockDetailsContainer}>
          <Text style={styles.infoBlockTitle}>{string.vaccineBooking.vaccine_details}</Text>
          <Text style={styles.infoBlockSubTitleSmall}>
            {bookingItem?.resource_session_details?.vaccine_type}
          </Text>
          <Text style={styles.infoBlockSubTitleSmall}>({bookingItem?.dose_number} DOSE)</Text>
        </View>
      </View>
    );
  };

  const renderSiteInfo = (bookingItem: any) => {
    return (
      <View style={{ flexDirection: 'row', flex: 1.5, marginVertical: 3 }}>
        <Location style={{ opacity: 0.5, width: 20, height: 20 }} />
        <View style={styles.infoBlockDetailsContainer}>
          <Text style={styles.infoBlockTitle}>Site</Text>
          <Text style={styles.infoBlockSubTitleSmall}>
            {bookingItem?.resource_session_details?.resource_detail?.name}{' '}
            {bookingItem?.resource_session_details?.resource_detail?.street_line1}{' '}
            {bookingItem?.resource_session_details?.resource_detail?.street_line2}{' '}
            {bookingItem?.resource_session_details?.resource_detail?.street_line3},{' '}
            {bookingItem?.resource_session_details?.resource_detail?.city},{' '}
            {bookingItem?.resource_session_details?.resource_detail?.state}
          </Text>
        </View>
      </View>
    );
  };

  const renderModeOfPayment = (bookingItem: any) => {
    return (
      <View style={{ flexDirection: 'row', flex: 1, marginVertical: 3 }}>
        <View style={{ opacity: 0.5, width: 20, height: 20 }}>
          <CurrencyIcon style={{ opacity: 1, width: 20, height: 20, marginTop: 5 }} />
        </View>
        <View style={styles.infoBlockDetailsContainer}>
          <Text style={styles.infoBlockTitle}>Mode</Text>
          <Text style={styles.infoBlockSubTitleSmall}>
            {bookingItem?.payment_type == PAYMENT_TYPE.IN_APP_PURCHASE
              ? 'Payment'
              : bookingItem?.payment_type}
          </Text>
        </View>
      </View>
    );
  };

  const renderUserIcon = (bookingItem: any) => {
    if (bookingItem?.patient_info?.gender == 'FEMALE') {
      return <FemaleIcon />;
    } else if (bookingItem?.patient_info?.gender == 'MALE') {
      return <MaleIcon />;
    } else {
      return <AgentIcon />;
    }
  };

  const renderBookingListItem = (bookingItem: any, index: any) => {
    return (
      <TouchableOpacity
        style={styles.bookingItemCardContainer}
        onPress={() => {
          try {
            props.navigation.navigate(AppRoutes.VaccineBookingConfirmationScreen, {
              appointmentId: bookingItem?.id,
              displayId: bookingItem?.display_id,
              cmsIdentifier: cmsIdentifier,
              subscriptionId: subscriptionId,
            });
          } catch (e) {}
        }}
      >
        {/* profile header  */}
        <View style={{ flexDirection: 'row' }}>
          {renderUserIcon(bookingItem)}
          <View style={styles.bookedUserInfo}>
            <Text style={styles.bookedUserName}>
              {bookingItem?.patient_info?.firstName} {bookingItem?.patient_info?.lastName}
              {bookingItem?.patient_info?.relation != undefined &&
              bookingItem?.patient_info?.relation != 'ME'
                ? ' | ' +
                  bookingItem?.patient_info?.relation?.[0].toUpperCase() +
                  bookingItem?.patient_info?.relation?.substring(1).toLowerCase()
                : ''}
            </Text>

            {bookingItem?.display_id && (
              <Text style={styles.bookedUserPhone}>{bookingItem?.display_id}</Text>
            )}
          </View>
          <View
            style={[
              styles.statusStripContainer,
              {
                backgroundColor:
                  bookingItem?.status == BOOKING_STATUS.CANCELLED ||
                  bookingItem?.status == BOOKING_STATUS.REJECTED
                    ? '#890000'
                    : '#00B38E',
              },
              {
                alignSelf: bookingItem?.patient_info?.relation != 'ME' ? 'flex-end' : 'flex-start',
                marginBottom: bookingItem?.patient_info?.relation != 'ME' ? -8 : 0,
              },
            ]}
          >
            <Text style={styles.statusStripText}>{bookingItem?.status}</Text>
          </View>
        </View>
        {/* <Text>{bookingItem.title}</Text> */}
        <View style={styles.divider} />

        <View>
          <View style={{ flexDirection: 'row' }}>
            {renderDateAndSlotInfo(bookingItem)}
            {renderVaccineDetailsBlock(bookingItem)}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {renderSiteInfo(bookingItem)}
            {renderModeOfPayment(bookingItem)}
          </View>
        </View>

        <View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              try {
                props.navigation.navigate(AppRoutes.VaccineBookingConfirmationScreen, {
                  appointmentId: bookingItem?.id,
                  displayId: bookingItem?.display_id,
                  cmsIdentifier: cmsIdentifier,
                  subscriptionId: subscriptionId,
                });
              } catch (e) {}
            }}
          >
            <Text style={[styles.orangeCTA, { marginTop: 13 }]}>
              {string.vaccineBooking.view_qr_code_booking_details}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBookingList = () => {
    return (
      <View style={styles.bookingListContainer}>
        <FlatList
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          ref={(ref) => (flatListRef.current = ref)}
          data={bookingList || []}
          renderItem={({ item, index }) => renderBookingListItem(item, index)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialNumToRender={bookingList ? bookingList.length : 0}
          ListFooterComponent={() => {
            return renderNewBooking(true);
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {renderHeader(props)}

      {showRetailUserPage ? (
        <>
          {loading
            ? renderVaccineBookingListShimmer()
            : bookingList.length == 0
            ? renderNoBookings()
            : renderBookingList()}
        </>
      ) : isCorporateSubscription == false ? (
        renderCorporateOrRetailChoiceView()
      ) : isVaccineSubscription == true ? (
        <>
          {loading
            ? renderVaccineBookingListShimmer()
            : bookingList.length == 0
            ? renderNoBookings()
            : renderBookingList()}
        </>
      ) : (
        renderCorporateOrRetailChoiceView()
      )}
    </SafeAreaView>
  );
};
