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
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
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
  onSchedule: (date1: Date, slotInfo: TestSlot, date?: Date) => void;
  itemId?: any[];
  source?: string;
  isVisible?: boolean;
  isPremium?: boolean;
  heading?: string;
  slotInput?: any; //define type
  isFocus?: boolean;
}
const { width, height } = Dimensions.get('window');

const localFormatTestSlot = (slotTime: string) => moment(slotTime, 'hh:mm A')?.format('HH:mm');

export const TestSlotSelectionOverlayNew: React.FC<TestSlotSelectionOverlayNewProps> = (props) => {
  const {
    isTodaySlotUnavailable,
    maxDate,
    showInOverlay,
    slotInput,
    isPremium,
    isReschdedule,
  } = props;
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
  const isSameDate = moment().isSame(moment(date), 'date');

  const [selectedDate, setSelectedDate] = useState<string>(moment(date).format('DD') || '');
  const [isPrepaidSlot, setPrepaidSlot] = useState<boolean>(
    !!isReschdedule ? false : !!isPremium ? isPremium : false
  );
  //no need to show premium segregation in case of reschedule

  const [newSelectedSlot, setNewSelectedSlot] = useState(
    `${localFormatTestSlot(slotInfo?.slotInfo?.startTime!)}` || ''
  );
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [newChangedDate, setNewChangedDate] = useState<Date>();
  const [noSlotsArray, setNoSlotsArray] = useState([] as any);

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

  useEffect(() => {
    if (props.isFocus) {
      setNewSelectedSlot('');
      fetchSlots();
    }
  }, [date, props.isFocus]);

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
          setChangedDate(moment(dateToCheck)?.toDate());
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

  const dayPhaseArray = [
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

  //use formatTestSlot when time is coming in 24hr.
  let dropDownOptions = uniqueSlots?.map((val) => ({
    key: `${val?.startTime}`,
    value: `${val.startTime}`,
    slotInfo: val,
  }));

  const time24 = (item: any) => {
    return moment(item?.value, 'hh:mm A')?.format('HH:mm');
  };

  if (selectedDayTab == 1) {
    //for afternoon 12-17
    dropDownOptions = dropDownOptions?.filter((item) => {
      if (time24(item) >= '12' && time24(item) < '17') {
        return item;
      }
    });
  } else if (selectedDayTab == 0) {
    //for morning 6- 12
    dropDownOptions = dropDownOptions?.filter((item) => {
      if (time24(item) >= '06' && time24(item) < '12') {
        return item;
      }
    });
  }

  const renderPremiumTag = () => {
    const distanceCharges =
      !!slotInfo?.slotInfo?.distanceCharges && slotInfo?.slotInfo?.distanceCharges;
    return (
      <>
        {distanceCharges > 0 ? (
          <View style={styles.premiumTag}>
            <PremiumIcon style={styles.premiumIcon} />
            <Text style={styles.premiumText}>
              Premium Slot - Additional charge of {string.common.Rs}
              {slotInfo?.slotInfo?.distanceCharges} will be levied
            </Text>
          </View>
        ) : null}
      </>
    );
  };
  const renderSlotSelectionView = () => {
    return (
      <View style={{ marginBottom: 30 }}>
        <View style={styles.dayPhaseContainer}>
          {dayPhaseArray?.map((item, index) => (
            <TouchableOpacity
              style={[
                styles.dayPhaseStyle,
                {
                  borderBottomColor:
                    selectedDayTab == index ? theme.colors.APP_GREEN : theme.colors.WHITE,
                  borderBottomWidth: selectedDayTab == index ? 4 : 0,
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
        <View>
          {dropDownOptions?.length != 0 ? (
            <FlatList
              keyExtractor={(_, index) => index.toString()}
              data={dropDownOptions}
              extraData={newSelectedSlot}
              contentContainerStyle={styles.timeContainer}
              numColumns={4}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    const selectedSlot = getTestSlotDetailsByTime(
                      slots,
                      (item?.slotInfo as UniqueSlotType)?.startTime,
                      (item?.slotInfo as UniqueSlotType)?.endTime
                    );
                    setSlotInfo(selectedSlot);
                    setPrepaidSlot(item?.slotInfo?.isPaidSlot);
                    setNewSelectedSlot(item?.value);
                    props.isReschdedule && setNewChangedDate(changedDate);
                    props.isReschdedule ? null : onSchedule(changedDate!, item, props.date);
                    // onSchedule(date!, slotInfo!); //if first needs to be selected
                  }}
                  style={[
                    styles.dateContentStyle,
                    {
                      backgroundColor:
                        newSelectedSlot == item?.value
                          ? theme.colors.APP_GREEN
                          : theme.colors.DEFAULT_BACKGROUND_COLOR,
                    },
                  ]}
                >
                  <>
                    {item?.slotInfo?.isPaidSlot ? (
                      isReschdedule ? null : (
                        <PremiumIcon style={styles.premiumIconAbsolute} />
                      )
                    ) : null}
                    <Text
                      style={[
                        styles.dateTextStyle,
                        {
                          color:
                            newSelectedSlot == item?.value ? 'white' : theme.colors.SHERPA_BLUE,
                        },
                      ]}
                    >
                      {moment(item?.value, 'hh:mm A').format('hh:mm a')}
                    </Text>
                  </>
                </TouchableOpacity>
              )}
            />
          ) : (
            renderNoSlots()
          )}
        </View>
      </View>
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
                    marginHorizontal: showInOverlay ? (width > 400 ? 5 : 1) : width > 400 ? 5 : 1, //1 : -4 (if width is 16 pixels gap)
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
        <Text style={styles.noSlotsText}>Sorry! No Slots are Available</Text>
      </View>
    );
  };

  const isDoneBtnDisabled = !newChangedDate || !slotInfo; //!date

  const renderBottomButton = (
    <Button
      style={{ margin: 16, marginTop: 5, width: 'auto' }}
      onPress={() => {
        if (!isDoneBtnDisabled) {
          onSchedule(newChangedDate!, slotInfo!, new Date()); //date
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
              marginBottom: !showInOverlay ? height / 2.8 : 0,
            },
            showInOverlay && { flex: 1 },
            !showInOverlay && { height: height / 1.5 },
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
          <ScrollView style={styles.containerContentStyle} bounces={false}>
            {renderCalendarView()}
            {isPrepaidSlot ? renderPremiumTag() : null}
            {renderSlotSelectionView()}
          </ScrollView>
          {showInOverlay && props.isReschdedule && dropDownOptions?.length
            ? renderBottomButton
            : null}
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
  },
  containerContentStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
    width: '94%',
    alignSelf: 'center',
    // backgroundColor: '#c8c8c8',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // width: '94%',
    marginTop: 60, //40
    // backgroundColor: '#c8c8c8',
  },
  noSlotsText: {
    ...theme.viewStyles.text('SB', 17, theme.colors.SHERPA_BLUE),
  },
  dateContentStyle: {
    width: width > 400 ? 68 : 64,
    height: 42,
    margin: width > 400 ? 12 : 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  dateTextStyle: {
    ...theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE),
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
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
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
});
