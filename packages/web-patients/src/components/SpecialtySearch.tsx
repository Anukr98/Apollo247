import React from 'react';
import { Theme, CircularProgress, Popover, Typography } from '@material-ui/core';
import { readableParam } from 'helpers/commonHelpers';
import { makeStyles } from '@material-ui/styles';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import {
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_doctors as DoctorsType,
  SearchDoctorAndSpecialtyByName_SearchDoctorAndSpecialtyByName_specialties as SpecialtyType,
} from 'graphql/types/SearchDoctorAndSpecialtyByName';
import { AphInput } from '@aph/web-ui-components';
import _lowerCase from 'lodash/lowerCase';
import { Cities } from './Cities';

const useStyles = makeStyles((theme: Theme) => {
  return {
    location: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: '2px solid #00b38e',
      padding: '5px 0',
      margin: '0 10px 0 0',
      cursor: 'pointer',
      '& >img': {
        margin: '0 10px 0 0',
      },
      [theme.breakpoints.down(600)]: {
        margin: '0 0 10px',
      },
    },
    userLocation: {
      display: 'flex',
      alignItems: 'center',
      '& p': {
        fontSize: 16,
        color: 'rgba(2,71,91, 0.3)',
        fontWeight: 700,
        margin: '0 10px 0 0',
        minWidth: 50,
        maxWidth: 120,
        whiteSpace: 'nowrap',
      },
    },
    searchInput: {
      padding: '0 0 0 30px',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      position: 'relative',
      '&  >img': {
        position: 'absolute',
        left: 0,
      },
    },
    specialitySearch: {
      padding: '10px 0',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down(700)]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    cityActive: {
      color: '#02475b !important',
    },
    searchContent: {
      position: 'absolute',
      top: 36,
      left: 0,
      right: 0,
      zIndex: 5,
      maxHeight: 300,
      overflow: 'auto',
      padding: 20,
      background: '#fff',
      borderRadius: 5,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',

      '& h6': {
        fontSize: 12,
        color: 'rgba(1,71,91, 0.6)',
        fontWeight: 700,
        textTransform: 'uppercase',
      },
      '&::-webkit-scrollbar': {
        width: 8,
      },
      '&::-webkit-scrollbar-track': {
        background: '#fff',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#d8d8d8',
        borderRadius: 4,
      },
    },
    doctorContent: {
      display: 'flex',
      alignItems: 'center',
    },
    dImg: {
      margin: '0 15px 0 0',
      '& img': {
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid #ccc',
      },
    },
    doctorDetails: {},
    doctorList: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      '& li': {
        padding: '10px 0',
      },
    },
    docContent: {
      '& h2': {
        fontSize: 16,
        color: '#02475b',
        fontWeight: 500,
        margin: '0 0 5px',
      },
      '& p': {
        fontSize: 12,
        color: 'rgba(2,71,91,0.7)',
        fontWeight: 500,
      },
      margin: '10px 0 0',
      padding: '7px 0 0',
    },
    sContent: {
      borderBottom: '1px solid rgba(1,71,91,0.5)',
      paddingBottom: '7px',
    },
    sList: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      '& li': {
        fontSize: 16,
        color: '#02475b',
        padding: '5px 0',
        fontWeight: 500,
      },
    },
    noDoctorContent: {
      padding: '10px 0',
      '& h2': {
        fontSize: 16,
        margin: '10px 0',
        color: '#00a7b9',
        fontWeight: 'bold',
      },
      '& p': {
        fontSize: 14,
        fontWeight: 700,
      },
      [theme.breakpoints.down(769)]: {
        padding: 0,
      },
    },
  };
});

interface SpecialtySearchProps {
  setSearchKeyword: (searchKeyword: string) => void;
  searchKeyword: string;
  selectedCity: string;
  setSelectedCity: (selectedCity: string) => void;
  searchSpecialty: SpecialtyType[] | null;
  searchDoctors: DoctorsType[] | null;
  searchLoading: boolean;
  setLocationPopup: (locationPopup: boolean) => void;
  locationPopup: boolean;
}

export const SpecialtySearch: React.FC<SpecialtySearchProps> = (props) => {
  const classes = useStyles({});
  const {
    selectedCity,
    setSearchKeyword,
    setLocationPopup,
    searchDoctors,
    searchLoading,
    searchSpecialty,
    searchKeyword,
    locationPopup,
    setSelectedCity,
  } = props;
  return (
    <>
      <div className={classes.specialitySearch}>
        {/* <div className={classes.location} onClick={() => setLocationPopup(true)}>
          <img src={require('images/location.svg')} alt="" />
          <div className={classes.userLocation}>
            <Typography className={selectedCity ? classes.cityActive : null}>
              {selectedCity === '' ? 'Select Your City' : selectedCity}
            </Typography>
            <img src={require('images/ic_dropdown_green.svg')} alt="" />
          </div>
        </div> */}
        <div className={classes.searchContainer}>
          <img src={require('images/ic-search.svg')} alt="" />
          <AphInput
            className={classes.searchInput}
            placeholder="Search doctors or specialities"
            value={searchKeyword}
            onChange={(e) => {
              const searchValue = e.target.value;
              setSearchKeyword(searchValue);
            }}
          />
          {(searchSpecialty || searchDoctors || searchLoading) && searchKeyword.length > 0 && (
            <div className={classes.searchContent}>
              {searchLoading ? (
                <CircularProgress />
              ) : (
                <>
                  {searchSpecialty && searchSpecialty.length > 0 && (
                    <div className={classes.sContent}>
                      <Typography component="h6">Specialities</Typography>
                      <ul className={classes.sList}>
                        {searchSpecialty.map((specialty: SpecialtyType) => (
                          <Link
                            key={specialty.id}
                            to={
                              selectedCity === ''
                                ? clientRoutes.specialties(readableParam(specialty.name))
                                : clientRoutes.citySpecialties(
                                    _lowerCase(selectedCity),
                                    readableParam(specialty.name)
                                  )
                            }
                          >
                            <li key={specialty.id} onClick={() => setSearchKeyword('')}>
                              {specialty.name}
                            </li>
                          </Link>
                        ))}
                      </ul>
                    </div>
                  )}
                  {searchDoctors && searchDoctors.length > 0 && (
                    <div className={classes.docContent}>
                      <Typography component="h6">Doctors</Typography>
                      <ul className={classes.doctorList}>
                        {searchDoctors.map((doctor: DoctorsType) => (
                          <li key={doctor.id}>
                            <Link
                              key={doctor.id}
                              to={clientRoutes.doctorDetails(
                                readableParam(doctor.fullName),
                                doctor.id
                              )}
                            >
                              <div className={classes.doctorContent}>
                                <div className={classes.dImg}>
                                  <img src={doctor.photoUrl} />
                                </div>
                                <div className={classes.doctorDetails}>
                                  <Typography component="h2">{doctor.fullName}</Typography>
                                  <Typography>
                                    {doctor.specialty && doctor.specialty.name
                                      ? doctor.specialty.name
                                      : ''}{' '}
                                    |{' '}
                                    {doctor.doctorHospital &&
                                    doctor.doctorHospital[0] &&
                                    doctor.doctorHospital[0].facility
                                      ? `${doctor.doctorHospital[0].facility.name || ''} ${doctor
                                          .doctorHospital[0].facility.streetLine1 || ''} ${doctor
                                          .doctorHospital[0].facility.city || ''} `
                                      : ''}
                                  </Typography>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              {!searchLoading &&
                searchDoctors &&
                searchDoctors.length === 0 &&
                searchSpecialty &&
                searchSpecialty.length === 0 && <p>No Results Found</p>}
            </div>
          )}
        </div>
      </div>
      {locationPopup && (
        <Cities
          setSelectedCity={setSelectedCity}
          locationPopup={locationPopup}
          setLocationPopup={setLocationPopup}
          selectedCity={selectedCity}
        />
      )}
    </>
  );
};
