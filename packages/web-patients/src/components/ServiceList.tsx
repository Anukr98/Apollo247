import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';
import { clientRoutes } from 'helpers/clientRoutes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    serviceList: {
      paddingTop: 162,
      paddingBottom: 40,
      paddingLeft: 20,
      paddingRight: 20,
      [theme.breakpoints.up('sm')]: {
        paddingTop: 131,
      },
    },
    serviceItem: {
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
      position: 'relative',
      height: '100%',
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
      },
      [theme.breakpoints.up('sm')]: {
        paddingBottom: 45,
      },
      '& p': {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 1.5,
        letterSpacing: 'normal',
        color: 'rgba(0,0,0,0.5)',
        marginTop: 5,
        marginBottom: 5,
      },
    },
    serviceInfo: {
      paddingRight: 0,
    },
    avatarBlock: {
      marginLeft: 'auto',
      [theme.breakpoints.up('sm')]: {
        position: 'absolute',
        top: -10,
        right: -10,
      },
    },
    bigAvatar: {
      width: 70,
      height: 70,
      backgroundColor: '#afc3c9',
    },
    action: {
      fontSize: 13,
      fontWeight: 'bold',
      color: theme.palette.action.selected,
      lineHeight: 1.85,
      textTransform: 'uppercase',
      [theme.breakpoints.up('sm')]: {
        position: 'absolute',
        bottom: 20,
      },
    },
  };
});

type ServiceItem = {
  title: string;
  content: string;
  action: {
    link: string;
    content: string;
  };
};

interface ServiceItemProps {
  item: ServiceItem;
}

const ServiceItem: React.FC<ServiceItemProps> = (props) => {
  const classes = useStyles();
  const { title, content, action } = props.item;
  return (
    <ProtectedWithLoginPopup>
      {({ protectWithLoginPopup, isProtected }) => (
        <Grid item lg={3} sm={6} xs={3}>
          <Paper className={classes.serviceItem}>
            <div className={classes.serviceInfo}>
              <Typography variant="h5">{title}</Typography>
              <p>{content}</p>
              <Link
                className={classes.action}
                to={action.link}
                onClick={(e) => {
                  protectWithLoginPopup();
                  if (isProtected) e.preventDefault();
                }}
              >
                {action.content}
              </Link>
            </div>
            <div className={classes.avatarBlock}>
              <Avatar
                alt=""
                src={require('images/ic_placeholder.png')}
                className={classes.bigAvatar}
              />
            </div>
          </Paper>
        </Grid>
      )}
    </ProtectedWithLoginPopup>
  );
};

export const ServiceList: React.FC = (props) => {
  const classes = useStyles();
  const serviceItems: ServiceItem[] = [
    {
      title: 'You know which doctor you are looking for?',
      content: `Let's get you connected with them.`,
      action: { link: clientRoutes.doctorsLanding(), content: 'Find specialist' },
    },
    {
      title: `Just want to buy medicines? It’s easy!`,
      content: 'You can search by name or prescription.',
      action: { link: clientRoutes.medicines(), content: 'Search Medicine' },
    },
    {
      title: 'Do you want to get some tests done?',
      content: 'Get your tests/diagnostics booked here.',
      action: { link: '', content: 'Book a test' },
    },
    {
      title: 'Want to know how we have the best?',
      content: 'Learn about our Start Doctors Program.',
      action: { link: '', content: 'Who are star doctors' },
    },
  ];

  return (
    <div className={classes.serviceList}>
      <Grid container spacing={2}>
        {serviceItems.map((item, i) => (
          <ServiceItem item={item} key={i} />
        ))}
      </Grid>
    </div>
  );
};
