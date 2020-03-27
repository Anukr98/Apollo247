import { CapsuleView } from '@aph/mobile-doctors/src/components/ui/CapsuleView';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import {
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails,
  GetCaseSheet_getCaseSheet_patientDetails_familyHistory,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { DoctorType } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import styles from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/CaseSheetDetails.styles';

export interface CaseSheetDetailsProps extends NavigationScreenProps {
  consultDetails: GetCaseSheet_getCaseSheet_pastAppointments;
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails;
}

export const CaseSheetDetails: React.FC<CaseSheetDetailsProps> = (props) => {
  const [showCF, setshowCF] = useState<boolean>(true);
  const [showVital, setshowVital] = useState<boolean>(false);
  const [showMedicalDetails, setshowMedicalDetails] = useState(false);
  const [showNotes, setshowNotes] = useState(false);
  const [showDiagnosis, setshowDiagnosis] = useState(false);
  const [showMP, setshowMP] = useState(false);
  const [showTP, setshowTP] = useState(false);
  const [showReferral, setshowReferral] = useState(false);
  const [showHelpModel, setshowHelpModel] = useState(false);

  const consultDetails: GetCaseSheet_getCaseSheet_pastAppointments = props.navigation.getParam(
    'consultDetails'
  );
  const patientDetails = props.navigation.getParam('patientDetails');
  const { patientMedicalHistory } = patientDetails;

  const caseSheet = (g(consultDetails, 'caseSheet') || []).filter(
    (item) => item.doctorType !== DoctorType.JUNIOR
  );
  const { doctorDetails } = useAuth();

  const renderHeader = () => {
    return (
      <Header
        headerText={strings.consult_room.consult_room}
        leftIcon="backArrow"
        onPressLeftIcon={() => props.navigation.goBack()}
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => setshowHelpModel(true),
          },
        ]}
      />
    );
  };

  const renderChiefComplaints = () => {
    const symptoms = caseSheet.length > 0 ? caseSheet[0].symptoms : null;
    if (symptoms)
      return (
        <CollapseCard
          heading={strings.case_sheet.symptoms}
          collapse={showCF}
          onPress={() => setshowCF(!showCF)}
          containerStyle={{ marginVertical: 10 }}
        >
          {symptoms &&
            symptoms.map((i) => {
              if (i) {
                const description = [
                  `${strings.common.since}: ${i.since || '-'}`,
                  `${strings.common.how_often}: ${i.howOften || '-'}`,
                  `${strings.common.severity}: ${i.severity || '-'}`,
                  `Details: ${i.details || '-'}`,
                ]
                  .filter((d) => d !== '')
                  .join('\n');
                return (
                  <View style={styles.symptomView}>
                    <Text style={styles.symptomText}>{i.symptom}</Text>
                    <Text style={styles.symptomdetails}>{description}</Text>
                  </View>
                );
              }
            })}
        </CollapseCard>
      );
  };

  const renderVitals = () => {
    if (patientMedicalHistory) {
      const data = [
        {
          label: 'Height',
          desc: patientMedicalHistory.height,
        },
        {
          label: 'Weight',
          desc: patientMedicalHistory.weight,
        },
        {
          label: 'BP',
          desc: patientMedicalHistory.bp,
        },
        {
          label: 'Temperature',
          desc: patientMedicalHistory.temperature,
        },
      ];

      return (
        <CollapseCard
          heading={strings.case_sheet.vitals}
          collapse={showVital}
          onPress={() => setshowVital(!showVital)}
          containerStyle={{ marginVertical: 10 }}
        >
          <View style={{ marginHorizontal: 16 }}>
            {data.map(({ label, desc }) => renderLabelDesc(label, desc ? desc : '-'))}
          </View>
        </CollapseCard>
      );
    }
  };

  const renderLabelDesc = (label?: string, description?: string) => (
    <View>
      {label && <Text style={styles.lablestyle}>{label}</Text>}
      {description && <Text style={styles.descrText}>{description}</Text>}
    </View>
  );

  const renderMedical = () => {
    const data = [
      {
        label: 'Medication History',
        desc: patientMedicalHistory ? patientMedicalHistory.pastMedicalHistory : '-',
      },
      {
        label: 'Drug Allergies',
        desc: patientMedicalHistory ? patientMedicalHistory.drugAllergies : '-',
      },
      {
        label: 'Diet Allergies/Restrictions',
        desc: patientMedicalHistory ? patientMedicalHistory.dietAllergies : '-',
      },
      {
        label: 'Lifestyle and Habits',
        desc:
          patientDetails && patientDetails.lifeStyle && patientDetails.lifeStyle.description
            ? patientDetails.lifeStyle.description
            : '-',
      },
      {
        label: 'Menstrual History',
        desc: patientMedicalHistory ? patientMedicalHistory.menstrualHistory || '-' : '-',
      },
      {
        label: 'Family Medical History',
        desc: patientDetails.familyHistory && getFamilyHistory(patientDetails.familyHistory),
      },
    ];
    return (
      <CollapseCard
        heading={strings.case_sheet.patients_medi_family_history}
        collapse={showMedicalDetails}
        onPress={() => setshowMedicalDetails(!showMedicalDetails)}
        containerStyle={{ marginVertical: 10 }}
      >
        <View style={{ marginHorizontal: 16 }}>
          {data.map(({ label, desc }) => renderLabelDesc(label, desc))}
        </View>
      </CollapseCard>
    );
  };

  const getFamilyHistory = (
    familyValues: (GetCaseSheet_getCaseSheet_patientDetails_familyHistory | null)[] | null
  ) => {
    if (familyValues) {
      let familyHistory: string = '';
      familyValues.forEach((i) => {
        if (i) {
          familyHistory += i.relation
            ? i.relation + ': ' + i.description || '-' + '\n'
            : i.description || '-' + '\n';
        }
      });
      return familyHistory.slice(0, -1);
    } else {
      return '-';
    }
  };

  const renderNotes = () => {
    if (caseSheet.length && caseSheet[0].notes)
      return (
        <CollapseCard
          heading={strings.case_sheet.jr_doctor_notes}
          collapse={showNotes}
          onPress={() => setshowNotes(!showNotes)}
          containerStyle={{ marginVertical: 10 }}
        >
          <View style={{ marginHorizontal: 16 }}>
            <Text style={styles.caseSheetNote}>{caseSheet[0].notes}</Text>
          </View>
        </CollapseCard>
      );
  };
  const renderDiagnosis = () => {
    return (
      <CollapseCard
        heading={strings.case_sheet.diagnosis}
        collapse={showDiagnosis}
        onPress={() => setshowDiagnosis(!showDiagnosis)}
        containerStyle={{ marginVertical: 10 }}
      >
        <View style={{ marginHorizontal: 16 }}>
          {renderLabelDesc(strings.case_sheet.diagonsed_medical_condi)}
          {caseSheet.length > 0 && (
            <View style={styles.caseSheetDescrView}>
              {caseSheet[0].diagnosticPrescription
                ? caseSheet[0].diagnosticPrescription.map(
                    (item) =>
                      item && (
                        <CapsuleView
                          diseaseName={item.itemname || ''}
                          containerStyle={styles.capsuleContainer}
                        />
                      )
                  )
                : null}
            </View>
          )}
        </View>
      </CollapseCard>
    );
  };
  const renderMP = () => {
    return (
      <CollapseCard
        heading={strings.case_sheet.medicine_prescription}
        collapse={showMP}
        onPress={() => setshowMP(!showMP)}
        containerStyle={{ marginVertical: 10 }}
      >
        <View style={styles.MPView}>
          {renderLabelDesc(strings.common.medicines)}
          {caseSheet.length > 0 &&
            caseSheet[0].medicinePrescription &&
            caseSheet[0].medicinePrescription.map(
              (item) =>
                item && (
                  <View>
                    <Text style={styles.medicineName}>{item.medicineName}</Text>
                  </View>
                )
            )}
        </View>
      </CollapseCard>
    );
  };

  const renderTP = () => {
    return (
      <CollapseCard
        heading={strings.case_sheet.test_prescription}
        collapse={showTP}
        onPress={() => setshowTP(!showTP)}
        containerStyle={{ marginVertical: 10 }}
      >
        <View style={styles.TPview}>{renderLabelDesc('Tests')}</View>
      </CollapseCard>
    );
  };

  const renderReferral = () => {
    return (
      <CollapseCard
        heading={strings.case_sheet.referral}
        collapse={showReferral}
        onPress={() => setshowReferral(!showReferral)}
        containerStyle={{ marginVertical: 10 }}
      >
        <View style={styles.referralView}>
          <Text style={styles.referralText}>{strings.case_sheet.pulmologist}</Text>
        </View>
      </CollapseCard>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        {renderHeader()}
        <ScrollView bounces={false} style={{ zIndex: 1 }}>
          <Text style={styles.scrollViewText}>{`${strings.case_sheet.submitted_by} ${
            doctorDetails ? doctorDetails!.firstName : ''
          } ${strings.case_sheet.on} ${moment(consultDetails.appointmentDateTime).format(
            'DD/MM/YYYY'
          )} at\n${moment(consultDetails.appointmentDateTime).format('hh.mm A')}`}</Text>
          <Text style={styles.apptId}>
            {strings.case_sheet.appt_id}: {consultDetails.displayId}
          </Text>
          {renderChiefComplaints()}
          {renderVitals()}
          {renderMedical()}
          {renderNotes()}
          {renderDiagnosis()}
          {renderMP()}
          {renderTP()}
          {renderReferral()}
        </ScrollView>
      </SafeAreaView>
      {showHelpModel ? <NeedHelpCard onPress={() => setshowHelpModel(false)} /> : null}
    </View>
  );
};
