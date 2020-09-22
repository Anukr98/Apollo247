import React, { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Tabs, Tab, Typography } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { AphDialog, AphDialogClose, AphDialogTitle } from '@aph/web-ui-components';
import { getAppStoreLink } from 'helpers/dateHelpers';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 5,
      padding: 20,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '23px',
      marginTop: 20,
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
        marginBottom: 20,
      },
      '& h3': {
        margin: 0,
        color: '#01667c',
        fontSize: 16,
        fontWeight: 600,
        paddingBottom: 20,
      },
      '& ul': {
        paddingLeft: 20,
      },
    },
    tabButtons: {
      display: 'flex',
    },
    button: {
      fontSize: 12,
      fontWeight: 600,
      textTranform: 'none',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      backgroundColor: '#f7f8f5',
      border: '1px solid #f7f8f5',
      minWidth: 135,
      '&:hover': {
        backgroundColor: '#f7f8f5',
      },
      '&:last-child': {
        marginLeft: 'auto',
      },
    },
    btnActive: {
      border: '1px solid #00b38e',
      '&:before': {
        content: "''",
        position: 'absolute',
        bottom: -38,
        left: 0,
        right: 0,
        zIndex: 2,
        width: 20,
        height: '100%',
        margin: '0 auto',
        borderRadius: 4,
        borderTop: '10px solid #f7f8f5',
        borderBottom: '10px solid transparent',
        borderLeft: ' 40px solid transparent',
        borderRight: '40px solid transparent',
      },
      '&:after': {
        content: "''",
        position: 'absolute',
        bottom: -39,
        left: 0,
        right: 0,
        zIndex: 1,
        width: 20,
        height: '100%',
        margin: '0 auto',
        borderRadius: 4,
        borderTop: '10px solid #00b38e',
        borderBottom: '10px solid transparent',
        borderLeft: ' 40px solid transparent',
        borderRight: '40px solid transparent',
      },
    },
    consultGroup: {},
    groupHead: {
      display: 'flex',
      alignItems: 'center',
      padding: 16,
      paddingTop: 25,
      paddingBottom: 20,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      '& img': {
        verticalAlign: 'middle',
        marginRight: 16,
      },
      '& h4': {
        margin: 0,
        fontSize: 14,
        color: '#0589bb',
        fontWeight: 500,
        textTransform: 'uppercase',
      },
    },
    groupContent: {
      paddingTop: 20,
      '& ul': {
        padding: 0,
        margin: 0,
        '& li': {
          display: 'flex',
          fontSize: 12,
          lineHeight: '18px',
          color: 'rgba(1, 71, 91, 0.6)',
          paddingBottom: 10,
          '& span': {
            '&:first-child': {
              width: 20,
              display: 'inline-block',
              textAlign: 'center',
              marginRight: 10,
            },
            '&:last-child': {
              display: 'inline-block',
              width: 'calc(100% - 30px)',
            },
          },
          '& img': {
            verticalAlign: 'top',
          },
        },
      },
    },
    blueText: {
      color: '#0589bb !important',
    },
    appDownloadGroup: {
      marginTop: 10,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      paddingTop: 16,
      '& h4': {
        fontSize: 14,
        fontWeight: 500,
        color: '#0589bb',
        margin: 0,
      },
      '& p': {
        fontSize: 12,
        lineHeight: '18px',
        opacity: 0.6,
        marginTop: 0,
      },
    },
    appDownload: {
      display: 'flex',
      alignItems: 'center',
      '& img': {
        maxWidth: 77,
      },
      '& button': {
        flex: 1,
        color: '#fc9916',
        marginLeft: 16,
        backgroundColor: 'transparent',
        boxShadow: 'none',
        '&:hover': {
          backgroundColor: 'transparent',
        },
      },
    },
    card: {
      background: '#ffffff',
      borderRadius: 5,
      padding: 15,
      margin: '0 0 20px',
      '& h5': {
        fontSize: 16,
        fontWeight: 600,
        margin: '0 0 10px',
        lineHeight: '16px',
      },
    },
    tabsContainer: {},
    tabRoot: {
      background: '#f7f8f5',
      padding: 10,
      boxShadow: ' 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      minWidth: 140,
      opacity: 1,
      position: 'relative',
      border: '1px solid transparent',
      minHeight: 'auto',
      overflow: 'visible',
      '&:first-child': {
        margin: '0 10px 0 0',
      },
      '& span': {
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'none',
        lineHeight: '15px',
        position: 'relative',
        zIndex: 5,
      },
      '&:before': {
        content: "''",
        position: 'absolute',
        bottom: -34,
        left: 0,
        right: 0,
        zIndex: 2,
        width: 20,
        height: '100%',
        margin: '0 auto',
        borderRadius: 4,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderLeft: ' 40px solid transparent',
        borderRight: '40px solid transparent',
      },
      '&:after': {
        content: "''",
        position: 'absolute',
        bottom: -35,
        left: 0,
        right: 0,
        zIndex: 1,
        width: 20,
        height: '100%',
        margin: '0 auto',
        borderRadius: 4,
        borderTop: '10px solid transparent',
        borderBottom: '10px solid transparent',
        borderLeft: ' 40px solid transparent',
        borderRight: '40px solid transparent',
      },
      [theme.breakpoints.down('sm')]: {
        minWidth: 100,
        '&:first-child': {
          margin: '0 20px 0 0',
        },
      },
    },
    tabSelected: {
      borderColor: '#00b38e',
      '&:before': {
        borderTopColor: '#f7f8f5',
      },
      '&:after': {
        borderTopColor: '#00b38e',
      },
    },
    tabsRoot: {
      '& >div': {
        '& >div': {
          padding: '10px 0 30px',
        },
      },
    },
    tabsIndicator: {
      display: 'none',
    },
    tabContent: {},
    chatContainer: {},
    tabHead: {
      display: 'flex',
      alignItems: 'center',
      textAlign: 'left',
      '& img': {
        margin: '0 20px 0 0',
      },
      '& h6': {
        color: '#0589bb',
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: 600,
        paddingRight: 30,
        [theme.breakpoints.down('xs')]: {
          paddingRight: 0,
        },
      },
    },
    tabBody: {
      padding: '20px 0',
      borderTop: '1px solid #eeeeee',
      borderBottom: '1px solid #eeeeee',
      margin: '20px 0',
    },
    tabList: {
      padding: 0,
      margin: 0,
      listStyle: 'none',
      '& li': {
        padding: '5px 0',
        display: 'flex',
        alignItems: 'center',
        '& p': {
          fontSize: 12,
          color: 'rgb(2, 71, 91, 0.6)',
          margin: '0 0 0 15px',
          fontWeight: 500,
        },
      },
    },
    highlight: {
      '& p': {
        color: '#0589bb !important',
      },
    },
    appDetails: {
      '& h6': {
        color: '#0589bb',
        fontSize: 14,
        margin: '0 0 5px',
        fontWeight: 500,
      },
      '& p': {
        fontSize: 12,
        color: 'rgb(1, 71, 91, 0.6)',
        lineHeight: '18px',
        fontWeight: 500,
        paddingRight: 20,
        marginBottom: 10,
        [theme.breakpoints.down('xs')]: {
          paddingRight: 0,
        },
      },
    },
    consultContainer: {
      padding: 20,
    },
    appDetailsMobile: {
      padding: '10px 0 ',
      margin: '10px 0 0',
      borderTop: '1px solid #eeeeee',
      '& p': {
        margin: '0 0 15px',
      },
    },
    inPerson: {
      color: '#01475b',
      fontSize: 12,
      fontWeight: 500,
    },
    mobileIcon: {
      position: 'relative',
      top: 3,
    },
  });
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
};

const a11yProps = (index: any) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
};

export const HowItWorks: React.FC = (props) => {
  const classes = useStyles({});
  const [chatConsult, setChatConsult] = useState<boolean>(false);
  const [meetInPerson, setMeetInPerson] = useState<boolean>(false);
  const [value, setValue] = React.useState(0);

  const isDesktopOnly = useMediaQuery('(min-width:768px)');
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={classes.card}>
      <Typography component="h5">How it works</Typography>
      <div className={classes.tabsContainer}>
        <Tabs
          value={value}
          onChange={handleTabChange}
          aria-label="simple tabs example"
          classes={{
            root: classes.tabsRoot,
            indicator: classes.tabsIndicator,
          }}
        >
          <Tab
            label="Chat/Audio/Video"
            {...a11yProps(0)}
            classes={{
              root: classes.tabRoot,
              selected: classes.tabSelected,
            }}
            onDoubleClick={() => !isDesktopOnly && setChatConsult(true)}
          />
          <Tab
            label="Meet in Person"
            {...a11yProps(1)}
            classes={{
              root: classes.tabRoot,
              selected: classes.tabSelected,
            }}
            onDoubleClick={() => !isDesktopOnly && setMeetInPerson(true)}
          />
        </Tabs>

        <div className={classes.tabContent}>
          <TabPanel value={value} index={0}>
            <div className={classes.chatContainer}>
              <div className={classes.tabHead}>
                <img src={require('images/video-calling.svg')} />
                <Typography component="h6">How to consult ON WEB via audio/video?</Typography>
              </div>
              <div className={classes.tabBody}>
                <ul className={classes.tabList}>
                  <li>
                    <img src={require('images/consult-doc.svg')} />
                    <Typography>Choose the doctor</Typography>
                  </li>
                  <li>
                    <img src={require('images/slot.svg')} />
                    <Typography>Book a slot</Typography>
                  </li>
                  <li>
                    <img src={require('images/ic-payment.svg')} />
                    <Typography>Make payment</Typography>
                  </li>
                  <li>
                    <img src={require('images/ic-mobile.svg')} className={classes.mobileIcon} />
                    <Typography>
                      Be present in the consult room on apollo247.com at the time of consult
                    </Typography>
                  </li>
                  <li>
                    <img src={require('images/prescription.svg')} />
                    <Typography>Receive prescriptions instantly </Typography>
                  </li>
                  <li>
                    <img src={require('images/ic-followchat.svg')} />
                    <Typography>Follow Up via text - Valid upto 7 days</Typography>
                  </li>
                </ul>
              </div>
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <div className={classes.tabHead}>
              <img src={require('images/ic-specialist.svg')} />
              <Typography component="h6">
                How to consult <br /> in person{' '}
              </Typography>
            </div>
            <div className={classes.tabBody}>
              <ul className={classes.tabList}>
                <li>
                  <img src={require('images/consult-doc.svg')} />
                  <Typography>Choose the doctor</Typography>
                </li>
                <li>
                  <img src={require('images/slot.svg')} />
                  <Typography>Book a slot</Typography>
                </li>
                <li>
                  <img src={require('images/ic-payment.svg')} />
                  <Typography>Make payment</Typography>
                </li>
                <li className={classes.highlight}>
                  <img src={require('images/hospital.svg')} />
                  <Typography>Visit the doctor at Hospital/Clinic</Typography>
                </li>
                <li>
                  <img src={require('images/prescription.svg')} />
                  <Typography>Receive prescriptions instantly </Typography>
                </li>
              </ul>
            </div>
          </TabPanel>
        </div>
      </div>
      <div className={classes.appDetails}>
        {/* <Typography component="h6">Consultation works only on our mobile app</Typography> */}
        <Typography>
          To enjoy services provided by Apollo 247 on Mobile, download our App
        </Typography>
        <a href={getAppStoreLink()} target={'_blank'}>
          <div className={classes.appDownload}>
            <img src={require('images/apollo247.png')} />
            <AphButton>Download the App</AphButton>
          </div>
        </a>
      </div>
      <AphDialog open={chatConsult} maxWidth="sm">
        <AphDialogClose onClick={() => setChatConsult(false)} title={'Close'} />
        <AphDialogTitle>
          <div className={classes.tabHead}>
            <img src={require('images/video-calling.svg')} />
            <span>How to consult ON WEB via audio/video?</span>
          </div>
        </AphDialogTitle>
        <div className={classes.consultContainer}>
          <ul className={classes.tabList}>
            <li>
              <img src={require('images/consult-doc.svg')} />
              <Typography>Choose the doctor</Typography>
            </li>
            <li>
              <img src={require('images/slot.svg')} />
              <Typography>Book a slot</Typography>
            </li>
            <li>
              <img src={require('images/ic-payment.svg')} />
              <Typography>Make payment</Typography>
            </li>
            <li className={classes.highlight}>
              <img src={require('images/ic-video.svg')} />
              <Typography>Speak to the doctor via video/audio/chat</Typography>
            </li>
            <li>
              <img src={require('images/prescription.svg')} />
              <Typography>Receive prescriptions instantly </Typography>
            </li>
            <li className={classes.highlight}>
              <img src={require('images/chat.svg')} />
              <Typography>Chat with the doctor upto 7 days after your consult</Typography>
            </li>
          </ul>
          <div className={`${classes.appDetails} ${classes.appDetailsMobile}`}>
            <Typography component="h6">Consultation works only on our mobile app</Typography>
            <Typography>
              To enjoy services provided by Apollo 247 on Mobile, download our App
            </Typography>
            <div className={classes.appDownload}>
              <img src={require('images/apollo247.png')} />
              <AphButton onClick={() => window.open(getAppStoreLink())}>Download the App</AphButton>
            </div>
          </div>
        </div>
      </AphDialog>
      <AphDialog open={meetInPerson} maxWidth="sm">
        <AphDialogClose onClick={() => setMeetInPerson(false)} title={'Close'} />
        <AphDialogTitle>
          <div className={classes.tabHead}>
            <img src={require('images/ic-specialist.svg')} />
            <span>Meet in person </span>
          </div>
        </AphDialogTitle>
        <div className={classes.consultContainer}>
          <ul className={classes.tabList}>
            <li>How to consult in Person?</li>
            <li>
              <img src={require('images/consult-doc.svg')} />
              <Typography>Choose the doctor</Typography>
            </li>
            <li>
              <img src={require('images/slot.svg')} />
              <Typography>Book a slot</Typography>
            </li>
            <li>
              <img src={require('images/ic-payment.svg')} />
              <Typography>Make payment</Typography>
            </li>
            <li className={classes.highlight}>
              <img src={require('images/hospital.svg')} />
              <Typography>Visit the doctor at Hospital/Clinic</Typography>
            </li>
            <li>
              <img src={require('images/prescription.svg')} />
              <Typography>Receive prescriptions instantly </Typography>
            </li>
          </ul>
        </div>
      </AphDialog>
    </div>
  );
};
