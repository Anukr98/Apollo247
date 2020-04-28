import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, CircularProgress } from '@material-ui/core';
import {
  AphButton,
  AphDialog,
  AphDialogTitle,
  AphDialogClose,
  AphSelect,
} from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import { AphCalendar } from 'components/AphCalendar';
import { GET_DIAGNOSTIC_SLOTS } from 'graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import {
  getDiagnosticSlots,
  getDiagnosticSlotsVariables,
  getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot_slotInfo,
} from 'graphql/types/getDiagnosticSlots';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useDiagnosticsCart, DiagnosticSlot } from 'components/Tests/DiagnosticsCartProvider';
import moment from 'moment';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    appointmentWrapper: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      padding: 10,
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      marginTop: 5,
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginTop: 8,
      },
    },
    selectMenuRoot: {
      paddingRight: 55,
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 50,
      fontWeight: 600,
      lineHeight: '66px',
      paddingTop: 2,
      paddingBottom: 7,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      [theme.breakpoints.down('xs')]: {
        fontSize: 30,
        lineHeight: '46px',
      },
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: 'solid 0.5px rgba(2, 71, 91, 0.3)',
      paddingBottom: 8,
      marginBottom: 9,
      '& img': {
        marginRight: 22,
      },
    },
    appointmentInfo: {
      marginTop: 9,
      marginBottom: 14,
    },
    details: {
      display: 'flex',
      marginBottom: 4,
    },
    date: {
      marginLeft: 'auto',
    },
    time: {
      marginLeft: 'auto',
    },
    pickSlot: {
      textAlign: 'right',
      '& button': {
        padding: 0,
        color: '#fc9916',
        boxShadow: 'none',
        fontWeight: 'bold',
        paddingLeft: 20,
        marginLeft: 'auto',
        '&:hover': {
          backgroundColor: 'transparent',
          color: '#fc9916',
        },
      },
    },
    rescheduleButton: {
      paddingTop: 8,
      display: 'flex',
      '& button': {
        color: '#fc9916',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: 0,
        minWidth: 'auto',
      },
    },
    wrapperCards: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      padding: 16,
      marginTop: 16,
      marginBottom: 16,
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        margin: 0,
      },
    },
    wrapperCardSlots: {
      backgroundColor: '#f7f8f5',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      padding: 16,
      marginTop: 16,
      marginBottom: 16,
      '& p': {
        fontSize: 14,
        fontWeight: 500,
        color: '#02475b',
        margin: 0,
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    doneButton: {
      padding: 16,
      marginBOttom: 16,
      '& button': {
        width: '100%',
      },
    },
    selectContainer: {
      '& > div': {
        paddingTop: 0,
      },
    },
    noAddress: {
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      paddingBottom: 10,
    },
  };
});

export interface TestSlot {
  employeeCode: string;
  employeeName: string;
  diagnosticBranchCode: string;
  date: any;
  slotInfo: any;
}

type AppointmentsSlotProps = {
  setIsSlotSet: (isSlotSet: boolean) => void;
};

export const AppointmentsSlot: React.FC<AppointmentsSlotProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const {
    deliveryAddressId,
    setDiagnosticSlot,
    diagnosticSlot,
    deliveryAddresses,
  } = useDiagnosticsCart();
  const [isUploadPreDialogOpen, setIsUploadPreDialogOpen] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TestSlot | null>();
  const [date, setDate] = useState<Date>(
    diagnosticSlot ? new Date(diagnosticSlot.date) : new Date()
  );
  const [options, setOptions] = useState<{ key: string; value: string; data: any }[] | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<boolean>(false);

  const appStaticVariables = {
    Minutes: 60, // slots visible after this period for current date
    Days: 2, // slots can be booked upto this period
    Maxslot: '12:00', // 24 hours format
  };

  const getUniqueTestSlots = (slots: TestSlot[]) => {
    return slots
      .filter(
        (item, idx, array) =>
          array.findIndex(
            (_item) =>
              _item.slotInfo.startTime == item.slotInfo.startTime &&
              _item.slotInfo.endTime == item.slotInfo.endTime
          ) == idx
      )
      .map((val) => ({
        startTime: val.slotInfo.startTime!,
        endTime: val.slotInfo.endTime!,
        diagnosticBranchCode: val.diagnosticBranchCode,
        diagnosticEmployeeCode: val.employeeCode,
        slotInfo: val.slotInfo,
      }))
      .sort((a, b) => {
        if (moment(a.startTime.trim(), 'HH:mm').isAfter(moment(b.startTime.trim(), 'HH:mm')))
          return 1;
        else if (moment(b.startTime.trim(), 'HH:mm').isAfter(moment(a.startTime.trim(), 'HH:mm')))
          return -1;
        return 0;
      });
  };

  const getTestSlotDetailsByTime = (slots: TestSlot[], startTime: string, endTime: string) => {
    return slots.find(
      (item) => item.slotInfo.startTime === startTime && item.slotInfo.endTime === endTime
    )!;
  };

  const isValidTestSlot = (
    slot: getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot_slotInfo,
    date: Date
  ) => {
    return (
      slot.status != 'booked' &&
      (moment(date).format('DMY').toString() === moment().format('DMY').toString()
        ? moment(slot.startTime!.trim(), 'HH:mm').isSameOrAfter(
            moment(new Date()).add(appStaticVariables.Minutes, 'minutes')
          )
        : true) &&
      moment(slot.endTime!.trim(), 'HH:mm').isSameOrBefore(
        appStaticVariables.Maxslot && moment(appStaticVariables.Maxslot.trim(), 'HH:mm')
      )
    );
  };

  const selectedAddr = deliveryAddresses.find((item) => item.id == deliveryAddressId);

  const checkServicability = (selectedAddress: any) => {
    setLoading(true);
    client
      .query<getDiagnosticSlots, getDiagnosticSlotsVariables>({
        query: GET_DIAGNOSTIC_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: currentPatient ? currentPatient.id : '',
          hubCode: 'HYD_HUB1', // not considering this field at backend
          selectedDate: moment(date).format('YYYY-MM-DD'),
          zipCode: parseInt(selectedAddress.zipcode),
        },
      })
      .then((res) => {
        const { data, errors } = res;
        if (errors && errors[0].message.length > 0 && !data) {
          setSlotsError(true);
          return;
        }

        if (diagnosticSlot && date === new Date(diagnosticSlot.date)) {
          setSelectedTimeSlot({
            date: new Date(diagnosticSlot.date),
            diagnosticBranchCode: '',
            employeeCode: diagnosticSlot.diagnosticEmployeeCode,
            employeeName: '', // not sending name to API hence keeping empty
            slotInfo: {
              __typename: 'SlotInfo',
              endTime: diagnosticSlot.slotEndTime,
              slot: diagnosticSlot.employeeSlotId,
              startTime: diagnosticSlot.slotStartTime,
              status: 'empty',
            },
          });
        } else if (data && data.getDiagnosticSlots && data.getDiagnosticSlots.diagnosticSlot) {
          const diagnosticSlots = data.getDiagnosticSlots.diagnosticSlot || [];
          const slotsArray: TestSlot[] = [];
          diagnosticSlots!.forEach((item) => {
            item!.slotInfo!.forEach((slot) => {
              if (isValidTestSlot(slot!, date)) {
                slotsArray.push({
                  employeeCode: item!.employeeCode,
                  employeeName: item!.employeeName,
                  slotInfo: slot,
                  date: date,
                  diagnosticBranchCode: data.getDiagnosticSlots.diagnosticBranchCode,
                } as TestSlot);
              }
            });
          });
          const uniqueSlots = getUniqueTestSlots(slotsArray);
          if (uniqueSlots.length > 0) {
            const dropDownOptions = uniqueSlots.map((val: any) => ({
              key: `${formatTestSlot(val.startTime)} - ${formatTestSlot(val.endTime)}`,
              value: `${formatTestSlot(val.startTime)} - ${formatTestSlot(val.endTime)}`,
              data: val,
            }));
            setOptions(dropDownOptions);
            const slotData = getTestSlotDetailsByTime(
              slotsArray,
              uniqueSlots[0].startTime!,
              uniqueSlots[0].endTime!
            );
            setSelectedTimeSlot(slotData);
            setSelectedOption(
              `${formatTestSlot(slotData.slotInfo.startTime)} - ${formatTestSlot(
                slotData.slotInfo.endTime
              )}`
            );
            setDiagnosticSlot!({
              slotStartTime: uniqueSlots[0].startTime!,
              slotEndTime: uniqueSlots[0].endTime!,
              date: date.getTime(),
              employeeSlotId: uniqueSlots[0].slotInfo.slot,
              diagnosticBranchCode: uniqueSlots[0].diagnosticBranchCode,
              diagnosticEmployeeCode: uniqueSlots[0].diagnosticEmployeeCode,
              city: selectedAddress ? selectedAddress.city! : '', // not using city from this in order place API
            });
            props.setIsSlotSet(true);
          } else {
            setSelectedTimeSlot(null);
            setSelectedOption('No Slot Selected');
            setOptions([]);
            props.setIsSlotSet(false);
          }
        }
        setLoading(false);
        setSlotsError(false);
      })
      .catch((e) => {
        setSlotsError(true);
        setLoading(false);
        setOptions(null);
        console.log(
          'Sorry! We’re working hard to get to this area! In the meantime, you can either visit clinic near your location or change the address.'
        );
      });
  };

  useEffect(() => {
    if (deliveryAddresses && (deliveryAddressId || !selectedTimeSlot || date)) {
      const selectedAddress = deliveryAddresses.find((item) => item.id == deliveryAddressId);
      selectedAddress && checkServicability(selectedAddress);
    }
  }, [deliveryAddressId, date, deliveryAddresses]);

  const formatTestSlot = (slotTime: string) => moment(slotTime, 'HH:mm').format('hh:mm A');

  return !slotsError ? (
    <div className={classes.root}>
      <div className={classes.appointmentWrapper}>
        {loading ? (
          <CircularProgress size={22} />
        ) : (
          <>
            <div className={classes.header}>
              <img src={require('images/ic_calendar_show.svg')} alt="" />
              <span>Appointment Slot</span>
            </div>
            <div className={classes.appointmentInfo}>
              <div className={classes.details}>
                <div>Date</div>
                <div className={classes.date}>{moment(date).format('DD MMM, YYYY')}</div>
              </div>
              <div className={classes.details}>
                <div>Time</div>
                <div className={classes.time}>
                  {selectedTimeSlot
                    ? `${formatTestSlot(selectedTimeSlot.slotInfo.startTime!)} - ${formatTestSlot(
                        selectedTimeSlot.slotInfo.endTime!
                      )}`
                    : 'No slot selected'}
                </div>
              </div>
            </div>
            <div className={classes.pickSlot}>
              <AphButton onClick={() => setIsUploadPreDialogOpen(true)}>
                Pick Another Slot
              </AphButton>
            </div>
          </>
        )}

        <AphDialog open={isUploadPreDialogOpen} maxWidth="sm">
          <AphDialogClose onClick={() => setIsUploadPreDialogOpen(false)} title={'Close'} />
          <AphDialogTitle>Schedule Appointment</AphDialogTitle>
          <Scrollbars autoHide={true} autoHeight autoHeightMax={'55vh'}>
            <div className={classes.wrapperCards}>
              <AphCalendar
                getDate={(dateSelected: string) => {
                  setDate(moment(dateSelected, 'DD/MM/YYYY').toDate());
                }}
                selectedDate={date || new Date()}
                maxDate={moment().add(appStaticVariables.Days, 'day').toDate()}
              />
            </div>
            <div className={classes.wrapperCardSlots}>
              <p>Slot</p>
              <div className={classes.selectContainer}>
                {loading ? (
                  <CircularProgress size={22} />
                ) : (
                  <>
                    {options && options.length > 0 ? (
                      <AphSelect
                        value={selectedOption}
                        disabled={options ? options.length === 0 : true}
                        onChange={(e) => {
                          const value = e.target.value as string;
                          const filteredData =
                            options && options.find((option) => option.key === value);
                          if (filteredData) {
                            setSelectedTimeSlot(filteredData.data);
                            setDiagnosticSlot!({
                              slotStartTime: filteredData.data.slotInfo.startTime!,
                              slotEndTime: filteredData.data.slotInfo.endTime!,
                              date: filteredData.data.date,
                              employeeSlotId: filteredData.data.slotInfo.slot,
                              diagnosticBranchCode: filteredData.data.diagnosticBranchCode,
                              diagnosticEmployeeCode: filteredData.data.diagnosticEmployeeCode,
                              city: selectedAddr ? selectedAddr.city! : '', // not using city from this in order place API
                            });
                            props.setIsSlotSet(true);
                          }
                          setSelectedOption(value);
                        }}
                        MenuProps={{
                          anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'right',
                          },
                        }}
                      >
                        {options &&
                          options.length > 0 &&
                          options.map((option: { key: string; value: string; data: any }) => {
                            return (
                              <MenuItem
                                value={option.key}
                                key={option.key}
                                classes={{ selected: classes.menuSelected }}
                              >
                                {option.value}
                              </MenuItem>
                            );
                          })}
                      </AphSelect>
                    ) : (
                      'No slots available'
                    )}
                  </>
                )}
              </div>
            </div>
          </Scrollbars>
          <div className={classes.doneButton}>
            <AphButton color="primary" onClick={() => setIsUploadPreDialogOpen(false)}>
              Done
            </AphButton>
          </div>
        </AphDialog>
      </div>
    </div>
  ) : (
    <>
      {slotsError && (
        <div className={classes.noAddress}>
          Sorry! We're working hard to get to this area! In the meantime, you can either pick up
          from a nearby store, or change the pincode.
        </div>
      )}
    </>
  );
};
