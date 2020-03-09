import React, { useRef } from 'react';
import { Theme, Avatar, Popover } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { HelpForm } from 'components/Help/HelpForm';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      position: 'fixed',
      right: 18,
      bottom: 15,
      cursor: 'pointer',
      [theme.breakpoints.down('xs')]: {
        position: 'static',
        textAlign: 'center',
        paddingBottom: 30,
      },
    },
    medium: {
      width: 72,
      height: 72,
      margin: 'auto',
    },
    helpText: {
      backgroundColor: '#fff',
      fontSize: 16,
      color: '#0087ba',
      fontWeight: 500,
      padding: 12,
      borderRadius: 5,
      position: 'relative',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
      [theme.breakpoints.down('xs')]: {
        display: 'inline-block',
      },
      '&:before': {
        content: '""',
        width: 0,
        height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderBottom: '5px solid #fff',
        position: 'absolute',
        top: -5,
        left: '50%',
        marginLeft: -3,
      },
    },
    helpPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
      right: '20px !important',
      bottom: '20px !important',
      left: 'auto !important',
      top: 'auto !important',
      [theme.breakpoints.down('xs')]: {
        maxWidth: '100%',
        width: '100%',
        right: '0 !important',
        bottom: '0 !important',
      },
    },
  };
});

export const Help: React.FC = (props) => {
  const classes = useStyles();
  const mascotRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.root}>
      <Avatar
        className={classes.medium}
        alt="Help"
        src={require('images/ic-mascot.png')}
        onClick={() => setIsPopoverOpen(true)}
      />
      <div className={classes.helpText}>Need Help?</div>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        onClose={() => setIsPopoverOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{ paper: classes.helpPopover }}
      >
        <HelpForm />
      </Popover>
    </div>
  );
};