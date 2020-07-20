import React, { useState } from 'react';
import { Theme, RadioGroup, FormControlLabel, Checkbox, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton, AphRadio } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';
import {
  SearchObject,
  feeInRupees,
  experienceList,
  genderList,
  languageList,
  availabilityList,
} from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      marginTop: 10,
      marginBottom: 14,
      [theme.breakpoints.down('xs')]: {
        marginTop: 0,
      },
    },
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
    modalDialog: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
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

interface FilterProps {
  isOnlineSelected: boolean;
  setIsOnlineSelected: (isOnlineSelected: boolean) => void;
  isPhysicalSelected: boolean;
  setIsPhysicalSelected: (isPhysicalSelected: boolean) => void;
  setFilter: (filter: SearchObject) => void;
  filter: SearchObject;
  onlyFilteredCount: number;
}

export const Filters: React.FC<FilterProps> = (props) => {
  const classes = useStyles({});
  const {
    isOnlineSelected,
    setIsOnlineSelected,
    isPhysicalSelected,
    setIsPhysicalSelected,
    setFilter,
    filter,
    onlyFilteredCount,
  } = props;

  const [isFilterOpen, setisFilterOpen] = React.useState(false);
  const [localFilter, setLocalFilter] = useState<SearchObject>(filter);

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
    if (type === 'experience') {
      let { experience } = localFilter;
      experience = filterValues(experience, value);
      setLocalFilter({ ...localFilter, experience });
    } else if (type === 'fee') {
      let { fees } = localFilter;
      fees = filterValues(fees, value);
      setLocalFilter({ ...localFilter, fees });
    } else if (type === 'gender') {
      let { gender } = localFilter;
      gender = filterValues(gender, value);
      setLocalFilter({ ...localFilter, gender });
    } else if (type === 'language') {
      let { language } = localFilter;
      language = filterValues(language, value);
      setLocalFilter({ ...localFilter, language });
    } else if (type === 'availability') {
      let { availability } = localFilter;
      availability = filterValues(availability, value);
      setLocalFilter({ ...localFilter, availability });
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.filters}>
        <div className={classes.leftGroup}>
          <FormControlLabel
            control={
              <AphCheckbox
                color="primary"
                name="onlineconsults"
                onChange={(e) => {
                  setIsOnlineSelected(e.target.checked);
                }}
                checked={isOnlineSelected}
              />
            }
            label="Online Consults"
          />
          <FormControlLabel
            control={
              <AphCheckbox
                color="primary"
                name="inperson"
                onChange={(e) => {
                  setIsPhysicalSelected(e.target.checked);
                }}
                checked={isPhysicalSelected}
              />
            }
            label="In-Person Consults"
          />
        </div>
        <div className={classes.filterAction}>
          <AphButton onClick={() => setisFilterOpen(true)}>
            Filters(5) <img src={require('images/ic_filters.svg')} alt="" />
          </AphButton>
        </div>
      </div>
      <Modal
        className={classes.modalDialog}
        open={isFilterOpen}
        onClose={() => setisFilterOpen(false)}
      >
        <div className={classes.dialogPaper}>
          <div className={classes.dialogHeader}>
            <h3>Filters</h3>
            <AphButton onClick={() => setisFilterOpen(false)}>
              <img src={require('images/ic_cross.svg')} alt="" />
            </AphButton>
          </div>
          <div className={classes.dialogContent}>
            <div className={classes.filterGroup}>
              <div className={classes.filterType}>
                <h4>Experience In Years</h4>
                <div className={classes.filterBtns}>
                  {experienceList.map((obj) => (
                    <AphButton
                      key={obj.key}
                      className={applyClass(localFilter.experience, obj.key)}
                      onClick={() => {
                        setFilterValues('experience', obj.key);
                      }}
                    >
                      {obj.value}
                    </AphButton>
                  ))}
                </div>
              </div>
              <div className={classes.filterType}>
                <h4>Availability</h4>
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
                <h4>Fees In Rupees</h4>
                <div className={classes.filterBtns}>
                  {feeInRupees.map((fee) => (
                    <AphButton
                      key={fee}
                      className={applyClass(localFilter.fees, fee)}
                      onClick={() => {
                        setFilterValues('fee', fee);
                      }}
                    >
                      {fee}
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
              <div className={classes.filterType}>
                <h4>Language</h4>
                <div className={classes.filterBtns}>
                  {languageList.map((language: string) => (
                    <AphButton
                      key={language}
                      className={applyClass(localFilter.language, language)}
                      onClick={() => {
                        setFilterValues('language', language);
                      }}
                    >
                      {language}
                    </AphButton>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={classes.dialogActions}>
            <span className={classes.resultFound}>{onlyFilteredCount} Doctors found</span>
            <span>
              <AphButton
                className={classes.clearBtn}
                onClick={() => {
                  const filterInitialValues: SearchObject = {
                    searchKeyword: '',
                    cityName: [],
                    experience: [],
                    availability: [],
                    fees: [],
                    gender: [],
                    language: [],
                    dateSelected: '',
                    specialtyName: '',
                    prakticeSpecialties: '',
                  };
                  setLocalFilter(filterInitialValues);
                  setFilter(filterInitialValues);
                  setisFilterOpen(false);
                }}
              >
                Clear Filters
              </AphButton>
              <AphButton
                onClick={() => {
                  setFilter(localFilter);
                  setisFilterOpen(false);
                }}
                className={classes.applyBtn}
              >
                Apply Filters
              </AphButton>
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
