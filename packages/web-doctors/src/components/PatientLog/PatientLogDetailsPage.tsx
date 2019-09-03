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
import { GetCaseSheet_getCaseSheet_patientDetails } from 'graphql/types/GetCaseSheet';

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
  };
});
type Params = { appointmentId: string };
export const PatientLogDetailsPage: React.FC = () => {
  const classes = useStyles();
  const params = useParams<Params>();
  const appointmentId = params.appointmentId;
  const [expanded, setExpanded] = useState<string | boolean>('');
  const [
    patientDetails,
    setPatientDetails,
  ] = useState<GetCaseSheet_getCaseSheet_patientDetails | null>(null);
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
        _data!.data!.getCaseSheet!.patientDetails
          ? setPatientDetails((_data!.data!.getCaseSheet!
              .patientDetails! as unknown) as GetCaseSheet_getCaseSheet_patientDetails)
          : setPatientDetails(null);
      });
  }, [appointmentId]);

  return (
    <div className={classes.container}>
      <div className={classes.caseSheet}>
        <section className={`${classes.column} ${classes.right}`}>
          <PatientDetailsUserCard patientDetails={patientDetails} />
        </section>
        <section className={classes.column}>
          {/* Patient Health Vault Panel */}
          <ExpansionPanel expanded={true} className={classes.expandIcon}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Past Consultations</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <PastConsultation />
            </ExpansionPanelDetails>
          </ExpansionPanel>

          {/* Patient History & Lifestyle */}
          <ExpansionPanel
            expanded={expanded === 'otherInstructions'}
            onChange={handlePanelExpansion('otherInstructions')}
            className={classes.expandIcon}
          >
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Patient History & Lifestyle</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails></ExpansionPanelDetails>
          </ExpansionPanel>
          {/* Patient Health Vault */}
          <ExpansionPanel className={classes.expandIcon}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h3">Patient Health Vault</Typography>
            </ExpansionPanelSummary>
          </ExpansionPanel>
        </section>
      </div>
    </div>
  );
};
