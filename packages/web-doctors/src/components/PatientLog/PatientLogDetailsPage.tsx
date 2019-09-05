import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from '@material-ui/core';
import { useApolloClient } from 'react-apollo-hooks';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useParams } from 'hooks/routerHooks';
import { GET_CASESHEET } from 'graphql/profiles';
import {
  GetCaseSheet_getCaseSheet_patientDetails,
  GetCaseSheet_getCaseSheet_caseSheetDetails_diagnosis,
  GetCaseSheet_getCaseSheet_pastAppointments,
} from 'graphql/types/GetCaseSheet';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { Header } from 'components/Header';
import { PatientDetailLifeStyle } from 'components/PatientLog/PatientDetailPanels/PatientDetailLifeStyle';
import { PastConsultation } from 'components/PatientLog/PatientDetailPanels/PastConsultation';
import { PatientDetailsUserCard } from 'components/PatientLog/PatientDetailsUserCard';
//import { GetJuniorDoctorCaseSheet } from 'graphql/types/GetJuniorDoctorCaseSheet';
import { GetCaseSheet } from 'graphql/types/GetCaseSheet';

const useStyles = makeStyles((theme: Theme) => {
  return {
    container: {
      padding: 20,
    },
    caseSheet: {
      minHeight: 'calc(100vh - 360px)',
      display: 'flex',
      flexFlow: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
      '& .Mui-expanded': {
        margin: '5px 0 0 0 !important',
        minHeight: 20,
        paddingBottom: 0,
        paddingRight: 6,
        paddingTop: 3,
      },
      '& div': {
        color: '#000',
      },
      [theme.breakpoints.down('xs')]: {
        display: 'block',
      },
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    right: {
      flex: 'initial',
      margin: '0 15px 0 0',
      minWidth: 300,
      maxWidth: 300,
      [theme.breakpoints.down('xs')]: {
        margin: '0 0 15px 0',
        maxWidth: '100%',
        minWidth: 200,
      },
      '& h2': {
        fontSize: 20,
        lineHeight: 'normal',
        fontWeight: 600,
        color: '#02475b',
      },
      '& h5': {
        fontSize: 16,
        lineHeight: 'normal',
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.8)',
        marginBottom: 10,
        textTransform: 'capitalize',
      },
      '& h6': {
        fontSize: 14,
        lineHeight: 'normal',
        fontWeight: 500,
        color: 'rgba(2, 71, 91, 0.8)',
        marginBottom: 10,
      },
      '& hr': {
        marginBottom: 10,
      },
    },
    expandIcon: {
      color: '#02475b',
      margin: '5px 0',
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      backgroundColor: '#fff',
      '&:before': {
        backgroundColor: 'transparent',
      },
      '&:first-child': {
        marginTop: 0,
      },
      '& h3': {
        fontSize: 17,
        fontWeight: theme.typography.fontWeightMedium,
        color: '#01475b',
        lineHeight: '24px',
        padding: '4px 0',
      },
    },
    divider: {
      margin: '20px 0',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    notesHeader: {
      color: '#0087ba',
      fontSize: 17,
      fontWeight: 500,
      marginBottom: 10,
    },
    notesContainer: {
      padding: 16,
      backgroundColor: '#fff',
    },
    textFieldColor: {
      '& input': {
        color: 'initial',
        '& :before': {
          border: 0,
        },
      },
    },
    textFieldWrapper: {
      border: 'solid 1px #30c1a3',
      borderRadius: 10,
      padding: 16,
      color: '#01475b',
      fontSize: 14,
      fontWeight: 500,
    },
    headerSticky: {
      position: 'fixed',
      width: '100%',
      zIndex: 999,
      top: 0,
    },
    blackArrow: {
      verticalAlign: 'middle',
      [theme.breakpoints.up(1220)]: {
        display: 'none',
      },
    },
    backArrow: {
      cursor: 'pointer',
      marginRight: 50,

      [theme.breakpoints.up(1220)]: {
        position: 'absolute',
        paddingTop: '76px',
        width: 48,
        height: 48,
        lineHeight: '36px',
        borderRadius: '50%',
        textAlign: 'center',
        backgroundColor: '#02475b',
      },
      '& img': {
        verticalAlign: 'bottom',
      },
    },
  };
});
type Params = { appointmentId: string; consultscount: string };
export const PatientLogDetailsPage: React.FC = () => {
  const classes = useStyles();
  const params = useParams<Params>();
  const appointmentId = params.appointmentId;
  const consultscount = params.consultscount;
  const [expanded, setExpanded] = useState<string | boolean>('');
  const [casesheetInfo, setCasesheetInfo] = useState<any>(null);
  const [
    patientDetails,
    setPatientDetails,
  ] = useState<GetCaseSheet_getCaseSheet_patientDetails | null>(null);
  const [pastAppointments, setPastAppointments] = useState<
    GetCaseSheet_getCaseSheet_pastAppointments[] | null
  >(null);
  const handlePanelExpansion = (panelName: string) => (
    e: React.ChangeEvent<{}>,
    isExpanded: boolean
  ) => setExpanded(isExpanded ? panelName : false);
  const client = useApolloClient();

  useEffect(() => {
    client
      .query<GetCaseSheet>({
        query: GET_CASESHEET,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: appointmentId },
      })
      .then((_data) => {
        setCasesheetInfo(_data.data);
        _data!.data!.getCaseSheet!.patientDetails
          ? setPatientDetails((_data!.data!.getCaseSheet!
              .patientDetails! as unknown) as GetCaseSheet_getCaseSheet_patientDetails)
          : setPatientDetails(null);
        _data!.data!.getCaseSheet!.caseSheetDetails!.diagnosis !== null
          ? setPastAppointments((_data!.data!.getCaseSheet!
              .pastAppointments as unknown) as GetCaseSheet_getCaseSheet_pastAppointments[])
          : setPastAppointments([]);
      });
  }, [appointmentId]);

  return (
    <div className={classes.container}>
      <div className={classes.caseSheet}>
        <div className={classes.headerSticky}>
          <Header />
        </div>

        <Grid container alignItems="flex-start" spacing={0}>
          <Grid item lg={1} sm={6} xs={12}>
            <Link to="/patientlog">
              <div className={classes.backArrow}>
                <img className={classes.blackArrow} src={require('images/ic_back.svg')} />
              </div>
            </Link>
          </Grid>
          <Grid item lg={2} sm={6} xs={12}>
            <section className={`${classes.column} ${classes.right}`}>
              <PatientDetailsUserCard
                patientDetails={patientDetails}
                consultscount={consultscount}
              />
            </section>
          </Grid>
          <Grid item lg={9} sm={6} xs={12}>
            <section className={classes.column}>
              {/* Patient Health Vault Panel */}
              <ExpansionPanel expanded={true} className={classes.expandIcon}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h3">Past Consultations</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  {casesheetInfo &&
                    casesheetInfo.getCaseSheet &&
                    casesheetInfo.getCaseSheet.pastAppointments && (
                      <PastConsultation
                        pastAppointments={
                          casesheetInfo &&
                          casesheetInfo.getCaseSheet &&
                          casesheetInfo.getCaseSheet.pastAppointments
                        }
                      />
                    )}
                </ExpansionPanelDetails>
              </ExpansionPanel>

              {/* Patient History & Lifestyle Panel */}
              <ExpansionPanel
                expanded={expanded === 'lifestyle'}
                onChange={handlePanelExpansion('lifestyle')}
                className={classes.expandIcon}
              >
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h3">Patient History &amp; Lifestyle</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <PatientDetailLifeStyle patientDetails={patientDetails} />
                </ExpansionPanelDetails>
              </ExpansionPanel>
              {/* Patient Health Vault */}
              <ExpansionPanel className={classes.expandIcon}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h3">Patient Health Vault</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <span>No data Found</span>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </section>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
