import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import React from 'react';

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
    patient: {
      color: '#fff',
      textAlign: 'left',
      padding: 12,
      fontWeight: theme.typography.fontWeightMedium,
      display: 'block',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 #00000026',
      backgroundColor: '#0087ba',
      fontSize: 15,
      maxWidth: 300,
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
  };
});

interface JdInfoCardProps {
  doctorName: string;
}

export const JdInfoCard: React.FC<JdInfoCardProps> = (props) => {
  const classes = useStyles({});
  const { doctorName } = props;
  return (
    <div className={classes.doctorCardMain}>
      <div className={classes.doctorAvatar}>
        <Avatar className={classes.avatar} src={require('images/ic_mascot_male.png')} alt="" />
      </div>
      <div className={`${classes.blueBubble} ${classes.patient} `}>
        <p>
          A doctor from {doctorName}'s team will join you shortly to collect your medical details.
          These details are essential for {doctorName} to help you and will take around 3-5 minutes.
        </p>
      </div>
    </div>
  );
};
