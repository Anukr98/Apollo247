import { Theme } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AppButton } from 'components/ui/AppButton';
import { AppSelectField } from 'components/ui/AppSelectField';
import React from 'react';

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
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        borderRadius: 0,
      },
      '& p': {
        fontSize: 17,
        fontWeight: 500,
        lineHeight: 1.41,
        color: theme.palette.secondary.main,
        marginTop: 20,
      },
    },
    formControl: {
      marginBottom: 20,
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
      },
    },
    actions: {
      padding: 20,
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
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    customScrollBar: {
      height: '65vh',
      overflow: 'auto',
      [theme.breakpoints.down('xs')]: {
        height: '75vh',
      },
    },
    signinGroup: {
      padding: 20,
      paddingTop: 0,
      paddingBottom: 0,
    },
    formGroup: {
      paddingTop: 30,
    },
    profileBox: {
      borderRadius: 5,
      backgroundColor: '#f7f8f5',
      padding: 20,
      marginBottom: 10,
    },
    boxHeader: {
      display: 'flex',
      borderBottom: '1px solid rgba(1,71,91,0.3)',
      paddingBottom: 10,
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.secondary.dark,
    },
    userId: {
      marginLeft: 'auto',
    },
    boxContent: {
      paddingTop: 15,
    },
    userName: {
      fontSize: 16,
      fontWeight: 500,
      color: theme.palette.secondary.light,
    },
    userInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: theme.palette.secondary.light,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
  });
});

export interface ExistingProfileProps {
  userDetails: [
    {
      firstName: string;
      id: string;
      lastName: string;
      mobileNuber: string;
      sex: string;
      uhid: string;
    }
  ];
}

export const ExistingProfile: React.FC<ExistingProfileProps> = (props) => {
  const classes = useStyles();
  const [userRelation, setUserRelation] = React.useState('5');

  const { userDetails } = props;

  const assignRelation = (event: React.ChangeEvent<{ value: string }>) => {
    setUserRelation(event.target.value as string);
  };

  return (
    <div className={classes.signUpBar}>
      <div className={classes.signUpPop}>
        <div className={classes.mascotIcon}>
          <img src={require('images/ic_mascot.png')} alt="" />
        </div>
        <div className={classes.customScrollBar}>
          <div className={classes.signinGroup}>
            <Typography variant="h2">
              welcome
              <br /> to apollo 24/7
            </Typography>
            <p>
              We have found {userDetails.length} accounts registered with this mobile number. Please
              tell us who is who? :)
            </p>
            <div className={classes.formGroup}>
              {userDetails.map((uhidInfo) => (
                <div className={classes.profileBox} key={uhidInfo.uhid}>
                  <div className={classes.boxHeader}>
                    <div>1.</div>
                    <div className={classes.userId}>{uhidInfo.uhid}</div>
                  </div>
                  <div className={classes.boxContent}>
                    <div className={classes.userName}>{uhidInfo.firstName}</div>
                    <div className={classes.userInfo}>Male | 01 January 1987</div>
                    <AppSelectField value={userRelation} onChange={assignRelation}>
                      <MenuItem value={5} classes={{ selected: classes.menuSelected }}>
                        Relation
                      </MenuItem>
                      <MenuItem value={10} classes={{ selected: classes.menuSelected }}>
                        Me
                      </MenuItem>
                      <MenuItem value={20} classes={{ selected: classes.menuSelected }}>
                        Mother
                      </MenuItem>
                      <MenuItem value={30} classes={{ selected: classes.menuSelected }}>
                        Father
                      </MenuItem>
                      <MenuItem value={40} classes={{ selected: classes.menuSelected }}>
                        Sister
                      </MenuItem>
                      <MenuItem value={50} classes={{ selected: classes.menuSelected }}>
                        Brother
                      </MenuItem>
                      <MenuItem value={60} classes={{ selected: classes.menuSelected }}>
                        Cousin
                      </MenuItem>
                      <MenuItem value={70} classes={{ selected: classes.menuSelected }}>
                        Wife
                      </MenuItem>
                      <MenuItem value={80} classes={{ selected: classes.menuSelected }}>
                        Husband
                      </MenuItem>
                    </AppSelectField>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={classes.actions}>
          <AppButton fullWidth disabled variant="contained" color="primary">
            Submit
          </AppButton>
        </div>
      </div>
    </div>
  );
};
