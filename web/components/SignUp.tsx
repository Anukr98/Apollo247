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
      bottom: '10px',
      right: '15px',

      '& img': {
        maxWidth: '72px',
        maxHeight: '72px',
      },
    },
    signUpPop: {
      paddingTop: '15px',
      '& p': {
        fontSize: '17px',
        fontWeight: 500,
        lineHeight: 1.41,
        color: '#0087ba',
        marginTop: '20px',
      },
      '& input': {
        fontSize: '16px',
        fontWeight: 600,
        color: '#02475b',
      },
      '& label.Mui-focused': {
        color: '#02475b',
      },
      '& .MuiInputBase-root': {
        fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
      },
      '& .MuiInputBase-root:before': {
        borderBottomColor: '#00b38e',
        borderWidth: '2px',
      },
      '& .MuiInputBase-root:hover:before': {
        borderBottomColor: 'rgba(0, 0, 0, 0.5)',
      },
      '& .MuiInput-underline:after': {
        borderBottomColor: '#00b38e',
      },
      '& form': {
        paddingTop: '30px',
      },
    },
    formControl: {
      marginBottom: '20px',

      '& label': {
        fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
        fontSize: '12px',
        fontWeight: 500,
        color: '#02475b',
      },
      '& .MuiInputLabel-shrink': {
        transform: 'translate(0, 1.5px) scale(1)',
      },
      '& input': {
        fontSize: '16px',
        fontWeight: 500,
        color: '#01475b',
        paddingTop: '9px',
      },
    },
    actions: {
      display: 'flex',
      paddingTop: '10px',
    },
    laterBtn: {
      marginRight: '10px',
      width: '50%',
      padding: '8px 13px',
      color: '#fc9916',
      fontSize: '13px',
      fontWeight: 'bold',
      backgroundColor: '#fff',
      fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    },
    submitBtn: {
      marginLeft: '10px',
      width: '50%',
      color: '#fff',
      padding: '8px 13px',
      fontSize: '13px',
      fontWeight: 'bold',
      fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    },
    btnGroup: {
      paddingTop: '7px',
      '& button': {
        width: '100%',
        color: '#00b38e',
        backgroundColor: '#fff',
        fontSize: '16px',
        fontWeight: 500,
        fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
        letterSpacing: '-0.36px',
        textTransform: 'none',
      },
    },
    bottomPopover: {
      '& .MuiPopover-paper': {
        width: '368px',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
        backgroundColor: '#ffffff',
      },
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
              }}
            />
            <TextField
              className={classes.formControl}
              label="Last Name"
              placeholder="Example, Donut"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              className={classes.formControl}
              label="Date Of Birth"
              placeholder="mm/dd/yyyy"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
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
              }}
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
