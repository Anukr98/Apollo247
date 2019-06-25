import { makeStyles, createStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    signUpBar: {
      display: 'flex',
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
      backgroundColor: '#ffffff',
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: '#0087ba',
        marginTop: 20,
      },
      '& form': {
        paddingTop: 30,
      },
    },
    formControl: {
      marginBottom: 20,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: '#02475b',
        transform: 'translate(0, 1.5px) scale(1)',
      },
    },
    inputRoot: {
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #02475b',
      },
      '& input': {
        fontSize: 16,
        fontWeight: 500,
        color: '#01475b',
        paddingTop: 9,
      },
    },
    inputFocused: {
      '&:before': {
        borderBottom: '2px solid #00b38e',
      },
      '&:after': {
        borderBottom: '2px solid #00b38e',
      },
    },
    actions: {
      display: 'flex',
      paddingTop: 10,
    },
    laterBtn: {
      marginRight: 10,
      width: '50%',
    },
    submitBtn: {
      marginLeft: 10,
      width: '50%',
    },
    btnGroup: {
      paddingTop: 7,
      '& button': {
        width: '100%',
        color: '#00b38e',
        backgroundColor: '#fff',
        fontSize: '16px',
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
            <TextField
              className={classes.formControl}
              label="First Name"
              placeholder="Example, Jonathan"
              fullWidth
              InputLabelProps={{
                shrink: true,
                focused: false,
              }}
              InputProps={{ classes: { root: classes.inputRoot, focused: classes.inputFocused } }}
            />
            <TextField
              className={classes.formControl}
              label="Last Name"
              placeholder="Example, Donut"
              fullWidth
              InputLabelProps={{
                shrink: true,
                focused: false,
              }}
              InputProps={{ classes: { root: classes.inputRoot, focused: classes.inputFocused } }}
            />
            <TextField
              className={classes.formControl}
              label="Date Of Birth"
              placeholder="mm/dd/yyyy"
              fullWidth
              InputLabelProps={{
                shrink: true,
                focused: false,
              }}
              InputProps={{ classes: { root: classes.inputRoot, focused: classes.inputFocused } }}
            />
            <div className={classes.formControl}>
              <label>Gender</label>
              <Grid container spacing={2} className={classes.btnGroup}>
                <Grid item xs={6} sm={4}>
                  <Button variant="contained">Male</Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button variant="contained">Female</Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button variant="contained">Other</Button>
                </Grid>
              </Grid>
            </div>
            <TextField
              className={classes.formControl}
              label="Email Address (Optional)"
              placeholder="name@email.com"
              fullWidth
              InputLabelProps={{
                shrink: true,
                focused: false,
              }}
              InputProps={{ classes: { root: classes.inputRoot, focused: classes.inputFocused } }}
            />
            <div className={classes.actions}>
              <Button variant="contained" className={classes.laterBtn}>
                Fill Later
              </Button>
              <Button variant="contained" color="primary" className={classes.submitBtn}>
                Submit
              </Button>
            </div>
          </form>
        </div>
      </Popover>
    </div>
  );
};
