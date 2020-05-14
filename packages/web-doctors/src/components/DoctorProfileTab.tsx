import { makeStyles } from '@material-ui/styles';
import { Theme, IconButton, Card, CardHeader, Avatar, CircularProgress } from '@material-ui/core';
import React, { useContext, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { AphButton } from '@aph/web-ui-components';
import { LoggedInUserType } from 'graphql/types/globalTypes';
import { ApolloError } from 'apollo-client';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { GET_DOCTOR_DETAILS_BY_ID } from 'graphql/profiles';
import {
  GetDoctorDetailsById,
  GetDoctorDetailsByIdVariables,
} from 'graphql/types/GetDoctorDetailsById';
import { useApolloClient } from 'react-apollo-hooks';
import {
  REMOVE_TEAM_DOCTOR_FROM_STAR_TEAM,
  GET_DOCTOR_DETAILS,
  MAKE_TEAM_DOCTOR_ACTIVE,
} from 'graphql/profiles';
import { MoreVert } from '@material-ui/icons';
import {
  RemoveTeamDoctorFromStarTeam,
  RemoveTeamDoctorFromStarTeamVariables,
} from 'graphql/types/RemoveTeamDoctorFromStarTeam';
import {
  MakeTeamDoctorActive,
  MakeTeamDoctorActiveVariables,
} from 'graphql/types/MakeTeamDoctorActive';
import { Mutation } from 'react-apollo';
import { StarDoctorSearch } from 'components/StarDoctorSearch';
import {
  GetDoctorDetails_getDoctorDetails,
  GetDoctorDetails,
  GetDoctorDetails_getDoctorDetails_doctorHospital,
  GetDoctorDetails_getDoctorDetails_starTeam,
} from 'graphql/types/GetDoctorDetails';

const useStyles = makeStyles((theme: Theme) => {
  return {
    ProfileContainer: {
      padding: '10px 20px 0 20px',
      [theme.breakpoints.down('xs')]: {
        padding: '10px 0 0 0',
      },
      '& h2': {
        fontSize: 16,
        color: theme.palette.secondary.dark,
        marginBottom: 15,
      },
      '& h3': {
        lineHeight: '22px',
        padding: '3px 5px 5px 0',
        fontSize: 16,
        fontWeight: theme.typography.fontWeightMedium,
        color: '#02475b',
      },
      '& h4': {
        padding: '5px 5px 5px 0',
        marginLeft: 20,
        fontSize: 20,
        borderBottom: 'solid 2px rgba(101,143,155,0.05)',
        fontWeight: 600,
      },
      '& h5': {
        padding: '5px 5px 3px 0',
        color: '#658f9b',
        fontWeight: 'normal',
      },
      '& h6': {
        color: theme.palette.secondary.main,
        padding: '5px 5px 5px 0',
        letterSpacing: '0.3px',
        marginLeft: 20,
        fontSize: 12,
        fontWeight: 600,
        '& span': {
          padding: '0 2px',
        },
      },
    },
    removeDoctor: {
      padding: theme.spacing(1),
      color: '#951717',
      fontSize: 15,
      fontWeight: theme.typography.fontWeightMedium,
    },
    tabContent: {
      borderRadius: 10,
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
    tabLeftcontent: {
      padding: '10px 20px 10px 20px',
    },
    columnContent: {
      '-webkit-column-break-inside': 'avoid',
      'page-break-inside': 'avoid',
      'break-inside': 'avoid',
      'max-width': 'initial',
    },
    gridContainer: {
      'column-count': 2,
      'column-fill': 'initial',
      display: 'block',
      [theme.breakpoints.down('xs')]: {
        'column-count': 1,
      },
    },
    serviceItem: {
      padding: '0 0 10px 0',
      position: 'relative',
      height: '100%',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {},
    },
    avatarBlock: {
      overflow: 'hidden',
      borderRadius: '10px 0 0 0',
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
      minWidth: 300,
      fontSize: 15,
      padding: '8px 16px',
      lineHeight: '24px',
      fontWeight: theme.typography.fontWeightBold,
      margin: theme.spacing(1, 1, 0, 1),
      backgroundColor: '#fc9916',
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      '&:hover': {
        backgroundColor: '#e28913',
      },
      [theme.breakpoints.down('xs')]: {
        minWidth: 140,
      },
    },
    backButton: {
      minWidth: 120,
      fontSize: 15,
      padding: '8px 16px',
      fontWeight: theme.typography.fontWeightBold,
      color: '#fc9916',
      backgroundColor: '#fff',
      margin: theme.spacing(1),
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
      paddingLeft: 4,
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    btnContainer: {
      borderTop: 'solid 2px rgba(101,143,155,0.2)',
      marginTop: 30,
      paddingTop: 10,
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
      maxWidth: 270,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      paddingRight: '20px',
      width: '78%',
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
  };
});

export interface StarDoctorCardProps {
  currentDocId: string;
  doctor: GetDoctorDetails_getDoctorDetails_starTeam;
}
const StarDoctorCard: React.FC<StarDoctorCardProps> = (props) => {
  const { doctor, currentDocId } = props;
  const client = useApolloClient();
  const [anchorEl, setAnchorEl] = React.useState((null as unknown) as HTMLButtonElement);
  const [currentDoctor, setCurrentDoctor] = React.useState('');

  function handleClick(event: React.MouseEvent<HTMLButtonElement>, id: string) {
    setAnchorEl(event.currentTarget);
    setCurrentDoctor(id);
  }

  function handleClose() {
    setAnchorEl((null as unknown) as HTMLButtonElement);
    setCurrentDoctor('');
  }
  const classes = useStyles({});
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
                <img src={require('images/no_photo.png')} />
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
                            starDoctor: currentDocId,
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
  const { starDoctors, currentDocId } = props;
  const [showAddDoc, setShowAddDoc] = React.useState<boolean>();
  const client = useApolloClient();
  const starDoctorsCardList = starDoctors.filter((existingDoc) => existingDoc!.isActive) || [];

  const classes = useStyles({});
  return (
    <Mutation<MakeTeamDoctorActive, MakeTeamDoctorActiveVariables>
      mutation={MAKE_TEAM_DOCTOR_ACTIVE}
    >
      {(mutate, { loading }) => (
        <Grid container alignItems="flex-start" spacing={0}>
          {starDoctorsCardList.map((doctor, index) => {
            return (
              doctor!.isActive === true && (
                <Grid item lg={4} sm={6} xs={12} key={index}>
                  <div className={classes.tabContentStarDoctor}>
                    <StarDoctorCard doctor={doctor!} currentDocId={currentDocId} />
                  </div>
                </Grid>
              )
            );
          })}
          {showAddDoc && (
            <Grid item lg={4} sm={6} xs={12}>
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
                <img src={require('images/ic_add.svg')} alt="" /> ADD DOCTOR
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
export const DoctorDetails: React.FC<DoctorDetailsProps> = (props) => {
  const { doctor, clinics } = props;
  const classes = useStyles({});

  return (
    <div>
      <Typography variant="h2">Basic Details</Typography>
      <div className={classes.tabContent}>
        <Grid container alignItems="flex-start" spacing={0}>
          <Grid item lg={4} sm={6} xs={12}>
            <Paper className={classes.serviceItem}>
              <div className={classes.avatarBlock}>
                <img alt="" src={require('images/no_photo.png')} className={classes.bigAvatar} />
                {doctor.doctorType === 'STAR_APOLLO' ? (
                  <img alt="" src={require('images/ic_star.svg')} className={classes.starImg} />
                ) : (
                  ''
                )}
              </div>
              <Typography variant="h4">
                {doctor.salutation!.charAt(0).toUpperCase()}
                {doctor.salutation!.slice(1).toLowerCase()}. {doctor.firstName} {doctor.lastName}
              </Typography>
              <Typography variant="h6">
                {((doctor && doctor.specialty && doctor.specialty.name) || '').toUpperCase()}{' '}
                <span> | </span>
                <span> {doctor.experience}YRS </span>
              </Typography>
            </Paper>
          </Grid>
          <Grid item lg={8} sm={6} xs={12} className={classes.tabLeftcontent}>
            <Grid container alignItems="flex-start" spacing={0} className={classes.gridContainer}>
              {doctor.qualification && doctor.qualification!.length > 0 && (
                <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                  <Paper className={classes.serviceItem}>
                    <Typography variant="h5">Education</Typography>
                    <Typography variant="h3">{doctor.qualification}</Typography>
                  </Paper>
                </Grid>
              )}
              {doctor.awards && doctor.awards!.length > 0 && (
                <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                  <Paper className={classes.serviceItem}>
                    <Typography variant="h5">Awards</Typography>
                    <Typography variant="h3" style={{ whiteSpace: 'pre-line' }}>
                      {doctor.awards
                        .replace('&amp;', '&')
                        .replace(/<\/?[^>]+>/gi, '')
                        .trim()}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              {doctor.specialty && doctor.specialty.name && doctor.specialty.name!.length > 0 && (
                <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                  <Paper className={classes.serviceItem}>
                    <Typography variant="h5">Speciality</Typography>
                    <Typography variant="h3">{doctor.specialty.name}</Typography>
                  </Paper>
                </Grid>
              )}
              {doctor.languages && doctor.languages!.length > 0 && (
                <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                  <Paper className={classes.serviceItem}>
                    <Typography variant="h5">Speaks</Typography>
                    <Typography variant="h3">{doctor.languages}</Typography>
                  </Paper>
                </Grid>
              )}
              {doctor.specialization && doctor!.specialization!.length > 0 && (
                <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                  <Paper className={classes.serviceItem}>
                    <Typography variant="h5">Services</Typography>
                    <Typography variant="h3">{doctor.specialization}</Typography>
                  </Paper>
                </Grid>
              )}

              {doctor.registrationNumber && doctor.registrationNumber!.length > 0 && (
                <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                  <Paper className={classes.serviceItem}>
                    <Typography variant="h5">MCI Number</Typography>
                    <Typography variant="h3">{doctor.registrationNumber}</Typography>
                  </Paper>
                </Grid>
              )}
              {doctor.doctorType !== 'PAYROLL' && (
                <Grid item lg={6} sm={12} xs={12} className={classes.columnContent}>
                  <Paper className={classes.serviceItem}>
                    <Typography variant="h5">In-person Consult Location</Typography>
                    {clinics.map((clinic, index) => (
                      <Typography
                        variant="h3"
                        key={index}
                        className={index > 0 ? classes.none : ''}
                      >
                        {clinic.facility.name}, {clinic.facility.streetLine1}
                        {clinic.facility.streetLine2}
                        {clinic.facility.streetLine3}, {clinic.facility.city}
                      </Typography>
                    ))}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

interface DoctorProfileTabProps {
  onNext: () => void;
}
export const DoctorProfileTab: React.FC<DoctorProfileTabProps> = (props) => {
  const classes = useStyles({});
  const useAuthContext = () => useContext<AuthContextProps>(AuthContext);
  const currentUserId = useAuthContext().currentUserId!;
  const currentUserType = useAuthContext().currentUserType!;
  const client = useApolloClient();
  const [userDetails, setUserDetails] = React.useState<any>();
  const [starDoctors, setStarDoctor] = React.useState<any>();
  const getDoctorDetailsById = () => {
    client
      .query<GetDoctorDetailsById, GetDoctorDetailsByIdVariables>({
        query: GET_DOCTOR_DETAILS_BY_ID,
        fetchPolicy: 'no-cache',
        variables: { id: currentUserId ? currentUserId : localStorage.getItem('currentUserId') },
      })
      .then((data) => {
        setUserDetails(data.data.getDoctorDetailsById);
        setStarDoctor(
          data.data.getDoctorDetailsById!.starTeam!.filter(
            (existingDoc: any) => existingDoc!.isActive === true
          ) || []
        );
      })
      .catch((error: ApolloError) => {
        console.log(error);
      });
  };
  const getDoctorDetail = () => {
    client
      .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS, fetchPolicy: 'no-cache' })
      .then((_data) => {
        setUserDetails(_data.data.getDoctorDetails);
        setStarDoctor(
          _data.data.getDoctorDetails!.starTeam!.filter(
            (existingDoc: any) => existingDoc!.isActive === true
          ) || []
        );
      })
      .catch((e) => {
        console.log('Error occured while fetching Doctor', e);
      });
  };

  useEffect(() => {
    if (currentUserType === LoggedInUserType.SECRETARY) {
      getDoctorDetailsById();
    } else {
      if (!userDetails) {
        getDoctorDetail();
      }
    }
  }, []);
  const doctorProfile = userDetails;

  return (
    <div className={classes.ProfileContainer}>
      {doctorProfile && (
        <DoctorDetails doctor={doctorProfile!} clinics={doctorProfile!.doctorHospital!} />
      )}
      {doctorProfile && doctorProfile!.doctorType === 'STAR_APOLLO' && (
        <div>
          <Typography className={classes.starDoctorHeading}>
            Your Star Doctors Team (
            {
              doctorProfile!.starTeam!.filter(
                (existingDoc: GetDoctorDetails_getDoctorDetails_starTeam | null) =>
                  existingDoc!.isActive === true
              ).length
            }
            )
          </Typography>
          <StarDoctorsList
            currentDocId={doctorProfile && doctorProfile.id}
            starDoctors={doctorProfile && doctorProfile.starTeam!}
          />
        </div>
      )}

      <Grid container alignItems="flex-start" spacing={0} className={classes.btnContainer}>
        <Grid item lg={12} sm={12} xs={12}>
          <AphButton
            variant="contained"
            color="primary"
            classes={{ root: classes.saveButton }}
            onClick={() => props.onNext()}
          >
            SAVE AND PROCEED
          </AphButton>
        </Grid>
      </Grid>
    </div>
  );
};
