import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab, Avatar, CircularProgress } from '@material-ui/core';
import { AphButton } from '@aph/web-ui-components';
import { AphCheckbox } from 'components/AphCheckbox';
import Scrollbars from 'react-custom-scrollbars';
import { useMutation } from 'react-apollo-hooks';
import { GET_PAST_CONSULTS_PRESCRIPTIONS } from 'graphql/profiles';
import {
  getPatientPastConsultsAndPrescriptions,
  getPatientPastConsultsAndPrescriptionsVariables,
  getPatientPastConsultsAndPrescriptions_getPatientPastConsultsAndPrescriptions_consults as Prescription,
} from 'graphql/types/getPatientPastConsultsAndPrescriptions';
import { useAllCurrentPatients } from 'hooks/authHooks';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      borderRadius: 5,
      display: 'flex',
      textAlign: 'left',
      backgroundColor: '#f7f8f5',
      zIndex: 999,
    },
    tabsWrapper: {
      width: '100%',
      padding: '0 0 20px 0',
    },
    prescriptionGroup: {
      fontSize: 14,
      fontWeight: 500,
      color: '#01475b',
      display: 'flex',
      padding: '12px 15px 0 15px ',
      '&:nth-child(1)': {
        padding: '15px 15px 0 15px',
      },
      '&:last-child': {
        padding: '12px 15px 15px 15px',
      },
    },
    checkbox: {
      alignItems: 'baseline',
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    closeBtn: {
      marginLeft: 'auto',
      paddingLeft: 20,
      '& button': {
        borderRadius: 0,
        boxShadow: 'none',
        padding: 0,
        minWidth: 'auto',
      },
    },
    imgThumb: {
      paddingRight: 12,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    followUpText: {
      opacity: 0.6,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      color: '#02475b',
    },
    progressRoot: {
      height: 2,
      marginTop: 5,
    },
    priscriptionInfo: {
      paddingTop: 5,
      fontSize: 12,
      fontWeight: 500,
      color: '#0087ba',
      lineHeight: '1.67px',
      letterSpacing: 0.04,
      display: 'inline-block',
      width: '100%',
      '& span': {
        borderRight: '0.5px solid rgba(2,71,91,0.3)',
        paddingRight: 10,
        marginRight: 10,
      },
      '& span:last-child': {
        marginRight: 0,
        paddingRight: 0,
        border: 'none',
      },
    },
    name: {
      opacity: 0.6,
      color: '#02475b',
    },
    date: {
      opacity: 0.6,
      color: '#02475b',
    },
    tabsRoot: {
      borderBottom: '0.5px solid rgba(2,71,91,0.3)',
      backgroundColor: '#fff',
      '& span': {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#02475b',
      },
    },
    tabRoot: {
      fontSize: 14,
      fontWeight: 500,
      textAlign: 'center',
      padding: '15px 10px',
      color: '#01475b',
      opacity: 0.6,
      minWidth: '50%',
      textTransform: 'none',
    },
    tabSelected: {
      color: theme.palette.secondary.dark,
      opacity: 1,
    },
    tabsIndicator: {
      backgroundColor: '#00b38e',
      height: 5,
    },
    rootTabContainer: {
      padding: 0,
    },
    followUpWrapper: {
      backgroundColor: '#fff',
      margin: '0 0 0 8px',
      borderRadius: 5,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      width: '100%',
      padding: 10,
    },
    followUpDetails: {
      display: 'flex',
      alignItems: 'baseline',
    },
    fileInfo: {
      display: 'flex',
      margin: '10px 0 0 0',
    },
    doctorImage: {
      borderRadius: '50%',
      margin: '0 13px 0 0',
    },
    doctorName: {
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
    },
    patientHistory: {
      opacity: 0.6,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      color: '#02475b',
      '& span': {
        margin: '0 5px 0 0',
      },
    },
    cbcText: {
      margin: '10px 0 0 0',
      fontSize: 16,
      color: '#01475b',
    },
    typeOfClinic: {
      opacity: 0.6,
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.67,
      color: '#02475b',
    },
    uploadPrescription: {
      width: '100%',
      borderRadius: 10,
    },
    uploadButtonWrapper: {
      padding: '0 20px',
      margin: '15px 0 0 0',
    },
  };
});

const TabContainer: React.FC = (props) => {
  return <Typography component="div">{props.children}</Typography>;
};

type EPrescriptionCardProps = {
  setIsEPrescriptionOpen?: (isEPrescriptionOpen: boolean) => void;
  setPhrPrescriptionData?: (phrPrescriptionData: Prescription[]) => void;
};

export const UploadEPrescriptionCard: React.FC<EPrescriptionCardProps> = (props) => {
  const classes = useStyles({});
  const [tabValue, setTabValue] = useState<number>(0);
  const { currentPatient } = useAllCurrentPatients();
  const [pastPrescriptions, setPastPrescriptions] = useState<Prescription[] | null>(null);

  const patientPastConsultAndPrescriptionMutation = useMutation<
    getPatientPastConsultsAndPrescriptions,
    getPatientPastConsultsAndPrescriptionsVariables
  >(GET_PAST_CONSULTS_PRESCRIPTIONS, {
    variables: {
      consultsAndOrdersInput: {
        patient: currentPatient && currentPatient.id ? currentPatient.id : '',
      },
    },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (!pastPrescriptions) {
      patientPastConsultAndPrescriptionMutation()
        .then(({ data }: any) => {
          if (
            data &&
            data.getPatientPastConsultsAndPrescriptions &&
            data.getPatientPastConsultsAndPrescriptions.consults
          ) {
            setPastPrescriptions(data.getPatientPastConsultsAndPrescriptions.consults);
          }
        })
        .catch((e) => console.log(e));
    }
  }, [pastPrescriptions]);

  const selectedPrescriptions: Prescription[] = [];

  return (
    <div className={classes.root}>
      <div className={classes.tabsWrapper}>
        <Tabs
          value={tabValue}
          classes={{
            root: classes.tabsRoot,
            indicator: classes.tabsIndicator,
          }}
          onChange={(e, newValue) => {
            setTabValue(newValue);
          }}
        >
          <Tab
            classes={{
              root: classes.tabRoot,
              selected: classes.tabSelected,
            }}
            label="Consults & Rx (18)"
          />
          <Tab
            classes={{
              root: classes.tabRoot,
              selected: classes.tabSelected,
            }}
            disabled
            label="Medical Records (27)"
          />
        </Tabs>
        {tabValue === 0 && (
          <TabContainer>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(45vh)'}>
              {pastPrescriptions && pastPrescriptions.length > 0 ? (
                pastPrescriptions.map((pastPrescription) => (
                  <div className={classes.prescriptionGroup}>
                    <AphCheckbox
                      onChange={() => selectedPrescriptions.push(pastPrescription)}
                      className={classes.checkbox}
                      color="primary"
                    />
                    <div className={classes.followUpWrapper}>
                      <div className={classes.followUpDetails}>
                        <div className={classes.imgThumb}>
                          <img src={require('images/ic_prescription_blue.svg')} alt="" />
                        </div>
                        <div className={classes.followUpText}>Follow-up to 20 Apr 2019</div>
                      </div>
                      <div className={classes.fileInfo}>
                        <Avatar
                          className={classes.doctorImage}
                          src={require('images/doctordp_01.png')}
                        />
                        <div>
                          <div className={classes.doctorName}>
                            Dr.{' '}
                            {pastPrescription.doctorInfo && pastPrescription.doctorInfo.firstName}
                          </div>
                          <div className={classes.patientHistory}>
                            {pastPrescription.caseSheet &&
                              pastPrescription.caseSheet.length > 0 &&
                              pastPrescription.caseSheet.map((caseSheet) =>
                                caseSheet && caseSheet.symptoms
                                  ? caseSheet.symptoms.map(
                                      (symptomData) =>
                                        symptomData &&
                                        symptomData.symptom && <span>{symptomData.symptom} </span>
                                    )
                                  : null
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <CircularProgress />
              )}
            </Scrollbars>
          </TabContainer>
        )}
        {tabValue === 1 && (
          <TabContainer>
            <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(45vh)'}>
              <div className={classes.prescriptionGroup}>
                <AphCheckbox className={classes.checkbox} color="primary" />
                <div className={classes.followUpWrapper}>
                  <div className={classes.followUpDetails}>
                    <div className={classes.followUpText}>12th August 2019</div>
                  </div>
                  <div>
                    <div className={classes.cbcText}>CBC</div>
                    <div className={classes.typeOfClinic}>Apollo Sugar Clinic, Hyderabad</div>
                  </div>
                </div>
              </div>
              <div className={classes.prescriptionGroup}>
                <AphCheckbox className={classes.checkbox} color="primary" />
                <div className={classes.followUpWrapper}>
                  <div className={classes.followUpDetails}>
                    <div className={classes.followUpText}>12th August 2019</div>
                  </div>
                  <div>
                    <div className={classes.cbcText}>CBC</div>
                    <div className={classes.typeOfClinic}>Apollo Sugar Clinic, Hyderabad</div>
                  </div>
                </div>
              </div>
              <div className={classes.prescriptionGroup}>
                <AphCheckbox className={classes.checkbox} color="primary" />
                <div className={classes.followUpWrapper}>
                  <div className={classes.followUpDetails}>
                    <div className={classes.followUpText}>12th August 2019</div>
                  </div>
                  <div>
                    <div className={classes.cbcText}>CBC</div>
                    <div className={classes.typeOfClinic}>Apollo Sugar Clinic, Hyderabad</div>
                  </div>
                </div>
              </div>
            </Scrollbars>
          </TabContainer>
        )}
        <div className={classes.uploadButtonWrapper}>
          <AphButton
            onClick={() => {
              props.setPhrPrescriptionData && props.setPhrPrescriptionData(selectedPrescriptions);
              props.setIsEPrescriptionOpen && props.setIsEPrescriptionOpen(false);
            }}
            className={classes.uploadPrescription}
            color="primary"
          >
            Upload
          </AphButton>
        </div>
      </div>
    </div>
  );
};
