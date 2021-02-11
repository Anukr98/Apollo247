import { AphOverlay, AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID } from '@aph/mobile-patients/src/graphql/profiles';
import {
  formatTestSlotWithBuffer,
  g,
  isValidTestSlotWithArea,
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
import {
  getDiagnosticSlotsWithAreaID,
  getDiagnosticSlotsWithAreaIDVariables,
  getDiagnosticSlotsWithAreaID_getDiagnosticSlotsWithAreaID_slots,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsWithAreaID';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

export interface TestSlotSelectionOverlayProps extends AphOverlayProps {
  zipCode: number;
  maxDate: Date;
  date: Date;
  slotInfo?: TestSlot;
  slots: TestSlot[];
  areaId: string;
  isReschdedule?: boolean;
  slotBooked?: string;
  onSchedule: (date: Date, slotInfo: TestSlot) => void;
  itemId?: any[];
}

export const TestSlotSelectionOverlay: React.FC<TestSlotSelectionOverlayProps> = (props) => {
  const { cartItems } = useDiagnosticsCart();

  const [slotInfo, setSlotInfo] = useState<TestSlot | undefined>(props.slotInfo);
  const [slots, setSlots] = useState<TestSlot[]>(props.slots);
  const [date, setDate] = useState<Date>(props.date);
  const [calendarType, setCalendarType] = useState<CALENDAR_TYPE>(CALENDAR_TYPE.WEEK);
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

  const checkCovidItem = props.isReschdedule
    ? itemId?.map((item) =>
        AppConfig.Configuration.DIAGNOSTIC_COVID_SLOT_ITEMID.includes(Number(item))
      )
    : cartItems?.map((item) =>
        AppConfig.Configuration.DIAGNOSTIC_COVID_SLOT_ITEMID.includes(Number(item?.id))
      );
  const isCovidItemInCart = checkCovidItem?.find((item) => item == false);
  const isContainOnlyCovidItem = isCovidItemInCart == undefined ? true : isCovidItemInCart;
  type UniqueSlotType = typeof uniqueSlots[0];

  const fetchSlots = () => {
    if (!isVisible || !zipCode) return;
    showSpinner(true);
    client
      .query<getDiagnosticSlotsWithAreaID, getDiagnosticSlotsWithAreaIDVariables>({
        query: GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID,
        fetchPolicy: 'no-cache',
        variables: {
          selectedDate: moment(date).format('YYYY-MM-DD'),
          areaID: parseInt(props.areaId!),
        },
      })
      .then(({ data }) => {
        const diagnosticSlots = g(data, 'getDiagnosticSlotsWithAreaID', 'slots') || [];
        console.log('ORIGINAL DIAGNOSTIC SLOTS', { diagnosticSlots });
        const updatedDiagnosticSlots =
          moment(date).format('YYYY-MM-DD') == dt && props.isReschdedule
            ? diagnosticSlots.filter((item) => item?.Timeslot != tm)
            : diagnosticSlots;

        const covidItem_Slot_StartTime = moment(
          AppConfig.Configuration.DIAGNOSTIC_COVID_MIN_SLOT_TIME,
          'HH:mm'
        );
        const diagnosticSlotsToShow = isContainOnlyCovidItem
          ? updatedDiagnosticSlots?.filter((item) =>
              moment(item?.Timeslot!, 'HH:mm').isSameOrAfter(covidItem_Slot_StartTime)
            )
          : updatedDiagnosticSlots;
        const slotsArray: TestSlot[] = [];
        diagnosticSlotsToShow?.forEach((item) => {
          if (isValidTestSlotWithArea(item!, date, isContainOnlyCovidItem!)) {
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
              date: date,
              diagnosticBranchCode: 'apollo_route',
            } as TestSlot);
          }
        });

        const uniqueSlots = getUniqueTestSlots(slotsArray);
        console.log('ARRAY OF SLOTS', { slotsArray });
        console.log('UNIQUE SLOTS', { uniqueSlots });
        // if slot is empty then refetch it for next date
        const isSameDate = moment().isSame(moment(date), 'date');
        if (isSameDate && uniqueSlots?.length == 0 && isDateAutoSelected) {
          setDate(
            moment(date)
              .add(1, 'day')
              .toDate()
          );
          showSpinner(true);
        } else {
          setSlots(slotsArray);
          uniqueSlots.length &&
            setSlotInfo(
              getTestSlotDetailsByTime(
                slotsArray,
                uniqueSlots[0].startTime!,
                uniqueSlots[0].endTime!
              )
            );
          showSpinner(false);
        }
      })
      .catch((e) => {
        console.log('getDiagnosticSlots Error', { e });
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
      key: `${formatTestSlotWithBuffer(val.startTime)}`,
      value: `${formatTestSlotWithBuffer(val.startTime)}`,
      data: val,
    }));

    console.log('dropDownOptions', { dropDownOptions, uniqueSlots });

    const { width } = Dimensions.get('window');
    return (
      <View style={[styles.sectionStyle, { paddingHorizontal: 16 }]}>
        <Text style={{ ...theme.viewStyles.text('M', 14, '#02475b'), marginTop: 16 }}>Slot</Text>
        <View style={styles.optionsView}>
          <MaterialMenu
            options={dropDownOptions}
            selectedText={slotInfo && `${formatTestSlotWithBuffer(slotInfo.slotInfo.startTime!)}`}
            menuContainerStyle={{
              alignItems: 'flex-end',
              marginTop: 24,
              marginLeft: width / 2 - 110,
            }}
            itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b') }}
            selectedTextStyle={{ ...theme.viewStyles.text('M', 16, '#00b38e') }}
            onPress={({ data }) => {
              console.log('selectedSlot', { data });

              const selectedSlot = getTestSlotDetailsByTime(
                slots,
                (data as UniqueSlotType).startTime,
                (data as UniqueSlotType).endTime
              );
              console.log('selectedSlot\n\n', { selectedSlot });
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
                      ? `${formatTestSlotWithBuffer(slotInfo.slotInfo.startTime!)}`
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

    return (
      <CalendarView
        styles={{ marginBottom: 16 }}
        date={dateToHighlight}
        minDate={new Date()}
        // minDate={minDate}
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
      style={{ margin: 16, marginTop: 32, width: 'auto' }}
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
});
