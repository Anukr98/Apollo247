import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    tabsRoot: {
      borderBottom: '1px solid rgba(0,0,0,0.2)',
    },
    tabRoot: {
      fontSize: 16,
      fontWeight: 500,
      textAlign: 'center',
      color: 'rgba(2,71,91,0.5)',
      padding: '14px 10px',
      textTransform: 'none',
      minWidth: '25%',
      opacity: 0.4,
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
      opacity: 1,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    rootTabContainer: {
      padding: 0,
    },
    timeSlotActions: {
      paddingTop: 10,
      marginLeft: -4,
      marginRight: -4,
      '& button': {
        fontSize: 16,
        fontWeight: 500,
        borderRadius: 10,
        margin: '5px 4px',
        textTransform: 'none',
      },
    },
    noSlotsAvailable: {
      fontSize: 14,
      color: '#0087ba',
      fontWeight: 500,
      lineHeight: 1.71,
      paddingTop: 15,
      paddingBottom: 5,
    },
    buttonActive: {
      backgroundColor: '#00b38e',
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: '#00b38e',
        color: theme.palette.common.white,
      },
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const DayTimeSlots: React.FC = (props) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState<number>(0);
  return (
    <div className={classes.root}>
      <Tabs
        value={tabValue}
        classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
        onChange={(e, newValue) => {
          setTabValue(newValue);
        }}
      >
        <Tab
          classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
          label={<img src={require('images/ic_morning.svg')} alt="" />}
        />
        <Tab
          classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
          label={<img src={require('images/ic_afternoon.svg')} alt="" />}
        />
        <Tab
          classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
          label={<img src={require('images/ic_evening.svg')} alt="" />}
        />
        <Tab
          classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
          label={<img src={require('images/ic_night.svg')} alt="" />}
        />
      </Tabs>
      {tabValue === 0 && (
        <TabContainer>
          <div className={classes.timeSlotActions}>
            <AphButton color="secondary">7:00 am</AphButton>
            <AphButton className={classes.buttonActive} color="secondary">
              7:40 am
            </AphButton>
            <AphButton color="secondary">8:20 am</AphButton>
            <AphButton color="secondary">9:00 am</AphButton>
            <AphButton color="secondary">9:40 am</AphButton>
          </div>
        </TabContainer>
      )}
      {tabValue === 1 && (
        <TabContainer>
          <div className={classes.noSlotsAvailable}>
            Oops! No morning slots available with Dr. Simran :(
          </div>
        </TabContainer>
      )}
      {tabValue === 2 && (
        <TabContainer>
          <div className={classes.timeSlotActions}>
            <AphButton color="secondary">4:00 pm</AphButton>
            <AphButton color="secondary">4:40 pm</AphButton>
            <AphButton color="secondary">5:20 pm</AphButton>
            <AphButton className={classes.buttonActive} color="secondary">
              6:00 pm
            </AphButton>
            <AphButton color="secondary">6:40 pm</AphButton>
          </div>
        </TabContainer>
      )}
      {tabValue === 3 && (
        <TabContainer>
          <div className={classes.timeSlotActions}>
            <AphButton color="secondary">7:00 pm</AphButton>
            <AphButton color="secondary">7:40 pm</AphButton>
            <AphButton color="secondary">8:20 pm</AphButton>
            <AphButton color="secondary">9:00 pm</AphButton>
            <AphButton className={classes.buttonActive} color="secondary">
              9:40 pm
            </AphButton>
          </div>
        </TabContainer>
      )}
    </div>
  );
};
