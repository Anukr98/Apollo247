import React, { useState, useEffect } from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import { CallPopover } from 'components/CallPopover';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import { ConsultRoom } from 'components/ConsultRoom';

const useStyles = makeStyles((theme: Theme) => {
  return {
    consultRoom: {
      paddingTop: 68,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 68,
      },
    },
    caseSheet: {
      minHeight: 'calc(100vh - 235px)',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 99,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      position: 'relative',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      backgroundColor: '#f7f7f7',
      minHeight: 500,
    },
    breadcrumbs: {
      marginLeft: 20,
      marginRight: 20,
      fontSize: 13,
      padding: '35px 20px',
      fontWeight: 600,
      color: '#02475b',
      textTransform: 'uppercase',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      [theme.breakpoints.down('xs')]: {
        position: 'fixed',
        zIndex: 2,
        top: 0,
        width: '100%',
        backgroundColor: theme.palette.common.white,
        margin: 0,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
      },
    },
    timeLeft: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(2, 71, 91, 0.6)',
      textTransform: 'capitalize',
      position: 'relative',
      top: -1,
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,
      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        left: -82,
        top: 20,
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
    whiteArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.down(1220)]: {
        display: 'none',
      },
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    tabsRoot: {
      backgroundColor: theme.palette.common.white,
      borderRadius: 0,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    tabRoot: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeightMedium,
      textAlign: 'center',
      color: '#02475b',
      padding: '14px 10px',
      textTransform: 'none',
      width: '50%',
      opacity: 1,
      [theme.breakpoints.down('xs')]: {
        width: '50%',
      },
    },
    tabSelected: {
      fontWeight: theme.typography.fontWeightBold,
      color: '#02475b',
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 4,
    },
    consultButtonContainer: {
      position: 'absolute',
      right: 0,
    },
    consultButton: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeightMedium,
      color: '#fff',
      padding: '6px 16px',
      backgroundColor: '#fc9916',
      marginLeft: 20,
      marginRight: 10,
      borderRadius: 15,
      boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
    },
    consultIcon: {
      padding: 6,
      backgroundColor: 'transparent',
      margin: '0 5px',
      minWidth: 20,
    },
    DisplayNone: {
      display: 'none !important',
    },
    typography: {
      padding: theme.spacing(2),
    },
    loginForm: {
      width: 280,
      minHeight: 290,
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    cross: {
      position: 'absolute',
      right: 0,
      top: '10px',
      fontSize: '18px',
      color: '#02475b',
    },
    loginFormWrap: {
      padding: '30px 0 50px 0',
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 10,
        marginBottom: 10,
      },
    },
    helpWrap: {
      paddingBottom: 0,
    },
    needHelp: {
      padding: '8px',
      width: '100%',
      marginTop: 15,
      borderRadius: '5px',
      boxShadow: 'none',
      backgroundColor: '#fc9916',
    },
  };
});
export const ConsultTabs: React.FC = (props) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState<number>(0);
  const [showTabs, setshowTabs] = useState<boolean>(true);
  const [startConsult, setStartConsult] = useState<boolean>(false);
  const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
  };
  const setStartConsultAction = (flag: boolean) => {
    if (startConsult !== flag) {
      console.log(flag);
      setStartConsult(flag);
    }
  };
  const toggleTabs = () => {
    setshowTabs(!showTabs);
  };
  useEffect(() => {
    console.log(1111111111);
  }, [startConsult]);

  return (
    <div className={classes.consultRoom}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <div className={classes.breadcrumbs}>
          <div>
            <div className={classes.backArrow}>
              <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
              <img className={classes.whiteArrow} src={require('images/ic_back_white.svg')} />
            </div>
          </div>
          CONSULT ROOM &nbsp; | &nbsp;
          <span className={classes.timeLeft}>
            Time to Consult <b>00:25</b>
          </span>
          <div className={classes.consultButtonContainer}>
            <CallPopover setStartConsultAction={(flag: boolean) => setStartConsultAction(flag)} />
          </div>
        </div>
        <div>
          <div className={showTabs ? '' : classes.DisplayNone}>
            <Tabs
              value={tabValue}
              variant="fullWidth"
              classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
              onChange={(e, newValue) => {
                setTabValue(newValue);
              }}
            >
              <Tab
                classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                label="Case Sheet"
              />
              <Tab
                classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                label="Chat"
              />
            </Tabs>
          </div>
          {tabValue === 0 && (
            <TabContainer>
              <div className={classes.caseSheet}>Case sheet</div>
            </TabContainer>
          )}
          {tabValue === 1 && (
            <TabContainer>
              <ConsultRoom startConsult={startConsult} toggleTabs={() => toggleTabs()} />
            </TabContainer>
          )}
        </div>
      </div>
    </div>
  );
};
