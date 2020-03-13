import { makeStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { AphButton } from '@aph/web-ui-components';
import _uniqueId from 'lodash/uniqueId';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    tabsRoot: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
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
        padding: '9px 13px',
        [theme.breakpoints.down('xs')]: {
          minWidth: 99,
        },
      },
    },
    noSlotsAvailable: {
      fontSize: 14,
      color: '#0087ba',
      fontWeight: 500,
      lineHeight: 1.71,
      padding: 6,
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
  return `${hours}:${minutesFormat}`;
};

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

export const DayTimeSlots: React.FC<DayTimeSlotsProps> = (props) => {
  const classes = useStyles({});
  const [selectedTime, setTimeSelected] = useState<string>('');

  const {
    morningSlots,
    eveningSlots,
    afternoonSlots,
    latenightSlots,
    doctorName,
    timeSelected,
  } = props;


  const getTabValue = () => {
    if (morningSlots.length === 0) {
      if (afternoonSlots.length > 0) {
        return 1;
      }
      if (eveningSlots.length > 0) {
        return 2;
      }
      return 3;
    }
    return 0;
  };

  const [tabValue, setTabValue] = useState<number>(getTabValue() || 0);
  const today = new Date();

  const noSlotsMessage = (slotName: string) => {
    return (
      <div className={classes.noSlotsAvailable}>
        Oops! No {slotName} slots available with Dr. {doctorName} :(
      </div>
    );
  };

  const tabs = [
    {
      label: <img src={require('images/ic_morning.svg')} alt="" />,
      tabValue: 0,
      slots: morningSlots,
      message: 'morning',
      key: 'morning_',
    },
    {
      label: <img src={require('images/ic_afternoon.svg')} alt="" />,
      tabValue: 1,
      slots: afternoonSlots,
      message: 'afternoon',
      key: 'afternoon_',
    },
    {
      label: <img src={require('images/ic_evening.svg')} alt="" />,
      tabValue: 2,
      slots: eveningSlots,
      message: 'evening',
      key: 'evening_',
    },
    {
      label: <img src={require('images/ic_night.svg')} alt="" />,
      tabValue: 3,
      slots: latenightSlots,
      message: 'late night',
      key: 'latenight_',
    },
  ];

  const getTwelveHour = (key: string, timeStringArray: Array<string>) => {
    const twelveHourHour =
      parseInt(timeStringArray[0], 10) > 12
        ? parseInt(timeStringArray[0], 10) - 12
        : timeStringArray[0];

    const formattedHour =
      twelveHourHour && twelveHourHour < 10 ? `${twelveHourHour}` : twelveHourHour;

    const hours = parseInt(timeStringArray[0], 10);

    switch (key) {
      case 'late night':
        return hours > 12
          ? `${hours - 12}:${timeStringArray[1]} pm`
          : `${hours == 0 ? '12' : hours}:${timeStringArray[1]} am`
      default:
        return formattedHour;
    }
  };

  const showTime = (key: string, formattedHour: string | number, timeString: string) => {
    switch (key) {
      case 'morning':
        return (
          <>
            {formattedHour}:{timeString}
            {formattedHour >= 12 ? ' pm' : ' am'}
          </>
        );
      case 'late night':
        return formattedHour;
      default:
        return (
          <>
            {formattedHour}:{timeString}&nbsp;pm
          </>
        );
    }
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
        {tabs.map((tab) => (
          <Tab
            classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
            label={tab.label}
          />
        ))}
      </Tabs>
      {tabs.map((tab) =>
        tab.tabValue === tabValue ? (
          <TabContainer>
            <div className={classes.timeSlotActions}>
              {tab.slots.length > 0
                ? tab.slots.map((slotTime: number) => {
                  const timeString = getTimeFromTimestamp(today, slotTime);
                  const timeStringArray = timeString.split(':');
                  const formattedHour = getTwelveHour(tab.message, timeStringArray);

                  if (formattedHour !== '') {
                    return (
                      <AphButton
                        color="secondary"
                        value={timeString}
                        className={selectedTime === timeString ? `${classes.buttonActive}` : ''}
                        onClick={(e) => {
                          setTimeSelected(e.currentTarget.value);
                          timeSelected(e.currentTarget.value);
                        }}
                        key={_uniqueId(tab.key)}
                      >
                        {showTime(tab.message, formattedHour, timeStringArray[1])}
                      </AphButton>
                    );
                  }
                })
                : noSlotsMessage(tab.message)}
            </div>
          </TabContainer>
        ) : null
      )}
    </div>
  );
};
