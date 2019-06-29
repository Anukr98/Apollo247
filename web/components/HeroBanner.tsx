import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { AppButton } from 'components/ui/AppButton';
import MenuItem from '@material-ui/core/MenuItem';
import { AppSelectField } from 'components/ui/AppSelectField';
import { ProtectedWithLoginPopup } from 'components/ProtectedWithLoginPopup';

const useStyles = makeStyles((theme: Theme) => {
  return {
    heroBanner: {
      display: 'flex',
      borderRadius: '0 0 10px 10px',
      backgroundColor: theme.palette.text.primary,
      padding: 40,
    },
    bannerInfo: {
      width: '50%',
      '& p': {
        fontSize: 17,
        lineHeight: 1.47,
        fontWeight: 500,
        color: theme.palette.secondary.main,
        marginTop: 16,
        marginBottom: 20,
      },
      '& h1': {
        display: 'flex',
        '& >div': {
          marginLeft: 10,
          paddingTop: 0,
          marginTop: -10,
          width: 'auto',
        },
      },
    },
    bannerImg: {
      width: '50%',
      marginLeft: 'auto',
      marginBottom: -190,
      textAlign: 'right',
      '& img': {
        marginTop: -15,
      },
    },
    button: {
      minWidth: 200,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    selectMenuRoot: {
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 56,
      fontWeight: 600,
      lineHeight: '66px',
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      minWidth: 100,
      marginLeft: 30,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

export const HeroBanner: React.FC = (props) => {
  const classes = useStyles();
  const [userName, setUserName] = React.useState(10);

  return (
    <div className={classes.heroBanner}>
      <div className={classes.bannerInfo}>
        <Typography variant="h1">
          <span>hello</span>
          <AppSelectField
            value={userName}
            onChange={(e) => setUserName(parseInt(e.currentTarget.value as string))}
            classes={{ root: classes.selectMenuRoot, selectMenu: classes.selectMenuItem }}
          >
            <MenuItem selected value={10} classes={{ selected: classes.menuSelected }}>
              Surj
            </MenuItem>
            <MenuItem value={20} classes={{ selected: classes.menuSelected }}>
              Preeti
            </MenuItem>
            <MenuItem classes={{ selected: classes.menuSelected }}>
              <AppButton color="primary" classes={{ root: classes.addMemberBtn }}>
                Add Member
              </AppButton>
            </MenuItem>
          </AppSelectField>
        </Typography>
        <p>Not feeling well today? Don’t worry. We will help you find the right doctor :)</p>
        <ProtectedWithLoginPopup>
          {({ protectWithLoginPopup }) => (
            <AppButton
              variant="contained"
              color="primary"
              classes={{ root: classes.button }}
              onClick={() => protectWithLoginPopup()}
            >
              Consult a doctor
            </AppButton>
          )}
        </ProtectedWithLoginPopup>
      </div>
      <div className={classes.bannerImg}>
        <img src={require('images/ic_doctor.svg')} alt="" />
      </div>
    </div>
  );
};
