import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';

const useStyles = makeStyles((theme: Theme) => {
  return {
    serviceList: {
      paddingTop: 80,
      paddingBottom: 40,
      paddingLeft: 20,
      paddingRight: 20,
    },
    serviceItem: {
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: theme.palette.common.white,
      position: 'relative',
      height: '100%',
      [theme.breakpoints.between('sm', 'md')]: {
        minHeight: 150,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 140,
      },
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
      },
      '& h5': {
        fontSize: 17,
        textAlign: 'center',
        [theme.breakpoints.up('sm')]: {
          paddingRight: 0,
        },
      },
      '& p': {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 1.5,
        letterSpacing: 'normal',
        color: 'rgba(0,0,0,0.5)',
        marginTop: 5,
        marginBottom: 5,
        textAlign: 'center',
      },
    },
    serviceInfo: {
      paddingRight: 20,
      [theme.breakpoints.up('sm')]: {
        paddingRight: 0,
      },
      '& h5': {
        fontWeight: theme.typography.fontWeightBold,
      },
    },
    avatarBlock: {
      marginLeft: 'auto',
      [theme.breakpoints.between('sm', 'md')]: {
        position: 'absolute',
        top: 0,
        left: -10,
      },
    },
    bigAvatar: {
      width: 180,
      height: 140,
    },
    action: {
      fontSize: 13,
      fontWeight: 'bold',
      color: theme.palette.action.selected,
      lineHeight: 1.85,
      textTransform: 'uppercase',
    },
  };
});

type ServiceItem = {
  title: string;
  image: string;
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
  const { title, content, action, image } = props.item;
  return (
    <ProtectedWithLoginPopup>
      {({ protectWithLoginPopup, isProtected }) => (
        <Grid item lg={3} sm={6} xs={12}>
          <Paper className={classes.serviceItem}>
            <div className={classes.serviceInfo}>
              <div className={classes.avatarBlock}>
                <img alt="" src={image} className={classes.bigAvatar} />
              </div>
              <Typography variant="h5">{title}</Typography>
              <p>{content}</p>
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
      title: 'higher revenues',
      image: require('images/ic_higher_revenues.svg'),
      content: `Get more patients and higher utilisation`,
      action: { link: '', content: 'Find specialist' },
    },
    {
      title: `easy follow ups`,
      image: require('images/ic_easy_followups.svg'),
      content: 'Follow up with your patients virtually and whenever you want',
      action: { link: '', content: 'Search Medicine' },
    },
    {
      title: 'anytime anywhere',
      image: require('images/ic_anytime.svg'),
      content: 'Consult virtually, at a time of your convenience',
      action: { link: '', content: 'Book a test' },
    },
    {
      title: 'medico-legal assistance',
      image: require('images/ic_medico_assistance.svg'),
      content: 'Get more patients and higher utilisation',
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
