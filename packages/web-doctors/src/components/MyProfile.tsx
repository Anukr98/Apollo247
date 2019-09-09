import { makeStyles } from '@material-ui/styles';
import { MoreVert } from '@material-ui/icons';
import React, { useState, useEffect } from 'react';
import isNumeric from 'validator/lib/isNumeric';
import {
  Theme,
  IconButton,
  Card,
  CardHeader,
  Avatar,
  CircularProgress,
  FormControl,
  InputAdornment,
  FormHelperText,
} from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { isMobileNumberValid } from '@aph/universal/dist/aphValidators';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { AphInput, AphButton } from '@aph/web-ui-components';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';

import { StarDoctorSearch } from 'components/StarDoctorSearch';
import {
  GetDoctorDetails_getDoctorDetails,
  GetDoctorDetails,
  GetDoctorDetails_getDoctorDetails_doctorHospital,
  GetDoctorDetails_getDoctorDetails_starTeam,
} from 'graphql/types/GetDoctorDetails';
import {
  RemoveTeamDoctorFromStarTeam,
  RemoveTeamDoctorFromStarTeamVariables,
} from 'graphql/types/RemoveTeamDoctorFromStarTeam';

import {
  UpdateDelegateNumber,
  UpdateDelegateNumberVariables,
} from 'graphql/types/UpdateDelegateNumber';
import {
  REMOVE_TEAM_DOCTOR_FROM_STAR_TEAM,
  GET_DOCTOR_DETAILS,
  MAKE_TEAM_DOCTOR_ACTIVE,
  UPDATE_DELEGATE_NUMBER,
  REMOVE_DELEGATE_NUMBER,
} from 'graphql/profiles';
import {
  MakeTeamDoctorActive,
  MakeTeamDoctorActiveVariables,
} from 'graphql/types/MakeTeamDoctorActive';

import { Mutation } from 'react-apollo';

const useStyles = makeStyles((theme: Theme) => {
  return {
    welcome: {
      paddingTop: 65,
      [theme.breakpoints.down('xs')]: {
        paddingTop: 65,
      },
    },
    booksLink: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 999,
      top: 0,
    },
    container: {
      maxWidth: 1064,
      margin: 'auto',
      backgroundColor: '#f7f7f7',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
    },
    helpText: {
      fontSize: 12,
      fontWeight: 500,
      color: 'rgba(2,71,91,0.5)',
      marginTop: 10,
      lineHeight: 2,
    },
    statusText: {
      fontSize: 12,
      fontWeight: 500,
      color: '#00b38e',
      marginTop: 10,
      lineHeight: 2,
    },
    labelRoot: {
      width: '100%',
    },
    inputAdornment: {
      color: theme.palette.secondary.dark,
      '& p': {
        color: theme.palette.secondary.dark,
        fontSize: 18,
        fontWeight: 500,
        marginBottom: 9,
      },
    },
    iconLabel: {
      fontSize: 12,
      color: '#67919d',
      paddingTop: 10,
      textTransform: 'uppercase',
    },
    iconSelected: {
      fontSize: '12px !important',
      color: theme.palette.primary.main,
    },
    outerContainer: {
      backgroundColor: 'rgba(216, 216, 216, 0.08)',
      padding: 16,
      border: '1px solid rgba(2,71,91,0.1)',
      borderRadius: 5,
      '& h2': {
        lineHeight: '18px',
        fontWeight: 600,
        margin: '0 0 15px 0',
      },
    },
    tabContent: {
      borderRadius: 5,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 0,
      position: 'relative',
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 30,
    },
    starDoctors: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      overflow: 'hidden',
      position: 'absolute',
      left: 10,
      '& h4': {
        borderBottom: 'none',
      },
    },
    awardsSection: {
      padding: '10px 20px 10px 20px',
      marginBottom: 20,
    },
    tabRightcontent: {
      // paddingRight: 20,
    },
    columnContent: {
      '-webkit-column-break-inside': 'avoid',
      'page-break-inside': 'avoid',
      'break-inside': 'avoid',
      'max-width': 'initial',
    },
    gridContainer: {
      borderTop: 'solid 1px rgba(2, 71, 91, 0.1)',
      'column-count': 2,
      'column-fill': 'initial',
      display: 'block',
      paddingTop: 20,
      [theme.breakpoints.down('xs')]: {
        'column-count': 1,
      },
    },
    serviceItem: {
      padding: '0 0 10px 0',
      position: 'relative',
      height: '100%',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        // display: 'flex',
      },
      '& h5': {
        fontSize: 12,
      },
    },
    serviceItemLeft: {
      padding: '0 0 10px 0',
      position: 'relative',
      height: '100%',
      borderRadius: 5,
      marginBottom: 12,
      color: '#01475b',
      [theme.breakpoints.down('xs')]: {
        // display: 'flex',
      },
    },
    avatarBlock: {
      overflow: 'hidden',
      borderRadius: '5px 5px 0 0',
      position: 'relative',
      paddingBottom: 20,
    },
    bigAvatar: {
      width: '100%',
    },
    profileImg: {
      height: 80,
    },
    tabContentStarDoctor: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 0,
      position: 'relative',
      minHeight: 115,
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 15,
      marginRight: 10,
      '& h4': {
        borderBottom: 'none',
        fontSize: 18,
        color: '#02475b',
        margin: 0,
        padding: 0,
        fontWeight: theme.typography.fontWeightMedium,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: '72%',
      },
      '& h6': {
        margin: 0,
        fontWeight: 600,
        color: '#0087ba',
      },
    },
    addStarDoctor: {
      borderRadius: 10,
      backgroundColor: theme.palette.primary.contrastText,
      padding: 16,
      position: 'relative',
      minHeight: 115,
      flexGrow: 1,
      boxShadow: '0 3px 15px 0 rgba(128, 128, 128, 0.3)',
      marginBottom: 30,
      marginRight: 10,
      '& h5': {
        fontWeight: theme.typography.fontWeightMedium,
        color: 'rgba(2,71,91,0.6)',
        fontSize: 14,
      },
    },
    saveButton: {
      minWidth: 150,
      fontSize: 15,
      padding: '8px 16px',
      lineHeight: '24px',
      fontWeight: theme.typography.fontWeightBold,
      margin: theme.spacing(0),
      backgroundColor: '#fc9916',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
    },
    backButton: {
      minWidth: 120,
      fontSize: 15,
      padding: '8px 16px',
      fontWeight: theme.typography.fontWeightBold,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(0, 1, 0, 0),
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#fff',
      },
    },
    btnAddDoctor: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      color: theme.palette.action.selected,
      fontSize: 14,
      fontWeight: theme.typography.fontWeightBold,
      // pointerEvents: 'none',
      paddingLeft: 0,
      marginBottom: 20,
      '& img': {
        marginRight: 8,
      },
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    btnContainer: {
      borderTop: 'solid 2px rgba(101,143,155,0.2)',
      marginTop: 20,
      paddingTop: 20,
      textAlign: 'right',
    },
    invited: {
      color: '#ff748e',
      fontSize: 15,
      fontWeight: theme.typography.fontWeightMedium,
      marginTop: 10,
      textTransform: 'uppercase',
      '& img': {
        position: 'relative',
        top: 4,
        marginRight: 15,
        marginLeft: 0,
      },
    },
    posRelative: {
      position: 'relative',
    },
    moreIcon: {
      position: 'absolute',
      top: 0,
      right: 0,
      padding: theme.spacing(0),
      backgroundColor: 'transparent',
      boxShadow: 'none',
      minWidth: 20,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    none: {
      display: 'none',
    },
    starImg: {
      position: 'absolute',
      bottom: 7,
      right: 15,
      width: 40,
    },
    card: {
      boxShadow: 'none',
    },
    cardHeader: {
      padding: '12px 0 12px 12px',
      position: 'relative',
    },
    details: {
      '& button': {
        padding: '5px 8px 5px 0px',
        color: '#02475b',
        position: 'absolute',
        right: 0,
        top: 8,
      },
    },
    qualification: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeightMedium,
      color: '#658f9b',
      display: 'block',
      maxWidth: 400,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      paddingRight: '20px',
      width: '51%',
    },
    profileAvatar: {
      width: 80,
      height: 80,
      '& img': {
        height: 80,
      },
    },
    starDoctorHeading: {
      fontSize: 16,
      marginBottom: 15,
      fontWeight: 600,
      color: '#02475b',
    },
    starDoctordelete: {
      color: '#951717',
      fontSize: 15,
      fontWeight: theme.typography.fontWeightMedium,
      padding: '16px 20px',
      cursor: 'pointer',
    },
    leftNav: {
      fontSize: 15,
      lineHeight: 1.6,
      fontWeight: 500,
      padding: '10px 10px 0 10px',
    },
    navRightIcon: {
      position: 'absolute',
      top: 12,
      right: 15,
    },
    navLeftIcon: {
      position: 'relative',
      top: 5,
      width: 'auto',
      marginRight: 10,
    },
    tabActive: {
      backgroundColor: '#0087ba',
      color: '#fff',
    },
    inputWidth: {
      width: '40%',
      align: 'left',
      paddingRight: 26,
      marginBottom: 0,
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    helpTxt: {
      color: '#0087ba',
      fontSize: 16,
      lineHeight: 1.38,
      fontWeight: 500,
    },
    orange: {
      color: '#fc9916',
      fontWeight: 700,
    },
  };
});
export interface StarDoctorCardProps {
  doctor: GetDoctorDetails_getDoctorDetails_starTeam;
}
const invalidPhoneMessage = 'This seems like the wrong number';
const StarDoctorCard: React.FC<StarDoctorCardProps> = (props) => {
  const { doctor } = props;
  //const moreButttonRef = useRef(null);
  //const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const client = useApolloClient();
  const [anchorEl, setAnchorEl] = React.useState((null as unknown) as HTMLButtonElement);
  const [currentDoctor, setCurrentDoctor] = React.useState('');
  const { data, error, loading } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);
  const getDoctorDetailsData = data && data.getDoctorDetails ? data.getDoctorDetails : null;

  if (loading) return <CircularProgress />;
  if (error || !getDoctorDetailsData) return <div>error :(</div>;

  const doctorProfile = getDoctorDetailsData;
  function handleClick(event: React.MouseEvent<HTMLButtonElement>, id: string) {
    setAnchorEl(event.currentTarget);
    setCurrentDoctor(id);
  }

  function handleClose() {
    setAnchorEl((null as unknown) as HTMLButtonElement);
    setCurrentDoctor('');
  }
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <div className={classes.details}>
        <CardHeader
          className={classes.cardHeader}
          avatar={
            <Avatar className={classes.profileAvatar}>
              {doctor!.associatedDoctor!.photoUrl ? (
                <img src={`${doctor!.associatedDoctor!.photoUrl}`} />
              ) : (
                <img src={require('images/doctor-profile.jpg')} />
              )}
            </Avatar>
          }
          action={
            <Mutation<RemoveTeamDoctorFromStarTeam, RemoveTeamDoctorFromStarTeamVariables>
              mutation={REMOVE_TEAM_DOCTOR_FROM_STAR_TEAM}
            >
              {(mutate, { loading }) => (
                <>
                  <IconButton
                    onClick={(e) => handleClick(e, doctor!.associatedDoctor!.firstName!)}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress /> : <MoreVert />}
                  </IconButton>
                  <Popover
                    id={
                      currentDoctor === doctor!.associatedDoctor!.firstName
                        ? doctor!.associatedDoctor!.firstName
                        : undefined
                    }
                    open={currentDoctor === doctor!.associatedDoctor!.firstName}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'center',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <Typography
                      className={classes.starDoctordelete}
                      onClick={(e) => {
                        mutate({
                          variables: {
                            associatedDoctor: doctor!.associatedDoctor!.id,
                            starDoctor: doctorProfile.id,
                          },
                        }).then(() => {
                          const existingData = client.readQuery<GetDoctorDetails>({
                            query: GET_DOCTOR_DETAILS,
                          });
                          const existingStarDoctorTeam =
                            (existingData &&
                              existingData.getDoctorDetails &&
                              existingData.getDoctorDetails.starTeam) ||
                            [];
                          const newStarDoctorTeam = existingStarDoctorTeam.filter(
                            (existingDoc) =>
                              existingDoc!.associatedDoctor!.firstName !==
                              doctor!.associatedDoctor!.firstName
                          );
                          const dataAfterMutation: GetDoctorDetails = {
                            ...existingData,
                            getDoctorDetails: {
                              ...existingData!.getDoctorDetails!,
                              starTeam: newStarDoctorTeam,
                            },
                          };
                          client.writeQuery({ query: GET_DOCTOR_DETAILS, data: dataAfterMutation });
                        });
                      }}
                    >
                      Remove
                    </Typography>
                  </Popover>
                </>
              )}
            </Mutation>
          }
          title={
            <div>
              <h4
                title={`${doctor!.associatedDoctor!.salutation &&
                  doctor!
                    .associatedDoctor!.salutation!.charAt(0)
                    .toUpperCase()}${doctor.associatedDoctor!.salutation!.slice(1).toLowerCase() +
                  '.'} ${doctor!.associatedDoctor!.firstName} ${
                  doctor!.associatedDoctor!.lastName
                }`}
              >
                {doctor!.associatedDoctor!.salutation &&
                  doctor!.associatedDoctor!.salutation!.charAt(0).toUpperCase()}
                {doctor.associatedDoctor!.salutation!.slice(1).toLowerCase() + '.'}{' '}
                {`${doctor!.associatedDoctor!.firstName!.split(' ')[0]} ${doctor!.associatedDoctor!
                  .lastName!}`.length < 15
                  ? `${doctor!.associatedDoctor!.firstName!.split(' ')[0]} ${
                      doctor!.associatedDoctor!.lastName
                    }`
                  : `${
                      doctor!.associatedDoctor!.firstName!.split(' ')[0]
                    } ${doctor!.associatedDoctor!.lastName!.charAt(0)}.`}
              </h4>
              {doctor!.isActive === true && (
                <h6>
                  <span>
                    {doctor!.associatedDoctor!.specialty!.name.toUpperCase()} |{' '}
                    {doctor!.associatedDoctor!.experience} YRS
                  </span>
                </h6>
              )}
            </div>
          }
          subheader={
            <div>
              {doctor!.isActive === true && (
                <span>
                  <span
                    className={classes.qualification}
                    title={`${doctor!.associatedDoctor!.qualification}`}
                  >
                    {doctor!.associatedDoctor!.qualification}
                  </span>
                  <span
                    className={classes.qualification}
                    title={`${
                      doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine1
                        ? doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine1 + ', '
                        : ''
                    }${
                      doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine2
                        ? doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine2 + ', '
                        : ''
                    }${
                      doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine3
                        ? doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine3 + ', '
                        : ''
                    }${
                      doctor!.associatedDoctor!.doctorHospital[0]!.facility!.city
                        ? doctor!.associatedDoctor!.doctorHospital[0]!.facility!.city
                        : ''
                    }`}
                  >
                    {doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine1
                      ? doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine1 + ', '
                      : ''}
                    {doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine2
                      ? doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine2 + ', '
                      : ''}
                    {doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine3
                      ? doctor!.associatedDoctor!.doctorHospital[0]!.facility!.streetLine3 + ', '
                      : ''}
                    {doctor!.associatedDoctor!.doctorHospital[0]!.facility!.city
                      ? doctor!.associatedDoctor!.doctorHospital[0]!.facility!.city
                      : ''}
                  </span>
                </span>
              )}
            </div>
          }
        />
        {}
      </div>
    </Card>
  );
};

export interface StarDoctorsListProps {
  currentDocId: string;
  starDoctors: (GetDoctorDetails_getDoctorDetails_starTeam | null)[];
}

const StarDoctorsList: React.FC<StarDoctorsListProps> = (props) => {
  const { starDoctors } = props;
  const [showAddDoc, setShowAddDoc] = React.useState<boolean>();
  const client = useApolloClient();
  const starDoctorsCardList = starDoctors.filter((existingDoc) => existingDoc!.isActive) || [];

  const classes = useStyles();
  return (
    <Mutation<MakeTeamDoctorActive, MakeTeamDoctorActiveVariables>
      mutation={MAKE_TEAM_DOCTOR_ACTIVE}
    >
      {(mutate, { loading }) => (
        <Grid container alignItems="flex-start" spacing={0}>
          {starDoctorsCardList.map((doctor, index) => {
            return (
              doctor!.isActive === true && (
                <Grid item lg={6} sm={6} xs={12} key={index}>
                  <div className={classes.tabContentStarDoctor}>
                    <StarDoctorCard doctor={doctor!} />
                  </div>
                </Grid>
              )
            );
          })}
          {showAddDoc && (
            <Grid item lg={6} sm={6} xs={12}>
              <div className={classes.addStarDoctor}>
                <Typography variant="h5">
                  Add a doctor to your team
                  <StarDoctorSearch
                    addDoctorHandler={(starDoctor) => {
                      setShowAddDoc(false);
                      mutate({
                        variables: {
                          associatedDoctor: starDoctor!.associatedDoctor!.id,
                          starDoctor: props.currentDocId,
                        },
                      }).then(() => {
                        const existingData = client.readQuery<GetDoctorDetails>({
                          query: GET_DOCTOR_DETAILS,
                        });
                        const existingStarDoctorTeam =
                          (existingData &&
                            existingData.getDoctorDetails &&
                            existingData.getDoctorDetails.starTeam) ||
                          [];
                        const newStarDoctorTeam = existingStarDoctorTeam.map((starDoc) => {
                          if (starDoc!.associatedDoctor!.id === starDoctor!.associatedDoctor!.id) {
                            starDoc!.isActive = true;
                          }
                          return starDoc;
                        });
                        const dataAfterMutation: GetDoctorDetails = {
                          ...existingData,
                          getDoctorDetails: {
                            ...existingData!.getDoctorDetails!,
                            starTeam: newStarDoctorTeam,
                          },
                        };
                        client.writeQuery({ query: GET_DOCTOR_DETAILS, data: dataAfterMutation });
                      });
                    }}
                  />
                </Typography>
              </div>
            </Grid>
          )}
          {props.starDoctors.filter((existingDoc) => !existingDoc!.isActive).length > 0 && (
            <Grid item lg={12} sm={12} xs={12}>
              <AphButton
                variant="contained"
                color="primary"
                classes={{ root: classes.btnAddDoctor }}
                onClick={() => setShowAddDoc(true)}
              >
                <img src={require('images/ic_dark_plus.svg')} alt="" /> ADD DOCTOR
              </AphButton>
            </Grid>
          )}
        </Grid>
      )}
    </Mutation>
  );
};

interface DoctorDetailsProps {
  doctor: GetDoctorDetails_getDoctorDetails;
  clinics: GetDoctorDetails_getDoctorDetails_doctorHospital[];
}
export const MyProfile: React.FC<DoctorDetailsProps> = (props) => {
  const { doctor, clinics } = props;
  const [mobileNumber, setMobileNumber] = useState<string>(
    doctor.delegateNumber ? doctor.delegateNumber.substring(3) : ''
  );
  const [phoneMessage, setPhoneMessage] = useState<string>('');
  const [delegateNumberStatus, setDelegateNumberStatus] = useState<string>('');
  const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);

  const classes = useStyles();
  const doctorProfile = doctor;
  useEffect(() => {
    const mobNumber = sessionStorage.getItem('mobileNumberSession')
      ? sessionStorage.getItem('mobileNumberSession')
      : doctor.delegateNumber!.includes('+91')
      ? doctor.delegateNumber!.slice(3)
      : doctor.delegateNumber;
    if (mobNumber) {
      setMobileNumber(mobNumber);
    } else if (mobNumber == null || (mobNumber && mobNumber.length == 0)) {
      setMobileNumber('');
    }
  }, []);

  return (
    <div>
      <h2>Your Profile</h2>
      <div className={`${classes.tabContent} ${classes.awardsSection}`}>
        <Typography variant="h4">
          {`${doctorProfile!.salutation &&
            doctorProfile!.salutation!.charAt(0).toUpperCase()}${doctorProfile
            .salutation!.slice(1)
            .toLowerCase() + '.'} ${doctorProfile.firstName} ${doctorProfile.lastName}`}{' '}
        </Typography>
        <Typography variant="h6">
          <span>
            {doctorProfile!.specialty!.name.toUpperCase()} | {doctorProfile!.experience} YRS
          </span>
        </Typography>
        <Grid container spacing={0} className={classes.gridContainer}>
          {doctorProfile.qualification && doctorProfile.qualification.length > 0 && (
            <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
              <Paper className={classes.serviceItem}>
                <Typography variant="h5">Education</Typography>
                <Typography variant="h3">{doctorProfile.qualification}</Typography>
              </Paper>
            </Grid>
          )}
          {doctorProfile.awards && doctorProfile.awards.length > 0 && (
            <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
              <Paper className={classes.serviceItem}>
                <Typography variant="h5">Awards</Typography>
                <Typography variant="h3">
                  {doctorProfile.awards
                    .replace('&amp;', '&')
                    .replace(/<\/?[^>]+>/gi, '')
                    .trim()}
                  }
                </Typography>
              </Paper>
            </Grid>
          )}

          {doctorProfile.specialty &&
            doctorProfile.specialty.name &&
            doctorProfile.specialty.name.length > 0 && (
              <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speciality</Typography>
                  <Typography variant="h3">{doctorProfile.specialty.name}</Typography>
                </Paper>
              </Grid>
            )}

          {doctorProfile.languages && doctorProfile.languages.length > 0 && (
            <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
              <Paper className={classes.serviceItem}>
                <Typography variant="h5">Speaks</Typography>
                <Typography variant="h3">{doctorProfile.languages}</Typography>
              </Paper>
            </Grid>
          )}

          {doctorProfile.specialization && doctorProfile.specialization.length > 0 && (
            <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
              <Paper className={classes.serviceItem}>
                <Typography variant="h5">Services</Typography>
                <Typography variant="h3">{doctorProfile.specialization}</Typography>
              </Paper>
            </Grid>
          )}

          {doctorProfile.registrationNumber && doctorProfile.registrationNumber.length > 0 && (
            <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
              <Paper className={classes.serviceItem}>
                <Typography variant="h5">MCI Number</Typography>
                <Typography variant="h3">{doctorProfile.registrationNumber}</Typography>
              </Paper>
            </Grid>
          )}

          <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
            <Paper className={classes.serviceItem}>
              <Typography variant="h5">In-person Consult Location</Typography>
              {clinics.map((clinic, index) => (
                <Typography variant="h3" key={index} className={index > 0 ? classes.none : ''}>
                  {clinic.facility.name}, {clinic.facility.streetLine1}
                  {clinic.facility.streetLine2}
                  {clinic.facility.streetLine3}, {clinic.facility.city}
                </Typography>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </div>

      <div>
        <Typography className={classes.starDoctorHeading}>
          {`Your Star Doctors Team (${
            doctorProfile!.starTeam!.filter(
              (existingDoc: GetDoctorDetails_getDoctorDetails_starTeam | null) =>
                existingDoc!.isActive === true
            ).length
          })`}
        </Typography>
        <StarDoctorsList currentDocId={doctorProfile.id} starDoctors={doctorProfile!.starTeam!} />
      </div>
      {sessionStorage.getItem('loggedInMobileNumber') === doctorProfile.mobileNumber && (
        <div>
          <h2>Secretary Login</h2>
          <div className={`${classes.tabContent} ${classes.awardsSection}`}>
            <h3>Enter the mobile number you’d like to assign access of your account to</h3>
            <FormControl fullWidth>
              <AphInput
                className={classes.inputWidth}
                inputProps={{ type: 'tel', maxLength: 10 }}
                value={mobileNumber}
                placeholder="Enter Here"
                onPaste={(e) => {
                  if (!isNumeric(e.clipboardData.getData('text'))) e.preventDefault();
                }}
                onChange={(event) => {
                  setDelegateNumberStatus('');
                  setMobileNumber(event.currentTarget.value);
                  if (event.currentTarget.value !== '') {
                    if (parseInt(event.currentTarget.value[0], 10) > 5) {
                      setPhoneMessage('');
                      setShowErrorMessage(false);
                    } else {
                      setPhoneMessage(invalidPhoneMessage);
                      setShowErrorMessage(true);
                    }
                  }
                }}
                error={
                  mobileNumber.trim() !== '' &&
                  ((showErrorMessage && !isMobileNumberValid(mobileNumber)) ||
                    (showErrorMessage && `+91${mobileNumber}` === doctorProfile.mobileNumber) ||
                    delegateNumberStatus === `Secretary Number can't be same as Star Doctor Number`)
                }
                onKeyPress={(e) => {
                  if (isNaN(parseInt(e.key, 10))) {
                    e.preventDefault();
                  }
                }}
                startAdornment={<InputAdornment position="start"></InputAdornment>}
              />
              {mobileNumber && mobileNumber !== '' && phoneMessage.length > 0 ? (
                <FormHelperText
                  component="div"
                  className={classes.helpText}
                  error={showErrorMessage}
                >
                  {mobileNumber && mobileNumber !== '' && phoneMessage.length > 0
                    ? phoneMessage
                    : ''}
                </FormHelperText>
              ) : (
                <FormHelperText
                  component="div"
                  className={classes.statusText}
                  error={showErrorMessage}
                >
                  {delegateNumberStatus.length > 0 ? delegateNumberStatus : ''}
                </FormHelperText>
              )}
            </FormControl>
          </div>
        </div>
      )}
      <div className={classes.helpTxt}>
        <img alt="" src={require('images/ic_info.svg')} className={classes.navLeftIcon} />
        Call <span className={classes.orange}>1800 - 3455 - 3455 </span>to make any changes
      </div>
      <Grid container alignItems="flex-start" spacing={0} className={classes.btnContainer}>
        <Grid item lg={12} sm={12} xs={12}>
          <AphButton
            variant="contained"
            color="primary"
            classes={{ root: classes.backButton }}
            onClick={() => setMobileNumber('')}
          >
            CANCEL
          </AphButton>
          {mobileNumber === '' ? (
            <Mutation<UpdateDelegateNumber, UpdateDelegateNumberVariables>
              mutation={REMOVE_DELEGATE_NUMBER}
            >
              {(mutate, { loading }) => (
                <AphButton
                  variant="contained"
                  color="primary"
                  classes={{ root: classes.saveButton }}
                  onClick={(e) => {
                    mutate({});
                    setShowErrorMessage(false);
                    setDelegateNumberStatus('Secretary Number has deleted successfully');
                    sessionStorage.setItem('mobileNumberSession', mobileNumber);
                  }}
                >
                  SAVE
                </AphButton>
              )}
            </Mutation>
          ) : (
            <Mutation<UpdateDelegateNumber, UpdateDelegateNumberVariables>
              mutation={UPDATE_DELEGATE_NUMBER}
            >
              {(mutate, { loading }) => (
                <AphButton
                  variant="contained"
                  color="primary"
                  disabled={mobileNumber!.length !== 10 || phoneMessage.length > 0}
                  classes={{ root: classes.saveButton }}
                  onClick={(e) => {
                    if (`+91${mobileNumber}` !== doctorProfile.mobileNumber) {
                      if (`+91${mobileNumber}` !== doctorProfile.delegateNumber) {
                        mutate({
                          variables: {
                            delegateNumber: `+91${mobileNumber}`,
                          },
                        })
                          .then((result) => {
                            setShowErrorMessage(false);
                            setDelegateNumberStatus('Secretary Number has updated successfully');
                            sessionStorage.setItem('mobileNumberSession', mobileNumber);
                          })
                          .catch((error) => {
                            if (error.toString().includes('INVALID_ENTITY')) {
                              setPhoneMessage('');
                              setShowErrorMessage(true);
                              setDelegateNumberStatus(
                                `Secretary Number can't be same as Star Doctor Number`
                              );
                            } else {
                              setShowErrorMessage(false);
                              setDelegateNumberStatus('Secretary Number has updated successfully');
                              sessionStorage.setItem('mobileNumberSession', mobileNumber);
                            }
                          });
                      } else {
                        setShowErrorMessage(false);
                        setDelegateNumberStatus('Secretary Number has updated successfully');
                        sessionStorage.setItem('mobileNumberSession', mobileNumber);
                      }
                    } else {
                      setPhoneMessage('');
                      setShowErrorMessage(true);
                      setDelegateNumberStatus(`Secretary Number can't be same as Doctor Number`);
                    }
                  }}
                >
                  SAVE
                </AphButton>
              )}
            </Mutation>
          )}
        </Grid>
      </Grid>
    </div>
  );
};
