import React, { useState, useEffect } from 'react';
import { Theme, Modal, Typography } from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import {
  genderList,
  consultType,
  appointmentStatus,
  availabilityList,
  AppointmentFilterObject,
} from 'helpers/commonHelpers';
import _uniq from 'lodash/uniq';
import { createMuiTheme } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import _ from 'lodash';
import format from 'date-fns/format';

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
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
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
      width: '25%',
      position: 'relative',
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
    keyboardDatepicker: {
      position: 'absolute',
      right: 0,
      '& svg': {
        color: '#02475B',
      },
      '& div': {
        '&:before': {
          borderBottom: 'none !important',
        },
        '&:after': {
          borderBottom: 'none !important',
        },
      },
      '& input': {
        width: 0,
      },
    },
    filterWrapper: {},
    filterContainer: {
      display: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#fff',
      },
    },
    filterHeader: {
      padding: 20,
      boxShadow: '0px 5px 20px rgba(128, 128, 128, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      '& h2': {
        fontSize: 13,
        fontWeight: 600,
        lineHeight: '17px',
        textTransform: 'uppercase',
      },
    },
    filterBody: {
      height: 'calc(100% - 150px)',
    },
    filterFooter: {
      padding: 20,
      boxShadow: '0px 5px 20px rgba(128, 128, 128, 0.3), 0px 3px 4px rgba(0, 0, 0, 0.5)',
      textAlign: 'center',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: 'auto',
      '& button': {
        width: '90%',
        margin: '0 auto',
        display: 'block',
      },
    },
    tabs: {},
    tabsContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      height: '100%',
    },
    tabsContent: {
      padding: 10,
      width: '75%',
      flex: '1 0 auto',
    },
    tabsRoot: {
      width: '35%',
      height: '100%',
      background: '#F7F8F5',
      flex: '1 0 auto',
    },
    tabsIndicator: {
      display: 'none',
    },
    tabRoot: {
      padding: 20,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '18px',
      border: 'none',
      borderBottom: ' 0.5px solid #CCCCCC',
      textTransform: 'none',
    },
    tabSelected: {
      color: '#0187BA',
      background: '#fff',
    },
    doctornameFilter: {
      width: '25%',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
  };
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

const defaultMaterialTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#00b38e',
    },
    text: {
      primary: '#00b38e',
    },
    action: {
      selected: '#fff',
    },
  },
  typography: {
    fontWeightMedium: 600,
    htmlFontSize: 14,
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    body1: {
      fontSize: 14,
      color: '#02475b',
      fontWeight: 500,
    },
    body2: {
      fontWeight: 600,
    },
    caption: {
      fontSize: 0,
    },
  },
});

interface AppointmentsFilterProps {
  setFilter: (filter: AppointmentFilterObject) => void;
  filter: AppointmentFilterObject;
  setIsFilterOpen: (filterOpen: boolean) => void;
  filterDoctorsList: string[];
  filterSpecialtyList: string[];
  selectedDate: Date | null;
  setSelectedDate: (selectedDate: Date | null) => void;
}

export const AppointmentsFilter: React.FC<AppointmentsFilterProps> = (props) => {
  const classes = useStyles({});
  const {
    filter,
    setFilter,
    setIsFilterOpen,
    filterDoctorsList,
    filterSpecialtyList,
    selectedDate,
    setSelectedDate,
  } = props;
  const [localFilter, setLocalFilter] = useState<AppointmentFilterObject>(_.cloneDeep(filter));
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

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
    if (type === 'appointmentStatus') {
      const appointmentStatus = filterValues(localFilter.appointmentStatus, value);
      setLocalFilter({ ...localFilter, appointmentStatus });
    } else if (type === 'availability') {
      const availability = filterValues(localFilter.availability, value);
      setLocalFilter({ ...localFilter, availability });
    } else if (type === 'doctor') {
      const doctorsList = filterValues(localFilter.doctorsList, value);
      setLocalFilter({ ...localFilter, doctorsList });
    } else if (type === 'specialty') {
      const specialtyList = filterValues(localFilter.specialtyList, value);
      setLocalFilter({ ...localFilter, specialtyList });
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    selectedDate && setFilterValues('availability', format(selectedDate, 'dd/MM/yyyy'));
  }, [selectedDate]);

  const tabOptions = ['Appointment Status', 'Date', 'Doctor', 'Speciality'];

  return (
    <div className={classes.filterWrapper}>
      <div className={classes.dialogPaper}>
        <div className={classes.dialogHeader}>
          <h3>Filters</h3>
          <AphButton
            onClick={() => {
              setIsFilterOpen(false);
            }}
          >
            <img src={require('images/ic_cross.svg')} alt="" />
          </AphButton>
        </div>
        <div className={classes.dialogContent}>
          <div className={classes.filterGroup}>
            {localFilter && (
              <>
                <div className={classes.filterType}>
                  <h4>Appointment Status</h4>
                  <div className={classes.filterBtns}>
                    {appointmentStatus.map((status) => (
                      <AphButton
                        key={status}
                        className={applyClass(localFilter.appointmentStatus, status)}
                        onClick={() => {
                          setFilterValues('appointmentStatus', status);
                        }}
                      >
                        {status}
                      </AphButton>
                    ))}
                  </div>
                </div>
                <div className={classes.filterType}>
                  <h4>Date</h4>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <ThemeProvider theme={defaultMaterialTheme}>
                      <KeyboardDatePicker
                        autoOk={true}
                        className={classes.keyboardDatepicker}
                        disableToolbar
                        variant="inline"
                        format="MM/dd/yyyy"
                        value={selectedDate}
                        KeyboardButtonProps={{
                          'aria-label': 'change date',
                        }}
                        onChange={(date) => handleDateChange((date as unknown) as Date)}
                        onFocus={() => {}}
                        onBlur={() => {}}
                      />
                    </ThemeProvider>
                  </MuiPickersUtilsProvider>
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
                  <h4>Doctor</h4>
                  <div className={classes.filterBtns}>
                    {filterDoctorsList &&
                      filterDoctorsList.length > 0 &&
                      _uniq(filterDoctorsList).map((doctorName) => (
                        <AphButton
                          key={doctorName}
                          className={applyClass(localFilter.doctorsList, doctorName)}
                          onClick={() => {
                            setFilterValues('doctor', doctorName);
                          }}
                        >
                          {doctorName}
                        </AphButton>
                      ))}
                  </div>
                </div>
                <div className={classes.filterType}>
                  <h4>Specialties</h4>
                  <div className={classes.filterBtns}>
                    {filterSpecialtyList &&
                      filterSpecialtyList.length > 0 &&
                      _uniq(filterSpecialtyList).map((specialtyName) => (
                        <AphButton
                          key={specialtyName}
                          className={applyClass(localFilter.specialtyList, specialtyName)}
                          onClick={() => {
                            setFilterValues('specialty', specialtyName);
                          }}
                        >
                          {specialtyName}
                        </AphButton>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className={classes.dialogActions}>
          <span>
            <AphButton
              className={classes.clearBtn}
              onClick={() => {
                const initialAppointmentFilterObject: AppointmentFilterObject = {
                  appointmentStatus: [],
                  availability: [],
                  doctorsList: [],
                  specialtyList: [],
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
      <div className={classes.filterContainer}>
        <div className={classes.filterHeader}>
          <Link
            to="#"
            onClick={() => {
              setIsFilterOpen(false);
              setFilter(localFilter);
            }}
          >
            <img src={require('images/ic_cross.svg')} alt="Close" />
          </Link>
          <Typography component="h2">Filters</Typography>
          <Link
            to="#"
            onClick={() => {
              const initialAppointmentFilterObject: AppointmentFilterObject = {
                appointmentStatus: [],
                availability: [],
                doctorsList: [],
                specialtyList: [],
              };
              setLocalFilter(initialAppointmentFilterObject);
              setFilter(initialAppointmentFilterObject);
            }}
          >
            <img src={require('images/ic_refresh.svg')} alt="Refresh" />
          </Link>
        </div>
        <div className={classes.filterBody}>
          <div className={classes.tabsContainer}>
            <Tabs
              orientation="vertical"
              value={value}
              onChange={handleChange}
              aria-label="Vertical tabs example"
              classes={{
                root: classes.tabsRoot,
                indicator: classes.tabsIndicator,
              }}
            >
              {tabOptions.map((key) => (
                <Tab
                  label={key}
                  classes={{
                    root: classes.tabRoot,
                    selected: classes.tabSelected,
                  }}
                />
              ))}
            </Tabs>
            <div className={classes.tabsContent}>
              <TabPanel value={value} index={0}>
                <div className={classes.filterBtns}>
                  {appointmentStatus.map((status) => (
                    <AphButton
                      key={status}
                      className={applyClass(localFilter.appointmentStatus, status)}
                      onClick={() => {
                        setFilterValues('appointmentStatus', status);
                      }}
                    >
                      {status}
                    </AphButton>
                  ))}
                </div>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <ThemeProvider theme={defaultMaterialTheme}>
                    <KeyboardDatePicker
                      autoOk={true}
                      className={classes.keyboardDatepicker}
                      disableToolbar
                      variant="inline"
                      format="MM/dd/yyyy"
                      value={selectedDate}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                      onChange={(date) => handleDateChange((date as unknown) as Date)}
                      onFocus={() => {}}
                      onBlur={() => {}}
                    />
                  </ThemeProvider>
                </MuiPickersUtilsProvider>
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
              </TabPanel>
              <TabPanel value={value} index={2}>
                <div className={classes.filterBtns}>
                  {filterDoctorsList &&
                    filterDoctorsList.length > 0 &&
                    _uniq(filterDoctorsList).map((doctorName) => (
                      <AphButton
                        key={doctorName}
                        className={applyClass(localFilter.doctorsList, doctorName)}
                        onClick={() => {
                          setFilterValues('doctor', doctorName);
                        }}
                      >
                        {doctorName}
                      </AphButton>
                    ))}
                </div>
              </TabPanel>
              <TabPanel value={value} index={3}>
                <div className={classes.filterBtns}>
                  {filterSpecialtyList &&
                    filterSpecialtyList.length > 0 &&
                    _uniq(filterSpecialtyList).map((specialtyName) => (
                      <AphButton
                        key={specialtyName}
                        className={applyClass(localFilter.specialtyList, specialtyName)}
                        onClick={() => {
                          setFilterValues('specialty', specialtyName);
                        }}
                      >
                        {specialtyName}
                      </AphButton>
                    ))}
                </div>
              </TabPanel>
            </div>
          </div>
        </div>
        <div className={classes.filterFooter}>
          <AphButton
            color="primary"
            variant="contained"
            onClick={() => {
              setFilter(localFilter);
              setIsFilterOpen(false);
            }}
          >
            Apply
          </AphButton>
        </div>
      </div>
    </div>
  );
};
