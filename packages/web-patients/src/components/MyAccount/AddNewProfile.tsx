import { Theme, FormControl, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import React, { useState, useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { AphButton, AphTextField, AphSelect } from '@aph/web-ui-components';
import Grid from '@material-ui/core/Grid';
import { Gender, Relation } from 'graphql/types/globalTypes';
import { useMutation } from 'react-apollo-hooks';
import { ADD_PROFILE, EDIT_PROFILE } from 'graphql/profiles';
import { useAllCurrentPatients } from 'hooks/authHooks';
import _find from 'lodash/find';
import moment from 'moment';
import { isNameValid, isEmailValid, isDobValid } from '@aph/universal/dist/aphValidators';
import FormHelperText from '@material-ui/core/FormHelperText';
import CircularProgress from '@material-ui/core/CircularProgress';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import _startCase from 'lodash/startCase';
import _toLower from 'lodash/toLower';
import { Alerts } from 'components/Alerts/Alerts';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      width: '100%',
    },
    dialogContent: {
      paddingTop: 20,
    },
    dialogActions: {
      padding: 20,
      paddingTop: 10,
      boxShadow: '0 -5px 20px 0 #ffffff',
      position: 'relative',
      textAlign: 'center',
      display: 'flex',
      '& button': {
        borderRadius: 10,
        flexGrow: 1,
        '&:first-child': {
          color: '#fca532',
          marginRight: 10,
        },
        '&:last-child': {
          marginLeft: 10,
        },
      },
    },
    customScrollBar: {
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 20,
      paddingTop: 30,
    },
    shadowHide: {
      overflow: 'hidden',
    },
    profileForm: {
      borderRadius: 10,
      backgroundColor: '#f7f8f5',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: 10,
      position: 'relative',
    },
    formControl: {
      marginBottom: 25,
      width: '100%',
      '& label': {
        fontSize: 14,
        fontWeight: 500,
        color: theme.palette.secondary.dark,
      },
    },
    noMargin: {
      marginBottom: 5,
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
    btnActive: {
      backgroundColor: '#00b38e !important',
      color: '#fff !important',
    },
    genderBtns: {
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      padding: '7px 13px 7px 13px',
      textTransform: 'none',
      borderRadius: 10,
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    relationMenu: {
      '& >div': {
        marginTop: 0,
        paddingTop: 0,
      },
    },
    uploadImage: {
      position: 'absolute',
      right: 20,
      top: -30,
      zIndex: 1,
    },
    profileCircle: {
      position: 'relative',
      width: 65,
      height: 65,
      borderRadius: '50%',
      backgroundColor: '#b2c7cd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      overflow: 'hidden',
      '& img': {
        maxWidth: '100%',
      },
    },
    uploadInput: {
      display: 'none',
    },
    editBtn: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: '#01475b',
      height: 24,
      width: 24,
      borderRadius: '50%',
      textAlign: 'center',
      cursor: 'pointer',
      '& img': {
        maxWidth: 13,
        verticalAlign: 'middle',
      },
    },
    showMessage: {
      opacity: 1.0,
    },
    hideMessage: {
      opacity: 0,
    },
    saveButton: {
      backgroundColor: '#fcb716',
      color: '#fff',
      '&:hover': {
        backgroundColor: '#fcb716',
        color: '#fff',
      },
    },
    saveBtnDisable: {
      backgroundColor: '#fcb716',
      color: '#fff',
      opacity: 0.5,
    },
  };
});

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_DOCTORS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

interface AddNewProfileProps {
  closeHandler: (popOpen: boolean) => void;
  selectedPatientId: string;
  successHandler: (isPopoverOpen: boolean) => void;
  isProfileDelete: boolean;
  isMeClicked: boolean;
}

export const AddNewProfile: React.FC<AddNewProfileProps> = (props) => {
  const classes = useStyles();
  const { closeHandler, selectedPatientId, successHandler, isProfileDelete } = props;

  const [mutationLoading, setMutationLoading] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [genderSelected, setGenderSelected] = useState<string>('');
  const [relation, setRelation] = useState<string>('');
  const [selectedRelation, setSelectedRelation] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const [isFirstNameValid, setIsFirstNameValid] = useState<boolean>(true);
  const [isLastNameValid, setIsLastNameValid] = useState<boolean>(true);
  const [isRelationValid, setIsRelationValid] = useState<boolean>(true);
  const [isGenderValid, setIsGenderValid] = useState<boolean>(true);
  const [isValidDob, setIsValidDob] = useState<boolean>(true);
  const [isEmailAddressValid, setIsEmailAddressValid] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);

  const { allCurrentPatients, currentPatient, setCurrentPatientId } = useAllCurrentPatients();

  // console.log(currentPatient, 'current patient......');

  const orderedGenders = [Gender.MALE, Gender.FEMALE];
  const orderedRelations = [
    Relation.BROTHER,
    Relation.COUSIN,
    Relation.DAUGHTER,
    Relation.FATHER,
    Relation.GRANDDAUGHTER,
    Relation.GRANDFATHER,
    Relation.GRANDMOTHER,
    Relation.GRANDSON,
    Relation.HUSBAND,
    Relation.ME,
    Relation.MOTHER,
    Relation.OTHER,
    Relation.SISTER,
    Relation.SON,
    Relation.WIFE,
  ];

  const addProfileMutation = useMutation(ADD_PROFILE);
  const editProfileMutation = useMutation(EDIT_PROFILE);

  const multiplePrimaryUsers =
    allCurrentPatients && allCurrentPatients.filter((x) => x.relation === Relation.ME).length > 0;
  const [primaryUserErrorMessage, setPrimaryUserErrorMessage] = useState<string>('');

  useEffect(() => {
    // if (selectedPatientId.length > 0) {
    const selectedPatientDetails = _find(allCurrentPatients, (currentPatientDetails) => {
      // return currentPatientDetails.id === (currentPatient ? currentPatient.id : '');
      return currentPatientDetails.relation === 'ME';
    });

    // console.log(
    //   selectedPatientDetails,
    //   multiplePrimaryUsers &&
    //   selectedRelation === 'ME' &&
    //   selectedPatientDetails &&
    //   selectedPatientDetails.relation !== selectedRelation
    // );

    if (
      multiplePrimaryUsers &&
      selectedRelation === 'ME' &&
      selectedPatientDetails &&
      selectedPatientDetails.relation === 'ME'
    ) {
      setPrimaryUserErrorMessage('Relation can be set as Me for only 1 profile');
    } else {
      setPrimaryUserErrorMessage('');
    }

    // if (
    //   multiplePrimaryUsers &&
    //   props.isMeClicked &&
    //   selectedRelation.length > 0 &&
    //   selectedRelation !== 'ME'
    // ) {
    //   setPrimaryUserErrorMessage('There should be 1 profile with relation set as Me');
    // }
    // } else if (selectedRelation.length > 0 && selectedPatientId.length === 0) {
    //   console.log(
    //     multiplePrimaryUsers &&
    //       selectedRelation === 'ME' &&
    //       selectedPatientDetails &&
    //       selectedPatientDetails.relation !== selectedRelation
    //   );
    // }
  }, [selectedRelation, selectedPatientId]);

  useEffect(() => {
    if (selectedPatientId.length > 0) {
      const selectedPatientDetails = _find(allCurrentPatients, (currentPatientDetails) => {
        return currentPatientDetails.id === selectedPatientId;
      });
      if (selectedPatientDetails) {
        setRelation(
          selectedPatientDetails && selectedPatientDetails.relation
            ? selectedPatientDetails.relation
            : ''
        );
        setGenderSelected(
          selectedPatientDetails && selectedPatientDetails.gender
            ? selectedPatientDetails.gender
            : ''
        );
        setFirstName(
          selectedPatientDetails && selectedPatientDetails.firstName
            ? selectedPatientDetails.firstName
            : ''
        );
        setLastName(
          selectedPatientDetails && selectedPatientDetails.lastName
            ? selectedPatientDetails.lastName
            : ''
        );
        setDob(
          selectedPatientDetails && selectedPatientDetails.dateOfBirth
            ? moment(selectedPatientDetails.dateOfBirth).format('DD/MM/YYYY')
            : ''
        );
        setEmailAddress(
          selectedPatientDetails && selectedPatientDetails.emailAddress
            ? selectedPatientDetails.emailAddress
            : ''
        );
        setPhotoUrl(
          selectedPatientDetails && selectedPatientDetails.photoUrl
            ? selectedPatientDetails.photoUrl
            : require('images/no_photo.png')
        );
      }
    }
  }, [allCurrentPatients, selectedPatientId]);

  const disableSubmitButton =
    (firstName.length > 0 &&
      lastName.length > 0 &&
      dob.length > 0 &&
      genderSelected.length > 0 &&
      relation.length > 0 &&
      (emailAddress !== '' ? emailAddress.length > 0 : true) &&
      (isFirstNameValid &&
        isLastNameValid &&
        isRelationValid &&
        isGenderValid &&
        primaryUserErrorMessage.length === 0 &&
        isValidDob &&
        (emailAddress !== '' ? isEmailAddressValid : true))) ||
    isProfileDelete;

  // console.log(
  //   'disable button',
  //   disableSubmitButton,
  //   firstName,
  //   lastName,
  //   dob,
  //   genderSelected,
  //   relation,
  //   emailAddress,
  //   firstName.length > 0 &&
  //     lastName.length > 0 &&
  //     dob.length > 0 &&
  //     genderSelected.length > 0 &&
  //     relation.length > 0 &&
  //     (emailAddress !== '' ? emailAddress.length > 0 : true)
  // );

  return (
    <div className={classes.root}>
      <div className={classes.shadowHide}>
        <div className={classes.dialogContent}>
          <Scrollbars autoHide={true} autoHeight autoHeightMax={'48vh'}>
            <div className={classes.customScrollBar}>
              <div className={classes.profileForm}>
                <div className={classes.uploadImage} title={'Upload Profile'}>
                  <input
                    accept="image/*"
                    className={classes.uploadInput}
                    id="upload-profile-photo"
                    type="file"
                    onChange={async (e) => {
                      setIsUploading(false);
                      const fileNames = e.target.files;
                      if (fileNames && fileNames.length > 0) {
                        const file = fileNames[0] || null;
                        const fileExtension = file.name.split('.').pop();
                        const fileSize = file.size;
                        if (fileSize > 2000000) {
                          setIsAlertOpen(true);
                          setAlertMessage('Invalid File Size. File size must be less than 2MB');
                        } else if (
                          fileExtension &&
                          (fileExtension.toLowerCase() === 'png' ||
                            fileExtension.toLowerCase() === 'jpg' ||
                            fileExtension.toLowerCase() === 'jpeg')
                        ) {
                          setIsUploading(true);
                          if (file) {
                            const aphBlob = await client
                              .uploadBrowserFile({ file })
                              .catch((error) => {
                                throw error;
                              });
                            if (aphBlob && aphBlob.name) {
                              const url = client.getBlobUrl(aphBlob.name);
                              setPhotoUrl(url);
                            }
                          }
                        } else {
                          setIsAlertOpen(true);
                          setAlertMessage(
                            'Invalid File Extension. Only files with .jpg and.png extensions are allowed.'
                          );
                        }
                        setIsUploading(false);
                      }
                    }}
                  />
                  <label className={classes.profileCircle} htmlFor="upload-profile-photo">
                    {isUploading ? <CircularProgress /> : <img src={photoUrl} />}
                  </label>
                  <label className={classes.editBtn} htmlFor="upload-profile-photo">
                    <img src={require('images/ic-edit-white.svg')} />
                  </label>
                </div>
                <FormControl className={`${classes.formControl} ${classes.noMargin}`} fullWidth>
                  <AphTextField
                    label="Full Name"
                    placeholder="First Name"
                    inputProps={{ maxLength: 20 }}
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                    onBlur={(e) => {
                      setIsFirstNameValid(isNameValid(e.target.value));
                    }}
                    error={!isFirstNameValid}
                  />
                  {!isFirstNameValid ? (
                    <FormHelperText
                      className={!isFirstNameValid ? classes.showMessage : classes.hideMessage}
                      component="div"
                      error={true}
                    >
                      Invalid first name
                    </FormHelperText>
                  ) : null}
                </FormControl>
                <FormControl className={`${classes.formControl}`} fullWidth>
                  <AphTextField
                    placeholder="Last name"
                    inputProps={{ maxLength: 20 }}
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                    onBlur={(e) => {
                      setIsLastNameValid(isNameValid(e.target.value));
                    }}
                    error={!isLastNameValid}
                  />
                  {!isLastNameValid ? (
                    <FormHelperText
                      className={!isLastNameValid ? classes.showMessage : classes.hideMessage}
                      component="div"
                      error={true}
                    >
                      Invalid last name
                    </FormHelperText>
                  ) : null}
                </FormControl>
                <FormControl className={classes.formControl} fullWidth>
                  <AphTextField
                    label="Date Of Birth"
                    placeholder="dd/mm/yyyy"
                    inputProps={{ type: 'text', maxLength: 10 }}
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                    }}
                    onBlur={(e) => {
                      setIsValidDob(isDobValid(e.target.value));
                    }}
                    error={!isValidDob}
                  />
                  {!isValidDob ? (
                    <FormHelperText
                      className={!isValidDob ? classes.showMessage : classes.hideMessage}
                      component="div"
                      error={true}
                    >
                      Invalid date of birth
                    </FormHelperText>
                  ) : null}
                </FormControl>
                <FormControl className={classes.formControl}>
                  <label>Gender</label>
                  <Grid container spacing={2} className={classes.btnGroup}>
                    {orderedGenders.map((gender) => {
                      return (
                        <Grid item xs={4} sm={4}>
                          <AphButton
                            color="secondary"
                            className={`${classes.genderBtns} ${
                              gender === genderSelected ? classes.btnActive : ''
                            }`}
                            value={genderSelected}
                            onClick={() => {
                              setGenderSelected(gender as Gender);
                            }}
                          >
                            {_startCase(_toLower(gender))}
                          </AphButton>
                        </Grid>
                      );
                    })}
                  </Grid>
                </FormControl>
                <FormControl className={`${classes.formControl} ${classes.relationMenu}`} fullWidth>
                  <label>Relation</label>
                  <AphSelect
                    onChange={(e) => {
                      setSelectedRelation(e.target.value as Relation);
                      setRelation(e.target.value as Relation);
                      multiplePrimaryUsers;
                    }}
                    value={relation}
                  >
                    {orderedRelations.map((relation) => {
                      return (
                        <MenuItem classes={{ selected: classes.menuSelected }} value={relation}>
                          {_startCase(_toLower(relation))}
                        </MenuItem>
                      );
                    })}
                  </AphSelect>
                  {primaryUserErrorMessage && (
                    <FormHelperText component="div" error={true}>
                      {primaryUserErrorMessage}
                    </FormHelperText>
                  )}
                </FormControl>
                <FormControl className={`${classes.formControl} ${classes.noMargin}`} fullWidth>
                  <AphTextField
                    label="Email Address (Optional)"
                    placeholder="name@email.com"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value);
                    }}
                    onBlur={(e) => {
                      if (e.target.value !== '') {
                        setIsEmailAddressValid(isEmailValid(e.target.value));
                      }
                    }}
                    error={!isEmailAddressValid}
                  />
                  {emailAddress !== '' && !isEmailAddressValid ? (
                    <FormHelperText
                      className={!isEmailAddressValid ? classes.showMessage : classes.hideMessage}
                      component="div"
                      error={true}
                    >
                      Invalid email id
                    </FormHelperText>
                  ) : null}
                </FormControl>
              </div>
            </div>
          </Scrollbars>
        </div>
        <div className={classes.dialogActions}>
          <AphButton
            onClick={() => closeHandler(false)}
            disabled={isProfileDelete}
            title={'Cancel'}
          >
            Cancel
          </AphButton>
          <AphButton
            color="primary"
            onClick={() => {
              setMutationLoading(true);
              const userObject = {
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: moment(dob, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                gender: genderSelected,
                relation: relation,
                emailAddress: emailAddress,
                photoUrl: photoUrl,
                id: selectedPatientId,
                mobileNumber:
                  currentPatient && currentPatient.mobileNumber ? currentPatient.mobileNumber : '',
              };
              if (selectedPatientId.length > 0) {
                delete userObject.mobileNumber;
                userObject.id = selectedPatientId;
                editProfileMutation({
                  variables: {
                    editProfileInput: { ...userObject },
                  },
                })
                  .then(() => {
                    // setCurrentPatientId(selectedPatientId);
                    // localStorage.removeItem('currentUser');
                    closeHandler(false);
                    successHandler(true);
                  })
                  .catch((e) => {
                    setMutationLoading(false);
                    setIsAlertOpen(true);
                    setAlertMessage('An error occurred while updating profile.');
                  });
              } else {
                delete userObject.id;
                addProfileMutation({
                  variables: {
                    PatientProfileInput: { ...userObject },
                  },
                })
                  .then((response) => {
                    closeHandler(false);
                    successHandler(true);
                    window.location.reload();
                  })
                  .catch((e) => {
                    setMutationLoading(false);
                    setIsAlertOpen(true);
                    setAlertMessage('An error occurred while creating profile.');
                  });
              }
            }}
            disabled={!disableSubmitButton}
            classes={{
              root: classes.saveButton,
              disabled: !disableSubmitButton ? classes.saveBtnDisable : '',
            }}
            title={'save'}
          >
            {mutationLoading ? <CircularProgress size={20} /> : 'Save'}
          </AphButton>
        </div>
      </div>
      <Alerts
        setAlertMessage={setAlertMessage}
        alertMessage={alertMessage}
        isAlertOpen={isAlertOpen}
        setIsAlertOpen={setIsAlertOpen}
      />
    </div>
  );
};
