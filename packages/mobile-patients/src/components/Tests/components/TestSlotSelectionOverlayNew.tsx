import { AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Morning,
  Afternoon,
  Night,
  MorningSelected,
  AfternoonSelected,
  NightSelected,
  EmptySlot,
  CrossPopup,
  PremiumIcon
} from '@aph/mobile-patients/src/components/ui/Icons';
import { GET_CUSTOMIZED_DIAGNOSTIC_SLOTS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  formatTestSlot,
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
import {
  getDiagnosticSlotsCustomized,
  getDiagnosticSlotsCustomizedVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsCustomized';
import { Overlay } from 'react-native-elements';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { createAddressObject } from '@aph/mobile-patients/src/utils/commonUtils';
import { colors } from '@aph/mobile-patients/src/theme/colors';

export interface TestSlotSelectionOverlayNewProps extends AphOverlayProps {
  maxDate: Date;
  date: Date;
  slotInfo?: TestSlot;
  slots: TestSlot[];
  areaId: string;
  isReschdedule?: boolean;
  slotBooked?: string;
  isTodaySlotUnavailable?: boolean;
  onSchedule: (date: Date, slotInfo: TestSlot) => void;
  itemId?: any[];
  source?: string;
  isVisible: boolean;
  addressDetails?: any;
}
const { width } = Dimensions.get('window');
export const TestSlotSelectionOverlayNew: React.FC<TestSlotSelectionOverlayNewProps> = (props) => {
  const { isTodaySlotUnavailable, maxDate, addressDetails } = props;
  const { cartItems } = useDiagnosticsCart();
  const [selectedDayTab, setSelectedDayTab] = useState(0);
  const [slotInfo, setSlotInfo] = useState<TestSlot | undefined>(props.slotInfo);
  const [slots, setSlots] = useState<TestSlot[]>(props.slots);
  const [date, setDate] = useState<Date>(props.date);
  const [isDateAutoSelected, setIsDateAutoSelected] = useState(true);
  const client = useApolloClient();
  const [spinner, showSpinner] = useState(false);
  const { onSchedule, isVisible, ...attributes } = props;
  const uniqueSlots = getUniqueTestSlots(slots);
  const dt = moment(props.slotBooked!).format('YYYY-MM-DD') || null;
  const tm = moment(props.slotBooked!).format('hh:mm') || null;
  const isSameDate = moment().isSame(moment(date), 'date');
  const itemId = props.itemId;
  const cartItemsWithId = cartItems?.map((item) => Number(item?.id));
  const [selectedDate, setSelectedDate] = useState<string>(moment(date).format('DD') || '');
  const [newSelectedSlot, setNewSelectedSlot] = useState(
    `${formatTestSlot(slotInfo?.slotInfo?.startTime!)}` || ''
  );
  type UniqueSlotType = typeof uniqueSlots[0];

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

  const fetchSlots = (updatedDate?: Date) => {
    let dateToCheck = !!updatedDate ? updatedDate : date;
    const getAddressObject = createAddressObject(addressDetails);
    if (!isVisible) return;
    setSelectedDate(moment(dateToCheck).format('DD'));
    showSpinner(true);
    client
      .query<getDiagnosticSlotsCustomized, getDiagnosticSlotsCustomizedVariables>({
        query: GET_CUSTOMIZED_DIAGNOSTIC_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          selectedDate: moment(dateToCheck).format('YYYY-MM-DD'),
          areaID: Number(props.areaId!),
          itemIds: props.isReschdedule ? itemId! : cartItemsWithId,
          patientAddressObj: getAddressObject,
        },
      })
      .then(({ data }) => {
        const diagnosticSlots = g(data, 'getDiagnosticSlotsCustomized', 'slots') || [];
        const updatedDiagnosticSlots =
          moment(dateToCheck).format('YYYY-MM-DD') == dt && props.isReschdedule
            ? diagnosticSlots.filter((item) => item?.Timeslot != tm)
            : diagnosticSlots;
        const slotsArray: TestSlot[] = [];
        updatedDiagnosticSlots?.forEach((item) => {
          //all the hardcoded values are not returned by api.
          slotsArray.push({
            employeeCode: 'apollo_employee_code',
            employeeName: 'apollo_employee_name',
            slotInfo: {
              endTime: item?.Timeslot!,
              status: 'empty',
              startTime: item?.Timeslot!,
              slot: item?.TimeslotID,
            },
            date: dateToCheck,
            diagnosticBranchCode: 'apollo_route',
          } as TestSlot);
        });
        // if slot is empty then refetch it for next date
        const isSameDate = moment().isSame(moment(date), 'date');
        const hasReachedEnd = moment(dateToCheck).isSameOrAfter(moment(maxDate), 'date');
        if (!hasReachedEnd && slotsArray?.length == 0 && isDateAutoSelected) {
          let changedDate = moment(dateToCheck) //date
            .add(1, 'day')
            .toDate();

          fetchSlots(changedDate);
        } else {
          setSlots(slotsArray);
          slotsArray?.length && setSlotInfo(slotsArray?.[0]);
          setNewSelectedSlot(`${formatTestSlot(slotsArray?.[0]?.slotInfo?.startTime!)}` || '');
          showSpinner(false);
        }
      })
      .catch((e) => {
        const noHubSlots = g(e, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';
        if (!noHubSlots) {
          handleGraphQlError(e);
        }
        showSpinner(false);
      });
  };

  useEffect(() => {
    fetchSlots();
  }, [date]);

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
    {
      tab: 2,
      activeImage: <NightSelected />,
      inactiveImage: <Night />,
      title: 'Evening',
    },
  ];

  let dropDownOptions = uniqueSlots?.map((val) => ({
    key: `${formatTestSlot(val.startTime)}`,
    value: `${formatTestSlot(val.startTime)}`,
    data: val,
  }));

  const time24 = (item: any) => {
    return moment(item?.value, 'hh:mm A').format('HH');
  };

  if (selectedDayTab == 1) {
    //for afternoon 12-17
    dropDownOptions = dropDownOptions.filter((item) => {
      if (time24(item) >= '12' && time24(item) < '17') {
        return item;
      }
    });
  } else if (selectedDayTab == 2) {
    //for evening 17 - 6
    dropDownOptions = dropDownOptions.filter((item) => {
      if (time24(item) >= '17' && time24(item) < '06') {
        return item;
      }
    });
  } else if (selectedDayTab == 0) {
    //for morning 6- 12
    dropDownOptions = dropDownOptions.filter((item) => {
      if (time24(item) >= '06' && time24(item) < '12') {
        return item;
      }
    });
  }
  const renderPremiumTag = () => {
    return (
      <View style={styles.premiumTag}>
        <PremiumIcon style={styles.premiumIcon}/>
        <Text style={styles.premiumText}>
          Premium Slot - Additional charge of ₹125 will be levied{' '}
        </Text>
      </View>
    );
  };
  const renderSlotSelectionView = () => {
    return (
      <View>
        <View style={styles.dayPhaseContainer}>
          {dayPhaseArray.map((item, index) => (
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
                  padding: 10,
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
                      (item?.data as UniqueSlotType)?.startTime,
                      (item?.data as UniqueSlotType)?.endTime
                    );
                    setSlotInfo(selectedSlot);
                    setNewSelectedSlot(item?.value);
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
                  <PremiumIcon style={styles.premiumIconAbsolute}/>
                  <Text
                    style={[
                      styles.dateTextStyle,
                      {
                        color: newSelectedSlot == item?.value ? 'white' : theme.colors.SHERPA_BLUE,
                      },
                    ]}
                  >
                    {moment(item?.value,'hh:mm A').format('hh:mm a')}
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

    const isCurrentDateSlotUnavailable = isSameDate && uniqueSlots?.length == 0;
    //date is the selected date & minDate : date to show.
    const dateToHighlight =
      isCurrentDateSlotUnavailable && isDateAutoSelected
        ? moment(date)
            .add(1, 'day')
            .toDate()
        : date;

    const minDateToShow = props.isReschdedule
      ? new Date()
      : !!isTodaySlotUnavailable && isTodaySlotUnavailable
      ? moment(new Date())
          .add(1, 'day')
          .toDate()
      : new Date();
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
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dateStyle,
                    {
                      color: selectedDate == item?.dates ? 'white' : theme.colors.SHERPA_BLUE,
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
  const isDoneBtnDisabled = !date || !slotInfo;

  const renderBottomButton = (
    <Button
      style={{ margin: 16, marginTop: 5, width: 'auto' }}
      onPress={() => {
        if (!isDoneBtnDisabled) {
          onSchedule(date!, slotInfo!);
        }
      }}
      disabled={isDoneBtnDisabled}
      title={'DONE'}
    />
  );

  return (
    <Overlay
      isVisible
      onRequestClose={() => props.onClose()}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <>
        <TouchableOpacity
          style={styles.closeContainer}
          onPress={() => {
            props.onClose();
          }}
        >
          <CrossPopup />
        </TouchableOpacity>
        <View style={styles.containerStyle}>
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
            {' '}
            {props.heading}
          </Text>
          <ScrollView style={styles.containerContentStyle}>
            {renderCalendarView()}
            {renderPremiumTag()}
            {renderSlotSelectionView()}
          </ScrollView>
          {dropDownOptions.length ? renderBottomButton : null}
        </View>
        {spinner && <Spinner />}
      </>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 140,
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
    backgroundColor: '#FCFDDA',
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
  },
  premiumIcon: {
    width: 16,
    height: 16,
  },
  dateContainer: {
    marginHorizontal: width > 400 ? 5 : 1, //5
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
    width: '94%',
    paddingVertical: 40,
    alignSelf: 'center',
    // backgroundColor: '#c8c8c8',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSlotsText: {
    ...theme.viewStyles.text('SB', 17, theme.colors.SHERPA_BLUE),
  },
  dateContentStyle: {
    width: 68,
    height: 42,
    margin: 12,
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
