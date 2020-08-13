import { makeStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => {
  return {
    doctorCardMain: {
      paddingLeft: 15,
    },
    doctorAvatar: {
      position: 'absolute',
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
      display: 'inline-block',
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 #00000026',
      backgroundColor: '#0087ba',
      fontSize: 15,
      maxWidth: 240,
      margin: '0 0 10px 40px',
    },
    chatTime: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: 'right',
      color: 'rgba(255, 255, 255, 0.6)',
      margin: '10px 0 0 0',
    },
    avatar: {
      width: 32,
      height: 32,
      '& img': {
        verticalAlign: 'middle',
      },
    },
  };
});

interface DoctorCardProps {
  message: string;
}

export const DoctorCard: React.FC<DoctorCardProps> = (props) => {
  const classes = useStyles({});
  return (
    <div className={classes.doctorCardMain}>
      <div className={classes.doctorAvatar}>
        <Avatar className={classes.avatar} src={require('images/no_photo_icon_round.svg')} alt="" />
      </div>
      <div className={`${classes.blueBubble} ${classes.petient} `}>{props.message}</div>
    </div>
  );
};
