import {
  Filter,
  TrackerBig,
  OnlineConsult,
  PrescriptionSkyBlue,
} from '@aph/mobile-patients/src/components/ui/Icons';
import strings from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { getDoctorDetailsById_getDoctorDetailsById_specialty } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';

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
  profileImageStyle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'red' },
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
const data: rowData = {
  id: 'id',
  salutation: 'Dr',
  firstName: 'Mamatha',
  lastName: 'V',
  qualification: 'MBBS',
  mobileNumber: '2345678909',
  experience: '2',
  languages: 'English,Telugu',
  city: 'Hyderabad',
  awards: '',
  photoUrl:
    'https://image.shutterstock.com/image-photo/smiling-doctor-posing-arms-crossed-600w-519507367.jpg',
  specialty: undefined,
  registrationNumber: '',
  onlineConsultationFees: '',
  physicalConsultationFees: '',
  status: 'Follow-up to 20 Apr 2019',
  desease: 'Cold, Cough, Fever, Nausea',
};
export interface HealthConsultViewProps {
  onPressOrder?: () => void;
  onClickCard?: () => void;
}

export const HealthConsultView: React.FC<HealthConsultViewProps> = (props) => {
  const tabs = strings.health_records_home.tabs;

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);

  const renderConsults = () => {
    return (
      <View style={{}}>
        <Filter />
      </View>
    );
  };
  return (
    <View style={styles.viewStyle}>
      <View style={styles.trackerViewStyle}>
        <TrackerBig />
        <View style={styles.trackerLineStyle} />
      </View>
      <View style={styles.rightViewStyle}>
        <Text style={styles.labelTextStyle}>Today, 12 Aug 2019</Text>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.cardContainerStyle]}
          onPress={() => {
            props.onClickCard ? props.onClickCard() : null;
          }}
        >
          <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.imageView}>
                {/* {data.image} */}
                {data.photoUrl &&
                  data.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/) && (
                    <Image style={styles.profileImageStyle} source={{ uri: data.photoUrl }} />
                  )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.doctorNameStyles}>
                  Dr. {data.firstName} {data.lastName}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.descriptionTextStyles}>{data.status}</Text>
                  <OnlineConsult />
                </View>
                <View style={styles.separatorStyles} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.descriptionTextStyles}>{data.desease}</Text>
                  <PrescriptionSkyBlue />
                </View>
              </View>
            </View>
            <View
              style={[theme.viewStyles.darkSeparatorStyle, { marginTop: 8, marginBottom: 15 }]}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text style={styles.yellowTextStyle}>BOOK FOLLOW-UP</Text>
              <Text style={styles.yellowTextStyle} onPress={props.onPressOrder}>
                ORDER MEDS & TESTS
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
