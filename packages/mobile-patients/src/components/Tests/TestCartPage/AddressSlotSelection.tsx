import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View, ScrollView } from 'react-native';
import {
  addSlotDuration,
  g,
  isDiagnosticSelectedCartEmpty,
  isEmptyObject,
  TestSlot,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useApolloClient } from 'react-apollo-hooks';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { patientObjWithLineItems } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { DiagnosticAppointmentTimeSlot } from '@aph/mobile-patients/src/components/Tests/utils/Events';
import { TestSlotSelectionOverlayNew } from '@aph/mobile-patients/src/components/Tests/components/TestSlotSelectionOverlayNew';
import moment from 'moment';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { diagnosticGetCustomizedSlotsV2 } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  createPatientAddressObject,
  createPatientObjLineItems,
} from '@aph/mobile-patients/src/components/Tests/utils/helpers';
import {
  SCREEN_NAMES,
  TimelineWizard,
} from '@aph/mobile-patients/src/components/Tests/components/TimelineWizard';
import { DIAGNOSTIC_SLOT_TYPE } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { screenHeight } from 'react-native-calendars/src/expandableCalendar/commons';

export interface AddressSlotSelectionProps extends NavigationScreenProps {
  reportGenDetails: any;
}

export const AddressSlotSelection: React.FC<AddressSlotSelectionProps> = (props) => {
  const {
    cartItems,
    isDiagnosticCircleSubscription,
    modifiedOrder,
    setDeliveryAddressId,
    setDiagnosticSlot,
    setPinCode,
    patientCartItems,
    diagnosticSlot,
    grandTotal,
  } = useDiagnosticsCart();

  const { diagnosticServiceabilityData, diagnosticLocation } = useAppCommonData();

  const { setLoading, showAphAlert, hideAphAlert, loading } = useUIElements();
  const client = useApolloClient();

  //after clicking on slot seleftion cta on previous page, remove the items which has isSelected as false

  const reportGenDetails = props.navigation.getParam('reportGenDetails');
  const selectedAddr = props.navigation.getParam('selectedAddress');
  const [selectedTimeSlot, setselectedTimeSlot] = useState({}) as any;
  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [todaySlotNotAvailable, setTodaySlotNotAvailable] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [diagnosticSlotDuration, setDiagnosticSlotDuration] = useState<number>(0);

  const [slotsInput, setSlotsInput] = useState({});

  var pricesForItemArray;

  const cartItemsWithId = cartItems?.map((item) => Number(item?.id!));
  const isCovidItem = cartItemsWithId?.map((item) =>
    AppConfig.Configuration.Covid_Items.includes(item)
  );
  const isCartHasCovidItem = isCovidItem?.find((item) => item === true);

  const maxDaysToShow = !!isCartHasCovidItem
    ? AppConfig.Configuration.Covid_Max_Slot_Days
    : AppConfig.Configuration.Non_Covid_Max_Slot_Days;

  const { currentPatient } = useAllCurrentPatients();

  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  // const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setIsFocus(true);
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });
    const willBlur = props.navigation.addListener('willBlur', (payload) => {
      setIsFocus(false);
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      didFocus && didFocus.remove();
      willBlur && willBlur.remove();
    };
  }, []);

  function handleBack() {
    props.navigation.goBack();
    return true;
  }

  const numberOfSlots = selectedTimeSlot?.slotInfo?.internalSlots?.length;
  useEffect(() => {
    if (numberOfSlots == 0) {
      triggerWebengageEvent();
    }
  }, [numberOfSlots]);

  //call the slot api.
  useEffect(() => {
    if (isFocus) {
      setDiagnosticSlot?.(null);
      setselectedTimeSlot({});
      getSlots();
    }
  }, [isFocus]);

  async function getSlots() {
    const getAddressObject = createPatientAddressObject(selectedAddr, diagnosticServiceabilityData);
    const getPatientObjWithLineItems = createPatientObjLineItems(
      patientCartItems,
      isDiagnosticCircleSubscription,
      reportGenDetails
    ) as (patientObjWithLineItems | null)[];

    const billAmount = getPatientObjWithLineItems
      ?.map((item) => Number(item?.totalPrice))
      ?.reduce((prev: number, curr: number) => prev + curr, 0);

    //check if on changing address, correct state-cityid are getting passed.
    //on adding address
    //on edit the address
    const getServiceabilityObject = {
      cityID: Number(diagnosticServiceabilityData?.cityId),
      stateID: Number(diagnosticServiceabilityData?.stateId),
    };

    setSlotsInput({
      addressObject: getAddressObject,
      lineItems: getPatientObjWithLineItems,
      total: billAmount,
      serviceabilityObj: getServiceabilityObject,
    });

    let dateToCheck = moment()?.format('YYYY-MM-DD'); //checking for current date
    try {
      const slotsResponse = await diagnosticGetCustomizedSlotsV2(
        client,
        getAddressObject,
        getPatientObjWithLineItems,
        billAmount,
        dateToCheck, //will be current date
        getServiceabilityObject
      );
      if (slotsResponse?.data?.getCustomizedSlotsv2) {
        const getSlotResponse = slotsResponse?.data?.getCustomizedSlotsv2;
        const getDistanceCharges = getSlotResponse?.distanceCharges;
        const getIndividualSlotDuration = getSlotResponse?.slotDurationInMinutes;
        //get the slots array
        const diagnosticSlots = getSlotResponse?.available_slots || [];

        const diagnosticSlotsToShow = diagnosticSlots;

        let slotsArray: any = [];
        diagnosticSlotsToShow?.forEach((item) => {
          slotsArray.push({
            date: date,
            slotInfo: {
              endTime: item?.slotDetail?.slotDisplayTime,
              isPaidSlot: item?.isPaidSlot,
              status: 'empty',
              internalSlots: item?.slotDetail?.internalSlots,
              startTime: item?.slotDetail?.slotDisplayTime,
              distanceCharges: !!item?.isPaidSlot && item?.isPaidSlot ? getDistanceCharges : 0, //would be overall
            } as any,
          });
        });

        //if no slots are there
        if (slotsArray?.length == 0) {
          setTodaySlotNotAvailable(true);
          let changedDate = moment(dateToCheck) //date
            .add(1, 'day')
            .toDate();
          setDate(changedDate);
          setselectedTimeSlot(undefined);
        } else {
          setSlots(slotsArray);
          todaySlotNotAvailable && setTodaySlotNotAvailable(false);
          const slotDetails = slotsArray?.[0];
          // slotsArray?.length && setselectedTimeSlot(slotDetails); //to explicitly select the slot
          setDiagnosticSlotDuration(getIndividualSlotDuration! || 0);
          setDiagnosticSlot?.({
            isPaidSlot: slotDetails?.isPaidSlot,
            internalSlots: slotDetails?.internalSlot!,
            slotStartTime: slotDetails?.slotInfo?.startTime!,
            slotEndTime: slotDetails?.slotInfo?.endTime!,
            date: new Date(dateToCheck)?.getTime(), //date,
            selectedDate: moment(dateToCheck),
            distanceCharges:
              !!slotDetails?.isPaidSlot && slotDetails?.isPaidSlot ? getDistanceCharges! : 0,
          });
          setLoading?.(false);
        }
      }
      setLoading?.(false);
    } catch (error) {
      CommonBugFender('AddressSlotselection_getSlots', error);
      setDiagnosticSlot && setDiagnosticSlot(null);
      setselectedTimeSlot(undefined);
      const noHubSlots = g(error, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';
      setLoading?.(false);
      if (noHubSlots) {
        setDeliveryAddressId?.(selectedAddr?.id!);
        setPinCode?.(selectedAddr?.zipcode!);
        showAphAlert?.({
          title: string.common.uhOh,
          description: string.diagnostics.noSlotAvailable.replace(
            '{{date}}',
            moment(dateToCheck).format('DD MMM, YYYY')
          ),
          onPressOk: () => {
            hideAphAlert && hideAphAlert();
          },
        });
      } else {
        CommonBugFender('AddressSlotselection_getSlots_NotHubSlotError', error);
        // setDeliveryAddressId?.('');
        setselectedTimeSlot(undefined);
        showAphAlert?.({
          title: string.common.uhOh,
          description: string.diagnostics.bookingOrderFailedMessage,
        });
      }
    }
  }

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'SCHEDULE APPOINTMENT'}
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

  const renderScheduleHeading = () => {
    return (
      <View style={{ marginTop: 16 }}>
        <Text style={styles.addressHeadingText}>Schedule Appointment</Text>
      </View>
    );
  };

  const renderSlotSelection = () => {
    return !!slotsInput && !isEmptyObject(slotsInput) ? (
      <TestSlotSelectionOverlayNew
        isVisible={false}
        heading={''}
        onClose={() => {}}
        isFocus={isFocus}
        showInOverlay={false}
        source={'Tests'}
        date={date}
        maxDate={moment()
          .add(maxDaysToShow, 'day')
          .toDate()}
        isTodaySlotUnavailable={todaySlotNotAvailable}
        slots={slots}
        isPremium={selectedTimeSlot?.slotInfo?.isPaidSlot}
        slotInfo={selectedTimeSlot}
        slotInput={slotsInput}
        slotDuration={diagnosticSlotDuration}
        onSchedule={(
          date: Date,
          slotInfo: TestSlot,
          getSlotDuration: number,
          currentDate: Date | undefined
        ) => {
          setDate(date);
          setDiagnosticSlotDuration(getSlotDuration);
          setselectedTimeSlot(slotInfo);
          setDiagnosticSlot?.({
            internalSlots: slotInfo?.slotInfo?.internalSlots!,
            distanceCharges:
              !!slotInfo?.slotInfo?.isPaidSlot && slotInfo?.slotInfo?.isPaidSlot
                ? slotInfo?.slotInfo?.distanceCharges!
                : 0,
            isPaidSlot: slotInfo?.slotInfo?.isPaidSlot!,
            slotStartTime: slotInfo?.slotInfo?.startTime!,
            slotEndTime: slotInfo?.slotInfo?.endTime!,
            date: date?.getTime(),
            selectedDate: date,
          });
        }}
      />
    ) : null;
  };

  const renderMainView = () => {
    return (
      <ScrollView>
        <View style={{ marginLeft: 16 }}>{renderScheduleHeading()}</View>
        <View style={{ height: screenHeight }}>{renderSlotSelection()}</View>
      </ScrollView>
    );
  };

  function _navigateToReview() {
    triggerWebengageEvent();
    props.navigation.navigate(AppRoutes.ReviewOrder, {
      selectedAddress: selectedAddr,
      slotsInput: slotsInput,
      selectedTimeSlot: selectedTimeSlot,
      showPaidPopUp: selectedTimeSlot?.slotInfo?.isPaidSlot,
    });
  }

  function triggerWebengageEvent() {
    const slotType = selectedTimeSlot?.slotInfo?.isPaidSlot
      ? DIAGNOSTIC_SLOT_TYPE.PAID
      : DIAGNOSTIC_SLOT_TYPE.FREE;
    const slotTime = selectedTimeSlot?.slotInfo?.startTime;
    const slotDate = moment(diagnosticSlot?.selectedDate)?.format('DD-MM-YYYY');
    const numberOfSlots = selectedTimeSlot?.slotInfo?.internalSlots?.length;
    let totalCart: DiagnosticsCartItem[] = [];
    for (let index = 0; index < patientCartItems.length; index++) {
      const element = patientCartItems[index];
      element?.cartItems?.map((item) => {
        totalCart?.push(item);
      });
    }
    DiagnosticAppointmentTimeSlot(
      slotType,
      slotTime,
      numberOfSlots,
      slotDate,
      currentPatient,
      isDiagnosticCircleSubscription,
      diagnosticLocation,
      totalCart,
      grandTotal
    );
  }

  const disableCTA = !(
    !!selectedTimeSlot &&
    !isEmptyObject(selectedTimeSlot) &&
    selectedTimeSlot?.slotInfo?.startTime
  );

  const renderStickyBottom = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomStyle}>
        {!!selectedTimeSlot?.slotInfo?.startTime && renderDateTime()}
        <Button
          title={'CHECKOUT'}
          onPress={() => _navigateToReview()}
          disabled={disableCTA}
          style={{ width: !!selectedTimeSlot?.slotInfo?.startTime ? '60%' : '100%' }}
        />
      </StickyBottomComponent>
    );
  };

  const renderDateTime = () => {
    const slotStartTime = moment(selectedTimeSlot?.slotInfo?.startTime, 'hh:mm A')?.format(
      'hh:mm a'
    );
    const getEndSlot = addSlotDuration(slotStartTime, diagnosticSlotDuration);
    return (
      <View style={styles.leftViewContainer}>
        <Text style={styles.leftTopText}>
          {moment(diagnosticSlot?.selectedDate)?.format('DD MMM')}
        </Text>
        <Text style={styles.leftBottomText}>
          {diagnosticSlotDuration == 0 ? slotStartTime : `${slotStartTime} - ${getEndSlot}`}
        </Text>
      </View>
    );
  };

  const renderWizard = () => {
    return (
      <TimelineWizard
        currentPage={SCREEN_NAMES.SCHEDULE}
        upcomingPages={[SCREEN_NAMES.REVIEW]}
        donePages={[SCREEN_NAMES.PATIENT, SCREEN_NAMES.CART]}
        navigation={props.navigation}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[{ ...theme.viewStyles.container }]}>
        {renderHeader()}
        {renderWizard()}
        {renderMainView()}
      </SafeAreaView>
      {renderStickyBottom()}
    </View>
  );
};

const styles = StyleSheet.create({
  addressHeadingText: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 1, 20),
  },
  leftViewContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 8,
    paddingLeft: 3,
    paddingTop: 3,
  },
  leftTopText: { ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) },
  leftBottomText: {
    ...theme.viewStyles.text('R', 14, theme.colors.SHERPA_BLUE, 1, 24),
    marginTop: -5,
  },
  stickyBottomStyle: {
    shadowColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
