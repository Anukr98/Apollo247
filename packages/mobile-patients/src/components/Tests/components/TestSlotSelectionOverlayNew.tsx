import { AphOverlay, AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import {
  Morning,
  Afternoon,
  Night,
  MorningSelected,
  AfternoonSelected,
  NightSelected,
  DropdownGreen,
  InfoIconRed,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
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

export interface TestSlotSelectionOverlayNewProps extends AphOverlayProps {
  zipCode: number;
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
}
const { width, height } = Dimensions.get('window');
export const TestSlotSelectionOverlayNew: React.FC<TestSlotSelectionOverlayNewProps> = (props) => {
  const { isTodaySlotUnavailable, maxDate } = props;
  const { cartItems } = useDiagnosticsCart();
  const [selectedDayTab, setSelectedDayTab] = useState(0);
  const [slotInfo, setSlotInfo] = useState<TestSlot | undefined>(props.slotInfo);
  const [slots, setSlots] = useState<TestSlot[]>(props.slots);
  const [date, setDate] = useState<Date>(props.date);
  const [changedDate, setChangedDate] = useState<Date>(props.date);
  const [calendarType, setCalendarType] = useState<CALENDAR_TYPE>(CALENDAR_TYPE.MONTH);
  const [isDateAutoSelected, setIsDateAutoSelected] = useState(true);
  const client = useApolloClient();
  const [spinner, showSpinner] = useState(false);
  const { zipCode, onSchedule, isVisible, ...attributes } = props;
  const aphOverlayProps: AphOverlayProps = { ...attributes, loading: spinner, isVisible };
  const uniqueSlots = getUniqueTestSlots(slots);
  const dt = moment(props.slotBooked!).format('YYYY-MM-DD') || null;
  const tm = moment(props.slotBooked!).format('hh:mm') || null;
  const isSameDate = moment().isSame(moment(date), 'date');
  const itemId = props.itemId;
  const cartItemsWithId = cartItems?.map((item) => Number(item?.id));
  const [selectedDate, setSelectedDate] = useState('12');
  type UniqueSlotType = typeof uniqueSlots[0];
  const datearray = [
    {
      date: '12',
      day: 'Mon',
    },
    {
      date: '13',
      day: 'Tue',
    },
    {
      date: '14',
      day: 'Wed',
    },
    {
      date: '15',
      day: 'Thu',
    },
    {
      date: '16',
      day: 'Fri',
    },
    {
      date: '17',
      day: 'Sat',
    },
    {
      date: '18',
      day: 'Sun',
    },
    {
      date: '19',
      day: 'Mon',
    },
    {
      date: '20',
      day: 'Tue',
    },
  ];
  const fetchSlots = (updatedDate?: Date) => {
    let dateToCheck = !!updatedDate ? updatedDate : date;
    setChangedDate(dateToCheck);
    if (!isVisible || !zipCode) return;
    showSpinner(true);
    client
      .query<getDiagnosticSlotsCustomized, getDiagnosticSlotsCustomizedVariables>({
        query: GET_CUSTOMIZED_DIAGNOSTIC_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          selectedDate: moment(dateToCheck).format('YYYY-MM-DD'),
          areaID: Number(props.areaId!),
          itemIds: props.isReschdedule ? itemId! : cartItemsWithId,
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

  const renderSlotSelectionView = () => {
    const dropDownOptions = uniqueSlots?.map((val) => ({
      key: `${formatTestSlot(val.startTime)}`,
      value: `${formatTestSlot(val.startTime)}`,
      data: val,
    }));
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
    // console.log('dropDownOptions :>> ', dropDownOptions);
    const wait = [
      { data: { endTime: '06:00', startTime: '06:00' }, key: '06:00 AM', value: '06:00 AM' },
      { data: { endTime: '06:30', startTime: '06:30' }, key: '06:30 AM', value: '06:30 AM' },
      { data: { endTime: '07:00', startTime: '07:00' }, key: '07:00 AM', value: '07:00 AM' },
      { data: { endTime: '07:30', startTime: '07:30' }, key: '07:30 AM', value: '07:30 AM' },
      { data: { endTime: '08:00', startTime: '08:00' }, key: '08:00 AM', value: '08:00 AM' },
      { data: { endTime: '08:30', startTime: '08:30' }, key: '08:30 AM', value: '08:30 AM' },
      { data: { endTime: '09:00', startTime: '09:00' }, key: '09:00 AM', value: '09:00 AM' },
      { data: { endTime: '09:30', startTime: '09:30' }, key: '09:30 AM', value: '09:30 AM' },
      { data: { endTime: '10:00', startTime: '10:00' }, key: '10:00 AM', value: '10:00 AM' },
      { data: { endTime: '10:30', startTime: '10:30' }, key: '10:30 AM', value: '10:30 AM' },
    ];
    return (
      <View>
        <View style={styles.dayPhaseContainer}>
          {dayPhaseArray.map((item, index) => (
            <TouchableOpacity
              style={[styles.dayPhaseStyle,{
                borderBottomColor: selectedDayTab == index ? theme.colors.APP_GREEN : theme.colors.WHITE,
                borderBottomWidth: selectedDayTab == index ? 4 : 0,
              }]}
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
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            data={dropDownOptions}
            contentContainerStyle={styles.timeContainer}
            numColumns={4}
            renderItem={({ item, index }) => (
              <View style={styles.dateContentStyle}>
                <Text style={styles.dateTextStyle}>{item?.value}</Text>
              </View>
            )}
          />
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
              <View
                style={{
                  borderColor: '#cccccc',
                  borderWidth: 1,
                  borderRadius: 10,
                  margin: 10,
                  padding: 10,
                }}
              >
                <Text
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(15),
                    color: theme.colors.LIGHT_BLUE,
                    padding: 10,
                  }}
                >
                  {`${moment().format('MMMM')} ${moment().format('YYYY')}`}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {datearray.map((item, index) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedDate(item?.date);
                      }}
                      style={[
                        styles.dateContainer,
                        {
                          backgroundColor:
                            selectedDate == item?.date ? theme.colors.APP_GREEN : 'transparent',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateStyle,
                          {
                            color: selectedDate == item?.date ? 'white' : theme.colors.SHERPA_BLUE,
                          },
                        ]}
                      >
                        {item?.date}
                      </Text>
                      <Text
                        style={[
                          styles.dayStyle,
                          {
                            color: selectedDate == item?.date ? 'white' : theme.colors.SHERPA_BLUE,
                          },
                        ]}
                      >
                        {item?.day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          );
        };;

  const isDoneBtnDisabled = !date || !slotInfo;
  const infoPanel = () => {
    return (
      <View style={styles.warningbox}>
        <InfoIconRed />
        <Text
          style={{
            ...theme.fonts.IBMPlexSansRegular(10),
            color: theme.colors.LIGHT_BLUE,
            padding: 10,
          }}
        >
          Phelbo will arrive within 30 minutes of the slot time
        </Text>
      </View>
    );
  };
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
      // onRequestClose={() => (onPressClose())}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <View style={styles.containerStyle}>
        {renderCalendarView()}
        {infoPanel()}
        {renderSlotSelectionView()}
        {renderBottomButton}
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: 160,
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
  warningbox: {
    backgroundColor: '#FCFDDA',
    flexDirection: 'row',
    borderRadius: 10,
    margin: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dateContainer: {
    width: 75,
    height: 75,
    marginHorizontal: 10,
    borderRadius: 10,
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
  dateContentStyle: {
    width: 68,
    height: 42,
    margin: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  dateTextStyle:{
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
});
