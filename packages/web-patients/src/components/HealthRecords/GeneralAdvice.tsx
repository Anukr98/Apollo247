import React from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
} from '@material-ui/core';
import {
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet as CaseSheetType,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults_caseSheet_otherInstructions as OtherInstructionType,
} from '../../graphql/types/getPatientPastConsultsAndPrescriptions';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      marginBottom: '12px !important',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '4px 20px',
      fontSize: 16,
      fontWeight: 500,
      color: '#02475b',
      textTransform: 'uppercase',
    },
    panelExpanded: {
      minHeight: 'auto !important',
      '& >div:first-child': {
        marginTop: 12,
        marginBottom: 12,
      },
    },
    panelDetails: {
      padding: 20,
      paddingTop: 0,
      display: 'inline-block',
      width: '100%',
    },
    noWrapper: {
      color: '#01475b',
      fontWeight: 500,
      fontSize: 14,
      textTransform: 'uppercase',
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      letterSpacing: 0.02,
      paddingBottom: 8,
      opacity: 0.8,
    },
    cardSection: {
      padding: 12,
      backgroundColor: '#f7f8f5',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      lineHeight: 1.43,
      minHeight: 84,
      '& ol': {
        paddingLeft: 20,
        margin: 0,
        '& li': {
          paddingLeft: 10,
        },
      },
    },
    bottomActions: {
      paddingTop: 20,
      paddingBottom: 10,
      textAlign: 'right',
      '& button': {
        color: '#fc9916',
        fontSize: 14,
        fontWeight: 600,
        boxShadow: 'none',
        padding: 0,
        border: 'none',
        backgroundColor: 'transparent',
      },
    },
  };
});

type GeneralAdviceProps = {
  caseSheetList: (CaseSheetType | null)[] | null;
};

export const GeneralAdvice: React.FC<GeneralAdviceProps> = (props) => {
  const classes = useStyles({});
  const caseSheetList = props.caseSheetList;

  const adviceList: OtherInstructionType[] = [];

  caseSheetList &&
    caseSheetList.length > 0 &&
    caseSheetList.forEach(
      (caseSheet: CaseSheetType | null) =>
        caseSheet &&
        caseSheet.doctorType !== 'JUNIOR' &&
        caseSheet.otherInstructions &&
        caseSheet.otherInstructions.length > 0 &&
        caseSheet.otherInstructions.forEach(
          (advice: OtherInstructionType | null) => advice && adviceList.push(advice)
        )
    );

  return (
    <ExpansionPanel className={classes.root} defaultExpanded={true}>
      <ExpansionPanelSummary
        expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
        classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
      >
        General Advice
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.panelDetails}>
        <Grid container spacing={2}>
          <Grid item sm={12}>
            {adviceList && adviceList.length > 0 ? (
              <div className={classes.cardSection}>
                <ol>
                  {adviceList.map((advice: OtherInstructionType) => (
                    <li>{advice.instruction}</li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className={classes.noWrapper}>No Advice</div>
            )}
          </Grid>
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
