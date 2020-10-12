import { AphOverlay, AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import {
  GET_DIAGNOSTIC_SLOTS,
  GET_DIAGNOSTIC_SLOTS_WITH_AREA_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticSlots,
  getDiagnosticSlotsVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlots';
import {
  formatTestSlot,
  formatTestSlotWithBuffer,
  g,
  getTestSlotDetailsByTime,
  getUniqueTestSlots,
  handleGraphQlError,
  isValidTestSlot,
  isValidTestSlotWithArea,
  TestSlot,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  getDiagnosticSlotsWithAreaID,
  getDiagnosticSlotsWithAreaIDVariables,
} from '../../graphql/types/getDiagnosticSlotsWithAreaID';

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

export interface TestSlotSelectionOverlayProps extends AphOverlayProps {
  zipCode: number;
  maxDate: Date;
  date: Date;
  slotInfo?: TestSlot;
  slots: TestSlot[];
  areaId: string;
  onSchedule: (date: Date, slotInfo: TestSlot) => void;
}

export const TestSlotSelectionOverlay: React.FC<TestSlotSelectionOverlayProps> = (props) => {
  const [slotInfo, setSlotInfo] = useState<TestSlot | undefined>(props.slotInfo);
  const [slots, setSlots] = useState<TestSlot[]>(props.slots);
  const [date, setDate] = useState<Date>(props.date);
  const [calendarType, setCalendarType] = useState<CALENDAR_TYPE>(CALENDAR_TYPE.WEEK);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [spinner, showSpinner] = useState(false);
  const { zipCode, onSchedule, isVisible, ...attributes } = props;
  const aphOverlayProps: AphOverlayProps = { ...attributes, loading: spinner, isVisible };
  const uniqueSlots = getUniqueTestSlots(slots);
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

        const slotsArray: TestSlot[] = [];
        diagnosticSlots!.forEach((item) => {
          if (isValidTestSlotWithArea(item!, date)) {
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

        setSlots(slotsArray);
        uniqueSlots.length &&
          setSlotInfo(
            getTestSlotDetailsByTime(slotsArray, uniqueSlots[0].startTime!, uniqueSlots[0].endTime!)
          );
      })
      .catch((e) => {
        console.log('getDiagnosticSlots Error', { e });
        const noHubSlots = g(e, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';
        if (!noHubSlots) {
          handleGraphQlError(e);
        }
      })
      .finally(() => {
        showSpinner(false);
      });
  };

  useEffect(() => {
    fetchSlots();
  }, [date]);

  const renderSlotSelectionView = () => {
    const dropDownOptions = uniqueSlots.map((val) => ({
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
                    : dropDownOptions.length
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
    return (
      <CalendarView
        styles={{ marginBottom: 16 }}
        date={date}
        minDate={new Date()}
        maxDate={props.maxDate}
        onPressDate={(selectedDate) => {
          setDate(selectedDate);
          setSlotInfo(undefined);
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
