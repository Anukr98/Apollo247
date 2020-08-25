import { AphOverlay, AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { GET_DIAGNOSTIC_IT_DOSE_SLOTS } from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetDiagnosticItDoseSlots,
  GetDiagnosticItDoseSlotsVariables,
} from '@aph/mobile-patients/src/graphql/types/GetDiagnosticItDoseSlots';
import {
  formatTestSlot,
  g,
  handleGraphQlError,
  isValidTestSlot,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { TestSlot } from '@aph/mobile-patients/src/components/Tests/TestsCart';

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

  const fetchSlots = () => {
    if (!isVisible || !zipCode) return;
    showSpinner(true);
    client
      .query<GetDiagnosticItDoseSlots, GetDiagnosticItDoseSlotsVariables>({
        query: GET_DIAGNOSTIC_IT_DOSE_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: g(currentPatient, 'id'),
          selectedDate: moment(date).format('YYYY-MM-DD'),
          zipCode: Number(zipCode),
        },
      })
      .then(({ data }) => {
        const diagnosticSlots =
          (g(data, 'getDiagnosticItDoseSlots', 'slotInfo') as TestSlot[]) || [];
        const slotsArray = diagnosticSlots.filter((slot) => isValidTestSlot(slot, date));
        setSlots(slotsArray);
        setSlotInfo(slotsArray[0]);
      })
      .catch((e) => {
        console.log('getDiagnosticItDoseSlots Error', { e });
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
    const dropDownOptions = slots.map((val) => ({
      key: val.TimeslotID!,
      value: `${formatTestSlot(val.Timeslot!)}`,
      data: val,
    }));

    console.log('dropDownOptions', { dropDownOptions });

    const { width } = Dimensions.get('window');

    return (
      <View style={[styles.sectionStyle, { paddingHorizontal: 16 }]}>
        <Text style={{ ...theme.viewStyles.text('M', 14, '#02475b'), marginTop: 16 }}>Slot</Text>
        <View style={styles.optionsView}>
          <MaterialMenu
            options={dropDownOptions}
            selectedText={slotInfo && `${formatTestSlot(slotInfo.Timeslot!)}`}
            menuContainerStyle={{
              alignItems: 'flex-end',
              marginTop: 24,
              marginLeft: width / 2 - 110,
            }}
            itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b') }}
            selectedTextStyle={{ ...theme.viewStyles.text('M', 16, '#00b38e') }}
            onPress={({ data }) => {
              console.log('selectedSlot', { data });
              setSlotInfo(data);
            }}
          >
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <View style={[styles.placeholderViewStyle]}>
                <Text
                  style={[styles.placeholderTextStyle, slotInfo ? null : styles.placeholderStyle]}
                >
                  {spinner
                    ? 'Loading...'
                    : dropDownOptions.length
                    ? slotInfo
                      ? `${formatTestSlot(slotInfo.Timeslot!)}`
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
          onSchedule(date, slotInfo!);
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
