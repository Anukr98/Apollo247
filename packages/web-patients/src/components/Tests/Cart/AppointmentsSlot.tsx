import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem } from '@material-ui/core';
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
import { getDiagnosticSlots, getDiagnosticSlotsVariables } from 'graphql/types/getDiagnosticSlots';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { useDiagnosticsCart } from 'components/Tests/DiagnosticsCartProvider';
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
  };
});

export const AppointmentsSlot: React.FC = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();
  const { deliveryAddressId, setDiagnosticSlot, deliveryAddresses } = useDiagnosticsCart();
  const [checkingServicability, setCheckingServicability] = React.useState<boolean>(false);
  const [dateSelected, setDateSelected] = useState<string>();
  const client = useApolloClient();

  const checkServicability = (selectedAddress: any) => {
    setCheckingServicability(true);
    client
      .query<getDiagnosticSlots, getDiagnosticSlotsVariables>({
        query: GET_DIAGNOSTIC_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: currentPatient ? currentPatient.id : '',
          hubCode: 'HYD_HUB1', // not considering this field at backend
          selectedDate: moment().format('YYYY-MM-DD'),
          zipCode: parseInt(selectedAddress.zipcode!),
        },
      })
      .then(({ data }) => {
        console.log('ORIGINAL DIAGNOSTIC SLOTS', { data });
      })
      .catch((e) => {
        console.log(
          'Sorry! We’re working hard to get to this area! In the meantime, you can either visit clinic near your location or change the address.'
        );
      });
  };

  useEffect(() => {
    if (deliveryAddressId) {
      const selectedAddress = deliveryAddresses.find((address) => address.id === deliveryAddressId);
      if (selectedAddress) {
        checkServicability(selectedAddress);
      }
    }
  }, [deliveryAddressId]);

  return (
    <div className={classes.root}>
      <div className={classes.appointmentWrapper}>
        <div className={classes.header}>
          <img src={require('images/ic_calendar_show.svg')} alt="" />
          <span>Appointment Slot</span>
        </div>
        <div className={classes.appointmentInfo}>
          <div className={classes.details}>
            <div>Date</div>
            <div className={classes.date}>12 March, 2020</div>
          </div>
          <div className={classes.details}>
            <div>Time</div>
            <div className={classes.time}>8:20 AM </div>
          </div>
        </div>
        <div className={classes.pickSlot}>
          <AphButton>Pick Another Slot</AphButton>
        </div>

        <AphDialog open={false} maxWidth="sm">
          <AphDialogClose title={'Close'} />
          <AphDialogTitle>Schedule Appointment</AphDialogTitle>
          <Scrollbars autoHide={true} autoHeight autoHeightMax={'55vh'}>
            <div className={classes.wrapperCards}>
              <AphCalendar
                getDate={(dateSelected: string) => setDateSelected(dateSelected)}
                selectedDate={new Date()}
              />
            </div>
            <div className={classes.wrapperCards}>
              <p>Slot</p>
              <div className={classes.selectContainer}>
                <AphSelect>
                  <MenuItem value={1} classes={{ selected: classes.menuSelected }}>
                    6:00 am - 6:40 am
                  </MenuItem>
                  <MenuItem value={2}>6:00 am - 6:40 am</MenuItem>
                  <MenuItem value={3}>6:00 am - 6:40 am</MenuItem>
                </AphSelect>
              </div>
            </div>
          </Scrollbars>
          <div className={classes.doneButton}>
            <AphButton color="primary">Done</AphButton>
          </div>
        </AphDialog>
      </div>
    </div>
  );
};
