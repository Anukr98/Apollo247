import React from 'react';
import { Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AphButton } from '@aph/web-ui-components';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    hdcContainer: {
      background: `#fff url(${require('images/hdfc/bg.svg')}) no-repeat 0 0`,
      backgroundPosition: 'bottom',
      boxShadow: ' 0px 5px 20px rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: 16,
      margin: '30px 0 0 auto',
      position: 'relative',
    },
    hdcContent: {
      position: 'relative',
    },
    joinClub: {
      [theme.breakpoints.down('sm')]: {
        padding: '0 0 30px',
      },

      '& h2': {
        fontSize: 32,
        fontWeight: 700,
        color: '#02475b',
        lineHeight: '42px',
        [theme.breakpoints.down('sm')]: {
          fontSize: 18,
          lineHeight: '24px',
          margin: '0 0 5px',
        },
      },
      '& h5': {
        fontSize: 14,
        lineHeight: '24px',
        margin: '0 0 10px',
        fontWeight: 600,
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
          lineHeight: '18px',
          margin: '0 0 5px',
        },
      },
      '& p': {
        fontSize: 14,
        lineHeight: '24px',
        fontWeight: 300,
        [theme.breakpoints.down('sm')]: {
          fontSize: 10,
          lineHeight: '16px',
        },
      },
      '& a, button': {
        position: 'absolute',
        right: 0,
        bottom: 0,
        boxShadow: 'none',
        display: 'block',
        marginLeft: 'auto',
        color: '#FC9916',
      },
    },
    overflowHidden: {
      overflow: 'hidden',
    },
    hdcHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 0 10px',
    },
  };
});

export interface HdfcHomePageProps {
  patientPhone: string | null;
}

export const HdfcHomePage: React.FC<HdfcHomePageProps> = (props) => {
  const classes = useStyles({});
  const [showJoinClub, setShowJoinClub] = React.useState<boolean>(true);

  return (
    <div className={`${classes.hdcContainer} ${showJoinClub ? classes.overflowHidden : ''} `}>
      <div className={classes.hdcContent}>
        <div className={classes.hdcHeader}>
          <img src={require('images/hdfc/apollo-hashtag.svg')} alt="HDFC Call Doctor" width="100" />
          <img src={require('images/hdfc/hdfc-logo.svg')} alt="HDFC Call Doctor" width="100" />
        </div>
        {showJoinClub && (
          <div className={classes.joinClub}>
            <Typography component="h2">Hey ! </Typography>
            <Typography component="h5">
              You are missing out on a world of exclusive benefits
            </Typography>
            <Typography>
              Just book a Doctor Consultation or order Pharmacy products worth Rs 499 or more to
              join the club!
            </Typography>
            <AphButton href={clientRoutes.membershipPlanDetail()}>Tell Me More</AphButton>
          </div>
        )}
      </div>
    </div>
  );
};
