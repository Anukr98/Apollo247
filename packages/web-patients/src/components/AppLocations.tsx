import React, { useRef } from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme, Popover } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    userLocation: {
      borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      paddingLeft: 20,
      marginLeft: 40,
      paddingTop: 20,
      paddingBottom: 20,
      marginTop: -14,
    },
    locationWrap: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    selectedLocation: {
      fontSize: 13,
      fontWeight: 600,
      color: theme.palette.secondary.light,
      textTransform: 'uppercase',
    },
    locationIcon: {
      color: '#00b38e',
      marginRight: 5,
    },
  });
});

export const AppLocations: React.FC = (props) => {
  const classes = useStyles();
  const locationRef = useRef(null);
  const [isLocationPopoverOpen, setIsLocationPopoverOpen] = React.useState<boolean>(false);

  return (
    <div className={classes.userLocation}>
      <div
        className={classes.locationWrap}
        ref={locationRef}
        onClick={() => setIsLocationPopoverOpen(true)}
      >
        <img className={classes.locationIcon} src={require('images/ic_location_on.svg')} alt="" />
        <div className={classes.selectedLocation}>Madhapur</div>
      </div>
      <Popover
        open={isLocationPopoverOpen}
        anchorEl={locationRef.current}
        onClose={() => setIsLocationPopoverOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        Page content
      </Popover>
    </div>
  );
};
