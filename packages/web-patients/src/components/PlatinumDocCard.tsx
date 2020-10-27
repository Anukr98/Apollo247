import React, { useState } from 'react';
import { CircularProgress, Modal, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { getAvailability, readableParam } from 'helpers/commonHelpers';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { dataLayerTracking } from 'gtmTracking';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import { consultNowClickTracking } from 'webEngageTracking';
import { SEARCH_TYPE } from 'graphql/types/globalTypes';
import { useMutation } from 'react-apollo-hooks';
import { SaveSearch, SaveSearchVariables } from 'graphql/types/SaveSearch';
import { SAVE_PATIENT_SEARCH } from 'graphql/pastsearches';
import { BookConsult } from 'components/BookConsult';
import { genericData } from 'strings/AppConfig';

const useStyles = makeStyles((theme: Theme) => {
  return {
    pdContainer: {
      background: 'linear-gradient(105.88deg, #2C4C70 0.63%, #5EACB0 102.46%)',
      boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.08)',
      padding: '20px 50px',
      margin: '0 0 30px',
      [theme.breakpoints.down('sm')]: {
        padding: 20,
      },
    },
    heading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 600,
      lineHeight: '18px',
      color: '#fff',
      '& img': {
        margin: '0 20px 0 0',
        width: 16,
      },
    },
    pdocCard: {
      padding: 24,
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      background: '#fff',
      borderRadius: 10,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '20px 0',
      [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
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
    availableBox: {
      position: 'absolute',
      top: 0,
      left: 0,
      padding: '6px 15px',
      background: '#FF748E',
      borderRadius: 10,
      '& p': {
        fontSize: 12,
        fontWeight: 700,
        color: '#fff',
        textTransform: 'uppercase',
        [theme.breakpoints.down('sm')]: {
          fontSize: 8,
        },
      },
    },
    apolloImg: {
      position: 'absolute',
      top: -10,
      right: -10,
    },
    pdocContent: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '20px 0 0',
    },
    pdDocImgContainer: {
      margin: '0 20px 0 0 ',
    },
    imgBox: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      overflow: 'hidden',
      margin: '0 0 10px',
      // border: '1px solid rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    consultModes: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      '& li': {
        textAlign: 'center',
        margin: '0 10px 0 0',
        '&:last-child': {
          margin: 0,
        },
        '& img': {
          margin: '0 0 5px',
        },
        '& p': {
          fontSize: 8,
          fontWeight: 500,
        },
      },
    },
    pdocConnectOptions: {},
    pdocInfo: {
      '& h2': {
        fontSize: 18,
        fontWeight: 600,
      },
      '& h3': {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 600,
        textTransform: 'uppercase',
        color: '#0092C2',
        margin: '10px 0',
      },
      '& p': {
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
        color: '#658F9B',
      },
    },
    consultDetails: {
      padding: '20px 0 0',
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
      '& p': {
        fontSize: 13,
        lineHeight: '24px',
        margin: '0 0 10px',
        '& span': {
          color: '#0092C2',
          fontSize: 17,
          fontWeight: 500,
        },
      },
      '& button': {
        width: '100%',
      },
    },
  };
});

interface PlatinumCardProps {
  doctorInfo: any;
  specialtyId: string;
}
export const PlatinumDocCard: React.FC<PlatinumCardProps> = (props) => {
  const { doctorInfo, specialtyId } = props;
  const doctorValue = doctorInfo.displayName.toLowerCase();
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const differenceInMinutes = doctorInfo ? doctorInfo.earliestSlotInMinutes : 0;
  const specialityName = doctorInfo && doctorInfo.specialistSingularTerm.toLowerCase();
  const [popupLoading, setPopupLoading] = useState<boolean>(false);
  const saveSearchMutation = useMutation<SaveSearch, SaveSearchVariables>(SAVE_PATIENT_SEARCH);
  const { currentPatient } = useAllCurrentPatients();
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const consultMode = doctorInfo.consultMode;
  const availabilityMarkupString = (type: string) =>
    doctorInfo.slot ? getAvailability(doctorInfo.slot, differenceInMinutes, type) : '';
  const availabilityMarkup = (type: string) => {
    return type === 'markup' ? (
      <div
        className={`${classes.availability} ${differenceInMinutes < genericData.consultDiffInMinutes ? classes.availableNow : null
          }`}
      >
        {availabilityMarkupString(type)}
      </div>
    ) : (
        availabilityMarkupString(type)
      );
  };
  return (
    <div className={classes.pdContainer}>
      <Typography className={classes.heading}>
        {' '}
        <img src={require('images/ic_doctor_consult.svg')} alt="" />
        Doctor of the Hour!
      </Typography>

      <div className={classes.pdocCard}>
        <label className={classes.apolloImg}>
          <img src={require('images/ic_apollo.svg')} />
        </label>
        <div className={classes.availableBox}>
          {' '}
          <Typography> {'available in ' + doctorInfo.earliestSlotInMinutes + ' mins'}</Typography>
        </div>
        <Link to={clientRoutes.doctorDetails(readableParam(doctorValue), doctorInfo.id)}>
          <div className={classes.pdocContent}>
            <div className={classes.pdDocImgContainer}>
              <div className={classes.imgBox}>
                <img src={doctorInfo.photoUrl} alt="" width="100px" />
              </div>
              <div className={classes.pdocConnectOptions}>
                {/* {props.consultMode}    */}
                <ul className={classes.consultModes}>
                  <li>
                    <img src={require('images/ic-video.svg')} />
                    <Typography> Online</Typography>{' '}
                  </li>
                  <li>
                    <img src={require('images/fa-solid-hospital.svg')} />{' '}
                    <Typography>In Person</Typography>
                  </li>
                </ul>
              </div>
            </div>
            <div className={classes.pdocInfo}>
              <Typography component="h2">{doctorInfo.displayName}</Typography>
              <Typography component="h3">
                {' '}
                {doctorInfo.specialtydisplayName} | <span>{doctorInfo.experience + 'years'}</span>{' '}
              </Typography>

              <Typography>{doctorInfo.qualification}</Typography>
              <Typography>{doctorInfo.doctorfacility}</Typography>
              {/* <Typography>  {props.doctorType} </Typography> */}
            </div>
          </div>
        </Link>
        <div className={classes.consultDetails}>
          <Typography>
            Consultation Fees: <span> ₹ {doctorInfo.fee}</span>
          </Typography>
          <ProtectedWithLoginPopup>
            {({ protectWithLoginPopup }) => (
              <AphButton
                color="primary"
                onClick={() => {
                  /**Gtm code start start */
                  dataLayerTracking({
                    event: 'Consult Now Clicked',
                    product: doctorInfo.id,
                  });
                  /**Gtm code start end */

                  if (!isSignedIn) {
                    protectWithLoginPopup();
                  } else {
                    const hospitalName = doctorInfo && doctorInfo.doctorfacility;
                    const eventdata = {
                      availableInMins: differenceInMinutes,
                      docCategory: doctorInfo.doctorType,
                      exp: doctorInfo.experience,
                      hospital: hospitalName,
                      name: doctorInfo.displayName,
                      specialty: specialityName,
                      listingType: '',
                    };

                    consultNowClickTracking(eventdata);
                    setPopupLoading(true);
                    saveSearchMutation({
                      variables: {
                        saveSearchInput: {
                          type: SEARCH_TYPE.SPECIALTY,
                          typeId: specialtyId,
                          patient: currentPatient ? currentPatient.id : '',
                        },
                      },
                      fetchPolicy: 'no-cache',
                    });
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
                        /**Gtm code start start */
                        dataLayerTracking({
                          event: 'Consult Now Pop-up Shown',
                          product: doctorInfo.id,
                        });
                        /**Gtm code start end */
                      });
                  }
                }}
                fullWidth
              >
                {popupLoading ? (
                  <CircularProgress size={22} color="secondary" />
                ) : (
                    availabilityMarkup('doctorInfo')
                  )}
              </AphButton>
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
      </div>
    </div>
  );
};

export default PlatinumDocCard;
