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
        boxShadow: '0 15px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    filterSection: {
      padding: '20px 5px 20px 10px',
      paddingTop: 15,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
        position: 'absolute',
        top: 0,
        zIndex: 2,
        backgroundColor: '#f0f1ec',
        width: '100%',
        padding: 0,
        height: '100vh',
      },
    },
    filterSectionOpen: {
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    customScroll: {
      width: '100%',
      paddingLeft: 10,
      paddingRight: 15,
      [theme.breakpoints.down('xs')]: {
        padding: '10px 0 80px 0',
      },
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
      [theme.breakpoints.down('xs')]: {
        marginTop: 10,
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
        borderRadius: 0,
      },
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
    searchInputDisabled: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    filterHeader: {
      backgroundColor: '#fff',
      padding: 16,
      fontSize: 13,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      '& button': {
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
      '& >span': {
        width: 'calc(100% - 48px)',
        textAlign: 'center',
      },
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
  prakticeSpecialties: string | null;
}

export interface DoctorsFilterProps {
  handleFilterOptions: (filterOptions: SearchObject) => void;
  existingFilters: SearchObject;
  disableFilters: boolean;
  showError: boolean;
  showNormal: (showNormal: boolean) => void;
  emptySpeciality: (specialitySelected: string) => void;
  manageFilter: (disableFilters: boolean) => void;
  showResponsiveFilter: boolean;
  setShowResponsiveFilter: (showResponsiveFilter: boolean) => void;
  prakticeSpecialties?: '';
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
    showResponsiveFilter,
    setShowResponsiveFilter,
  } = props;

  // console.log(showResponsiveFilter, 'responsive filter is.....');

  const filterCities = { Hyderabad: 'Hyderabad', Chennai: 'Chennai' };
  const filterExperiences = { '0_5': '0-5', '6_10': '6-10', '11_15': '11-15', '15_99': '15+' };
  const filterAvailability = {
    now: 'Now',
    today: 'Today',
    tomorrow: 'Tomorrow',
    next3: 'Next 3 Days',
  };
  const filterFees = { '100_500': '100-500', '501_1000': '501-1000', '1000_-1': '1000+' };
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
  const isMediumScreen = useMediaQuery('(min-width:768px) and (max-width:900px)');
  const isSmallScreen = useMediaQuery('(max-width:767px)');

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
    prakticeSpecialties: '',
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
  const clearFilters = () => {
    // emptySpeciality('');
    setCityName([]);
    setGender([]);
    setExperience([]);
    setAvailability([]);
    setFees([]);
    setLanguage([]);
    setDateSelected('');
    setShowCalendar(false);
  };
  const isValidSearch = (value: string) => /^([^ ]+[ ]{0,1}[^ ]*)*$/.test(value);

  const gepTracking = (filterName: string, filterValue: string) => {
    window.gep('Consultations', selectedSpecialtyName, `${filterName} - ${filterValue}`)
  }

  return (
    <div className={classes.root}>
      <AphTextField
        classes={{
          root: `${classes.searchInput} ${!disableFilters ? classes.searchInputDisabled : ''}`,
        }}
        placeholder="Search doctors or specialities"
        onChange={(event) => {
          if (localStorage.getItem('symptomTracker')) {
            localStorage.removeItem('symptomTracker');
          }
          if (isValidSearch(event.target.value)) {
            if (localStorage.getItem('symptomTracker')) {
              localStorage.removeItem('symptomTracker');
              emptyFilters(true);
            }
            if (
              selectedSpecialtyName !== '' &&
              selectedSpecialtyName !== event.currentTarget.value
            ) {
              emptyFilters(false);
            }
            setSearchKeyword(event.target.value);
            filterOptions.searchKeyword = event.currentTarget.value;
            if (event.target.value.length === 0) {
              emptyFilters(true);
            } else if (event.target.value.length > 2) {
              handleFilterOptions(filterOptions);
            }
          }
        }}
        value={searchKeyword}
        error={showError}
        title="Search doctors or specialities"
        // disabled={localStorage && localStorage.getItem('symptomTracker') !== null ? true : false}
      />
      {showError ? (
        <FormHelperText className={classes.helpText} component="div" error={showError}>
          Sorry, we couldn't find what you are looking for :(
        </FormHelperText>
      ) : (
        ''
      )}
      <div
        className={` ${showResponsiveFilter ? classes.filterSectionOpen : ''} ${
          classes.filterSection
        } ${disableFilters ? classes.filterSectionDisabled : ''}`}
      >
        <div className={classes.filterHeader}>
          <AphButton
            onClick={() => {
              setShowResponsiveFilter(false);
              handleFilterOptions(filterOptions);
            }}
          >
            <img src={require('images/ic_cross.svg')} alt="" />
          </AphButton>
          <span>FILTERS</span>
          <AphButton
            onClick={() => {
              clearFilters();
              setShowResponsiveFilter(true);
            }}
          >
            <img src={require('images/ic_refresh.svg')} alt="" />
          </AphButton>
        </div>
        <Scrollbars
          autoHide={true}
          autoHeight
          autoHeightMax={
            isMediumScreen
              ? 'calc(100vh - 320px)'
              : isSmallScreen
              ? 'calc(100vh - 60px)'
              : 'calc(100vh - 275px)'
          }
        >
          <div className={classes.customScroll}>
            {/* <div className={classes.filterBox}>
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
                      title={'Select city'}
                    >
                      {filterCityName}
                    </AphButton>
                  );
                })}
              </div>
            </div> */}
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
                          gepTracking('Experience', e.currentTarget.value)
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
                    setAvailability([]);
                  }}
                >
                  <img
                    src={
                      showCalendar
                        ? require('images/ic_calendar_close.svg')
                        : require('images/ic_calendar_show.svg')
                    }
                    title={'Calendar'}
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
                          gepTracking('Availability', e.currentTarget.value)
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
                          gepTracking('Fees In Rupees', e.currentTarget.value)
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
                          gepTracking('Gender', e.currentTarget.value)
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
                          gepTracking('Language', e.currentTarget.value)
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
