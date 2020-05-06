import { makeStyles } from '@material-ui/styles';
import { MoreVert } from '@material-ui/icons';
import React, { useState, useContext, useEffect } from 'react';
import { LoggedInUserType } from 'graphql/types/globalTypes';
import { AuthContext, AuthContextProps } from 'components/AuthProvider';
import { AphButton } from '@aph/web-ui-components';
import { ApolloError } from 'apollo-client';
import {
  Theme,
  IconButton,
  Card,
  CardHeader,
  Avatar,
  CircularProgress,
  FormControl,
  MenuItem,
} from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { useApolloClient } from 'react-apollo-hooks';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';

import { GetSecretaryList } from 'graphql/types/GetSecretaryList';
import { GET_SECRETARY_LIST } from 'graphql/profiles';
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

import { AddSecretary, AddSecretaryVariables } from 'graphql/types/AddSecretary';
import {
  REMOVE_TEAM_DOCTOR_FROM_STAR_TEAM,
  GET_DOCTOR_DETAILS,
  MAKE_TEAM_DOCTOR_ACTIVE,
  ADD_SECRETARY,
  REMOVE_SECRETARY,
} from 'graphql/profiles';
import {
  MakeTeamDoctorActive,
  MakeTeamDoctorActiveVariables,
} from 'graphql/types/MakeTeamDoctorActive';
import { RemoveSecretaryVariables, RemoveSecretary } from 'graphql/types/RemoveSecretary';

import { Mutation } from 'react-apollo';
import { AphSelect } from '@aph/web-ui-components';

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
      padding: '16px 20px 10px 20px',
      marginBottom: 20,
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
    menuPopover: {
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      marginLeft: -2,
      marginTop: 45,
      borderRadius: 10,
      left: '270px',
      width: '450px',
      '& ul': {
        padding: '10px 0px',
        '& li': {
          fontSize: 18,
          width: 480,
          fontWeight: 500,
          color: '#02475b',
          minHeight: 'auto',
          paddingLeft: 10,
          paddingRight: 10,
          '&:last-child': {
            borderBottom: 'none',
          },
          '&:hover': {
            backgroundColor: '#f0f4f5',
          },
        },
      },
    },
    menuSelected: {
      backgroundColor: 'transparent !important',
      color: '#00b38e !important',
    },
    secretaryGrid: {
      marginBottom: 15,
    },
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
        fontWeight: 600,
        color: '#02475b',
        margin: 0,
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
        margin: 0,
        fontWeight: 600,
        '& span': {
          padding: '0 2px',
        },
      },
    },

    qualificationMini: {
      color: '#658f9b',
      display: 'block',
      overflow: 'hidden',
      fontSize: 12,
      maxWidth: 400,
      whiteSpace: 'nowrap',
      paddingRight: 20,
      textOverflow: 'ellipsis',
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
                <Grid item lg={6} sm={6} xs={12} key={index}>
                  <div className={classes.tabContentStarDoctor}>
                    <StarDoctorCard doctor={doctor!} currentDocId={currentDocId} />
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
                      }).then((res) => {
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
  const [popOver, setPopOver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [secretaryName, setSecretaryName] = useState<string>('');
  const [secretaryList, setSecretaryList] = useState<GetSecretaryList>();
  const useAuthContext = () => useContext<AuthContextProps>(AuthContext);
  const { currentUserType, doctorSecretary } = useAuthContext();
  const addDoctorSecretary = useAuthContext().addDoctorSecretary!;
  const classes = useStyles({});
  const [secretary, setSecretary] = useState<string>('');
  const client = useApolloClient();
  const [anchorEl, setAnchorEl] = React.useState((null as unknown) as HTMLButtonElement);

  const getSecretary = () => {
    setLoading(true);
    client
      .query<GetSecretaryList>({ query: GET_SECRETARY_LIST, fetchPolicy: 'no-cache' })
      .then((_data) => {
        setSecretaryList(_data.data);
      })
      .catch((e) => {
        console.log('Error occured while fetching secretary', e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (doctorSecretary === null && doctor && doctor.doctorSecretary) {
      client
        .query<GetDoctorDetails>({ query: GET_DOCTOR_DETAILS, fetchPolicy: 'no-cache' })
        .then((_data) => {
          addDoctorSecretary(
            _data.data.getDoctorDetails!.doctorSecretary
              ? _data.data.getDoctorDetails!.doctorSecretary!.secretary
              : null
          );
        })
        .catch((e) => {
          console.log('Error occured while fetching Doctor', e);
        });
    }
    if (currentUserType !== LoggedInUserType.SECRETARY) {
      getSecretary();
    }
  }, []);

  const doctorProfile = doctor;
  function handleClicks(event: React.MouseEvent<HTMLButtonElement>, id: string) {
    setAnchorEl(event.currentTarget);
    setPopOver(true);
  }
  function handleClose() {
    setAnchorEl((null as unknown) as HTMLButtonElement);
    setPopOver(false);
  }
  return (
    <div>
      {loading && <CircularProgress />}
      <h2>Your Profile</h2>
      {doctorProfile && (
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
                  <Typography variant="h3" style={{ whiteSpace: 'pre-line' }}>
                    {doctorProfile.awards
                      .replace('&amp;', '&')
                      .replace(/<\/?[^>]+>/gi, '')
                      .trim()}
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

            {doctorProfile.doctorType !== 'PAYROLL' && (
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
            )}
          </Grid>
        </div>
      )}

      {doctorProfile && (
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
      )}
      {doctorProfile && currentUserType !== LoggedInUserType.SECRETARY && (
        <div className={classes.ProfileContainer}>
          <h2>Secretary Login</h2>
          {doctorSecretary && (
            <Grid container alignItems="flex-start" spacing={0}>
              <Grid item lg={6} sm={6} xs={12} className={classes.secretaryGrid}>
                <Card className={classes.card}>
                  <div className={classes.details}>
                    <CardHeader
                      className={classes.cardHeader}
                      avatar={
                        <Avatar className={classes.profileAvatar}>
                          <img src={require('images/no_photo.png')} />
                        </Avatar>
                      }
                      action={
                        <Mutation<RemoveSecretary, RemoveSecretaryVariables>
                          mutation={REMOVE_SECRETARY}
                        >
                          {(mutate, { loading }) => (
                            <>
                              <IconButton
                                onClick={(e) => {
                                  handleClicks(
                                    e,
                                    `${doctorProfile &&
                                      doctorProfile.doctorSecretary &&
                                      doctorProfile.doctorSecretary.secretary &&
                                      doctorProfile.doctorSecretary.secretary.id}`
                                  );
                                }}
                              >
                                {loading ? <CircularProgress /> : <MoreVert />}
                              </IconButton>
                              <Popover
                                open={popOver}
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
                                    setPopOver(false);
                                    client
                                      .mutate<RemoveSecretary, RemoveSecretaryVariables>({
                                        mutation: REMOVE_SECRETARY,
                                        variables: {
                                          secretaryId: `${doctorSecretary!.id!}`,
                                        },
                                        fetchPolicy: 'no-cache',
                                      })
                                      .then((res: any) => {
                                        setSecretaryName('');

                                        addDoctorSecretary(null);
                                      })
                                      .catch((e: ApolloError) => {
                                        console.log(e);
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
                          <h4 title={''}>{doctorSecretary.name}</h4>
                          <div>
                            <h6>
                              <span className={classes.qualificationMini}>SECRETARY | 15 YRS</span>
                            </h6>
                          </div>
                        </div>
                      }
                    />
                    {}
                  </div>
                </Card>
              </Grid>
            </Grid>
          )}
          {doctorSecretary === null && (
            <div className={`${classes.tabContent} ${classes.awardsSection}`}>
              <h3>Please select the secretary</h3>
              <FormControl fullWidth>
                {
                  <Mutation<AddSecretary, AddSecretaryVariables> mutation={ADD_SECRETARY}>
                    {(mutate, { loading }) => (
                      <AphSelect
                        value={secretary}
                        MenuProps={{
                          classes: { paper: classes.menuPopover },
                          anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                        }}
                        onChange={(e: any) => {
                          const secretaryId =
                            secretaryList &&
                            secretaryList.getSecretaryList &&
                            secretaryList.getSecretaryList.map((item) => {
                              if (item!.name === e.target.value) {
                                return item!.id;
                              }
                              return null;
                            });
                          client
                            .mutate<AddSecretary, AddSecretaryVariables>({
                              mutation: ADD_SECRETARY,
                              variables: {
                                secretaryId: `${secretaryId &&
                                  secretaryId.length > 0 &&
                                  secretaryId[0]}`,
                              },
                              fetchPolicy: 'no-cache',
                            })
                            .then((res: any) => {
                              setSecretaryName(
                                res &&
                                  res.data &&
                                  res.data.addSecretary &&
                                  res.data.addSecretary.secretary &&
                                  res.data.addSecretary.secretary.name
                              );
                              addDoctorSecretary(
                                res &&
                                  res.data &&
                                  res.data.addSecretary &&
                                  res.data.addSecretary.secretary
                              );
                            })
                            .catch((e: ApolloError) => {
                              console.log(e);
                            });
                        }}
                      >
                        {secretaryList &&
                          secretaryList.getSecretaryList &&
                          secretaryList.getSecretaryList.map((item: any) => {
                            return (
                              <MenuItem
                                key={item.id}
                                value={item.name}
                                classes={{ selected: classes.menuSelected }}
                              >
                                {item && item.name}
                              </MenuItem>
                            );
                          })}
                      </AphSelect>
                    )}
                  </Mutation>
                }
              </FormControl>
            </div>
          )}
        </div>
      )}
      <div className={classes.helpTxt}>
        <img alt="" src={require('images/ic_info.svg')} className={classes.navLeftIcon} />
        Call <span className={classes.orange}>1800 - 3455 - 3455 </span>to make any changes
      </div>
    </div>
  );
};
