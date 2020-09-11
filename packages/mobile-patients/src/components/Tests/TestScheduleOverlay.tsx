import { AphOverlay, AphOverlayProps } from '@aph/mobile-patients/src/components/ui/AphOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  GET_DIAGNOSTIC_SLOTS,
  GET_PATIENT_ADDRESS_BY_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticSlots,
  getDiagnosticSlotsVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlots';
import { g, handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import {
  getPatientAddressById,
  getPatientAddressByIdVariables,
} from '../../graphql/types/getPatientAddressById';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    marginTop: 24,
  },
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
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

export interface SlotInfo {
  diagnosticBranchCode: string;
  employeeCode: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  slot: number;
}
export type TestScheduleType = 'home-visit' | 'clinic-visit';

export interface TestScheduleOverlayProps extends AphOverlayProps {
  options: [string, string][]; // Reschedule options = [key, value][];
  type: TestScheduleType;
  onReschedule: (
    type: TestScheduleType,
    date: Date,
    reason: string,
    comment?: string,
    slotInfo?: SlotInfo
  ) => void;
  addressId?: string;
  // for clinic-visit orders slotInfo wil be undefined
  // comment is optional

  // selectedSlot: SlotInfo;
  // slots: SlotInfo[];
  // onSchedule: (slotInfo: SlotInfo) => void;
}

export const TestScheduleOverlay: React.FC<TestScheduleOverlayProps> = (props) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [slotInfo, setSlotInfo] = useState<SlotInfo>();
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [calendarType, setCalendarType] = useState<CALENDAR_TYPE>(CALENDAR_TYPE.WEEK);
  const [overlayDropdown, setOverlayDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { options, type, onReschedule, addressId, loading: loadingProp, ...attributes } = props;
  const aphOverlayProps: AphOverlayProps = { ...attributes, loading: loading || loadingProp };
  const [zipCode, setZipCode] = useState('');

  const getAddressById = client.query<getPatientAddressById, getPatientAddressByIdVariables>({
    query: GET_PATIENT_ADDRESS_BY_ID,
    variables: { id: addressId },
  });
  const getSlots = client.query<getDiagnosticSlots, getDiagnosticSlotsVariables>({
    query: GET_DIAGNOSTIC_SLOTS,
    fetchPolicy: 'no-cache',
    variables: {
      patientId: g(currentPatient, 'id'),
      hubCode: 'HYD_HUB1',
      selectedDate: moment(date).format('YYYY-MM-DD'),
      zipCode: parseInt(zipCode, 10),
    },
  });

  const fetchSlots = () =>
    getSlots
      .then(({ data }) => {
        const slotsArray = g(data, 'getDiagnosticSlots', 'diagnosticSlot', '0' as any);
        const formattedSlotsArray = slotsArray!
          .slotInfo!.filter((item) => item!.status != 'booked')
          .filter((item) =>
            moment(date)
              .format('DMY')
              .toString() ===
            moment()
              .format('DMY')
              .toString()
              ? parseInt(item!.startTime!.split(':')[0], 10) >= parseInt(moment().format('k'), 10)
                ? parseInt(item!.startTime!.split(':')[1], 10) > moment().minute()
                : false
              : true
          )
          .map((item) => {
            return {
              diagnosticBranchCode: g(data, 'getDiagnosticSlots', 'diagnosticBranchCode'),
              employeeCode: g(slotsArray, 'employeeCode'),
              employeeName: g(slotsArray, 'employeeName'),
              startTime: item!.startTime,
              endTime: item!.endTime,
              slot: item!.slot,
            } as SlotInfo;
          });
        console.log('ARRAY OF SLOTS', { formattedSlotsArray });
        setSlots(formattedSlotsArray);
        setSlotInfo(formattedSlotsArray[0]);
      })
      .catch((e) => {
        CommonBugFender('TestScheduleOverlay_fetchSlots', e);
        console.log('getDiagnosticSlots Error', { e });
        if (!(g(e, 'graphQLErrors', '0', 'message') == 'NO_HUB_SLOTS')) {
          handleGraphQlError(e);
        }
      })
      .finally(() => {
        setLoading(false);
      });

  useEffect(() => {
    if (type == 'clinic-visit') {
      return;
    }
    console.log('EXECUTION STARTED');
    setLoading(true);
    if (zipCode) {
      fetchSlots();
    } else {
      getAddressById
        .then(({ data }) => {
          const _zipCode = g(data, 'getPatientAddressById', 'patientAddress', 'zipcode') || '';
          setZipCode(_zipCode);
          fetchSlots();
        })
        .catch((e) => {
          CommonBugFender('TestScheduleOverlay_getAddressById', e);
          handleGraphQlError(e);
          setLoading(false);
        });
    }
  }, [date]);

  const renderSlotSelectionView = () => {
    if (type == 'clinic-visit') return null;
    const dropDownOptions = slots.map((val) => ({
      key: val.slot.toString(),
      value: `${val.startTime} - ${val.endTime}`,
    }));
    const { width } = Dimensions.get('window');

    return (
      <View style={[styles.sectionStyle, { paddingHorizontal: 16 }]}>
        <Text style={{ ...theme.viewStyles.text('M', 14, '#02475b'), marginTop: 16 }}>Slot</Text>
        <View style={styles.optionsView}>
          <MaterialMenu
            options={dropDownOptions}
            selectedText={slotInfo && `${slotInfo.startTime} - ${slotInfo.endTime}`}
            menuContainerStyle={{
              alignItems: 'flex-end',
              marginTop: 24,
              marginLeft: width / 2 - 110,
            }}
            itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b') }}
            selectedTextStyle={{ ...theme.viewStyles.text('M', 16, '#00b38e') }}
            onPress={({ key }) => {
              const selectedSlot = slots.find((item) => item.slot.toString() == key)!;
              setSlotInfo(selectedSlot);
            }}
          >
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <View style={[styles.placeholderViewStyle]}>
                <Text
                  style={[styles.placeholderTextStyle, , slotInfo ? null : styles.placeholderStyle]}
                >
                  {loading
                    ? 'Loading...'
                    : dropDownOptions.length
                    ? slotInfo
                      ? `${slotInfo.startTime} - ${slotInfo.endTime}`
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
        date={date} // no default date initially
        minDate={new Date()}
        onPressDate={(selectedDate) => {
          setDate(selectedDate);
          type == 'home-visit' && setSlotInfo(undefined);
        }}
        calendarType={calendarType}
        onCalendarTypeChanged={(type) => {
          setCalendarType(type);
        }}
      />
    );
  };

  const optionsDropdown = overlayDropdown && (
    <Overlay
      onBackdropPress={() => setOverlayDropdown(false)}
      isVisible={overlayDropdown}
      overlayStyle={styles.dropdownOverlayStyle}
    >
      <DropDown
        cardContainer={{
          margin: 0,
        }}
        options={options.map(
          (item, i) =>
            ({
              onPress: () => {
                setSelectedReason(item[1]);
                setOverlayDropdown(false);
              },
              optionText: item[1],
            } as Option)
        )}
      />
    </Overlay>
  );

  const content = (
    <View style={{ paddingHorizontal: 16 }}>
      <Text
        style={[
          {
            marginBottom: 12,
            ...theme.viewStyles.text('M', 14, '#02475b'),
          },
        ]}
      >
        Why are you cancelling this order?
      </Text>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          setOverlayDropdown(true);
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={[
              {
                flex: 0.9,
                ...theme.fonts.IBMPlexSansMedium(18),
                color: theme.colors.SHERPA_BLUE,
              },
              selectedReason ? {} : { opacity: 0.3 },
            ]}
            numberOfLines={1}
          >
            {selectedReason || 'Select reason for cancelling'}
          </Text>
          <View style={{ flex: 0.1 }}>
            <DropdownGreen style={{ alignSelf: 'flex-end' }} />
          </View>
        </View>
        <View
          style={{
            marginTop: 5,
            backgroundColor: '#00b38e',
            height: 2,
          }}
        />
      </TouchableOpacity>
      <TextInputComponent
        value={comment}
        onChangeText={(text) => {
          setComment(text);
        }}
        label={'Add Comments (Optional)'}
        placeholder={'Enter your comments here…'}
      />
    </View>
  );

  const isDoneBtnDisabled = !date || !selectedReason || (type == 'home-visit' ? !slotInfo : false);

  const bottomButton = (
    <Button
      style={{ margin: 16, marginTop: 32, width: 'auto' }}
      onPress={() => {
        if (!isDoneBtnDisabled) {
          onReschedule(type, date!, selectedReason, comment, slotInfo);
        }
        onReschedule(type, date!, selectedReason, comment, slotInfo);
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
        {optionsDropdown}
        <View style={[styles.sectionStyle, { paddingVertical: 14, marginBottom: 0 }]}>
          {content}
        </View>
        {bottomButton}
      </View>
    </AphOverlay>
  );
};
