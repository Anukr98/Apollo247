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

interface WelcomeCardProps {
  doctorName: string;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.doctorCardMain}>
      <div className={classes.doctorAvatar}>
        <Avatar className={classes.avatar} src={require('images/ic_mascot_male.png')} alt="" />
      </div>
      <div className={`${classes.blueBubble} ${classes.petient} `}>
        Let’s get you feeling better by following simple steps :)
        <p>1. Answer some quick questions</p>
        <p>2. Please be present in this Consult Room at the time of consult</p>
        <p>3. Connect with your doctor via on web Audio/Video call.</p>
        <p>4. Get a prescription and meds, if necessary</p>
        <p>5. Follow up via text (validity 7 days)</p>
      </div>
      <div className={`${classes.blueBubble} ${classes.petient} `}>
        <p>
          A doctor from {props.doctorName}'s team will join you shortly to collect your medical
          details. These details are essential for {props.doctorName} to help you and will take
          around 3-5 minutes.
        </p>
      </div>
    </div>
  );
};
