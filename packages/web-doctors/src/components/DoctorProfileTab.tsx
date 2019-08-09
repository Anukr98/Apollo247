import { makeStyles } from '@material-ui/styles';
import { Theme, IconButton, Card, CardHeader, Avatar, CircularProgress } from '@material-ui/core';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { AphButton } from '@aph/web-ui-components';
import { GetDoctorProfile } from 'graphql/types/GetDoctorProfile';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  REMOVE_STAR_DOCTOR,
  GET_DOCTOR_PROFILE,
  ADD_DOCTOR_TO_STAR_PROGRAM,
  GET_DOCTOR_DETAILS,
} from 'graphql/profiles';
import { MoreVert } from '@material-ui/icons';
import {
  RemoveDoctorFromStarDoctorProgramVariables,
  RemoveDoctorFromStarDoctorProgram,
} from 'graphql/types/RemoveDoctorFromStarDoctorProgram';
import {
  AddDoctorToStarDoctorProgram,
  AddDoctorToStarDoctorProgramVariables,
} from 'graphql/types/AddDoctorToStarDoctorProgram';
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
      padding: '10px 5px 10px 20px',
    },
    serviceItem: {
      padding: '0 0 10px 0',
      position: 'relative',
      height: '100%',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        display: 'flex',
      },
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
      minHeight: 120,
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
      minHeight: 120,
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
      // pointerEvents: 'none',
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
  doctor: GetDoctorDetails_getDoctorDetails_starTeam;
}
const StarDoctorCard: React.FC<StarDoctorCardProps> = (props) => {
  const { doctor } = props;
  //const moreButttonRef = useRef(null);
  //const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <div className={classes.details}>
        <CardHeader
          className={classes.cardHeader}
          avatar={
            <Avatar className={classes.profileAvatar}>
              <img src={require('images/doctor-profile.jpg')} />
            </Avatar>
          }
          action={
            <Mutation<RemoveDoctorFromStarDoctorProgram, RemoveDoctorFromStarDoctorProgramVariables>
              mutation={REMOVE_STAR_DOCTOR}
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
                      onClick={() => {
                        mutate({
                          variables: {
                            starDoctorId: '1234',
                            doctorId: '1234',
                          },
                        }).then(() => {
                          const existingData = client.readQuery<GetDoctorProfile>({
                            query: GET_DOCTOR_PROFILE,
                          });
                          const existingStarDoctorTeam =
                            (existingData &&
                              existingData.getDoctorProfile &&
                              existingData.getDoctorProfile &&
                              existingData.getDoctorProfile.starDoctorTeam) ||
                            [];
                          const newStarDoctorTeam = existingStarDoctorTeam.filter(
                            (existingDoc) =>
                              existingDoc.firstName !== doctor!.associatedDoctor!.firstName
                          );
                          const dataAfterMutation: GetDoctorProfile = {
                            ...existingData,
                            getDoctorProfile: {
                              ...existingData!.getDoctorProfile!,
                              starDoctorTeam: newStarDoctorTeam,
                            },
                          };
                          client.writeQuery({ query: GET_DOCTOR_PROFILE, data: dataAfterMutation });
                        });
                      }}
                    >
                      Remove Doctor
                    </Typography>
                  </Popover>
                </>
              )}
            </Mutation>
          }
          title={
            <div>
              <h4>
                Dr. {doctor!.associatedDoctor!.firstName} {doctor!.associatedDoctor!.lastName}
              </h4>
              {doctor!.isActive === true && (
                <h6>
                  <span>GENERAL PHYSICIAN | {doctor!.associatedDoctor!.experience} YRS</span>
                </h6>
              )}
            </div>
          }
          subheader={
            <div>
              {doctor!.isActive === true && (
                <span className={classes.qualification}>
                  MBBS, Internal Medicine Apollo Hospitals, Jubilee Hills
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

  const classes = useStyles();
  return (
    <Mutation<AddDoctorToStarDoctorProgram, AddDoctorToStarDoctorProgramVariables>
      mutation={ADD_DOCTOR_TO_STAR_PROGRAM}
    >
      {(mutate, { loading }) => (
        <Grid container alignItems="flex-start" spacing={0}>
          {starDoctors.map((doctor, index) => {
            return (
              doctor!.isActive === true && (
                <Grid item lg={4} sm={6} xs={12} key={index}>
                  <div className={classes.tabContentStarDoctor}>
                    <StarDoctorCard doctor={doctor!} />
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
                          starDoctorId: starDoctor.id,
                          doctorId: props.currentDocId,
                        },
                      }).then(() => {
                        const existingData = client.readQuery<GetDoctorProfile>({
                          query: GET_DOCTOR_PROFILE,
                        });
                        const existingStarDoctorTeam =
                          (existingData &&
                            existingData.getDoctorProfile &&
                            existingData.getDoctorProfile &&
                            existingData.getDoctorProfile.starDoctorTeam) ||
                          [];
                        const newStarDoctorTeam = existingStarDoctorTeam.concat(starDoctor);
                        const dataAfterMutation: GetDoctorProfile = {
                          ...existingData,
                          getDoctorProfile: {
                            ...existingData!.getDoctorProfile!,
                            starDoctorTeam: newStarDoctorTeam,
                          },
                        };
                        client.writeQuery({ query: GET_DOCTOR_PROFILE, data: dataAfterMutation });
                      });
                    }}
                  />
                </Typography>
              </div>
            </Grid>
          )}
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
        </Grid>
      )}
    </Mutation>
  );
};

interface DoctorDetailsProps {
  doctor: GetDoctorDetails_getDoctorDetails;
  clinics: GetDoctorDetails_getDoctorDetails_doctorHospital[];
}
const DoctorDetails: React.FC<DoctorDetailsProps> = (props) => {
  const { doctor, clinics } = props;
  const classes = useStyles();

  return (
    <div>
      <Typography variant="h2">Basic Details</Typography>
      <div className={classes.tabContent}>
        <Grid container alignItems="flex-start" spacing={0}>
          <Grid item lg={4} sm={6} xs={12}>
            <Paper className={classes.serviceItem}>
              <div className={classes.avatarBlock}>
                <img
                  alt=""
                  src={require('images/doctor-profile.jpg')}
                  className={classes.bigAvatar}
                />
                <img alt="" src={require('images/ic_star.svg')} className={classes.starImg} />
              </div>
              <Typography variant="h4">
                Dr. {doctor.firstName} {doctor.lastName}
              </Typography>
              <Typography variant="h6">
                {(doctor.specialty.name || '').toUpperCase()} <span> | </span>
                <span> {doctor.experience}YRS </span>
              </Typography>
            </Paper>
          </Grid>
          <Grid item lg={8} sm={6} xs={12} className={classes.tabLeftcontent}>
            <Grid container alignItems="flex-start" spacing={0}>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Education</Typography>
                  <Typography variant="h3">{doctor.qualification}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Awards</Typography>
                  <Typography variant="h3">{doctor.awards}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speciality</Typography>
                  <Typography variant="h3">{doctor.specialty.name}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Speaks</Typography>
                  <Typography variant="h3">{doctor.languages}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">Services</Typography>
                  <Typography variant="h3">{doctor.specialization}</Typography>
                </Paper>
              </Grid>
              <Grid item lg={6} sm={12} xs={12}>
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
              <Grid item lg={6} sm={12} xs={12}>
                <Paper className={classes.serviceItem}>
                  <Typography variant="h5">MCI Number</Typography>
                  <Typography variant="h3">{doctor.registrationNumber}</Typography>
                </Paper>
              </Grid>
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
  const classes = useStyles();
  const { data, error, loading } = useQuery<GetDoctorDetails>(GET_DOCTOR_DETAILS);
  const getDoctorDetailsData = data && data.getDoctorDetails ? data.getDoctorDetails : null;

  if (loading) return <CircularProgress />;
  if (error || !getDoctorDetailsData) return <div>error :(</div>;

  const doctorProfile = getDoctorDetailsData;
  const clinics = getDoctorDetailsData.doctorHospital || [];
  const starDoctors =
    getDoctorDetailsData!.starTeam!.filter((existingDoc) => existingDoc!.isActive === true) || [];
  const numStarDoctors = starDoctors.length;

  return (
    <div className={classes.ProfileContainer}>
      <DoctorDetails doctor={doctorProfile} clinics={clinics} />

      {doctorProfile.doctorType === 'STAR_APOLLO' && (
        <div>
          <Typography className={numStarDoctors === 0 ? classes.none : classes.starDoctorHeading}>
            Your Star Doctors Team ({numStarDoctors})
          </Typography>
          <StarDoctorsList currentDocId={doctorProfile.id} starDoctors={starDoctors} />
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
