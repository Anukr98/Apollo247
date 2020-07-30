import React from 'react';
import { makeStyles } from '@material-ui/styles';
interface AlertProps {
  error: any;
  onClose: () => void;
}

const useStyles = makeStyles(() => {
  return {
    toastMessage: {
      width: 'fit-content',
      height: '40px',
      borderRadius: '10px',
      boxShadow: '0 1px 13px 0 rgba(0, 0, 0, 0.16)',
      backgroundColor: '#00b38e',
      paddingRight: 10,
    },
    toastMessageText: {
      fontSize: '14px',
      fontWeight: 500,
      fontStretch: 'normal',
      fontStyle: 'normal',
      lineHeight: 1.43,
      letterSpacing: 'normal',
      color: '#ffffff',
      position: 'relative',
      top: 6,
    },
  };
});

const Alert = (props: AlertProps) => {
  const classes = useStyles({});
  return (
    Boolean(props.error) && (
      <div
        className={classes.toastMessage}
        onLoad={() => {
          setTimeout(() => {
            props.onClose();
          }, 6000);
        }}
      >
        <span className={classes.toastMessageText}>
          <img
            src={require('images/ic_cancel_green.svg')}
            alt=""
            style={{
              height: 18,
              width: 18,
              position: 'relative',
              top: 4,
              marginLeft: 12,
              marginRight: 10,
              cursor: 'pointer',
            }}
            onClick={props.onClose}
          />
          {Boolean(props.error) ? props.error.message : null}
        </span>
      </div>
    )
  );
};

export default Alert;
