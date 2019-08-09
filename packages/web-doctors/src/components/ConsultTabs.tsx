import React, { useState } from 'react';
import { Theme } from '@material-ui/core';
import { useParams } from 'hooks/routerHooks';
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
    DisplayNone: {
      display: 'none !important',
    },
    typography: {
      padding: theme.spacing(2),
    },
  };
});
type Params = { id: string };
export const ConsultTabs: React.FC = (props) => {
  const classes = useStyles();
  const [tabValue, setTabValue] = useState<number>(0);
  const [startConsult, setStartConsult] = useState<string>('');
  const params = useParams<Params>();
  const appointmentId = params.id;
  console.log(appointmentId);
  const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
  };
  const setStartConsultAction = (flag: boolean) => {
    setStartConsult('');
    const cookieStr = `action=${flag ? 'videocall' : 'audiocall'}`;
    document.cookie = cookieStr + ';path=/;';
    setStartConsult(flag ? 'videocall' : 'audiocall');
  };
  return (
    <div className={classes.consultRoom}>
      <div className={classes.headerSticky}>
        <Header />
      </div>
      <div className={classes.container}>
        <CallPopover setStartConsultAction={(flag: boolean) => setStartConsultAction(flag)} />
        <div>
          <div>
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
              <ConsultRoom startConsult={startConsult} />
            </TabContainer>
          )}
        </div>
      </div>
    </div>
  );
};
