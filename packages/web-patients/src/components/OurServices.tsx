import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'hooks/authHooks';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    serviceList: {
      paddingTop: 5,
      display: 'flex',
      flexWrap: 'wrap',
      marginLeft: -8,
      marginRight: -8,
    },
    serviceItem: {
      position: 'relative',
      width: '50%',
      paddingLeft: 8,
      paddingRight: 8,
      paddingBottom: 8,
      [theme.breakpoints.down(400)]: {
        width: '100%',
      },
    },
    serviceItemIn: {
      padding: 10,
      borderRadius: 10,
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
      height: '100%',
      '& a': {
        display: 'flex',
        alignItems: 'center',
        lineHeight: '18px',
      },
    },
    serviceInfo: {
      '& h5': {
        color: '#01475b',
        fontWeight: 500,
        fontSize: 14,
      },
    },
    bigAvatar: {
      width: 40,
      height: 40,
      marginRight: 10,
      overflow: 'inherit',
      '& img': {
        height: 40,
        width: 'auto',
      },
    },
  };
});

type ServiceItem = {
  title: string;
  content: string;
  imgUrl: string;
  action: {
    link: string;
    content: string;
  };
};

interface ServiceItemProps {
  item: ServiceItem;
}

const ServiceItem: React.FC<ServiceItemProps> = (props) => {
  const classes = useStyles({});
  const { isSignedIn } = useAuth();
  const { title, imgUrl, content, action } = props.item;
  return (
    <ProtectedWithLoginPopup>
      {({ protectWithLoginPopup, isProtected }) => (
        <div className={classes.serviceItem}>
          <Paper className={classes.serviceItemIn}>
            <Link
              to={action.link}
              onClick={(e) => {
                if (action.link === '') {
                  protectWithLoginPopup();
                }
              }}
              title={title}
            >
              <Avatar alt="" src={imgUrl} className={classes.bigAvatar} />
              <div className={classes.serviceInfo}>
                <Typography variant="h5" title={title}>
                  {title}
                </Typography>
              </div>
            </Link>
          </Paper>
        </div>
      )}
    </ProtectedWithLoginPopup>
  );
};

export const OurServices: React.FC = (props) => {
  const { isSignedIn } = useAuth();

  const classes = useStyles({});
  const serviceItems: ServiceItem[] = [
    {
      title: 'Book Doctor Appointment',
      content: `Let's get you connected with them.`,
      imgUrl: `${require('images/ic-doctor.svg')}`,
      action: { link: clientRoutes.doctorsLanding(), content: 'Find specialist' },
    },
    {
      title: `Buy Medicines`,
      content: 'You can search by name or prescription.',
      imgUrl: `${require('images/ic_medicines.png')}`,
      action: { link: clientRoutes.medicines(), content: 'Search Medicine' },
    },
    // {
    //   title: 'Order Tests',
    //   content: 'Get your tests/diagnostics booked here.',
    //   imgUrl: `${require('images/ic-tests.svg')}`,
    //   action: { link: '', content: 'Book a test' },
    // },
    // {
    //   title: 'Manage Diabetes',
    //   content: 'Learn about our Start Doctors Program.',
    //   imgUrl: `${require('images/ic-diabetes.svg')}`,
    //   action: { link: '', content: 'Who are star doctors' },
    // },
    {
      title: 'Track Symptoms',
      content: 'Learn about our Star Doctors Program.',
      imgUrl: `${require('images/ic-symptomtracker.svg')}`,
      action: {
        link: isSignedIn ? clientRoutes.symptomsTrackerFor() : clientRoutes.symptomsTracker(),
        content: 'Who are star doctors',
      },
    },
    {
      title: 'View Health Records',
      content: 'Learn about our Start Doctors Program.',
      imgUrl: `${require('images/ic-prescription.svg')}`,
      action: {
        link: isSignedIn ? clientRoutes.healthRecords() : '',
        content: 'Who are star doctors',
      },
    },
  ];

  return (
    <div className={classes.serviceList}>
      {serviceItems.map((item, i) => (
        <ServiceItem item={item} key={i} />
      ))}
    </div>
  );
};
