import { More, TrackerBig } from '@aph/mobile-patients/src/components/ui/Icons';
import { getDoctorDetailsById_getDoctorDetailsById_specialty } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { getPatientMedicalRecords_getPatientMedicalRecords_medicalRecords } from '@aph/mobile-patients/src/graphql/types/getPatientMedicalRecords';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labTests,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecks,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizations,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response,
} from '../../graphql/types/getPatientPrismMedicalRecords';

const styles = StyleSheet.create({
  viewStyle: {
    flexDirection: 'row',
  },
  trackerViewStyle: {
    width: 44,
    alignItems: 'center',
  },
  trackerLineStyle: {
    flex: 1,
    width: 4,
    alignSelf: 'center',
    backgroundColor: theme.colors.SKY_BLUE,
  },
  labelTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.LIGHT_BLUE,
    paddingLeft: 4,
  },
  cardContainerStyle: {
    flex: 1,
    ...theme.viewStyles.cardViewStyle,
    marginTop: 8,
    marginBottom: 20,
    marginRight: 20,
    marginLeft: 4,
    padding: 16,
  },
  rightViewStyle: {
    flex: 1,
  },
  imageView: {
    marginRight: 16,
  },
  doctorNameStyles: {
    paddingTop: 4,
    paddingBottom: 8,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
  },
  separatorStyles: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
    marginVertical: 7,
  },
  descriptionTextStyles: {
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.TEXT_LIGHT_BLUE,
  },
  profileImageStyle: { width: 40, height: 40, borderRadius: 20 },
  yellowTextStyle: {
    ...theme.fonts.IBMPlexSansBold(12),
    lineHeight: 20,
    color: theme.colors.APP_YELLOW,
  },
});

type rowData = {
  id?: string;
  salutation?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  qualification?: string | null;
  mobileNumber?: string;
  experience?: string | null;
  specialization?: string | null;
  languages?: string | null;
  city?: string | null;
  awards?: string | null;
  photoUrl?: string | null;
  specialty?: getDoctorDetailsById_getDoctorDetailsById_specialty;
  registrationNumber?: string;
  onlineConsultationFees?: string;
  physicalConsultationFees?: string;
  status: string;
  desease: string;
};

export interface HealthMedicineCardProps {
  onPressDelete?: () => void;
  onPressOrder?: () => void;
  onClickCard?: () => void;
  disableDelete?: boolean;
  datalab?: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response;
  dataprescription?: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response;
}

export const HealthMedicineCard: React.FC<HealthMedicineCardProps> = (props) => {
  const { datalab, dataprescription, disableDelete } = props;
  return (
    <View style={styles.viewStyle}>
      <View style={styles.trackerViewStyle}>
        <TrackerBig />
        <View style={styles.trackerLineStyle} />
      </View>
      <View style={styles.rightViewStyle}>
        <Text style={styles.labelTextStyle}>
          {moment((dataprescription && dataprescription.date) || (datalab && datalab.date)).format(
            'DD MMM YYYY'
          )}
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.cardContainerStyle]}
          onPress={() => {
            CommonLogEvent('HEALTH_MEDICINE_CARD', 'On follow up click'),
              props.onClickCard ? props.onClickCard() : null;
          }}
        >
          <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.doctorNameStyles}>
                  {(dataprescription && dataprescription.prescriptionName) ||
                    (datalab && datalab.labTestName)}
                </Text>
                {disableDelete ? null : (
                  <TouchableOpacity onPress={props.onPressDelete}>
                    <More />
                  </TouchableOpacity>
                )}
              </View>
              {datalab && !!datalab.labTestSource && (
                <Text style={styles.descriptionTextStyles}>{datalab && datalab.labTestSource}</Text>
              )}
              {dataprescription && !!dataprescription.source && (
                <Text style={styles.descriptionTextStyles}>
                  {dataprescription && dataprescription.source}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
