import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { AppTextField } from 'components/ui/AppTextField';
import { AppButton } from 'components/ui/AppButton';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    signUpBar: {
      display: 'flex',
    },
    formControl: {
      marginBottom: 20,
    },
    mascotCircle: {
      marginLeft: 'auto',
      cursor: 'pointer',
      position: 'fixed',
      bottom: 10,
      right: 15,
      '& img': {
        maxWidth: 72,
        maxHeight: 72,
      },
    },
    signUpPop: {
      width: 368,
      padding: 20,
      borderRadius: 10,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
      '& form': {
        paddingTop: 30,
      },
    },
    actions: {
      paddingTop: 10,
    },
    btnGroup: {
      paddingTop: 7,
      '& button': {
        width: '100%',
        color: '#00b38e',
        backgroundColor: theme.palette.common.white,
        fontSize: 16,
        fontWeight: 500,
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'none',
      boxShadow: 'none',
    },
  });
});

export const SignUp: React.FC = (props) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div className={classes.signUpBar}>
      <div
        className={classes.mascotCircle}
        aria-describedby={id}
        onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}
      >
        <img src={require('images/ic_mascot.png')} alt="" />
      </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        className={classes.bottomPopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.signUpPop}>
          <Typography variant="h2">
            welcome
            <br /> to apollo 24/7
          </Typography>
          <p>Let us quickly get to know you so that we can get you the best help :)</p>
          <form>
            <AppTextField label="First Name" placeholder="Example, Jonathan" />
            <AppTextField label="Last Name" placeholder="Example, Donut" />
            <AppTextField label="Date Of Birth" placeholder="mm/dd/yyyy" />
            <div className={classes.formControl}>
              <label>Gender</label>
              <Grid container spacing={2} className={classes.btnGroup}>
                <Grid item xs={6} sm={4}>
                  <AppButton variant="contained">Male</AppButton>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <AppButton variant="contained">Female</AppButton>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <AppButton variant="contained">Other</AppButton>
                </Grid>
              </Grid>
            </div>
            <AppTextField label="Email Address (Optional)" placeholder="name@email.com" />
            <div className={classes.actions}>
              <AppButton
                fullWidth
                variant="contained"
                color="primary"
              >
                Submit
              </AppButton>
            </div>
          </form>
        </div>
      </Popover>
    </div>
  );
};
