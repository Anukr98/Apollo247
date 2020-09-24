import {
  More,
  TrackerBig,
  PHRHospitalIcon,
  PHRSelfUploadIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response,
  getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords';
import { FILTER_TYPE } from '@aph/mobile-patients/src/components/HealthRecords/MedicalRecords';
import _ from 'lodash';

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
    lineHeight: 21,
    color: theme.colors.SHERPA_BLUE,
  },
  separatorStyles: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
    marginVertical: 7,
  },
  descriptionTextStyles: {
    paddingLeft: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.TEXT_LIGHT_BLUE,
    lineHeight: 20,
  },
  profileImageStyle: { width: 40, height: 40, borderRadius: 20 },
  yellowTextStyle: {
    ...theme.fonts.IBMPlexSansBold(12),
    lineHeight: 20,
    color: theme.colors.APP_YELLOW,
  },
});

export interface HealthMedicineCardProps {
  onPressDelete?: () => void;
  onPressOrder?: () => void;
  onClickCard?: () => void;
  disableDelete?: boolean;
  filterApplied?: FILTER_TYPE | string;
  prevItemData?: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response;
  datalab?: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_labResults_response;
  dataprescription?: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_prescriptions_response;
  datahealthcheck?: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_healthChecksNew_response;
  datahospitalization?: getPatientPrismMedicalRecords_getPatientPrismMedicalRecords_hospitalizationsNew_response;
}

export const HealthMedicineCard: React.FC<HealthMedicineCardProps> = (props) => {
  const {
    datalab,
    dataprescription,
    disableDelete,
    datahealthcheck,
    prevItemData,
    filterApplied,
    datahospitalization,
  } = props;

  const healthCheckName = datahealthcheck?.healthCheckName || datahealthcheck?.healthCheckType;
  const hospitalizationDoctorName = datahospitalization?.doctorName
    ? 'Dr. ' + datahospitalization?.doctorName
    : '';

  const dateFilterApplied = datalab && filterApplied && filterApplied !== FILTER_TYPE.DATE;
  const clubFilterData =
    filterApplied && filterApplied === FILTER_TYPE.DATE
      ? prevItemData?.date === datalab?.date
      : filterApplied === FILTER_TYPE.TEST
      ? prevItemData?.labTestName === datalab?.labTestName
      : datalab?.packageName && datalab?.packageName.length > 0 && datalab?.packageName !== '-'
      ? prevItemData?.packageName === datalab?.packageName
      : prevItemData?.labTestName === datalab?.labTestName;

  const reportSource =
    datalab?.labTestSource ||
    dataprescription?.source ||
    datahealthcheck?.source ||
    datahospitalization?.source ||
    '';

  const reportName =
    dataprescription?.prescriptionName ||
    datalab?.labTestName ||
    healthCheckName ||
    hospitalizationDoctorName ||
    '';

  const reportSourceNonSelf =
    datalab?.siteDisplayName || datahealthcheck?.source || datahospitalization?.hospitalName || '';

  const reportSourceSelf = reportSource === '247self' || _.lowerCase(reportSource) === 'self';

  const getDateFormatted = () => {
    const date_text = (date_t: any) => {
      return moment(date_t).format('DD MMM YYYY');
    };
    return dataprescription && dataprescription.date
      ? date_text(dataprescription.date)
      : datalab && datalab.date
      ? moment().format('DD/MM/YYYY') === moment(datalab.date).format('DD/MM/YYYY')
        ? `Today, ${date_text(datalab.date)}`
        : date_text(datalab.date)
      : datahealthcheck && datahealthcheck.date
      ? moment().format('DD/MM/YYYY') === moment(datahealthcheck.date).format('DD/MM/YYYY')
        ? `Today, ${date_text(datahealthcheck.date)}`
        : date_text(datahealthcheck.date)
      : datahospitalization && datahospitalization.dateOfHospitalization && datahospitalization.date
      ? `From ${moment(datahospitalization.dateOfHospitalization).format(
          'DD MMM, YYYY'
        )} to ${moment(datahospitalization.date).format('DD MMM, YYYY')}`
      : date_text(datahospitalization?.date || '') || '';
  };

  const renderTrackerImage = () => {
    return clubFilterData ? null : <TrackerBig />;
  };

  const getFilterAppliedText = () => {
    return datalab && filterApplied === FILTER_TYPE.DATE
      ? getDateFormatted()
      : filterApplied === FILTER_TYPE.TEST
      ? datalab?.labTestName
      : datalab?.packageName && datalab?.packageName.length > 0 && datalab?.packageName !== '-'
      ? datalab?.packageName
      : datalab?.labTestName;
  };

  return (
    <View style={styles.viewStyle}>
      <View style={styles.trackerViewStyle}>
        {datalab ? renderTrackerImage() : <TrackerBig />}
        <View style={styles.trackerLineStyle} />
      </View>
      <View style={styles.rightViewStyle}>
        {datalab && clubFilterData ? null : (
          <Text style={styles.labelTextStyle}>
            {dateFilterApplied ? getFilterAppliedText() : getDateFormatted()}
          </Text>
        )}
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
                  {datalab && filterApplied && filterApplied !== FILTER_TYPE.DATE
                    ? getDateFormatted()
                    : reportName}
                </Text>
                {disableDelete ? null : (
                  <TouchableOpacity onPress={props.onPressDelete}>
                    <More />
                  </TouchableOpacity>
                )}
              </View>
              {reportSource ? (
                <View style={{ flexDirection: 'row', paddingLeft: 2 }}>
                  {reportSourceSelf ? (
                    <PHRSelfUploadIcon style={{ width: 16, height: 10.14, alignSelf: 'center' }} />
                  ) : (
                    <PHRHospitalIcon style={{ width: 14, height: 14, alignSelf: 'center' }} />
                  )}
                  <Text style={styles.descriptionTextStyles}>
                    {datahospitalization && reportSourceNonSelf !== '-'
                      ? reportSourceNonSelf
                      : reportSourceSelf
                      ? 'Self upload'
                      : reportSourceNonSelf}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
