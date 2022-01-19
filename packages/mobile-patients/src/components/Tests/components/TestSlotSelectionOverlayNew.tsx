import { AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Morning,
  Afternoon,
  MorningSelected,
  AfternoonSelected,
  EmptySlot,
  CrossPopup,
  PremiumIcon,
  NightSelected,
  Night,
  MinusPatientCircleIcon,
  AddPatientCircleIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  addSlotDuration,
  g,
  getTestSlotDetailsByTime,
  getUniqueTestSlots,
  handleGraphQlError,
  TestSlot,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { Overlay } from 'react-native-elements';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { diagnosticGetCustomizedSlotsV2 } from '@aph/mobile-patients/src/helpers/clientCalls';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';

interface SlotDetails {
  distanceCharges: number;
  endTime: string;
  internalSlots: any;
  isPaidSlot: boolean;
  startTime: string;
}
interface SlotsType {
  key: string;
  value: string;
  slotInfo: SlotDetails;
}

export interface TestSlotSelectionOverlayNewProps extends AphOverlayProps {
  showInOverlay?: boolean;
  maxDate: Date;
  date: Date;
  slotInfo?: TestSlot;
  slots: TestSlot[];
  areaId?: string;
  isReschdedule?: boolean;
  slotBooked?: string;
  isTodaySlotUnavailable?: boolean;
  onSchedule: (date1: Date, slotInfo: TestSlot, slotDuration: number, date?: Date) => void;
  itemId?: any[];
  source?: string;
  isVisible: boolean;
  isPremium?: boolean;
  heading: string;
  slotInput?: any; //define type
  isFocus?: boolean;
  slotDuration: number;
}
const { width, height } = Dimensions.get('window');

const localFormatTestSlot = (slotTime: string) => moment(slotTime, 'hh:mm A')?.format('HH:mm');

export const TestSlotSelectionOverlayNew: React.FC<TestSlotSelectionOverlayNewProps> = (props) => {
  const { maxDate, showInOverlay, slotInput, isPremium, isReschdedule, slotDuration } = props;
  const { setLoading } = useUIElements();
  const { cartItems } = useDiagnosticsCart();
  const [selectedDayTab, setSelectedDayTab] = useState(0);
  const [slotInfo, setSlotInfo] = useState<TestSlot | undefined>(props.slotInfo);
  const [slots, setSlots] = useState<TestSlot[]>(props.slots);
  const [date, setDate] = useState<Date>(props.date);
  const [changedDate, setChangedDate] = useState<Date>();
  const [isDateAutoSelected, setIsDateAutoSelected] = useState(true);
  const client = useApolloClient();
  const { onSchedule, isVisible, ...attributes } = props;
  const uniqueSlots = getUniqueTestSlots(slots); //removed sorting

  const dt = moment(props.slotBooked!).format('YYYY-MM-DD') || null;
  const tm = moment(props.slotBooked!)?.format('hh:mm A') || null; //format changed from hh:mm

  const [selectedDate, setSelectedDate] = useState<string>(moment(date).format('DD') || '');
  const [isPrepaidSlot, setPrepaidSlot] = useState<boolean>(
    !!isReschdedule ? false : !!isPremium ? isPremium : false
  );
  const [overallDistanceCharge, setOverallDistanceCharge] = useState<number>(0);
  //no need to show premium segregation in case of reschedule

  const [newSelectedSlot, setNewSelectedSlot] = useState(
    `${localFormatTestSlot(slotInfo?.slotInfo?.startTime!)}` || ''
  );
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [newChangedDate, setNewChangedDate] = useState<Date>();
  const [noSlotsArray, setNoSlotsArray] = useState([] as any);
  const [overallSlotsArray, setOverallSlotsArray] = useState([] as any);
  const [morningSlots, setMorningSlots] = useState([] as any);
  const [afternoonSlots, setAfternoonSlots] = useState([] as any);
  const [eveningSlots, setEveningSlots] = useState([] as any);
  const [diagnosticSlotDuration, setDiagnosticSlotDuration] = useState<number>(slotDuration);

  type UniqueSlotType = typeof uniqueSlots[0];

  var noSlot = [];
  var offsetDays = 0;
  var offsetDates = 0;
  var offsetTimestamp = 0;
  let newDateArray: { days: string; dates: string; timestamp: string }[] = [];
  while (offsetDates < 4) {
    newDateArray.push({
      days: moment()
        .add(offsetDays++, 'days')
        .format('ddd'),
      dates: moment()
        .add(offsetDates++, 'days')
        .format('DD'),
      timestamp: moment()
        .add(offsetTimestamp++, 'days')
        .format(),
    });
  }
  let monthHeading = `${moment().format('MMMM')} ${moment().format('YYYY')}`;

  //use formatTestSlot when time is coming in 24hr.
  let dropDownOptions = uniqueSlots?.map((val) => ({
    key: `${val?.startTime}`,
    value: `${val.startTime}`,
    slotInfo: val,
  }));

  let overallSlots;

  var dayPhaseArray = [
    {
      tab: 0,
      activeImage: <MorningSelected />,
      inactiveImage: <Morning />,
      title: 'Morning',
    },
    {
      tab: 1,
      activeImage: <AfternoonSelected />,
      inactiveImage: <Afternoon />,
      title: 'Afternoon',
    },
  ];

  useEffect(() => {
    if (props.isFocus) {
      setNewSelectedSlot('');
      fetchSlots();
    }
  }, [date, props.isFocus]);

  useEffect(() => {
    changeOverallSlots();
  }, [selectedDayTab]);

  const fetchSlots = async (updatedDate?: Date) => {
    let dateToCheck = !!updatedDate
      ? moment(updatedDate)?.format('YYYY-MM-DD')
      : moment(date)?.format('YYYY-MM-DD');
    setSelectedDate(moment(dateToCheck).format('DD'));
    setLoading?.(true);
    setShowSpinner(true);
    try {
      const slotsResponse = props.isReschdedule
        ? await diagnosticGetCustomizedSlotsV2(
            client,
            slotInput?.addressObject,
            slotInput?.lineItems,
            slotInput?.total,
            dateToCheck, //will be current date
            slotInput?.serviceabilityObj,
            slotInput?.orderId
          )
        : await diagnosticGetCustomizedSlotsV2(
            client,
            slotInput?.addressObject,
            slotInput?.lineItems,
            slotInput?.total,
            dateToCheck, //will be current date
            slotInput?.serviceabilityObj
          );
      if (slotsResponse?.data?.getCustomizedSlotsv2) {
        const getSlotResponse = slotsResponse?.data?.getCustomizedSlotsv2;
        const getDistanceCharges = getSlotResponse?.distanceCharges;
        const getSlotDuration = getSlotResponse?.slotDurationInMinutes;
        //get the slots array
        const diagnosticSlots = getSlotResponse?.available_slots || [];

        const updatedDiagnosticSlots =
          moment(dateToCheck)?.format('YYYY-MM-DD') == dt && props.isReschdedule
            ? diagnosticSlots?.filter((item) => item?.slotDetail?.slotDisplayTime != tm)
            : diagnosticSlots;

        let slotsArray: any = [];
        updatedDiagnosticSlots?.forEach((item) => {
          slotsArray.push({
            slotInfo: {
              endTime: item?.slotDetail?.slotDisplayTime,
              isPaidSlot: item?.isPaidSlot,
              status: 'empty',
              internalSlots: item?.slotDetail?.internalSlots!,
              startTime: item?.slotDetail?.slotDisplayTime,
              distanceCharges: !!item?.isPaidSlot && item?.isPaidSlot ? getDistanceCharges : 0, //would be overall
            } as any,
          });
        });

        const hasReachedEnd = moment(dateToCheck).isSameOrAfter(moment(maxDate), 'date');
        if (!hasReachedEnd && slotsArray?.length == 0 && isDateAutoSelected) {
          let changedDate = moment(dateToCheck) //date
            .add(1, 'day')
            .toDate();

          fetchSlots(changedDate);
          const array = noSlotsArray?.concat(moment(dateToCheck)?.format('DD'));
          setNoSlotsArray(array);
        } else {
          setSlots(slotsArray);
          setOverallDistanceCharge(getDistanceCharges!);
          setChangedDate(moment(dateToCheck)?.toDate());
          setDiagnosticSlotDuration(getSlotDuration! || 0);
          populateSlots(slotsArray);
          //this needs to be added, if need to select the first slot by default
          // slotsArray?.length && setSlotInfo(slotsArray?.[0]);
          // setNewSelectedSlot(`${localFormatTestSlot(slotsArray?.[0]?.slotInfo?.startTime!)}` || ''); //for setting the next date slot by default
          setLoading?.(false);
          setShowSpinner(false);
        }
      }
    } catch (e) {
      console.log({ e });
      const noHubSlots = g(e, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';
      if (!noHubSlots) {
        handleGraphQlError(e);
      }
      setLoading?.(false);
      setShowSpinner(false);
    }
  };

  const time24 = (item: any) => {
    return moment(item?.value, 'hh:mm A')?.format('HH:mm');
  };

  function populateSlots(slotsArray: any) {
    const getOverallUniqueSlots = getUniqueTestSlots(slotsArray);
    overallSlots = getOverallUniqueSlots?.map((val) => ({
      key: `${val?.startTime}`,
      value: `${val.startTime}`,
      slotInfo: val,
    }));

    let getEveningSlots: Array<SlotsType> = [];
    let getAfternoonSlots: Array<SlotsType> = [];
    let getMorningSlots: Array<SlotsType> = [];

    getAfternoonSlots = overallSlots?.filter((item: any) => {
      if (time24(item) >= '12' && time24(item) < '17') {
        return item;
      }
    });

    getEveningSlots = overallSlots?.filter((item: any) => {
      //changed from < 6 to 23
      if (time24(item) >= '17' && time24(item) < '23') {
        return item;
      }
    });
    getMorningSlots = overallSlots?.filter((item: any) => {
      if (time24(item) >= '06' && time24(item) < '12') {
        return item;
      }
    });

    setMorningSlots(getMorningSlots);
    setAfternoonSlots(getAfternoonSlots);
    setEveningSlots(getEveningSlots);
    /**
     * added since, it was persisting previous slots
     */
    if (overallSlots?.length == 0) {
      setOverallSlotsArray([]);
      setSelectedDayTab(0);
      return;
    }
    if (getMorningSlots?.length > 0) {
      setOverallSlotsArray(getMorningSlots);
      setSelectedDayTab(0);
    } else if (getMorningSlots?.length == 0 && getAfternoonSlots?.length > 0) {
      setOverallSlotsArray(getAfternoonSlots);
      setSelectedDayTab(1);
    } else if (
      getMorningSlots?.length == 0 &&
      getAfternoonSlots?.length == 0 &&
      getEveningSlots?.length > 0
    ) {
      setOverallSlotsArray(getEveningSlots);
      setSelectedDayTab(2);
    }
  }

  if (!!eveningSlots && eveningSlots?.length > 0) {
    dayPhaseArray?.push({
      tab: 2,
      activeImage: <NightSelected />,
      inactiveImage: <Night />,
      title: 'Evening',
    });
  }

  function changeOverallSlots() {
    if (selectedDayTab == 1) {
      setOverallSlotsArray(afternoonSlots);
    }
    if (selectedDayTab == 2) {
      setOverallSlotsArray(eveningSlots);
    }
    if (selectedDayTab == 0) {
      setOverallSlotsArray(morningSlots);
    }
  }

  const renderPremiumTag = () => {
    const distanceCharges = overallDistanceCharge;
    return (
      <>
        {distanceCharges > 0 ? (
          <View style={styles.premiumTag}>
            <PremiumIcon style={styles.premiumIcon} />
            <Text style={styles.premiumText}>
              Paid Slot - Additional charge of {string.common.Rs}
              {distanceCharges} will be levied
            </Text>
          </View>
        ) : null}
      </>
    );
  };
  const renderSlotSelectionView = () => {
    return (
      <View style={styles.slotsView}>
        <View style={styles.dayPhaseContainer}>
          {dayPhaseArray?.map((item, index) => (
            <TouchableOpacity
              style={[
                styles.dayPhaseStyle,
                {
                  borderBottomColor:
                    selectedDayTab == index ? theme.colors.APP_GREEN : theme.colors.WHITE,
                  borderBottomWidth: selectedDayTab == index ? 4 : 0,
                  marginLeft: index == 0 ? 6 : 0,
                },
              ]}
              onPress={() => {
                setSelectedDayTab(index);
              }}
            >
              {selectedDayTab == index ? item?.activeImage : item?.inactiveImage}
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(16),
                  color: selectedDayTab == index ? theme.colors.APP_GREEN : theme.colors.LIGHT_BLUE,
                  padding: 16,
                }}
              >
                {item?.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.slotsList}>
          {!!overallSlotsArray && overallSlotsArray?.length != 0 ? (
            <FlatList
              bounces={false}
              nestedScrollEnabled={true}
              keyExtractor={(_, index) => index.toString()}
              data={overallSlotsArray}
              extraData={newSelectedSlot}
              contentContainerStyle={styles.timeContainer}
              renderItem={(item: any, index: number) => renderTimeSlots(item, index)}
            />
          ) : (
            renderNoSlots()
          )}
        </View>
      </View>
    );
  };

  function _onPressSlot(slotDetails: any, slotValue: any) {
    const selectedSlot = getTestSlotDetailsByTime(
      slots,
      (slotDetails?.item?.slotInfo as UniqueSlotType)?.startTime,
      (slotDetails?.item?.slotInfo as UniqueSlotType)?.endTime
    );
    setSlotInfo(selectedSlot);
    setPrepaidSlot(slotDetails?.item?.slotInfo?.isPaidSlot);
    setNewSelectedSlot(slotValue);
    props.isReschdedule && setNewChangedDate(changedDate);
    props.isReschdedule
      ? null
      : onSchedule(changedDate!, slotDetails?.item, diagnosticSlotDuration, props.date);
    // onSchedule(date!, slotInfo!); //if first needs to be selected
  }

  const renderTimeSlots = (item: any, index: number) => {
    const slotValue = item?.item?.value;
    const startSlotValue = moment(slotValue, 'hh:mm A')?.format('hh:mm a');
    const endSlotValue = addSlotDuration(slotValue, diagnosticSlotDuration);
    const isSelected = newSelectedSlot == slotValue;

    return (
      <TouchableOpacity
        key={index?.toString()}
        onPress={() => _onPressSlot(item, slotValue)}
        style={[
          styles.dateContentStyle,
          {
            backgroundColor: isSelected
              ? theme.colors.APP_GREEN
              : theme.colors.DEFAULT_BACKGROUND_COLOR,
          },
        ]}
      >
        <>
          {item?.item?.slotInfo?.isPaidSlot ? (
            isReschdedule ? null : (
              <PremiumIcon style={styles.premiumIconAbsolute} />
            )
          ) : null}
          <View style={styles.outerSlotView}>
            <Text
              style={[
                styles.dateTextStyle,
                {
                  color: isSelected ? colors.WHITE : colors.SHERPA_BLUE,
                },
              ]}
            >
              {diagnosticSlotDuration == 0 ? startSlotValue : `${startSlotValue} - ${endSlotValue}`}
            </Text>
            <View style={styles.arrowIconView}>
              {!isSelected ? (
                <MinusPatientCircleIcon style={styles.arrowStyle} />
              ) : (
                <AddPatientCircleIcon style={styles.arrowStyle} />
              )}
            </View>
          </View>
        </>
      </TouchableOpacity>
    );
  };

  const renderCalendarView = () => {
    /**
     * as soon as current date has no slot selection, then change it to next date (autoselection)
     */

    return (
      <View>
        <View style={styles.monthHeading}>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(15),
              color: theme.colors.LIGHT_BLUE,
              padding: 10,
            }}
          >
            {monthHeading}
          </Text>
          <View style={styles.dateArrayContainer}>
            {newDateArray?.map((item, index) => (
              <TouchableOpacity
                key={index.toString()}
                onPress={() => {
                  let newdate = moment(item?.timestamp)
                    .utc()
                    .toDate();

                  setSelectedDate(item?.dates);
                  setDate(newdate);
                  setSlotInfo(undefined);
                  setIsDateAutoSelected(false);
                }}
                style={[
                  styles.dateContainer,
                  {
                    backgroundColor:
                      selectedDate == item?.dates ? theme.colors.APP_GREEN : 'transparent',
                    marginHorizontal: showInOverlay
                      ? width > 400
                        ? 5
                        : 1
                      : width > 400
                      ? 5
                      : width > 340
                      ? 1
                      : -7, //1 : -4 (if width is 16 pixels gap)
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dateStyle,
                    {
                      color: selectedDate == item?.dates ? 'white' : theme.colors.SHERPA_BLUE,
                      opacity: noSlotsArray?.includes(item?.dates) ? 0.6 : 1,
                    },
                  ]}
                >
                  {item?.dates}
                </Text>
                <Text
                  style={[
                    styles.dayStyle,
                    {
                      color: selectedDate == item?.dates ? 'white' : theme.colors.SHERPA_BLUE,
                      opacity: noSlotsArray?.includes(item?.dates) ? 0.6 : 1,
                    },
                  ]}
                >
                  {item?.days}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };
  const renderNoSlots = () => {
    return (
      <View style={styles.noSlotsContainer}>
        <EmptySlot />
        <Text style={styles.noSlotsText}>{string.diagnosticsOrders.noSlot}</Text>
      </View>
    );
  };

  const isDoneBtnDisabled = !newChangedDate || !slotInfo; //!date

  const renderBottomButton = (
    <Button
      style={{ margin: 16, marginTop: 5, width: 'auto' }}
      onPress={() => {
        if (!isDoneBtnDisabled) {
          onSchedule(newChangedDate!, slotInfo!, diagnosticSlotDuration, new Date()); //date
        }
      }}
      disabled={isDoneBtnDisabled}
      title={'DONE'}
    />
  );

  const renderSlotSelection = () => {
    return (
      <>
        {showInOverlay ? (
          <TouchableOpacity
            style={styles.closeContainer}
            onPress={() => {
              props.onClose();
            }}
          >
            <CrossPopup />
          </TouchableOpacity>
        ) : null}
        <View
          style={[
            styles.containerStyle,
            {
              borderTopLeftRadius: showInOverlay ? 10 : 0,
              borderTopRightRadius: showInOverlay ? 10 : 0,
              marginTop: showInOverlay ? 140 : 16,
              marginBottom: !showInOverlay ? height / 2.8 : 0, //2.8
            },
          ]}
        >
          {showInOverlay ? (
            <Text
              style={[
                {
                  ...theme.fonts.IBMPlexSansMedium(17),
                  color: theme.colors.LIGHT_BLUE,
                  padding: 15,
                },
                props.headingTextStyle,
              ]}
            >
              {props.heading}
            </Text>
          ) : null}
          {renderCalendarView()}
          {props.isReschdedule ? null : renderPremiumTag()}
          {renderSlotSelectionView()}
          {showInOverlay && props.isReschdedule && overallSlotsArray?.length ? (
            renderBottomButton
          ) : (
            <View style={{ height: 10 }}></View>
          )}
          {showSpinner && props.isReschdedule && <Spinner />}
        </View>
      </>
    );
  };

  return (
    <>
      {!showInOverlay ? (
        <>{renderSlotSelection()}</>
      ) : (
        <Overlay
          isVisible
          onRequestClose={() => props.onClose()}
          windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
          containerStyle={{ marginBottom: 0 }}
          fullScreen
          transparent
          overlayStyle={styles.phrOverlayStyle}
        >
          {renderSlotSelection()}
        </Overlay>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: theme.colors.WHITE,
    flex: 1,
  },
  containerContentStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexGrow: 1,
  },
  closeContainer: {
    alignSelf: 'flex-end',
    marginTop: 100,
    marginHorizontal: 20,
    position: 'absolute',
  },
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  premiumTag: {
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    flexDirection: 'row',
    borderRadius: 10,
    margin: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  premiumText: {
    ...theme.viewStyles.text('SB', 12, colors.SHERPA_BLUE, 1),
    marginHorizontal: 5,
  },
  premiumIconAbsolute: {
    width: 16,
    height: 16,
    position: 'absolute',
    top: 0,
    right: 0,
    resizeMode: 'contain',
  },
  premiumIcon: {
    width: 16,
    height: 16,
  },
  dateContainer: {
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.APP_GREEN,
  },
  dayPhaseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  dayPhaseStyle: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  dateStyle: {
    ...theme.viewStyles.text('M', 17, 'white'),
  },
  dayStyle: {
    ...theme.viewStyles.text('M', 12, 'white'),
  },
  timeContainer: {
    justifyContent: 'center',
    marginBottom: 20,
  },
  noSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60, //40
  },
  noSlotsText: {
    ...theme.viewStyles.text('SB', 17, theme.colors.SHERPA_BLUE),
  },
  dateContentStyle: {
    height: 42,
    margin: 8,
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 10,
    alignItems: 'flex-start',
    paddingLeft: 16,
    justifyContent: 'center',
  },
  dateTextStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE),
    textAlign: 'center',
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 6,
    paddingBottom: 3,
    borderColor: colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
  },
  sectionStyle: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.CARD_BG,
    marginBottom: 16,
  },
  menuStyle: {
    alignItems: 'flex-end',
    marginTop: -40,
    marginLeft: width / 2 - 90,
  },
  monthHeading: {
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  dateArrayContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  arrowIconView: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowStyle: {
    height: 18,
    width: 20,
    resizeMode: 'contain',
  },
  outerSlotView: {
    flexDirection: 'row',
    width: '95%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotsList: { marginBottom: 20, marginTop: 10 },
  slotsView: { marginBottom: 30, flex: 1 },
});

TestSlotSelectionOverlayNew.defaultProps = {
  heading: '',
  isVisible: false,
};
