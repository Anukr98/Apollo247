import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { g, isEmptyObject, TestSlot } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
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
import {
  DiagnosticLineItem,
  patientObjWithLineItems,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { DiagnosticAppointmentTimeSlot } from '@aph/mobile-patients/src/components/Tests/Events';
import { TestSlotSelectionOverlayNew } from '@aph/mobile-patients/src/components/Tests/components/TestSlotSelectionOverlayNew';
import moment from 'moment';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { diagnosticGetCustomizedSlotsV2 } from '@aph/mobile-patients/src/helpers/clientCalls';
import { createPatientAddressObject } from '@aph/mobile-patients/src/utils/commonUtils';
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  SCREEN_NAMES,
  TimelineWizard,
} from '@aph/mobile-patients/src/components/Tests/components/TimelineWizard';

export interface AddressSlotSelectionProps extends NavigationScreenProps {
  reportGenDetails: any;
}

export const AddressSlotSelection: React.FC<AddressSlotSelectionProps> = (props) => {
  const {
    cartItems,
    isDiagnosticCircleSubscription,
    modifiedOrder,
    addresses,
    deliveryAddressId,
    setDeliveryAddressId,
    setDiagnosticSlot,
    setCartPagePopulated,
    selectedPatient,
    setPinCode,
    patientCartItems,
  } = useDiagnosticsCart();

  const { diagnosticServiceabilityData } = useAppCommonData();

  const { setLoading, showAphAlert, hideAphAlert, loading } = useUIElements();
  const client = useApolloClient();
  console.log({ props });

  //after clicking on slot seleftion cta on previous page, remove the items which has isSelected as false

  const reportGenDetails = props.navigation.getParam('reportGenDetails');
  const [selectedTimeSlot, setselectedTimeSlot] = useState({}) as any;
  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [todaySlotNotAvailable, setTodaySlotNotAvailable] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [isFocus, setIsFocus] = useState<boolean>(false);

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
  const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);

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

  //call the slot api.
  useEffect(() => {
    if (isFocus) {
      setDiagnosticSlot?.(null);
      setselectedTimeSlot({});
      getSlots();
    }
  }, [isFocus]);

  const setWebEnageEventForAppointmentTimeSlot = (
    mode: 'Automatic' | 'Manual',
    slotDetails: TestSlot
  ) => {
    const area = null;
    const timeSlot = !!slotDetails ? slotDetails?.slotInfo?.startTime! : 'No slot';
    const selectedAddr = addresses?.find((item) => item?.id == deliveryAddressId);
    const selectionMode = mode;
    const isSlotAvailable = slotDetails?.slotInfo?.startTime! ? 'Yes' : 'No';

    DiagnosticAppointmentTimeSlot(
      selectedAddr,
      null,
      timeSlot,
      selectionMode,
      isSlotAvailable,
      currentPatient
    );
  };

  //define type
  function createLineItemPrices(selectedItem: any) {
    pricesForItemArray = selectedItem?.cartItems?.map(
      (item: any, index: number) =>
        ({
          itemId: Number(item?.id),
          price:
            isDiagnosticCircleSubscription && item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
              ? Number(item?.circleSpecialPrice)
              : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
              ? Number(item?.discountSpecialPrice)
              : Number(item?.specialPrice) || Number(item?.price),
          mrp:
            isDiagnosticCircleSubscription && item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
              ? Number(item?.circlePrice)
              : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
              ? Number(item?.discountPrice)
              : Number(item?.price),
          groupPlan: isDiagnosticCircleSubscription
            ? item?.groupPlan!
            : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
            ? item?.groupPlan
            : DIAGNOSTIC_GROUP_PLAN.ALL,
          preTestingRequirement:
            !!reportGenDetails && reportGenDetails?.[index]?.itemPrepration
              ? reportGenDetails?.[index]?.itemPrepration
              : null,
          reportGenerationTime:
            !!reportGenDetails && reportGenDetails?.[index]?.itemReportTat
              ? reportGenDetails?.[index]?.itemReportTat
              : null,
        } as DiagnosticLineItem)
    );

    return {
      pricesForItemArray,
    };
  }

  // function createPatientObjLineItems() {
  //   const getPricesForItem = createLineItemPrices()?.pricesForItemArray;

  //   const totalPrice = getPricesForItem
  //     ?.map((item) => Number(item?.price))
  //     ?.reduce((prev: number, curr: number) => prev + curr, 0);
  //   var array = [];
  //   array.push({
  //     patientID: selectedPatient?.id || currentPatient?.id,
  //     lineItems: getPricesForItem,
  //     totalPrice: totalPrice,
  //   });
  //   return array;
  // }

  function createPatientObjLineItems() {
    //move this logic outside
    const filterPatientItems = patientCartItems?.map((item) => {
      let obj = {
        patientId: item?.patientId,
        cartItems: item?.cartItems?.filter((items) => items?.isSelected == true),
      };
      return obj;
    });
    console.log({ filterPatientItems });
    var array = [] as any; //define type

    const pp = filterPatientItems?.map((item) => {
      const getPricesForItem = createLineItemPrices(item)?.pricesForItemArray;
      console.log({ getPricesForItem });
      const totalPrice = getPricesForItem
        ?.map((item: any) => Number(item?.price))
        ?.reduce((prev: number, curr: number) => prev + curr, 0);
      console.log({ totalPrice });
      array.push({
        patientID: item?.patientId,
        lineItems: getPricesForItem,
        totalPrice: totalPrice,
      });
    });
    console.log({ array });
    return array;
  }

  async function getSlots() {
    //if city - state is null then check from the serviceability api
    var getAddressObject = createPatientAddressObject(
      isModifyFlow ? modifiedOrder?.patientAddressObj : selectedAddr
    );
    // const getPatientObjWithLineItems = createPatientObjLineItems() as (patientObjWithLineItems | null)[];
    const getPatientObjWithLineItems = createPatientObjLineItems() as (patientObjWithLineItems | null)[];

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
      console.log({ slotsResponse });
      if (slotsResponse?.data?.getCustomizedSlotsv2) {
        const getSlotResponse = slotsResponse?.data?.getCustomizedSlotsv2;
        const getDistanceCharges = getSlotResponse?.distanceCharges;
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

          setDiagnosticSlot?.({
            isPaidSlot: slotDetails?.isPaidSlot,
            internalSlot: slotDetails?.internalSlot!,
            slotStartTime: slotDetails?.slotInfo?.startTime!,
            slotEndTime: slotDetails?.slotInfo?.endTime!,
            date: new Date(dateToCheck)?.getTime(), //date,
            selectedDate: moment(dateToCheck),
            distanceCharges:
              !!slotDetails?.isPaidSlot && slotDetails?.isPaidSlot ? getDistanceCharges! : 0,
            city: selectedAddr ? selectedAddr?.city! : '', // not using city from this in order place API
          });
          setWebEnageEventForAppointmentTimeSlot('Automatic', slotDetails);
          setCartPagePopulated?.(true);
          setLoading?.(false);
        }
      }
      setLoading?.(false);
    } catch (error) {
      console.log({ error });
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
        // setCartPagePopulated?.(false);
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
        //add a type here
        onSchedule={(date: Date, slotInfo: TestSlot, currentDate: Date | undefined) => {
          console.log({ slotInfo });
          setDate(date);
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
          setWebEnageEventForAppointmentTimeSlot('Manual', slotInfo);
        }}
      />
    ) : null;
  };

  const renderMainView = () => {
    return (
      <View style={{ margin: 16, marginTop: 4, marginBottom: 50 }}>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {renderScheduleHeading()}
          {renderSlotSelection()}
        </ScrollView>
      </View>
    );
  };

  function _navigateToReview() {
    props.navigation.navigate(AppRoutes.ReviewOrder, {
      slotsInput: slotsInput,
      selectedTimeSlot: selectedTimeSlot,
      showPaidPopUp: selectedTimeSlot?.slotInfo?.isPaidSlot,
    });
  }

  const disableCTA = !(
    !!selectedTimeSlot &&
    !isEmptyObject(selectedTimeSlot) &&
    selectedTimeSlot?.slotInfo?.startTime
  );

  const renderStickyBottom = () => {
    return (
      <StickyBottomComponent>
        <Button title={'CHECKOUT'} onPress={() => _navigateToReview()} disabled={disableCTA} />
      </StickyBottomComponent>
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
});
