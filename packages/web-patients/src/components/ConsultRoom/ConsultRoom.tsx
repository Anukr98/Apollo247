import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, MenuItem } from '@material-ui/core';
import React from 'react';
import { Header } from 'components/Header';
import { AphSelect, AphButton } from '@aph/web-ui-components';
import { ThingsToDo } from 'components/ConsultRoom/ThingsToDo';
import { ConsultationsCard } from 'components/ConsultRoom/ConsultationsCard';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      paddingTop: 88,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 101,
      },
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    consultPage: {
      borderRadius: '0 0 10px 10px',
      backgroundColor: '#f7f8f5',
      paddingLeft: 40,
      paddingRight: 20,
      paddingTop: 46,
      paddingBottom: 40,
    },
    consultationsHeader: {
      paddingBottom: 60,
      width: 'calc(100% - 328px)',
      paddingRight: 20,
      '& h1': {
        display: 'flex',
        fontSize: 50,
        [theme.breakpoints.down('xs')]: {
          fontSize: 30,
        },
        '& >div': {
          marginLeft: 10,
          paddingTop: 0,
          marginTop: -10,
          width: 'auto',
        },
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        color: '#0087ba',
        margin: 0,
        paddingTop: 10,
      },
    },
    selectMenuRoot: {
      paddingRight: 55,
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 50,
      fontWeight: 600,
      lineHeight: '66px',
      padding: '2px 0 7px',
      [theme.breakpoints.down('xs')]: {
        fontSize: 30,
        lineHeight: '46px',
      },
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      marginLeft: 30,
      paddingBottom: 0,
      paddingRight: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    bottomActions: {
      marginTop: 20,
      maxWidth: 201,
    },
    consultSection: {
      display: 'flex',
      paddingRight: 20,
    },
    leftSection: {
      width: 'calc(100% - 328px)',
      marginTop: -60,
    },
    rightSection: {
      width: 328,
      marginTop: -183,
    },
    noConsultations: {
      paddingBottom: 0,
    },
  };
});

export const ConsultRoom: React.FC = (props) => {
  const classes = useStyles();
  const [currentPatientName] = React.useState<number>(1);

  return (
    <div className={classes.root}>
      <div className={classes.headerSticky}>
        <div className={classes.container}>
          <Header />
        </div>
      </div>
      <div className={classes.container}>
        <div className={classes.consultPage}>
          <div className={`${classes.consultationsHeader} ${classes.noConsultations}`}>
            <Typography variant="h1">
              <span>hi</span>
              <AphSelect
                value={currentPatientName}
                classes={{ root: classes.selectMenuRoot, selectMenu: classes.selectMenuItem }}
              >
                <MenuItem classes={{ selected: classes.menuSelected }} value={1}>
                  surj!
                </MenuItem>
                <MenuItem classes={{ selected: classes.menuSelected }}>
                  <AphButton color="primary" classes={{ root: classes.addMemberBtn }}>
                    Add Member
                  </AphButton>
                </MenuItem>
              </AphSelect>
            </Typography>
            <p>You have no consultations today :) Hope you are doing well?</p>
            <div className={classes.bottomActions}>
              <AphButton fullWidth color="primary">
                Consult Doctor
              </AphButton>
            </div>
          </div>
        </div>
        <div className={classes.consultSection}>
          <div className={classes.leftSection}>
            <ConsultationsCard />
          </div>
          <div className={classes.rightSection}>
            <ThingsToDo />
          </div>
        </div>
      </div>
    </div>
  );
};
