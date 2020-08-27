import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import React from 'react';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { Link } from 'react-router-dom';
import { clientRoutes } from 'helpers/clientRoutes';

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
    petient: {
      color: '#fff',
      textAlign: 'left',
      padding: 12,
      fontWeight: theme.typography.fontWeightMedium,
      display: 'block',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 #00000026',
      backgroundColor: '#0087ba',
      fontSize: 15,
      maxWidth: 240,
      margin: '0 0 10px 45px',
      '& p': {
        margin: 0,
        padding: '5px 0 0 0',
      },
    },
    chatTime: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: 'right',
      color: 'rgba(255, 255, 255, 0.6)',
      margin: '10px 0 0 0',
    },
    avatar: {
      width: 40,
      height: 40,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    downloadBtn: {
      fontSize: 13,
      lineHeight: '24px',
      color: '#fff',
      minWidth: 101,
      fontWeight: 'bold',
      border: '2px solid #FCB715',
      height: 40,
      background: 'transparent',
      borderRadius: 10,
      margin: '10px 10px 0 0',
      textTransform: 'uppercase',
      '&:focus': {
        outline: 'none',
      },
    },
    viewBtn: {
      fontSize: 13,
      lineHeight: '24px',
      color: '#fff',
      minWidth: 101,
      border: '2px solid #FCB716',
      height: 40,
      borderRadius: 10,
      background: '#FCB716',
      margin: '10px 0 0 0',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      '&:focus': {
        outline: 'none',
      },
    },
  };
});

interface ViewPrescriptionCardProps {
  message: string;
  duration: string;
  messageDetails: any;
  chatTime: string;
}

export const ViewPrescriptionCard: React.FC<ViewPrescriptionCardProps> = (props) => {
  const classes = useStyles({});

  const { currentPatient } = useAllCurrentPatients();
  return (
    <div className={classes.doctorCardMain}>
      {/* <div className={classes.doctorAvatar}>
        <Avatar className={classes.avatar} src={require('images/ic_mascot_male.png')} alt="" />
      </div> */}
      <div className={`${classes.blueBubble} ${classes.petient} `}>
        <p>
          <div>
            Hello <span>{currentPatient.firstName}</span>
          </div>
          <div>Hope your consultation went well… Here is your prescription.</div>
          <div>
            <a href={props.messageDetails.transferInfo.pdfUrl} target="_blank">
              <button className={classes.downloadBtn}>Download</button>
            </a>
            <Link to={clientRoutes.prescription(props.messageDetails.transferInfo.appointmentId)}>
              <button className={classes.viewBtn}>View</button>
            </Link>
          </div>
          <div className={classes.chatTime}>{props.chatTime} </div>
        </p>
      </div>
    </div>
  );
};
