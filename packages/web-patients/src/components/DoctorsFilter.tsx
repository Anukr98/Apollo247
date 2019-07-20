import React, { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { AphButton, AphTextField } from '@aph/web-ui-components';
import { Gender } from 'graphql/types/globalTypes';
import { SearchObject } from 'components/DoctorsLanding';
import _filter from 'lodash/filter';
import _reverse from 'lodash/reverse';
import _map from 'lodash/map';
import _uniqueId from 'lodash/uniqueId';
import FormHelperText from '@material-ui/core/FormHelperText';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      paddingTop: 10,
      width: 328,
      borderRadius: 5,
    },
    filterSection: {
      padding: 20,
      paddingTop: 15,
    },
    customScroll: {
      height: '70vh',
      overflow: 'auto',
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
      borderBottom: '1px solid rgba(1,71,91,0.3)',
    },
    boxContent: {
      paddingTop: 5,
    },
    button: {
      marginRight: 5,
      marginTop: 5,
    },
    showMessage: {
      opacity: 1.0,
    },
    hideMessage: {
      opacity: 0,
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
  });
});

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

  const filterCities = { hyderabad: 'HYDERABAD', chennai: 'CHENNAI' };
  const filterExperiences = { '0_5': '0-5', '6_10': '6-10', '11_15': '11-15', '16_99': '16+' };
  const filterAvailability = { now: 'NOW', today: 'TODAY', tomorrow: 'TOMORROW' };
  const filterFees = { '100_500': '100-500', '501_1000': '501-1000', '1001_1500': '1001-1500' };
  const filterGenders = _reverse(_filter(Object.values(Gender), (gender) => gender !== 'OTHER')); // show MALE, FEMALE instead of FEMALE, MALE
  const filterLanguages = { Hindi: 'HINDI', English: 'ENGLISH', Telugu: 'TELUGU' };

  const [searchKeyword, setSearchKeyword] = useState<string>(existingFilters.searchKeyword || '');
  const [cityName, setCityName] = useState<string>(existingFilters.cityName || '');
  const [experience, setExperience] = useState<string>(existingFilters.experience || '');
  const [availability, setAvailability] = useState<string>(existingFilters.availability || '');
  const [fees, setFees] = useState<string>(existingFilters.fees || '');
  const [gender, setGender] = useState<string>(existingFilters.gender || '');
  const [language, setLanguage] = useState<string>(existingFilters.language || '');

  // console.log(searchKeyword, '---------');
  // console.log('filter status...', disabled);

  const filterOptions = {
    searchKeyword: existingFilters.searchKeyword,
    cityName: existingFilters.cityName,
    experience: existingFilters.experience,
    availability: existingFilters.availability,
    fees: existingFilters.fees,
    gender: existingFilters.gender,
    language: existingFilters.language,
  };

  // console.log(filterOptions, 'in filters........', existingFilters);

  return (
    <div className={classes.root}>
      <AphTextField
        classes={{ root: classes.searchInput }}
        placeholder="Search doctors or specialities"
        onChange={(event) => {
          setSearchKeyword(event.target.value);
          filterOptions.searchKeyword = event.currentTarget.value;
          if (event.target.value.length === 0) {
            filterOptions.searchKeyword = '';
            showNormal(true);
            emptySpeciality('');
            manageFilter(true);
            setCityName('');
            setGender('');
            setExperience('');
            setAvailability('');
            setFees('');
            setLanguage('');
          }
          handleFilterOptions(filterOptions);
        }}
        value={existingFilters.searchKeyword || ''}
        error={showError}
      />
      <FormHelperText
        className={showError ? classes.showMessage : classes.hideMessage}
        component="div"
        error={showError}
      >
        Sorry, we couldn't find what you are looking for :(
      </FormHelperText>
      <div className={classes.filterSection}>
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
                      index === cityName
                        ? `${classes.button} ${classes.buttonActive}`
                        : `${classes.button}`
                    }
                    value={index}
                    onClick={(e) => {
                      setCityName(e.currentTarget.value);
                      filterOptions.cityName = e.currentTarget.value;
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
                      index === experience
                        ? `${classes.button} ${classes.buttonActive}`
                        : `${classes.button}`
                    }
                    value={index}
                    onClick={(e) => {
                      setExperience(e.currentTarget.value);
                      filterOptions.experience = e.currentTarget.value;
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
            <div className={classes.filterType}>Availability</div>
            <div className={classes.boxContent}>
              {_map(filterAvailability, (filterAvailability, index) => {
                return (
                  <AphButton
                    color="secondary"
                    size="small"
                    className={
                      index === availability
                        ? `${classes.button} ${classes.buttonActive}`
                        : `${classes.button}`
                    }
                    value={index}
                    onClick={(e) => {
                      setAvailability(e.currentTarget.value);
                      filterOptions.availability = e.currentTarget.value;
                      handleFilterOptions(filterOptions);
                    }}
                    key={_uniqueId('ava_')}
                    disabled={disableFilters}
                  >
                    {filterAvailability}
                  </AphButton>
                );
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
                      index === fees
                        ? `${classes.button} ${classes.buttonActive}`
                        : `${classes.button}`
                    }
                    value={index}
                    onClick={(e) => {
                      setFees(e.currentTarget.value);
                      filterOptions.fees = e.currentTarget.value;
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
                      setGender(Gender[e.currentTarget.value as Gender]);
                    }}
                    className={
                      gender === filterGender
                        ? `${classes.button} ${classes.buttonActive}`
                        : `${classes.button}`
                    }
                    key={_uniqueId('gender_')}
                    disabled={disableFilters}
                  >
                    {filterGender}
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
                      index === language
                        ? `${classes.button} ${classes.buttonActive}`
                        : `${classes.button}`
                    }
                    value={index}
                    onClick={(e) => {
                      setLanguage(e.currentTarget.value);
                      filterOptions.language = e.currentTarget.value;
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
      </div>
    </div>
  );
};
