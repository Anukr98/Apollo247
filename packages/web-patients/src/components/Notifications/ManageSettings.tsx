import { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { SettingsCard } from 'components/Notifications/SettingsCard';
import useMediaQuery from '@material-ui/core/useMediaQuery';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
      borderRadius: 5,
      padding: '15px 5px 0 5px',
      [theme.breakpoints.down('xs')]: {
        borderRadius: 0,
        boxShadow: 'none',
        backgroundColor: 'transparent',
      },
      [theme.breakpoints.up('sm')]: {
        padding: 0,
      },
    },
    sectionBody: {
      paddingRight: 15,
      paddingLeft: 15,
      paddingTop: 5,
      [theme.breakpoints.up('sm')]: {
        paddingTop: 0,
      },
    },
    scrollBars: {
      height: 'calc(100vh - 154px) !important',
      [theme.breakpoints.down('xs')]: {
        height: '100% !important',
        '& >div:nth-child(2)': {
          display: 'none',
        },
        '& >div:nth-child(3)': {
          display: 'none',
        },
      },
    },
  };
});

export const ManageSettings: React.FC = (props) => {
  const classes = useStyles({});
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  return (
    <div className={classes.root}>
      <Scrollbars
        autoHide={true}
        className={classes.scrollBars}
        renderView={(props) =>
          isSmallScreen ? <div {...props} style={{ position: 'static' }} /> : <div {...props} />
        }
      >
        <div className={classes.sectionBody}>
          <SettingsCard />
        </div>
      </Scrollbars>
    </div>
  );
};
