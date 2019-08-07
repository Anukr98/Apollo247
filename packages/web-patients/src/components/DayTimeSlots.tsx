import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { AphButton } from '@aph/web-ui-components';
import _uniqueId from 'lodash/uniqueId';

// import { getTime } from 'date-fns/esm';

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

interface DayTimeSlotsProps {
  morningSlots: number[];
  afternoonSlots: number[];
  eveningSlots: number[];
  latenightSlots: number[];
  doctorName: string;
  timeSelected: (timeSelected: string) => void;
}

// this must be moved into common utils later.
const getTimeFromTimestamp = (today: Date, slotTime: number) => {
  const hours = new Date(slotTime).getHours();
  const minutes = new Date(slotTime).getMinutes();
  const minutesFormat = minutes > 9 ? minutes : `0${minutes}`;
  console.log(minutesFormat);
  return `${hours}:${minutesFormat}`;
};

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const DayTimeSlots: React.FC<DayTimeSlotsProps> = (props) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState<number>(0);
  const [selectedTime, setTimeSelected] = useState<string>('');

  const {
    morningSlots,
    eveningSlots,
    afternoonSlots,
    latenightSlots,
    doctorName,
    timeSelected,
  } = props;

  const today = new Date();

  const noSlotsMessage = (slotName: string) => {
    return (
      <div className={classes.noSlotsAvailable}>
        Oops! No {slotName} slots are available with Dr. {doctorName} :(
      </div>
    );
  };

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
            {morningSlots.length > 0
              ? morningSlots.map((slotTime: number) => {
                  const timeString = getTimeFromTimestamp(today, slotTime);
                  const timeStringArray = timeString.split(':');
                  const twelveHourHour =
                    parseInt(timeStringArray[0], 10) > 12
                      ? parseInt(timeStringArray[0], 10) - 12
                      : timeStringArray[0];
                  const formattedHour = twelveHourHour < 10 ? `0${twelveHourHour}` : twelveHourHour;
                  return (
                    <AphButton
                      color="secondary"
                      value={timeString}
                      className={selectedTime === timeString ? `${classes.buttonActive}` : ''}
                      onClick={(e) => {
                        setTimeSelected(e.currentTarget.value);
                        timeSelected(e.currentTarget.value);
                      }}
                      key={_uniqueId('morning_')}
                    >
                      {formattedHour}:{timeStringArray[1]}
                      am
                    </AphButton>
                  );
                })
              : noSlotsMessage('morning')}
          </div>
        </TabContainer>
      )}
      {tabValue === 1 && (
        <TabContainer>
          <div className={classes.timeSlotActions}>
            {afternoonSlots.length > 0
              ? afternoonSlots.map((slotTime: number) => {
                  const timeString = getTimeFromTimestamp(today, slotTime);
                  const timeStringArray = timeString.split(':');
                  const twelveHourHour =
                    parseInt(timeStringArray[0], 10) > 12
                      ? parseInt(timeStringArray[0], 10) - 12
                      : timeStringArray[0];
                  const formattedHour = twelveHourHour < 10 ? `0${twelveHourHour}` : twelveHourHour;
                  return (
                    <AphButton
                      color="secondary"
                      value={timeString}
                      className={selectedTime === timeString ? `${classes.buttonActive}` : ''}
                      onClick={(e) => {
                        setTimeSelected(e.currentTarget.value);
                        timeSelected(e.currentTarget.value);
                      }}
                      key={_uniqueId('morning_')}
                    >
                      {formattedHour}:{timeStringArray[1]}
                      pm
                    </AphButton>
                  );
                })
              : noSlotsMessage('afternoon')}
          </div>
        </TabContainer>
      )}
      {tabValue === 2 && (
        <TabContainer>
          <div className={classes.timeSlotActions}>
            {eveningSlots.length > 0
              ? eveningSlots.map((slotTime: number) => {
                  const timeString = getTimeFromTimestamp(today, slotTime);
                  const timeStringArray = timeString.split(':');
                  const twelveHourHour =
                    parseInt(timeStringArray[0], 10) > 12
                      ? parseInt(timeStringArray[0], 10) - 12
                      : timeStringArray[0];
                  const formattedHour = twelveHourHour < 10 ? `0${twelveHourHour}` : twelveHourHour;
                  return (
                    <AphButton
                      color="secondary"
                      value={timeString}
                      className={selectedTime === timeString ? `${classes.buttonActive}` : ''}
                      onClick={(e) => {
                        setTimeSelected(e.currentTarget.value);
                        timeSelected(e.currentTarget.value);
                      }}
                      key={_uniqueId('morning_')}
                    >
                      {formattedHour}:{timeStringArray[1]}
                      pm
                    </AphButton>
                  );
                })
              : noSlotsMessage('evening')}
          </div>
        </TabContainer>
      )}
      {tabValue === 3 && (
        <TabContainer>
          <div className={classes.timeSlotActions}>
            {latenightSlots.length > 0
              ? latenightSlots.map((slotTime: number) => {
                  const timeString = getTimeFromTimestamp(today, slotTime);
                  const timeStringArray = timeString.split(':');
                  const twelveHourHour =
                    parseInt(timeStringArray[0], 10) > 12
                      ? parseInt(timeStringArray[0], 10) - 12
                      : timeStringArray[0];
                  const formattedHour = twelveHourHour < 10 ? `0${twelveHourHour}` : twelveHourHour;
                  return (
                    <AphButton
                      color="secondary"
                      value={timeString}
                      className={selectedTime === timeString ? `${classes.buttonActive}` : ''}
                      onClick={(e) => {
                        setTimeSelected(e.currentTarget.value);
                        timeSelected(e.currentTarget.value);
                      }}
                      key={_uniqueId('morning_')}
                    >
                      {formattedHour}:{timeStringArray[1]}
                      pm
                    </AphButton>
                  );
                })
              : noSlotsMessage('late night')}
          </div>
        </TabContainer>
      )}
    </div>
  );
};
