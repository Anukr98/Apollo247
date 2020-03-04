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
    cardTitle: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      letterSpacing: 0.02,
      paddingBottom: 8,
      opacity: 0.8,
    },
    cardSection: {
      padding: 16,
      backgroundColor: '#f7f8f5',
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
    },
    resultError: {
      color: '#d10001',
    },
  };
});

type DetailedFindingsProps = {
  activeData: any;
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
  const { data } = props.activeData;

  return (
    <ExpansionPanel className={classes.root} defaultExpanded={true}>
      <ExpansionPanelSummary
        expandIcon={<img src={require('images/ic_accordion_down.svg')} alt="" />}
        classes={{ root: classes.panelHeader, expanded: classes.panelExpanded }}
      >
        Detailed Findings
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={classes.panelDetails}>
        <Grid container spacing={2}>
          {data &&
            (
              (data.medicalRecordParameters && data.medicalRecordParameters) ||
              (data.labTestResultParameters && data.labTestResultParameters)
            ).map((detail: any) => {
              const unit = MedicalTest.find((item) => item.key === detail.unit);
              return (
                <Grid item xs={12} sm={12}>
                  <div className={classes.cardTitle}>
                    {detail.setParameter ? detail.parameterName : 'SUMMARY'}
                  </div>
                  <div className={classes.cardSection}>
                    <Grid container spacing={2}>
                      {detail.setParameter ? (
                        <>
                          <Grid item xs={6} sm={3}>
                            <div className={classes.resultGroup}>
                              <label>Result</label>
                              <div className={classes.result}>{detail.result}</div>
                            </div>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <div className={classes.resultGroup}>
                              <label>Units</label>
                              <div className={classes.result}>
                                {unit ? unit.value : detail.unit}
                              </div>
                            </div>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <div className={classes.resultGroup}>
                              <label>Normal Range</label>
                              <div className={`${classes.result}`}>
                                {detail.minimum} - {detail.maximum}
                              </div>
                            </div>
                          </Grid>
                        </>
                      ) : (
                        <div className={classes.result}>{detail.result}</div>
                      )}
                    </Grid>
                  </div>
                </Grid>
              );
            })}
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
