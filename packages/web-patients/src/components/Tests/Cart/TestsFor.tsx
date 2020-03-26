import { makeStyles } from '@material-ui/styles';
import { Theme, MenuItem, Popover } from '@material-ui/core';
import React, { useState } from 'react';
import { AphSelect, AphButton } from '@aph/web-ui-components';
import Typography from '@material-ui/core/Typography';
import { GetCurrentPatients_getCurrentPatients_patients } from 'graphql/types/GetCurrentPatients';
import { useAllCurrentPatients, useAuth } from 'hooks/authHooks';
import _isEmpty from 'lodash/isEmpty';
import { AphDialogTitle, AphDialog, AphDialogClose } from '@aph/web-ui-components';
import { AddNewProfile } from 'components/MyAccount/AddNewProfile';
import { MascotWithMessage } from 'components/MascotWithMessage';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    medicineStrip: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: '0 14px 10px 14px',
      marginBottom: 10,
      position: 'relative',
    },
    medicineInformation: {
      paddingRight: 10,
    },
    menuRoot: {
      fontSize: 13,
      fontWeight: 500,
      color: '#02475b',
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e',
      fontWeight: 600,
    },
    selectMenuRoot: {
      paddingRight: 55,
      '& svg': {
        color: '#00b38e',
        fontSize: 30,
      },
    },
    selectMenuItem: {
      color: theme.palette.secondary.dark,
      fontSize: 16,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textTransform: 'capitalize',
      [theme.breakpoints.down('xs')]: {
        fontSize: 16,
      },
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    testsInfo: {
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      paddingTop: 8,
    },
    sectionHeader: {
      color: '#02475b',
      fontSize: 14,
      fontWeight: 500,
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      paddingBottom: 10,
      paddingTop: 10,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
    },
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(0, 0, 0, 0.3)',
      '& ul': {
        padding: '10px 20px',
        maxHeight: '65vh',
        '& li': {
          fontSize: 16,
          fontWeight: 500,
          color: '#01475b',
          minHeight: 'auto',
          paddingLeft: 0,
          paddingRight: 0,
          borderBottom: '1px solid rgba(1,71,91,0.2)',
          textTransform: 'capitalize',
          '&:last-child': {
            borderBottom: 'none',
          },
          '&:first-child': {
            borderBottom: 'none',
            padding: 0,
          },
        },
      },
    },
    addMemberBtn: {
      boxShadow: 'none',
      backgroundColor: 'transparent',
      marginLeft: 30,
      paddingBottom: 0,
      paddingRight: 0,
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

type Patient = GetCurrentPatients_getCurrentPatients_patients;

export const TestsFor: React.FC = (props) => {
  const classes = useStyles({});
  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  const [isAddNewProfileDialogOpen, setIsAddNewProfileDialogOpen] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [isMeClicked, setIsMeClicked] = useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>
        <span>Who Are These Tests For?</span>
      </div>
      <div className={classes.medicineStrip}>
        <div className={classes.medicineInformation}>
          {allCurrentPatients && currentPatient && !_isEmpty(currentPatient.firstName) && (
            <Typography>
              <AphSelect
                value={currentPatient.id}
                onChange={(e) => setCurrentPatientId(e.target.value as Patient['id'])}
                classes={{ root: classes.selectMenuRoot, selectMenu: classes.selectMenuItem }}
                title={currentPatient.firstName || ''}
              >
                {allCurrentPatients.map((patient) => {
                  const isSelected = patient.relation === 'ME';
                  const name = (patient.firstName || '').toLocaleLowerCase();
                  return (
                    <MenuItem
                      selected={isSelected}
                      value={patient.id}
                      classes={{ selected: classes.menuSelected }}
                      key={patient.id}
                      title={name || ''}
                    >
                      {name}
                    </MenuItem>
                  );
                })}
                <MenuItem classes={{ selected: classes.menuSelected }}>
                  <AphButton
                    color="primary"
                    classes={{ root: classes.addMemberBtn }}
                    onClick={() => {
                      setIsAddNewProfileDialogOpen(true);
                    }}
                    title={'Add New Profile'}
                  >
                    Add New Profile
                  </AphButton>
                </MenuItem>
              </AphSelect>
            </Typography>
          )}
          <div className={classes.testsInfo}>
            All the tests must be for one person. Tests for multiple profiles will require separate
            purchases.
          </div>
          <AphDialog open={isAddNewProfileDialogOpen} maxWidth="sm">
            <AphDialogClose onClick={() => setIsAddNewProfileDialogOpen(false)} title={'Close'} />
            <AphDialogTitle>Add New Member</AphDialogTitle>
            <AddNewProfile
              closeHandler={(isAddNewProfileDialogOpen: boolean) =>
                setIsAddNewProfileDialogOpen(isAddNewProfileDialogOpen)
              }
              isMeClicked={isMeClicked}
              selectedPatientId=""
              successHandler={(isPopoverOpen: boolean) => setIsPopoverOpen(isPopoverOpen)}
              isProfileDelete={false}
            />
          </AphDialog>
          <Popover
            open={isPopoverOpen}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            classes={{ paper: classes.bottomPopover }}
          >
            <MascotWithMessage
              messageTitle=""
              message="Profile created successfully."
              closeButtonLabel="OK"
              closeMascot={() => {
                setIsPopoverOpen(false);
                window.location.reload(true);
              }}
            />
          </Popover>
        </div>
      </div>
    </div>
  );
};
