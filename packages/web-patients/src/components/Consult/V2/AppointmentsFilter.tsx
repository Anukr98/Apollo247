import React, { useState } from 'react';
import { Theme, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import {
  genderList,
  consultType,
  appointmentStatus,
  availabilityList,
  AppointmentFilterObject,
} from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    filters: {
      backgroundColor: '#fff',
      marginTop: 10,
      padding: '12px 20px',
      borderRadius: 5,
      display: 'flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 500,
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
        marginTop: 0,
      },
      '& label': {
        marginLeft: 0,
        '& span': {
          fontSize: 12,
          paddingRight: 2,
          fontWeight: 500,
        },
      },
    },
    leftGroup: {
      display: 'flex',
      alignItems: 'center',
    },
    filterAction: {
      marginLeft: 'auto',
      '& button': {
        boxShadow: 'none',
        backgroundColor: 'transparent',
        fontWeight: 500,
        textTransform: 'none',
        padding: 0,
        minWidth: 'auto',
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
      '& img': {
        marginLeft: 5,
      },
    },
    radioGroup: {
      display: 'flex',
      alignItems: 'center',
      '& label': {
        marginLeft: 0,
        fontSize: 12,
        '& span': {
          paddingRight: 2,
        },
      },
    },
    sortBy: {
      paddingRight: 10,
    },
    dialogPaper: {
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      width: 680,
      outline: 'none',
    },
    dialogHeader: {
      padding: 20,
      display: 'flex',
      '& h3': {
        fontSie: 16,
        fontWeight: 600,
        color: '#01667c',
        margin: 0,
      },
      '& button': {
        marginLeft: 'auto',
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    dialogContent: {
      padding: '0 20px',
    },
    filterGroup: {
      display: 'flex',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
    filterType: {
      paddingLeft: 16,
      paddingRight: 8,
      borderRight: '0.5px solid rgba(2,71,91,0.3)',
      width: '20%',
      [theme.breakpoints.down('sm')]: {
        display: 'inline-block',
        width: '100%',
        paddingTop: 15,
        paddingLeft: 0,
        borderRight: 'none',
      },
      '& h4': {
        fontSize: 12,
        fontWeight: 500,
        color: '#02475b',
        margin: 0,
        paddingBottom: 4,
      },
      '&:first-child': {
        paddingLeft: 0,
      },
      '&:last-child': {
        paddingRight: 0,
        borderRight: 'none',
      },
    },
    filterBtns: {
      '& button': {
        borderRadius: 10,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        backgroundColor: '#ffffff',
        color: '#00b38e',
        textTransform: 'none',
        fontSize: 12,
        lineHeight: '14px',
        fontWeight: 500,
        padding: '8px 8px',
        margin: '4px 0',
        marginRight: 8,
        minWidth: 'auto',
        [theme.breakpoints.down('sm')]: {
          marginRight: 6,
        },
      },
    },
    filterActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
    dialogActions: {
      padding: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      [theme.breakpoints.down('sm')]: {
        display: 'block',
      },
    },
    resultFound: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      opacity: 0.5,
      [theme.breakpoints.down('sm')]: {
        display: 'inline-block',
        width: '100%',
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 9,
      },
    },
    clearBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#fc9916',
      boxShadow: 'none',
      marginLeft: 10,
    },
    applyBtn: {
      backgroundColor: '#fff',
      color: '#fc9916',
      marginLeft: 10,
      [theme.breakpoints.down('sm')]: {
        backgroundColor: '#fc9916',
        color: '#fff',
      },
    },
  };
});

interface AppointmentsFilterProps {
  setFilter: (filter: AppointmentFilterObject) => void;
  filter: AppointmentFilterObject;
  setIsFilterOpen: (filterOpen: boolean) => void;
}

export const AppointmentsFilter: React.FC<AppointmentsFilterProps> = (props) => {
  const classes = useStyles({});
  const { filter, setFilter, setIsFilterOpen } = props;
  const [localFilter, setLocalFilter] = useState<AppointmentFilterObject>(filter);

  const applyClass = (type: Array<string>, value: string) => {
    return type.includes(value) ? classes.filterActive : '';
  };

  const filterValues = (valueList: Array<string>, value: string) => {
    if (valueList.includes(value)) {
      valueList = valueList.filter((val) => val !== value);
    } else {
      valueList.push(value);
    }
    return valueList;
  };

  const setFilterValues = (type: string, value: string) => {
    if (type === 'consultType') {
      let { consultType } = localFilter;
      consultType = filterValues(consultType, value);
      setLocalFilter({ ...localFilter, consultType });
    } else if (type === 'appointmentStatus') {
      let { appointmentStatus } = localFilter;
      appointmentStatus = filterValues(appointmentStatus, value);
      setLocalFilter({ ...localFilter, appointmentStatus });
    } else if (type === 'gender') {
      let { gender } = localFilter;
      gender = filterValues(gender, value);
      setLocalFilter({ ...localFilter, gender });
    } else if (type === 'availability') {
      let { availability } = localFilter;
      availability = filterValues(availability, value);
      setLocalFilter({ ...localFilter, availability });
    }
  };

  return (
    <div className={classes.dialogPaper}>
      <div className={classes.dialogHeader}>
        <h3>Filters</h3>
        <AphButton onClick={() => setIsFilterOpen(false)}>
          <img src={require('images/ic_cross.svg')} alt="" />
        </AphButton>
      </div>
      <div className={classes.dialogContent}>
        <div className={classes.filterGroup}>
          <div className={classes.filterType}>
            <h4>Consult Type</h4>
            <div className={classes.filterBtns}>
              {consultType.map((obj) => (
                <AphButton
                  key={obj}
                  className={applyClass(localFilter.consultType, obj)}
                  onClick={() => {
                    setFilterValues('consultType', obj);
                  }}
                >
                  {obj}
                </AphButton>
              ))}
            </div>
          </div>
          <div className={classes.filterType}>
            <h4>Appointment Status</h4>
            <div className={classes.filterBtns}>
              {appointmentStatus.map((fee) => (
                <AphButton
                  key={fee}
                  className={applyClass(localFilter.appointmentStatus, fee)}
                  onClick={() => {
                    setFilterValues('appointmentStatus', fee);
                  }}
                >
                  {fee}
                </AphButton>
              ))}
            </div>
          </div>
          <div className={classes.filterType}>
            <h4>Date</h4>
            <div className={classes.filterBtns}>
              {availabilityList.map((availability: string) => (
                <AphButton
                  key={availability}
                  className={applyClass(localFilter.availability, availability)}
                  onClick={() => {
                    setFilterValues('availability', availability);
                  }}
                >
                  {availability}
                </AphButton>
              ))}
            </div>
          </div>
          <div className={classes.filterType}>
            <h4>Gender</h4>
            <div className={classes.filterBtns}>
              {genderList.map((gender) => (
                <AphButton
                  key={gender.key}
                  className={applyClass(localFilter.gender, gender.key)}
                  onClick={() => {
                    setFilterValues('gender', gender.key);
                  }}
                >
                  {gender.value}
                </AphButton>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={classes.dialogActions}>
        <span>
          <AphButton
            className={classes.clearBtn}
            onClick={() => {
              const initialAppointmentFilterObject: AppointmentFilterObject = {
                consultType: [],
                appointmentStatus: [],
                availability: [],
                gender: [],
              };
              setLocalFilter(initialAppointmentFilterObject);
              setFilter(initialAppointmentFilterObject);
              setIsFilterOpen(false);
            }}
          >
            Clear Filters
          </AphButton>
          <AphButton
            onClick={() => {
              setFilter(localFilter);
              setIsFilterOpen(false);
            }}
            className={classes.applyBtn}
          >
            Apply Filters
          </AphButton>
        </span>
      </div>
    </div>
  );
};
