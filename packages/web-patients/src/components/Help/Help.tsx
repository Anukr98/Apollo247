import { Theme, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Header } from 'components/Header';
import React, { useRef } from 'react';
import { MyProfile } from 'components/MyAccount/MyProfile';
import { useCurrentPatient } from 'hooks/authHooks';
import { NavigationBottom } from 'components/NavigationBottom';
import { LinearProgress } from '@material-ui/core';
import { BottomLinks } from 'components/BottomLinks';
import { HelpForm } from 'components/Help/HelpForm';
import { HelpSuccess } from 'components/HelpSuccess';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
    },
    myAccountPage: {
      backgroundColor: '#f7f8f5',
      [theme.breakpoints.down('xs')]: {
        backgroundColor: 'transparent',
        paddingBottom: 20,
      },
    },
    myAccountSection: {
      [theme.breakpoints.up('sm')]: {
        display: 'flex',
        padding: '20px 3px 20px 20px',
      },
    },
    leftSection: {
      width: 328,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    rightSection: {
      width: 'calc(100% - 328px)',
      paddingRight: 15,
      paddingTop: 5,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingTop: 56,
        paddingRight: 0,
      },
    },
    pageLoader: {
      position: 'absolute',
      top: 0,
      width: '100%',
    },
    footerLinks: {
      [theme.breakpoints.down(900)]: {
        display: 'none',
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
      right: '20px !important',
      bottom: '20px !important',
      left: 'auto !important',
      top: 'auto !important',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
      },
    },
  };
});

export const Help: React.FC = (props) => {
  const classes = useStyles({});
  const patient = useCurrentPatient();
  const mascotRef = useRef(null);
  const [isHelpSuccessPopoverOpen, setIsHelpSuccessPopoverOpen] = React.useState<boolean>(false);

  if (!patient)
    return (
      <div className={classes.pageLoader}>
        <LinearProgress />
      </div>
    );

  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.container}>
        <div className={classes.myAccountPage}>
          <div className={classes.myAccountSection}>
            <div className={classes.leftSection}>
              <MyProfile />
            </div>
            <div className={classes.rightSection}>
              <HelpForm submitStatus={(status: boolean) => setIsHelpSuccessPopoverOpen(status)} />
              <Popover
                open={isHelpSuccessPopoverOpen}
                anchorEl={mascotRef.current}
                onClose={() => setIsHelpSuccessPopoverOpen(false)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                classes={{ paper: classes.bottomPopover }}
              >
                <HelpSuccess onSubmitClick={() => setIsHelpSuccessPopoverOpen(false)} />
              </Popover>
            </div>
          </div>
        </div>
      </div>
      <div className={classes.footerLinks}>
        <BottomLinks />
      </div>
      <NavigationBottom />
    </div>
  );
};
