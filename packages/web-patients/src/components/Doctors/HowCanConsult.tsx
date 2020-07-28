import React, { useState, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, CircularProgress, Modal } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { GetDoctorDetailsById_getDoctorDetailsById as DoctorDetails } from 'graphql/types/GetDoctorDetailsById';
import { getDiffInMinutes, getAvailability } from 'helpers/commonHelpers';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { useAuth } from 'hooks/authHooks';
import { BookConsult } from 'components/BookConsult';
import { SEARCH_TYPE, ConsultMode } from 'graphql/types/globalTypes';
import { SaveSearch, SaveSearchVariables } from 'graphql/types/SaveSearch';
import { useMutation } from 'react-apollo-hooks';
import { SAVE_PATIENT_SEARCH } from 'graphql/pastsearches';
import { useAllCurrentPatients } from 'hooks/authHooks';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      padding: 20,
      paddingTop: 0,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '23px',
      [theme.breakpoints.up('sm')]: {
        backgroundColor: theme.palette.common.white,
        borderRadius: 5,
        paddingTop: 20,
      },
      '& h3': {
        margin: 0,
        color: '#01667c',
        fontSize: 14,
        fontWeight: 600,
        paddingBottom: 20,
      },
    },
    tabButtons: {
      margin: '0 -6px',
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& li': {
        padding: '0 6px',
      },
    },
    button: {
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'none',
      padding: 9,
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      border: '1px solid #f7f8f5',
      minWidth: 135,
      textAlign: 'left',

      height: 130,
      '&:hover': {
        backgroundColor: '#f7f8f5',
      },

      '& span': {
        display: 'block',
      },
    },
    btnActive: {
      border: '1px solid #00b38e',
      '&:before': {
        content: "''",
        position: 'absolute',
        bottom: -128,
        left: 0,
        right: 0,
        zIndex: 2,
        width: 20,
        height: '100%',
        margin: '0 auto',
        borderRadius: 4,
        borderTop: '10px solid #f7f8f5',
        borderBottom: '10px solid transparent',
        borderLeft: ' 40px solid transparent',
        borderRight: '40px solid transparent',
      },
      '&:after': {
        content: "''",
        position: 'absolute',
        bottom: -129,
        left: 0,
        right: 0,
        zIndex: 1,
        width: 20,
        height: '100%',
        margin: '0 auto',
        borderRadius: 4,
        borderTop: '10px solid #00b38e',
        borderBottom: '10px solid transparent',
        borderLeft: ' 40px solid transparent',
        borderRight: '40px solid transparent',
      },
    },
    consultGroup: {
      padding: '20px 0',
      [theme.breakpoints.down('sm')]: {
        borderRadius: '10px 10px 0 0',
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
        backgroundColor: '#ffffff',
        marginTop: 20,
        padding: 20,
      },
    },
    groupHead: {
      display: 'flex',
      padding: '20px 0',
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      [theme.breakpoints.down('sm')]: {
        padding: '0 0 10px',
      },
      '& img': {
        verticalAlign: 'middle',
        marginRight: 16,
      },
      '& h4': {
        margin: 0,
        fontSize: 14,
        color: '#0589bb',
        fontWeight: 500,
        textTransform: 'uppercase',
        lineHeight: 'normal',
      },
      '& p': {
        margin: 0,
        fontSize: 10,
        textTransform: 'uppercase',
      },
    },
    groupDetails: {
      padding: '0 10px',
    },
    groupContent: {
      padding: '20px  0 0 ',
      [theme.breakpoints.down('sm')]: {
        padding: '10px 0 0',
      },
      '& ul': {
        padding: 0,
        margin: 0,
        '& li': {
          display: 'flex',
          fontSize: 12,
          lineHeight: '18px',
          color: 'rgba(1, 71, 91, 0.6)',
          paddingBottom: 10,
          '& span': {
            '&:first-child': {
              paddingRight: 12,
            },
          },
          '& img': {
            verticalAlign: 'top',
          },
        },
      },
    },
    blueText: {
      color: '#0589bb !important',
    },
    appDownloadGroup: {
      marginTop: 10,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 16,
      '& h4': {
        fontSize: 14,
        fontWeight: 500,
        color: '#0589bb',
        margin: 0,
      },
      '& p': {
        fontSize: 12,
        lineHeight: '18px',
        opacity: 0.6,
        marginTop: 0,
      },
    },
    appDownload: {
      display: 'flex',
      alignItems: 'center',
      '& img': {
        maxWidth: 77,
      },
      '& button': {
        flex: 1,
        color: '#fc9916',
        marginLeft: 16,
        backgroundColor: '#fff',
      },
    },
    bottomActions: {
      // paddingTop: 20,
      fontSize: 12,
      lineHeight: '16px',
      color: '#01475b',
      textAlign: 'center',
      '& button': {
        minWidth: 200,
      },
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        borderRadius: '0 0 10px 10px',
        padding: '0 20px 20px 20px',
      },
    },
    noteInfo: {
      margin: '20px 0 0',
    },
    price: {
      fontSize: 16,
      fontWeight: 600,
      paddingTop: 8,
      lineHeight: '18px',
    },
    availablity: {
      backgroundColor: 'rgba(0,135,186, 0.11)',
      color: '#0087ba',
      textTransform: 'uppercase',
      borderRadius: 10,
      padding: '6px 8px',
      fontSize: 9,
      marginTop: 16,
    },
    availableNow: {
      backgroundColor: '#ff748e !important',
      color: '#fff !important',
    },
    availableSoon: {
      color: '#ff748e',
    },
    headerGroup: {
      [theme.breakpoints.down('xs')]: {
        backgroundColor: '#fff',
        padding: 20,
        marginLeft: -20,
        marginRight: -20,
        boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
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
      marginTop: '14px',
    },
    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  });
});
interface HowCanConsultProps {
  doctorDetails: DoctorDetails;
  doctorAvailablePhysicalSlots: string;
  doctorAvailableOnlineSlot: string;
}
export const HowCanConsult: React.FC<HowCanConsultProps> = (props) => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const { currentPatient } = useAllCurrentPatients();
  const [popupLoading, setPopupLoading] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const { doctorDetails, doctorAvailablePhysicalSlots, doctorAvailableOnlineSlot } = props;
  const [onlineDirection, setOnlineDirection] = useState<boolean>(false);
  const [physicalDirection, setPhysicalDirection] = useState<boolean>(false);
  const doctorName = doctorDetails && doctorDetails.fullName;
  const physcalFee = doctorDetails && doctorDetails.physicalConsultationFees;
  const onlineFee = doctorDetails && doctorDetails.onlineConsultationFees;
  const doctorId = doctorDetails && doctorDetails.id;
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const consultMode =
    doctorAvailableOnlineSlot.length > 0 && doctorAvailablePhysicalSlots.length > 0
      ? ConsultMode.BOTH
      : doctorAvailableOnlineSlot.length > 0
      ? ConsultMode.ONLINE
      : doctorAvailablePhysicalSlots.length > 0
      ? ConsultMode.PHYSICAL
      : null;

  const saveSearchMutation = useMutation<SaveSearch, SaveSearchVariables>(SAVE_PATIENT_SEARCH);

  const differenceInOnlineMinutes = getDiffInMinutes(doctorAvailableOnlineSlot);
  const differenceInPhysicalMinutes = getDiffInMinutes(doctorAvailablePhysicalSlots);

  const availabilityMarkup = (consultType: string) => {
    const differenceInMinutes =
      consultType === 'online' ? differenceInOnlineMinutes : differenceInPhysicalMinutes;
    return getAvailability(
      consultType === 'online' ? doctorAvailableOnlineSlot : doctorAvailablePhysicalSlots,
      differenceInMinutes,
      'consultType'
    );
  };

  useEffect(() => {
    if (consultMode) {
      setOnlineDirection(consultMode === ConsultMode.BOTH || consultMode === ConsultMode.ONLINE);
      setPhysicalDirection(consultMode === ConsultMode.PHYSICAL);
    }
  }, [consultMode]);
  return (
    <div className={classes.root}>
      <div className={classes.headerGroup}>
        <h3>How can I consult with {doctorName}:</h3>
        <ul className={classes.tabButtons}>
          <li>
            {(consultMode === ConsultMode.BOTH || consultMode === ConsultMode.ONLINE) && (
              <AphButton
                className={`${classes.button}  ${onlineDirection ? classes.btnActive : null}`}
                onClick={() => {
                  setOnlineDirection(true);
                  setPhysicalDirection(false);
                }}
              >
                <span>Chat/Audio/Video</span>
                <span className={classes.price}>Rs. {onlineFee}</span>
                <span
                  className={`${classes.availability} ${
                    differenceInOnlineMinutes < 15 ? classes.availableNow : null
                  }`}
                >
                  {availabilityMarkup('online')}
                </span>
              </AphButton>
            )}
          </li>
          <li>
            {(consultMode === ConsultMode.BOTH || consultMode === ConsultMode.PHYSICAL) && (
              <AphButton
                className={`${classes.button} ${physicalDirection ? classes.btnActive : null} `}
                id="btnActive"
                onClick={() => {
                  setPhysicalDirection(true);
                  setOnlineDirection(false);
                }}
              >
                <span>Meet in Person</span>
                <span className={classes.price}>Rs. {physcalFee}</span>
                <span
                  className={`${classes.availability} ${
                    differenceInPhysicalMinutes < 15 ? classes.availableNow : null
                  }`}
                >
                  {availabilityMarkup('physical')}
                </span>
              </AphButton>
            )}
          </li>
        </ul>
      </div>
      <div className={classes.consultGroup}>
        <div className={classes.groupHead}>
          <span>
            <img
              src={require(physicalDirection
                ? 'images/ic-specialist.svg'
                : 'images/video-calling.svg')}
              alt=""
            />
          </span>
          <div className={classes.groupDetails}>
            <h4>{physicalDirection ? 'Meet in person' : 'How to consult via chat/audio/video?'}</h4>
            {(physicalDirection || (isSmallScreen && onlineDirection)) && (
              <p
                className={
                  physicalDirection
                    ? differenceInPhysicalMinutes < 15
                      ? classes.availableSoon
                      : ''
                    : differenceInOnlineMinutes < 15
                    ? classes.availableSoon
                    : ''
                }
              >
                {availabilityMarkup(physicalDirection ? 'physical' : 'online')}
              </p>
            )}
          </div>
        </div>

        <div className={classes.groupContent}>
          <ul>
            <li>
              <span>
                <img src={require('images/ic_doctor_small.svg')} alt="" />
              </span>
              <span>Choose the doctor</span>
            </li>
            <li>
              <span>
                <img src={require('images/ic_book-slot.svg')} alt="" />
              </span>
              <span>Book a slot</span>
            </li>
            <li>
              <span>
                <img src={require('images/ic-payment.svg')} alt="" />
              </span>
              <span>Make payment</span>
            </li>
            <li className={classes.blueText}>
              <span>
                <img
                  src={require(onlineDirection
                    ? 'images/ic_video-blue.svg'
                    : 'images/ic_hospital.svg')}
                  alt=""
                />
              </span>
              <span>
                {onlineDirection
                  ? 'Speak to the doctor via video/audio/chat'
                  : 'Visit the doctor at Hospital/Clinic'}
              </span>
            </li>
            <li>
              <span>
                <img src={require('images/ic_prescription-sm.svg')} alt="" />
              </span>
              <span>Receive prescriptions instantly </span>
            </li>
            {onlineDirection && (
              <li className={classes.blueText}>
                <span>
                  <img src={require('images/ic_chat.svg')} alt="" />
                </span>
                <span>Chat with the doctor for 6 days after your consult</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      {/* <div className={classes.bottomActions}> */}
      <ProtectedWithLoginPopup>
        {({ protectWithLoginPopup }) => (
          <div className={classes.bottomActions}>
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
                        typeId: doctorDetails && doctorDetails.id,
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
              // fullWidth
              color="primary"
              // className={classes.bottomActions}
            >
              {popupLoading ? <CircularProgress size={22} color="secondary" /> : 'BOOK APPOINTMENT'}
            </AphButton>
            <p className={classes.noteInfo}>
              Please note that after booking, you will need to download the Apollo 247 app to
              continue with your consultation.
            </p>
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
          doctorId={doctorId}
          doctorAvailableIn={
            onlineDirection ? differenceInOnlineMinutes : differenceInPhysicalMinutes
          }
          setIsPopoverOpen={setIsPopoverOpen}
        />
      </Modal>
    </div>
    // </div>
  );
};
