import React, { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Avatar, Modal, CircularProgress } from '@material-ui/core';
import _forEach from 'lodash/forEach';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { AphButton } from '@aph/web-ui-components';
import {
  GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors as DoctorDetails,
  GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_doctorHospital,
} from 'graphql/types/GetDoctorsBySpecialtyAndFilters';
import { SEARCH_TYPE, ConsultMode } from 'graphql/types/globalTypes';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { useAuth } from 'hooks/authHooks';
import { useMutation } from 'react-apollo-hooks';
import { SaveSearch, SaveSearchVariables } from 'graphql/types/SaveSearch';
import { SAVE_PATIENT_SEARCH } from 'graphql/pastsearches';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { BookConsult } from 'components/BookConsult';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { readableParam, getAvailability } from 'helpers/commonHelpers';
import { GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctorsNextAvailability as NextAvailabilityType } from 'graphql/types/GetDoctorsBySpecialtyAndFilters';

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
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      },
    },
    iconGroup: {
      paddingTop: 10,
    },
    topContent: {
      padding: 15,
      paddingTop: 24,
      display: 'flex',
      position: 'relative',
      cursor: 'pointer',
    },
    doctorAvatar: {
      width: 80,
      height: 80,
    },
    otherDoctorType: {
      width: 80,
    },
    doctorInfo: {
      paddingLeft: 15,
      paddingTop: 10,
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
      letterSpacing: 0.25,
      '& span': {
        fontSize: 13,
      },
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
      left: 0,
      top: 0,
    },
    availableNow: {
      backgroundColor: '#ff748e',
      color: theme.palette.common.white,
    },
    apolloLogo: {
      textAlign: 'center',
      position: 'absolute',
      right: -5,
      top: -8,
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
    consultType: {
      display: 'flex',
      justifyContent: 'center',
      fontSize: 7,
      color: '#658f9b',
      textAlign: 'center',
      '& span': {
        paddingLeft: 5,
        paddingRight: 5,
      },
    },
  });
});

interface InfoCardProps {
  doctorInfo: DoctorDetails;
  nextAvailability: NextAvailabilityType;
  doctorType: string;
  consultMode: ConsultMode;
}

export const InfoCardPartner: React.FC<InfoCardProps> = (props) => {
  const { doctorInfo, nextAvailability, doctorType, consultMode } = props;
  const differenceInMinutes = nextAvailability ? nextAvailability.availableInMinutes : 0;
  const { isSignedIn } = useAuth();
  const { currentPatient } = useAllCurrentPatients();
  const classes = useStyles({});
  const [popupLoading, setPopupLoading] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const doctorValue = doctorInfo.fullName.toLowerCase();
  const specialityName =
    doctorInfo &&
    doctorInfo.specialty &&
    doctorInfo.specialty.name &&
    doctorInfo.specialty.name.toLowerCase();

  const availabilityMarkupString = nextAvailability
    ? getAvailability(
        nextAvailability.onlineSlot.length > 0
          ? nextAvailability.onlineSlot
          : nextAvailability.physicalSlot,
        differenceInMinutes,
        'doctorInfo'
      )
    : '';

  const availabilityMarkup = () => {
    return nextAvailability ? (
      <div
        className={`${classes.availability} ${
          differenceInMinutes < 15 ? classes.availableNow : null
        }`}
      >
        {availabilityMarkupString}
      </div>
    ) : null;
  };

  const clinics: GetDoctorsBySpecialtyAndFilters_getDoctorsBySpecialtyAndFilters_doctors_doctorHospital[] = [];

  doctorInfo &&
    _forEach(doctorInfo.doctorHospital, (hospitalDetails) => {
      if (
        hospitalDetails &&
        (hospitalDetails.facility.facilityType === 'CLINIC' ||
          hospitalDetails.facility.facilityType === 'HOSPITAL')
      ) {
        clinics.push(hospitalDetails);
      }
    });

  const saveSearchMutation = useMutation<SaveSearch, SaveSearchVariables>(SAVE_PATIENT_SEARCH);

  return (
    <div className={classes.root}>
      <Link
        to={clientRoutes.specialtyDoctorDetails(
          readableParam(specialityName),
          readableParam(doctorValue),
          doctorInfo.id
        )}
      >
        <div className={classes.topContent}>
          <div className={classes.iconGroup}>
            <Avatar
              alt=""
              src={doctorInfo.photoUrl || require('images/no_photo_icon_round.svg')}
              className={classes.doctorAvatar}
            />
            <div className={classes.consultType}>
              {(consultMode === ConsultMode.BOTH || consultMode === ConsultMode.ONLINE) && (
                <span>
                  <img src={require('images/ic-video.svg')} alt="" />
                  <br />
                  Online
                </span>
              )}
              {consultMode === ConsultMode.PHYSICAL && (
                <span>
                  <img src={require('images/fa-solid-hospital.svg')} alt="" />
                  <br />
                  In-Person
                </span>
              )}
            </div>
          </div>
          <div className={classes.doctorInfo}>
            <>{availabilityMarkup()}</>
            <div className={`${classes.apolloLogo}`}>
              <img
                className={doctorType.toLowerCase() !== 'apollo' ? classes.otherDoctorType : ''}
                src={
                  doctorType.toLowerCase() === 'apollo'
                    ? require('images/ic_apollo.svg')
                    : require('images/partner_doc.png')
                }
                alt=""
              />
            </div>
            <div className={classes.doctorName}>{`${doctorInfo.fullName}`}</div>
            <div className={classes.doctorType}>
              <span title={'Specialty'}>{doctorInfo.specialty.userFriendlyNomenclature}</span>
              <span className={classes.doctorExp} title={'Experiance'}>
                {doctorInfo.experience} {doctorInfo.experience === '1' ? 'YR' : 'YRS'} Exp.
              </span>
            </div>
            <div className={classes.doctorspecialty} title={'Specialty'}>
              <p>
                Starts at{' '}
                <span>
                  ₹ {doctorInfo.onlineConsultationFees || doctorInfo.physicalConsultationFees}
                </span>
              </p>
            </div>
            <div className={classes.doctorDetails} title={'Location'}>
              <p>{doctorInfo.qualification}</p>
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
      </Link>
      <ProtectedWithLoginPopup>
        {({ protectWithLoginPopup }) => (
          <div className={classes.bottomAction}>
            <AphButton
              onClick={() => {
                if (!isSignedIn) {
                  protectWithLoginPopup();
                } else {
                  setPopupLoading(true);
                  saveSearchMutation({
                    variables: {
                      saveSearchInput: {
                        type: SEARCH_TYPE.DOCTOR,
                        typeId: doctorInfo.id,
                        patient: currentPatient ? currentPatient.id : '',
                      },
                    },
                    fetchPolicy: 'no-cache',
                  })
                    .then(() => {
                      setPopupLoading(false);
                    })
                    .catch((e) => {
                      console.log(e);
                    })
                    .finally(() => {
                      setIsPopoverOpen(true);
                    });
                }
              }}
              fullWidth
              color="primary"
              className={classes.button}
            >
              {popupLoading ? (
                <CircularProgress size={22} color="secondary" />
              ) : (
                availabilityMarkupString
              )}
            </AphButton>
          </div>
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
          doctorId={doctorInfo.id}
          doctorAvailableIn={differenceInMinutes}
          setIsPopoverOpen={setIsPopoverOpen}
        />
      </Modal>
    </div>
  );
};
