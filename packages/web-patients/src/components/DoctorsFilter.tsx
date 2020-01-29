import React, { useState, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import { Gender } from 'graphql/types/globalTypes';
import FormHelperText from '@material-ui/core/FormHelperText';
import _filter from 'lodash/filter';
import _reverse from 'lodash/reverse';
import _map from 'lodash/map';
import _uniqueId from 'lodash/uniqueId';
import _toLower from 'lodash/toLower';
import _upperFirst from 'lodash/upperFirst';
import _without from 'lodash/without';
import { AphCalendar } from 'components/AphCalendar';
import Scrollbars from 'react-custom-scrollbars';
import { usePrevious } from 'hooks/reactCustomHooks';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      paddingTop: 10,
      width: 328,
      borderRadius: 5,
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
        paddingTop: 0,
        width: '100%',
        paddingBottom: 20,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    filterSection: {
      padding: '20px 5px 20px 10px',
      paddingTop: 15,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    customScroll: {
      width: '100%',
      paddingLeft: 10,
      paddingRight: 15,
    },
    searchInput: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    filterBox: {
      borderRadius: 5,
      backgroundColor: '#f7f8f5',
      padding: 10,
      marginTop: 5,
    },
    filterType: {
      color: '#02475b',
      fontSize: 12,
      fontWeight: 500,
      paddingBottom: 5,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      alignItems: 'center',
    },
    calendarIcon: {
      marginLeft: 'auto',
      cursor: 'pointer',
      '& img': {
        maxWidth: 20,
        verticalAlign: 'bottom',
      },
    },
    boxContent: {
      paddingTop: 5,
      '& button:last-child': {
        marginRight: 0,
      },
    },
    button: {
      marginRight: 5,
      marginTop: 5,
      minWidth: 'auto',
      color: '#00b38e !important',
      letterSpacing: -0.27,
      borderRadius: 10,
    },
    helpText: {
      paddingLeft: 20,
      paddingRight: 20,
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white + '!important',
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white + '!important',
      },
    },
    filterSectionDisabled: {
      opacity: 0.3,
    },
    calendarView: {
      display: 'none',
      '& p': {
        fontSize: 12,
        lineHeight: '26px',
      },
      '& >div': {
        '& >div:first-child': {
          '& >div:first-child': {
            marginBottom: 8,
          },
          '& >div:last-child': {
            '& span': {
              fontSize: 10,
            },
          },
        },
        '& >div:last-child': {
          minHeight: 160,
          marginTop: 5,
          '& button': {
            height: 32,
            width: 32,
            margin: '0 0 0 6px',
          },
        },
      },
    },
    showCalendar: {
      display: 'block',
    },
  });
});

export interface SearchObject {
  searchKeyword: string;
  cityName: string[] | null;
  experience: string[] | null;
  availability: string[] | null;
  fees: string[] | null;
  gender: string[] | null;
  language: string[] | null;
  dateSelected: string;
  specialtyName: string;
}

export interface DoctorsFilterProps {
  handleFilterOptions: (filterOptions: SearchObject) => void;
  existingFilters: SearchObject;
  disableFilters: boolean;
  showError: boolean;
  showNormal: (showNormal: boolean) => void;
  emptySpeciality: (specialitySelected: string) => void;
  manageFilter: (disableFilters: boolean) => void;
}

export const DoctorsFilter: React.FC<DoctorsFilterProps> = (props) => {
  const classes = useStyles();

  const {
    handleFilterOptions,
    existingFilters,
    disableFilters,
    showError,
    showNormal,
    emptySpeciality,
    manageFilter,
  } = props;

  const filterCities = { Hyderabad: 'Hyderabad', Chennai: 'Chennai' };
  const filterExperiences = { '0_5': '0-5', '6_10': '6-10', '11_15': '11-15', '15_99': '15+' };
  const filterAvailability = {
    now: 'Now',
    today: 'Today',
    tomorrow: 'Tomorrow',
    next3: 'Next 3 Days',
  };
  const filterFees = { '100_500': '100-500', '501_1000': '501-1000', '1001_10000': '1000+' };
  const filterGenders = _reverse(_filter(Object.values(Gender), (gender) => gender !== 'OTHER')); // show MALE, FEMALE instead of FEMALE, MALE
  const filterLanguages = { hindi: 'Hindi', english: 'English', telugu: 'Telugu' };

  const [searchKeyword, setSearchKeyword] = useState<string>(
    (existingFilters.searchKeyword.length > 0 ? existingFilters.searchKeyword : '') || ''
  );
  const [cityName, setCityName] = useState<string[]>(existingFilters.cityName || []);
  const [experience, setExperience] = useState<string[]>(existingFilters.experience || []);
  const [availability, setAvailability] = useState<string[]>(existingFilters.availability || []);
  const [fees, setFees] = useState<string[]>(existingFilters.fees || []);
  const [gender, setGender] = useState<string[]>(existingFilters.gender || []);
  const [language, setLanguage] = useState<string[]>(existingFilters.language || []);
  const [dateSelected, setDateSelected] = useState<string>(existingFilters.dateSelected || '');
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const prevDateSelected = usePrevious(dateSelected);
  const selectedSpecialtyName = existingFilters.specialtyName;
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:990px)');

  const filterOptions = {
    searchKeyword: searchKeyword,
    cityName: cityName,
    experience: experience,
    availability: availability,
    fees: fees,
    gender: gender,
    language: language,
    dateSelected: dateSelected,
    specialtyName: selectedSpecialtyName,
  };

  // we should keep the previous value and render only when prop changes to prevent infinite renders.
  // https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
  useEffect(() => {
    if (prevDateSelected !== dateSelected) handleFilterOptions(filterOptions);
  });

  // assign selected speciality into search keyword. this should happen only once when the component mounts.
  useEffect(() => {
    setSearchKeyword(existingFilters.searchKeyword);
  }, [existingFilters]);

  const emptyFilters = (emptySearchKeyword: boolean) => {
    if (emptySearchKeyword) {
      filterOptions.searchKeyword = '';
      filterOptions.specialtyName = '';
    }
    showNormal(true);
    emptySpeciality('');
    manageFilter(true);
    setCityName([]);
    setGender([]);
    setExperience([]);
    setAvailability([]);
    setFees([]);
    setLanguage([]);
    setDateSelected('');
    setShowCalendar(false);
    handleFilterOptions(filterOptions);
  };

  return (
    <div className={classes.root}>
      <AphTextField
        classes={{ root: classes.searchInput }}
        placeholder="Search doctors or specialities"
        onChange={(event) => {
          if (selectedSpecialtyName !== '' && selectedSpecialtyName !== event.currentTarget.value) {
            emptyFilters(false);
          }
          setSearchKeyword(event.target.value);
          filterOptions.searchKeyword = event.currentTarget.value;
          if (event.target.value.length === 0) {
            emptyFilters(true);
          } else if (event.target.value.length > 2) {
            handleFilterOptions(filterOptions);
          }
        }}
        value={searchKeyword}
        error={showError}
      />
      {showError ? (
        <FormHelperText className={classes.helpText} component="div" error={showError}>
          Sorry, we couldn't find what you are looking for :(
        </FormHelperText>
      ) : (
        ''
      )}
      <div
        className={`${classes.filterSection} ${
          disableFilters ? classes.filterSectionDisabled : ''
        }`}
      >
        <Scrollbars
          autoHide={true}
          autoHeight
          autoHeightMax={isMediumScreen ? 'calc(100vh - 320px)' : 'calc(100vh - 275px)'}
        >
          <div className={classes.customScroll}>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>City</div>
              <div className={classes.boxContent}>
                {_map(filterCities, (filterCityName, index) => {
                  return (
                    <AphButton
                      color="secondary"
                      size="small"
                      className={
                        cityName.includes(filterCityName)
                          ? `${classes.button} ${classes.buttonActive}`
                          : `${classes.button}`
                      }
                      value={index}
                      onClick={(e) => {
                        if (cityName.includes(e.currentTarget.value)) {
                          const newArray = _without(cityName, e.currentTarget.value);
                          setCityName(newArray);
                          filterOptions.cityName = newArray;
                        } else {
                          cityName.push(e.currentTarget.value);
                          setCityName(cityName);
                          filterOptions.cityName = cityName;
                        }
                        handleFilterOptions(filterOptions);
                      }}
                      key={_uniqueId('cityName_')}
                      disabled={disableFilters}
                    >
                      {filterCityName}
                    </AphButton>
                  );
                })}
              </div>
            </div>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>Experience In Years</div>
              <div className={classes.boxContent}>
                {_map(filterExperiences, (filterExperience, index) => {
                  return (
                    <AphButton
                      color="secondary"
                      size="small"
                      className={
                        experience.includes(_toLower(index))
                          ? `${classes.button} ${classes.buttonActive}`
                          : `${classes.button}`
                      }
                      value={index}
                      onClick={(e) => {
                        if (experience.includes(e.currentTarget.value)) {
                          const newArray = _without(experience, e.currentTarget.value);
                          setExperience(newArray);
                          filterOptions.experience = newArray;
                        } else {
                          experience.push(e.currentTarget.value);
                          setExperience(experience);
                          filterOptions.experience = experience;
                        }
                        handleFilterOptions(filterOptions);
                      }}
                      key={_uniqueId('exp_')}
                      disabled={disableFilters}
                    >
                      {filterExperience}
                    </AphButton>
                  );
                })}
              </div>
            </div>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>
                Availability
                <div
                  className={classes.calendarIcon}
                  onClick={(e) => {
                    setDateSelected('');
                    !disableFilters ? setShowCalendar(showCalendar ? false : true) : false;
                  }}
                >
                  <img
                    src={
                      showCalendar
                        ? require('images/ic_calendar_close.svg')
                        : require('images/ic_calendar_show.svg')
                    }
                  />
                </div>
              </div>
              <div className={classes.boxContent}>
                <div
                  className={`${classes.calendarView} ${showCalendar ? classes.showCalendar : ''}`}
                >
                  {showCalendar && (
                    <AphCalendar
                      getDate={(dateSelected: string) => setDateSelected(dateSelected)}
                      selectedDate={new Date()}
                    />
                  )}
                </div>
                {_map(filterAvailability, (filterAvailability, index) => {
                  return !showCalendar ? (
                    <AphButton
                      color="secondary"
                      size="small"
                      className={
                        availability.includes(_toLower(index))
                          ? `${classes.button} ${classes.buttonActive}`
                          : `${classes.button}`
                      }
                      value={index}
                      onClick={(e) => {
                        if (availability.includes(e.currentTarget.value)) {
                          const newArray = _without(availability, e.currentTarget.value);
                          setAvailability(newArray);
                          filterOptions.availability = newArray;
                        } else {
                          availability.push(e.currentTarget.value);
                          setAvailability(availability);
                          filterOptions.availability = availability;
                        }
                        handleFilterOptions(filterOptions);
                      }}
                      key={_uniqueId('ava_')}
                      disabled={disableFilters}
                    >
                      {filterAvailability}
                    </AphButton>
                  ) : null;
                })}
              </div>
            </div>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>Fees In Rupees</div>
              <div className={classes.boxContent}>
                {_map(filterFees, (filterFee, index) => {
                  return (
                    <AphButton
                      color="secondary"
                      size="small"
                      className={
                        fees.includes(_toLower(index))
                          ? `${classes.button} ${classes.buttonActive}`
                          : `${classes.button}`
                      }
                      value={index}
                      onClick={(e) => {
                        if (fees.includes(e.currentTarget.value)) {
                          const newArray = _without(fees, e.currentTarget.value);
                          setFees(newArray);
                          filterOptions.fees = newArray;
                        } else {
                          fees.push(e.currentTarget.value);
                          setFees(fees);
                          filterOptions.fees = fees;
                        }
                        handleFilterOptions(filterOptions);
                      }}
                      key={_uniqueId('fees_')}
                      disabled={disableFilters}
                    >
                      {filterFee}
                    </AphButton>
                  );
                })}
              </div>
            </div>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>Gender</div>
              <div className={classes.boxContent}>
                {_map(filterGenders, (filterGender) => {
                  return (
                    <AphButton
                      color="secondary"
                      size="small"
                      value={Gender[filterGender]}
                      onClick={(e) => {
                        if (gender.includes(e.currentTarget.value)) {
                          const newArray = _without(gender, e.currentTarget.value);
                          setGender(newArray);
                          filterOptions.gender = newArray;
                        } else {
                          gender.push(Gender[e.currentTarget.value as Gender]);
                          setGender(gender);
                          filterOptions.gender = gender;
                        }
                        handleFilterOptions(filterOptions);
                      }}
                      className={
                        gender.includes(filterGender)
                          ? `${classes.button} ${classes.buttonActive}`
                          : `${classes.button}`
                      }
                      key={_uniqueId('gender_')}
                      disabled={disableFilters}
                    >
                      {_upperFirst(_toLower(filterGender))}
                    </AphButton>
                  );
                })}
              </div>
            </div>
            <div className={classes.filterBox}>
              <div className={classes.filterType}>Language</div>
              <div className={classes.boxContent}>
                {_map(filterLanguages, (filterLanguage, index) => {
                  return (
                    <AphButton
                      color="secondary"
                      size="small"
                      className={
                        language.includes(_toLower(index))
                          ? `${classes.button} ${classes.buttonActive}`
                          : `${classes.button}`
                      }
                      value={index}
                      onClick={(e) => {
                        if (language.includes(e.currentTarget.value)) {
                          const newArray = _without(language, e.currentTarget.value);
                          setLanguage(newArray);
                          filterOptions.language = newArray;
                        } else {
                          language.push(e.currentTarget.value);
                          setLanguage(language);
                          filterOptions.language = language;
                        }
                        handleFilterOptions(filterOptions);
                      }}
                      key={_uniqueId('lang_')}
                      disabled={disableFilters}
                    >
                      {filterLanguage}
                    </AphButton>
                  );
                })}
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};
