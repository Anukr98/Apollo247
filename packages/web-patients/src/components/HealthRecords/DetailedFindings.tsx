import React from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Theme,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
} from '@material-ui/core';
import { MedicalTestUnit } from 'graphql/types/globalTypes';
import {
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response as LabResultsType,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response_labTestResults as LabTestResultsType,
} from '../../graphql/types/getPatientPrismMedicalRecords';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: 'transparent',
      boxShadow: 'none',
      marginBottom: '12px !important',
      '&:before': {
        display: 'none',
      },
    },
    panelHeader: {
      padding: '4px 20px',
      fontSize: 14,
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
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 5px 20px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      padding: 20,
      display: 'inline-block',
      width: '100%',
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: '#02475b',
      letterSpacing: 0.02,
      paddingBottom: 8,
    },
    cardSection: {
      padding: '16px 10px',
      backgroundColor: 'transparent',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: 500,
      color: '#0087ba',
      lineHeight: 1.43,
      minHeight: 75,
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
    resultGroup: {
      display: 'flex',
      '& label': {
        fontSize: 12,
        fontWeight: 500,
        color: '#01475b',
      },
    },
    result: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: 0.04,
      color: '#0087ba',
      marginLeft: 'auto',
    },
    resultError: {
      color: '#d10001',
    },
    labtest: {
      marginRight: 10,
      position: 'relative',
      top: 6,
    },
    bullet: {
      width: 5,
      height: 5,
      borderRadius: '50%',
      backgroundColor: '#02475B',
      display: 'inline-block',
      marginRight: 12,
    },
  };
});

type DetailedFindingsProps = {
  activeData: LabResultsType;
};

export const MedicalTest = [
  { value: 'gm', key: MedicalTestUnit.GM },
  {
    value: 'gm/dl',
    key: MedicalTestUnit.GM_SLASH_DL,
  },
  {
    value: '%', //replaceStringWithChar(MedicalTestUnit._PERCENT_),
    key: MedicalTestUnit._PERCENT_,
  },
];

export const DetailedFindings: React.FC<DetailedFindingsProps> = (props) => {
  const classes = useStyles({});
  const { activeData } = props;
  return (
    activeData &&
    activeData.labTestResults && (
      <ExpansionPanel className={classes.root} defaultExpanded={true}>
        <ExpansionPanelSummary
          expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
          classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
        >
          Detailed Findings
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.panelDetails}>
          <Grid container spacing={2}>
            {activeData.labTestResults.map((detail: LabTestResultsType) => {
              const unit = MedicalTest.find((item) => item.key === detail.unit);
              return (
                <Grid item xs={12} sm={12}>
                  {/* icon should come here */}
                  <div className={classes.cardTitle}>
                    <img
                      className={classes.labtest}
                      src={require('images/ic_labtest.svg')}
                      alt=""
                    />{' '}
                    Impressions
                  </div>
                  <div className={classes.cardSection}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={12}>
                        <div className={classes.resultGroup}>
                          <label>
                            <span className={classes.bullet}></span>Normal Range
                          </label>
                          <div className={`${classes.result}`}>
                            {detail.range ? detail.range : '-'}
                          </div>
                        </div>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <div className={classes.resultGroup}>
                          <label>
                            <span className={classes.bullet}></span>Units
                          </label>
                          <div className={classes.result}>
                            {unit ? unit.value : detail.unit || 'N/A'}
                          </div>
                        </div>
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <div className={classes.resultGroup}>
                          <label>
                            <span className={classes.bullet}></span>Result
                          </label>
                          <div className={classes.result}>{detail.result || 'N/A'}</div>
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  );
};
