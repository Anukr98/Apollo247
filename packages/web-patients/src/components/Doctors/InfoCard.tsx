import React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Avatar } from '@material-ui/core';
import _forEach from 'lodash/forEach';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { AphButton } from '@aph/web-ui-components';

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

export const InfoCard: React.FC = (props) => {
  const classes = useStyles({});

  return (
    <div className={classes.root}>
      <div
        className={classes.topContent}
      >
				<div className={classes.iconGroup}>
					<Avatar
						alt=""
						src={require('images/no_photo_icon_round.svg')}
						className={classes.doctorAvatar}
					/>
					<div className={classes.consultType}>
						<span>
							<img src={require('images/ic-video.svg')} alt="" /><br/>Online
						</span>
						<span><img src={require('images/fa-solid-hospital.svg')} alt="" /><br/>In-Person</span>
					</div>
				</div>
        <div className={classes.doctorInfo}>
          <div className={`${classes.availability}`}>AVAILABLE IN 1 HOUR</div>
					<div className={`${classes.apolloLogo}`}><img src={require('images/ic_apollo.svg')} alt="" /></div>
          <div className={classes.doctorName}>
						Dr. Gennifer Ghosh
          </div>
          <div className={classes.doctorType}>
            <span title={'Specialty'}>
							Family Physician
            </span>
            <span className={classes.doctorExp} title={'Experiance'}>
							7 YRS Exp.
            </span>
          </div>
          <div className={classes.doctorspecialty} title={'Specialty'}>
            <p>Starts at <span>₹ 500</span></p>
          </div>
          <div className={classes.doctorDetails} title={'Location'}>
						<p>MBBS, Internal Medicine</p>
            <p>Apollo Hospitals, Jubilee Hills</p>
          </div>
        </div>
      </div>
			<div
        className={classes.bottomAction}
      >
				<AphButton
					fullWidth
					color="primary"
					className={classes.button}
				>
					Book Appointment
				</AphButton>
      </div>			
    </div>
  );
};


