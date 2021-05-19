import { AphOverlay, AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
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
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  getDiagnosticSlotsCustomized,
  getDiagnosticSlotsCustomizedVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsCustomized';

export interface TestSlotSelectionOverlayProps extends AphOverlayProps {
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
const { width } = Dimensions.get('window');
export const TestSlotSelectionOverlay: React.FC<TestSlotSelectionOverlayProps> = (props) => {
  const { isTodaySlotUnavailable, maxDate } = props;
  const { cartItems } = useDiagnosticsCart();

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

  type UniqueSlotType = typeof uniqueSlots[0];

  const fetchSlots = (updatedDate?: Date) => {
    let dateToCheck = !!updatedDate ? updatedDate : date;
    setChangedDate(dateToCheck);
    if (!isVisible) return;
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

    return (
      <View style={[styles.sectionStyle, { paddingHorizontal: 16 }]}>
        <Text style={{ ...theme.viewStyles.text('M', 14, '#02475b'), marginTop: 16 }}>Slot</Text>
        <View style={styles.optionsView}>
          <MaterialMenu
            options={dropDownOptions}
            selectedText={slotInfo && `${formatTestSlot(slotInfo.slotInfo.startTime!)}`}
            menuContainerStyle={styles.menuStyle}
            itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b') }}
            selectedTextStyle={{ ...theme.viewStyles.text('M', 16, '#00b38e') }}
            onPress={({ data }) => {
              const selectedSlot = getTestSlotDetailsByTime(
                slots,
                (data as UniqueSlotType).startTime,
                (data as UniqueSlotType).endTime
              );
              setSlotInfo(selectedSlot);
            }}
          >
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <View style={[styles.placeholderViewStyle]}>
                <Text
                  style={[styles.placeholderTextStyle, , slotInfo ? null : styles.placeholderStyle]}
                >
                  {spinner
                    ? 'Loading...'
                    : dropDownOptions?.length
                    ? slotInfo
                      ? `${formatTestSlot(slotInfo.slotInfo.startTime!)}`
                      : 'Please select a slot'
                    : 'No slots available'}
                </Text>
                <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
                  <DropdownGreen />
                </View>
              </View>
            </View>
          </MaterialMenu>
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
      <CalendarView
        source={props.source}
        styles={{ marginBottom: 16 }}
        date={changedDate}
        minDate={new Date()}
        maxDate={props.maxDate}
        onPressDate={(selectedDate) => {
          setDate(selectedDate);
          setSlotInfo(undefined);
          setIsDateAutoSelected(false);
        }}
        calendarType={calendarType}
        onCalendarTypeChanged={(type) => {
          setCalendarType(type);
        }}
      />
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
    <AphOverlay {...aphOverlayProps}>
      <View style={styles.containerStyle}>
        {renderCalendarView()}
        {renderSlotSelectionView()}
        {renderBottomButton}
      </View>
    </AphOverlay>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    marginTop: 20,
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
