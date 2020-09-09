import { AphButton } from '@aph/web-ui-components';
import { clientRoutes } from 'helpers/clientRoutes';
import _forEach from 'lodash/forEach';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { Mutation } from 'react-apollo';
import { SaveSearch, SaveSearchVariables } from 'graphql/types/SaveSearch';
import { SAVE_PATIENT_SEARCH } from 'graphql/pastsearches';
import { SEARCH_TYPE, ConsultMode } from 'graphql/types/globalTypes';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { BookConsult } from 'components/BookConsult';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Avatar, Modal, Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { BookConsult } from 'components/BookConsult';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { SAVE_PATIENT_SEARCH } from 'graphql/pastsearches';
import { ConsultMode, SEARCH_TYPE } from 'graphql/types/globalTypes';
import { SaveSearch, SaveSearchVariables } from 'graphql/types/SaveSearch';
import { clientRoutes } from 'helpers/clientRoutes';
import {
  getDiffInDays,
  getDiffInHours,
  getDiffInMinutes,
  readableParam,
} from 'helpers/commonHelpers';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import _forEach from 'lodash/forEach';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import React from 'react';
import { Mutation } from 'react-apollo';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      height: '100%',
      position: 'relative',
      paddingBottom: 40,
      [theme.breakpoints.down('sm')]: {
        boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    topContent: {
      padding: 15,
      display: 'flex',
      position: 'relative',
      cursor: 'pointer',
    },
    doctorAvatar: {
      width: 80,
      height: 80,
    },
    doctorInfo: {
      paddingLeft: 15,
      paddingTop: 15,
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
    },
    doctorType: {
      fontSize: 10,
      fontWeight: 600,
      color: '#0087ba',
      textTransform: 'uppercase',
      letterSpacing: 0.25,
    },
    doctorspecialty: {
      fontSize: 10,
      fontWeight: 600,
      color: '#0087ba',
      textTransform: 'uppercase',
      letterSpacing: 0.25,
    },
    doctorExp: {
      paddingLeft: 8,
      marginLeft: 5,
      paddingRight: 5,
      position: 'relative',
      '&:before': {
        position: 'absolute',
        content: '""',
        width: 1,
        height: 10,
        top: 1,
        left: 0,
        backgroundColor: '#0087ba',
      },
    },
    doctorDetails: {
      paddingTop: 0,
      fontSize: 10,
      fontWeight: 500,
      color: '#658f9b',
      '& p': {
        margin: 0,
      },
    },
    availability: {
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
      backgroundColor: 'rgba(0,135,186,0.11)',
      padding: '6px 12px',
      color: '#02475b',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      borderRadius: 10,
      position: 'absolute',
      right: 0,
      top: 0,
    },
    availableNow: {
      backgroundColor: '#ff748e',
      color: theme.palette.common.white,
    },
    bottomAction: {
      position: 'absolute',
      width: '100%',
      bottom: 0,
    },
    button: {
      width: '100%',
      borderRadius: '0 0 10px 10px',
      boxShadow: 'none',
    },
    cardLoader: {
      position: 'absolute',
      left: 10,
      right: 10,
      top: 0,
    },
  });
});

interface DoctorCardProps {
  doctorDetails: any;
  nextAvailability: string | null;
  history?: any;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const { doctorDetails, nextAvailability } = props;
  const { currentPatient } = useAllCurrentPatients();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const [popupLoading, setPopupLoading] = React.useState<boolean>(false);
  const doctorId = doctorDetails.id;
  const doctorName = doctorDetails && doctorDetails.fullName;

  const clinics: any = [];

  const consultModeOnline: any = [];
  const consultModePhysical: any = [];
  doctorDetails &&
    doctorDetails.consultHours &&
    doctorDetails.consultHours.map((item: any) => {
      if (item.consultMode === 'PHYSICAL' || item.consultMode === 'BOTH') {
        consultModePhysical.push(item.consultMode);
      }
      if (item.consultMode === 'ONLINE' || item.consultMode === 'BOTH') {
        consultModeOnline.push(item.consultMode);
      }
    });
  const consultMode =
    consultModeOnline.length > 0 && consultModePhysical.length > 0
      ? ConsultMode.BOTH
      : consultModeOnline.length > 0
      ? ConsultMode.ONLINE
      : consultModePhysical.length > 0
      ? ConsultMode.PHYSICAL
      : null;

  const differenceInMinutes = getDiffInMinutes(nextAvailability);
  const availabilityMarkup = () => {
    if (nextAvailability && nextAvailability.length > 0) {
      if (differenceInMinutes === 0) {
        return (
          <div className={`${classes.availability} ${classes.availableNow}`}>AVAILABLE NOW</div>
        );
      } else if (differenceInMinutes > 0 && differenceInMinutes <= 15) {
        return (
          <div className={`${classes.availability} ${classes.availableNow}`}>
            AVAILABLE IN {differenceInMinutes} {differenceInMinutes === 1 ? 'MIN' : 'MINS'}
          </div>
        );
      } else if (differenceInMinutes > 15 && differenceInMinutes <= 60) {
        return (
          <div className={`${classes.availability}`}>AVAILABLE IN {differenceInMinutes} MINS</div>
        );
      } else if (differenceInMinutes >= 60 && differenceInMinutes < 1380) {
        return (
          <div className={`${classes.availability}`}>
            AVAILABLE IN {getDiffInHours(nextAvailability)} HOURS
          </div>
        );
      } else if (differenceInMinutes >= 1380) {
        return (
          <div className={`${classes.availability}`}>
            AVAILABLE IN {getDiffInDays(nextAvailability)} Days
          </div>
        );
      }
    } else {
      return null;
    }
  };

  // as per the MVP, we have only one clinic or hospital.
  _forEach(doctorDetails.doctorHospital, (hospitalDetails) => {
    if (
      hospitalDetails &&
      (hospitalDetails.facility.facilityType === 'CLINIC' ||
        hospitalDetails.facility.facilityType === 'HOSPITAL')
    ) {
      clinics.push(hospitalDetails);
    }
  });

  const navigateToDoctorDetails = () => {
    const readableDoctorName = readableParam(doctorName);
    props.history.push(clientRoutes.doctorDetails(readableDoctorName, doctorId));
  };

  return (
    <div className={classes.root}>
      <div
        className={classes.topContent}
        onClick={() => {
          navigateToDoctorDetails();
        }}
      >
        <Avatar
          alt={doctorDetails.firstName || ''}
          src={
            doctorDetails.thumbnailUrl && doctorDetails.thumbnailUrl !== ''
              ? doctorDetails.thumbnailUrl
              : require('images/no_photo_icon_round.svg')
          }
          title={
            doctorDetails.fullName
              ? doctorDetails.fullName
              : `${_startCase(_toLower(doctorDetails.firstName))} ${_startCase(
                  _toLower(doctorDetails.lastName)
                )}`
          }
          className={classes.doctorAvatar}
        />
        <div
          className={classes.doctorInfo}
          onClick={() => {
            navigateToDoctorDetails();
          }}
        >
          {availabilityMarkup()}
          <div
            className={classes.doctorName}
            title={
              doctorDetails.fullName
                ? doctorDetails.fullName
                : `${_startCase(_toLower(doctorDetails.firstName))} ${_startCase(
                    _toLower(doctorDetails.lastName)
                  )}`
            }
          >
            {doctorDetails.fullName
              ? doctorDetails.fullName
              : `${_startCase(_toLower(doctorDetails.firstName))} ${_startCase(
                  _toLower(doctorDetails.lastName)
                )}`}
          </div>
          <div className={classes.doctorType}>
            <span title={'Specialty'}>
              {' '}
              {doctorDetails.specialty ? doctorDetails.specialty.name : null}
            </span>
            <span className={classes.doctorExp} title={'Experiance'}>
              {doctorDetails.experience}{' '}
              {doctorDetails && parseInt(doctorDetails.experience || '1', 10) > 1 ? 'YRS' : 'YEAR'}
            </span>
          </div>
          <div className={classes.doctorspecialty} title={'Specialty'}>
            <p>
              {doctorDetails &&
                doctorDetails.specialty &&
                doctorDetails.specialty.userFriendlyNomenclature}
            </p>
          </div>
          <div className={classes.doctorDetails} title={'Location'}>
            <p>{doctorDetails.qualification}</p>
            {
              <p>
                {clinics && clinics.length > 0
                  ? clinics[0].facility.name + ',' + clinics[0].facility.city
                  : ''}
              </p>
            }
          </div>
        </div>
      </div>
      <ProtectedWithLoginPopup>
        {({ protectWithLoginPopup }) => (
          <Mutation<SaveSearch, SaveSearchVariables>
            mutation={SAVE_PATIENT_SEARCH}
            variables={{
              saveSearchInput: {
                type: SEARCH_TYPE.DOCTOR,
                typeId: doctorId,
                patient: currentPatient ? currentPatient.id : '',
              },
            }}
            onCompleted={(data) => {
              setIsPopoverOpen(true);
            }}
            onError={(error) => {
              console.log(error);
            }}
          >
            {(mutation) => (
              <div
                onClick={() => {
                  !isSignedIn ? protectWithLoginPopup() : setPopupLoading(true);
                  mutation()
                    .then(() => {
                      setPopupLoading(false);
                    })
                    .catch(() => {
                      setPopupLoading(false);
                    });
                }}
                className={classes.bottomAction}
              >
                <AphButton
                  fullWidth
                  color="primary"
                  className={classes.button}
                  title={
                    getDiffInMinutes(nextAvailability) > 0 &&
                    getDiffInMinutes(nextAvailability) <= 60
                      ? 'Consult now'
                      : 'Book appointments'
                  }
                >
                  {popupLoading ? (
                    <CircularProgress size={22} color="secondary" />
                  ) : getDiffInMinutes(nextAvailability) > 0 &&
                    getDiffInMinutes(nextAvailability) <= 60 ? (
                    'CONSULT NOW'
                  ) : (
                    'BOOK APPOINTMENT'
                  )}
                </AphButton>
              </div>
            )}
          </Mutation>
        )}
      </ProtectedWithLoginPopup>
      <Modal
        open={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        disableBackdropClick
        disableEscapeKeyDown
      >
        <BookConsult
          consultMode={consultMode}
          doctorId={doctorDetails.id}
          doctorAvailableIn={differenceInMinutes}
          setIsPopoverOpen={setIsPopoverOpen}
        />
      </Modal>
    </div>
  );
};
