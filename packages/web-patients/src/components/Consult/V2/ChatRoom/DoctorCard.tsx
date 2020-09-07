import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar, Popover } from '@material-ui/core';
import React, { useState, useRef, useEffect } from 'react';
import { ViewPrescriptionCard } from 'components/Consult/V2/ChatRoom/ViewPrescriptionCard';
import format from 'date-fns/format';
import isToday from 'date-fns/isToday';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';
import { AphButton } from '@aph/web-ui-components';
import { GetAppointmentData_getAppointmentData_appointmentsHistory as AppointmentHistory } from 'graphql/types/GetAppointmentData';

const useStyles = makeStyles((theme: Theme) => {
  return {
    doctorCardMain: {
      paddingLeft: 15,
      position: 'relative',
    },
    doctorAvatar: {
      position: 'absolute',
      bottom: 10,
    },
    blueBubble: {
      backgroundColor: '#0087ba',
      color: theme.palette.common.white,
      marginBottom: 5,
    },
    imageUpload: {
      overflow: 'hidden',
      borderRadius: 10,
      width: 130,
      cursor: 'pointer',
    },
    petient: {
      color: '#fff',
      textAlign: 'left',
      padding: 12,
      fontWeight: theme.typography.fontWeightMedium,
      display: 'inline-block',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 #00000026',
      backgroundColor: '#0087ba',
      fontSize: 15,
      maxWidth: 240,
      margin: '0 0 10px 45px',
    },
    chatTime: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: 'right',
      color: 'rgba(255, 255, 255, 0.6)',
      margin: '10px 0 0 0',
    },
    defaultChatTime: {
      color: 'rgba(101, 143, 155, 0.6)',
      textAlign: 'right',
      margin: '2px 0 0 0',
    },
    avatar: {
      width: 40,
      height: 40,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    durationMsg: {
      fontSize: 10,
      marginTop: 2,
      display: 'block',
      position: 'relative',
      top: -15,
      left: 30,
      width: '70%',
    },
    chatImgBubble: {
      padding: 0,
      border: 'none',
      '& img': {
        maxWidth: '100%',
        verticalAlign: 'middle',
      },
    },
    audioCall: {
      background: 'transparent',
      boxShadow: 'none',
      padding: 0,
      color: '#02475B',
      marginLeft: 10,
      position: 'relative',
      top: -4,
    },
    missedCall: {
      background: 'transparent',
      boxShadow: 'none',
      padding: 0,
      color: '#890000',
      marginLeft: 10,
    },
    actions: {
      padding: '0 20px 20px 20px',
      display: 'flex',
      '& button': {
        borderRadius: 10,
        color: '#fc9916',
        padding: 0,
        boxShadow: 'none',
        '&:last-child': {
          marginLeft: 'auto',
        },
      },
    },
    windowBody: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    popoverBottom: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: 'auto !important',
        bottom: 0,
      },
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        marginBottom: 0,
      },
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
  };
});

interface DoctorCardProps {
  message: string;
  duration: string;
  messageDetails: any;
  setModalOpen: (flag: boolean) => void;
  setImgPrevUrl: (url: string) => void;
  chatTime: string;
  doctorName: string;
  appointmentDetails: AppointmentHistory;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const classes = useStyles({});
  const mascotRef = useRef(null);
  const message = props.message.replace(/\n/g, '<br />');
  const chatDate = new Date(props.chatTime);
  const chatTime = isToday(chatDate)
    ? format(chatDate, 'hh:mm a')
    : format(chatDate, 'do MMMM yyyy, hh:mm a');
  const { appointmentDetails } = props;

  const isCancelledByDoctor =
    props.messageDetails && props.messageDetails.message === '^^#cancelConsultInitiated';

  return (
    <div className={classes.doctorCardMain}>
      <div className={classes.doctorAvatar}>
        {message.toLocaleLowerCase() !== 'video call ended' &&
          message.toLocaleLowerCase() !== 'audio call ended' && (
            <Avatar className={classes.avatar} src={require('images/ic_mascot_male.png')} alt="" />
          )}
      </div>
      {props.duration === '00 : 00' ? (
        <>
          <img src={require('images/ic_missedcall.svg')} />
          <div
            className={`${classes.blueBubble} ${classes.petient} ${classes.missedCall}`}
            dangerouslySetInnerHTML={{
              __html:
                message.toLocaleLowerCase() === 'video call ended'
                  ? 'You missed a video call'
                  : 'You missed a voice call',
            }}
          ></div>
        </>
      ) : props.duration ? (
        <div>
          <img src={require('images/ic_round_call.svg')} />
          <div
            className={`${classes.blueBubble} ${classes.petient} ${classes.audioCall}`}
            dangerouslySetInnerHTML={{
              __html: message.replace(/\<(?!br).*?\>/g, ''),
            }}
          ></div>
          <span className={classes.durationMsg}>Duration- {props.duration}</span>
        </div>
      ) : props.messageDetails.message === '^^#DocumentUpload' ? (
        <div className={classes.chatImgBubble}>
          <div
            className={classes.imageUpload}
            onClick={() => {
              props.setModalOpen(props.messageDetails.fileType === 'pdf' ? false : true);
              props.setImgPrevUrl(props.messageDetails.url);
            }}
          >
            {props.messageDetails.fileType === 'pdf' ? (
              <a href={props.messageDetails.url} target="_blank">
                <img src={require('images/pdf_thumbnail.png')} />
              </a>
            ) : (
              <img src={props.messageDetails.url} alt={props.messageDetails.url} />
            )}
          </div>
        </div>
      ) : props.messageDetails.message === '^^#followupconsult' ||
        props.messageDetails.message === '^^#rescheduleconsult' ? (
        <ViewPrescriptionCard
          message={props.message}
          duration={props.duration}
          messageDetails={props.messageDetails}
          chatTime={chatTime}
          appointmentDetails={appointmentDetails}
        />
      ) : (
        !isCancelledByDoctor && (
          <>
            <div
              className={`${classes.blueBubble} ${classes.petient} `}
              dangerouslySetInnerHTML={{ __html: message.replace(/\<(?!br).*?\>/g, '') }}
            ></div>
          </>
        )
      )}
      <Popover
        open={isCancelledByDoctor}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.successPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <div className={classes.windowBody}>
              <p>Hi! :)</p>
              <p>
                we’re really sorry. Dr. {props.doctorName} will not be able to make it for this
                appointment. Any payment that you have made for this consultation would be refunded
                in 2-4 working days. We request you to please book appointment with any of our other
                Apollo certified doctors
              </p>
            </div>
            <Link to={clientRoutes.appointments()}>
              <div className={classes.actions}>
                <AphButton>OK, GOT IT</AphButton>
              </div>
            </Link>
          </div>
        </div>
      </Popover>
    </div>
  );
};
