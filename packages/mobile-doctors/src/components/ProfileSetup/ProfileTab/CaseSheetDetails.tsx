import { CapsuleView } from '@aph/mobile-doctors/src/components/ui/CapsuleView';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import {
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { DoctorType } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import strings from '@aph/mobile-doctors/src/strings/strings.json';

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

  const consultDetails = props.navigation.getParam('consultDetails');
  const patientDetails = props.navigation.getParam('patientDetails');
  const { patientMedicalHistory } = patientDetails;

  const caseSheet = consultDetails.caseSheet.filter(
    (item: any) => item.doctorType !== DoctorType.JUNIOR
  );

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
    // const data = consultDetails.caseSheet.filter(
    //   (item: any) => item.doctorType !== DoctorType.JUNIOR
    // );
    const symptoms = caseSheet.length ? caseSheet[0].symptoms : null;
    if (symptoms)
      return (
        <CollapseCard
          heading={strings.case_sheet.symptoms}
          collapse={showCF}
          onPress={() => setshowCF(!showCF)}
          containerStyle={{ marginVertical: 10 }}
        >
          {symptoms.map((item: any) => (
            <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
              <Text style={theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE)}>
                {item.symptom}
              </Text>
              <Text style={theme.viewStyles.text('S', 12, theme.colors.SHARP_BLUE)}>
                {`${strings.common.since}: ${item.since}\n${strings.common.how_often}: ${item.howOften}\n ${strings.common.severity}: ${item.severity}`}
              </Text>
            </View>
          ))}
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
      {label && (
        <Text style={theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.6))}>{label}</Text>
      )}
      {description && (
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE, 1, 20),
            marginBottom: 20,
          }}
        >
          {description}
        </Text>
      )}
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
        desc: patientMedicalHistory ? patientMedicalHistory.menstrualHistory : '-',
      },
      {
        label: 'Family Medical History',
        desc:
          patientDetails.familyHistory &&
          patientDetails.familyHistory
            .map((item) => `${item.relation}: ${item.description}`)
            .join('\n'), //'Father: Cardiac patient\nMother: Severely diabetic',
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
            <Text style={theme.viewStyles.text('S', 12, theme.colors.SHARP_BLUE, 1, 20)}>
              {caseSheet[0].notes}
            </Text>
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
            <View
              style={{ marginTop: 10, marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap' }}
            >
              {caseSheet[0].diagnosticPrescription
                ? caseSheet[0].diagnosticPrescription.map(({ itemname }) => (
                    <CapsuleView
                      diseaseName={itemname}
                      containerStyle={{ marginRight: 12, marginBottom: 12 }}
                    />
                  ))
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
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
          {renderLabelDesc(strings.common.medicines)}
          {caseSheet.length && caseSheet[0].medicinePrescription
            ? caseSheet[0].medicinePrescription.map((item: any) => (
                <View>
                  {item.medicineName && (
                    <Text style={theme.viewStyles.text('B', 14, theme.colors.LIGHT_BLUE)}>
                      {item.medicineName}
                    </Text>
                  )}
                </View>
              ))
            : null}
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
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>{renderLabelDesc('Tests')}</View>
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
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <Text style={{ ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE) }}>
            {strings.case_sheet.pulmologist}
          </Text>
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
          <Text
            style={{
              ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE),
              marginTop: 15,
              marginHorizontal: 20,
              marginBottom: 4,
            }}
          >{`${strings.case_sheet.submitted_by} ${
            consultDetails.doctorInfo ? consultDetails.doctorInfo.firstName : ''
          } ${strings.case_sheet.on} ${moment(consultDetails.appointmentDateTime).format(
            'DD/MM/YYYY'
          )} at\n${moment(consultDetails.appointmentDateTime).format('hh.mm A')}`}</Text>
          <Text
            style={{
              ...theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.6)),
              marginHorizontal: 20,
              marginBottom: 6,
            }}
          >
            {strings.case_sheet.appt_id}: {consultDetails.id}
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
