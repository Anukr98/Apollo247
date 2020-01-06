import React, { useState } from 'react';
import { View, SafeAreaView, Text, ScrollView } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import {
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { CollapseCard } from '@aph/mobile-doctors/src/components/ui/CollapseCard';
import { DoctorType } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { CapsuleView } from '@aph/mobile-doctors/src/components/ui/CapsuleView';

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

  const consultDetails = props.navigation.getParam('consultDetails');
  const patientDetails = props.navigation.getParam('patientDetails');

  const caseSheet = consultDetails.caseSheet.filter(
    (item: any) => item.doctorType !== DoctorType.JUNIOR
  );

  const renderHeader = () => {
    console.log(
      props.navigation.getParam('consultDetails'),
      props.navigation.getParam('patientDetails'),
      'patientDetails'
    );

    return (
      <Header
        headerText="CONSULT ROOM"
        leftIcon="backArrow"
        onPressLeftIcon={() => props.navigation.goBack()}
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => props.navigation.push(AppRoutes.NeedHelpAppointment),
          },
        ]}
      />
    );
  };

  const renderChiefComplaints = () => {
    console.log(showCF, 'showCF');
    // const data = consultDetails.caseSheet.filter(
    //   (item: any) => item.doctorType !== DoctorType.JUNIOR
    // );
    const symptoms = caseSheet.length ? caseSheet[0].symptoms : null;
    console.log(caseSheet, 'data', symptoms, 'symptoms');
    if (symptoms)
      return (
        <CollapseCard
          heading="Symptoms"
          collapse={showCF}
          onPress={() => setshowCF(!showCF)}
          containerStyle={{ marginVertical: 10 }}
        >
          {symptoms.map((item) => (
            <View style={{ marginHorizontal: 16 }}>
              <Text style={theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE)}>
                {item.symptom}
              </Text>
              <Text style={theme.viewStyles.text('S', 12, theme.colors.SHARP_BLUE)}>
                {`Since: ${item.since}\nHow often: ${item.howOften}\nSeverity: ${item.severity}`}
              </Text>
            </View>
          ))}
        </CollapseCard>
      );
  };

  const renderVitals = () => {
    const data = [
      {
        label: 'Height',
        desc: '160 cms',
      },
      {
        label: 'Weight',
        desc: '67 Kgs',
      },
      {
        label: 'BP',
        desc: '120/80 mm Hg',
      },
      {
        label: 'Temperature',
        desc: '-',
      },
    ];

    return (
      <CollapseCard
        heading="Vitals"
        collapse={showVital}
        onPress={() => setshowVital(!showVital)}
        containerStyle={{ marginVertical: 10 }}
      >
        <View style={{ marginHorizontal: 16 }}>
          {data.map(({ label, desc }) => renderLabelDesc(label, desc))}
        </View>
      </CollapseCard>
    );
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
        desc: 'She has been on BP medication for the past 1 year',
      },
      {
        label: 'Drug Allergies',
        desc: 'None',
      },
      {
        label: 'Diet Allergies/Restrictions',
        desc: 'Dairy. Dust',
      },
      {
        label: 'Lifestyle and Habits',
        desc: 'Patient doesn’t smoke, She recovered from chickenpox 6 months ago',
      },
      {
        label: 'Menstrual History',
        desc: 'Regular cycles;  Last period was on 16th Sep',
      },
      {
        label: 'Family Medical History',
        desc: 'Father: Cardiac patient\nMother: Severely diabetic',
      },
    ];
    return (
      <CollapseCard
        heading="Patient’s Medical & Family History"
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
          heading="Junior Doctor’s Notes"
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
        heading="Diagnosis"
        collapse={showDiagnosis}
        onPress={() => setshowDiagnosis(!showDiagnosis)}
        containerStyle={{ marginVertical: 10 }}
      >
        <View style={{ marginHorizontal: 16 }}>
          {renderLabelDesc('Diagnosed Medical Condition')}
          {caseSheet.length && (
            <View style={{ marginTop: 10, marginBottom: 20 }}>
              {caseSheet[0].diagnosticPrescription.map(({ itemname }) => (
                <CapsuleView diseaseName={itemname} />
              ))}
            </View>
          )}
        </View>
      </CollapseCard>
    );
  };
  const renderMP = () => {
    return (
      <CollapseCard
        heading="Medicine Prescription"
        collapse={showMP}
        onPress={() => setshowMP(!showMP)}
        containerStyle={{ marginVertical: 10 }}
      >
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
          {renderLabelDesc('Medicines')}
          {caseSheet.length &&
            caseSheet[0].medicinePrescription.map((item: any) => (
              <View>
                <Text style={theme.viewStyles.text('B', 14, theme.colors.LIGHT_BLUE)}>
                  {item.medicineName}
                </Text>
              </View>
            ))}
        </View>
      </CollapseCard>
    );
  };

  const renderTP = () => {
    return (
      <CollapseCard
        heading="Test Prescription"
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
        heading="Referral"
        collapse={showReferral}
        onPress={() => setshowReferral(!showReferral)}
        containerStyle={{ marginVertical: 10 }}
      >
        <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
          <Text style={{ ...theme.viewStyles.text('M', 14, theme.colors.SHARP_BLUE) }}>
            Pulmologist
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
          >{`Submitted by Dr. ${
            consultDetails.doctorInfo ? consultDetails.doctorInfo.firstName : ''
          } on ${moment(consultDetails.appointmentDateTime).format('DD/MM/YYYY')} at\n${moment(
            consultDetails.appointmentDateTime
          ).format('hh.mm A')}`}</Text>
          <Text
            style={{
              ...theme.viewStyles.text('M', 14, theme.colors.darkBlueColor(0.6)),
              marginHorizontal: 20,
              marginBottom: 6,
            }}
          >
            Appt ID: {consultDetails.id}
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
    </View>
  );
};
