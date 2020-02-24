import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import { AphButton } from '@aph/web-ui-components';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    signUpBar: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
      [theme.breakpoints.down('xs')]: {
        justifyContent: 'center',
      },
    },
    signUpPop: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    actions: {
      padding: '0 20px 20px 20px',
      display: 'flex',
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    signinGroup: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    button: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      marginLeft: 'auto',
      fontWeight: 'bold',
      color: '#fc9916',
      padding: 0,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  });
});

export interface MascotWithMessageProps {
  closeMascot: () => void;
  messageTitle: string;
  message: string;
  closeButtonLabel: string;
  refreshPage?: boolean;
}

export const MascotWithMessage: React.FC<MascotWithMessageProps> = (props, history) => {
  const classes = useStyles();

  // const { refreshPage } = props;

  // useEffect(() => {
  //   return <Redirect to="/address-book" />;
  // }, [refreshPage]);

  return (
    <div className={classes.signUpBar}>
      <div className={classes.signUpPop}>
        <div className={classes.mascotIcon}>
          <img src={require('images/ic-mascot.png')} alt="" />
        </div>
        <div className={classes.signinGroup}>
          {props.messageTitle.length > 0 ? (
            <Typography variant="h2">{props.messageTitle}</Typography>
          ) : null}
          <p>{props.message}</p>
        </div>
        <div className={classes.actions}>
          <AphButton
            type="submit"
            color="primary"
            classes={{ root: classes.button }}
            onClick={() => {
              props.closeMascot();
              props.refreshPage ? window.location.reload(true) : null;
            }}
          >
            {props.closeButtonLabel}
          </AphButton>
        </div>
      </div>
    </div>
  );
};
