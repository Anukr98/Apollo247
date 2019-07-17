import { ConsultOverlay } from '@aph/mobile-patients/src/components/ConsultOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { DoctorImage, ShareWhite } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { FlatList, NavigationScreenProps } from 'react-navigation';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  topView: {
    backgroundColor: theme.colors.WHITE,
    marginBottom: 8,
  },
  detailsViewStyle: {
    margin: 20,
  },
  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 7,
  },
  doctorSpecializationStyles: {
    paddingTop: 7,
    paddingBottom: 12,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.3,
  },
  educationTextStyles: {
    paddingTop: 4,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.LIGHT_BLUE,
    letterSpacing: 0.3,
  },
  doctorLocation: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
    letterSpacing: 0.3,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  horizontalSeparatorStyle: {
    borderRightWidth: 0.5,
    borderRightColor: theme.colors.SEPARATOR_LINE,
    marginHorizontal: 13,
  },
  cardView: {
    width: '100%',
    marginVertical: 8,
    ...theme.viewStyles.cardContainer,
  },
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  labelStyle: {
    marginTop: 16,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  onlineConsultView: {
    backgroundColor: theme.colors.CARD_BG,
    flexDirection: 'row',
    marginTop: 12,
    borderRadius: 10,
    padding: 12,
  },
  onlineConsultLabel: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 8,
  },
  onlineConsultAmount: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 16,
  },
});
const style = { width: 80, height: 80 };

type DoctorDetails = {
  image: any;
  doctorName: string;
  nickName: string;
  starDoctor: boolean;
  specialization: string;
  experience: string;
  education: string;
  awards: string;
  location: string;
  time: string;
  available: boolean;
  languages: string[];
};

const doctorDetails: DoctorDetails = {
  image: <DoctorImage style={style} />,
  doctorName: 'Dr. Simran Rai',
  nickName: 'Dr. Simran',
  starDoctor: true,
  specialization: 'GENERAL PHYSICIAN',
  experience: '7 YRS',
  education: 'MS (Surgery), MBBS (Internal Medicine)',
  awards: 'Dr. B.C.Roy Award (2009)',
  location: 'Apollo Hospitals, Jubilee Hills',
  time: 'CONSULT NOW',
  available: true,
  languages: ['English', 'Telugu', 'Hindi'],
};

type doctorsList = {
  image: any;
  doctorName: string;
  starDoctor: boolean;
  specialization: string;
  experience: string;
  education: string;
  location: string;
  time: string;
  available: boolean;
};

const DoctorsList: doctorsList[] = [
  {
    image: <DoctorImage style={style} />,
    doctorName: 'Dr. Simran Rai',
    starDoctor: true,
    specialization: 'GENERAL PHYSICIAN',
    experience: '7 YRS',
    education: 'MBBS, Internal Medicine',
    location: 'Apollo Hospitals, Jubilee Hills',
    time: 'CONSULT NOW',
    available: false,
  },
  {
    image: <DoctorImage style={style} />,
    doctorName: 'Dr. Rakhi Sharma',
    starDoctor: false,
    specialization: 'GENERAL PHYSICIAN',
    experience: '4 YRS',
    education: 'MBBS, Internal Medicine',
    location: 'Apollo Hospitals, Jubilee Hills',
    time: 'CONSULT NOW',
    available: false,
  },
  {
    image: <DoctorImage style={style} />,
    doctorName: 'Dr. Rahul Nerlekar',
    starDoctor: false,
    specialization: 'GENERAL PHYSICIAN',
    experience: '4 YRS',
    education: 'MBBS, Internal Medicine',
    location: 'Apollo Hospitals, Jubilee Hills',
    time: 'CONSULT IN 45 MINS',
    available: false,
  },
  {
    image: <DoctorImage style={style} />,
    doctorName: 'Dr. Ranjan Gopal',
    starDoctor: false,
    specialization: 'GENERAL PHYSICIAN',
    experience: '4 YRS',
    education: 'MBBS, Internal Medicine',
    location: 'Apollo Hospitals, Jubilee Hills',
    time: 'CONSULT IN 45 MINS',
    available: false,
  },
];

type Appointments = {
  date: string;
  type: string;
  symptoms: string[];
};

const Appointments: Appointments[] = [
  {
    date: '27 June, 6:30 pm',
    type: 'ONLINE CONSULT',
    symptoms: ['FEVER', 'COUGH & COLD'],
  },
  {
    date: '09 April, 3:00 pm',
    type: 'CLINIC VISIT',
    symptoms: ['FEVER', 'COUGH & COLD'],
  },
];

export interface DoctorDetailsProps extends NavigationScreenProps {}
export const DoctorDetails: React.FC<DoctorDetailsProps> = (props) => {
  const [dispalyoverlay, setdispalyoverlay] = useState<boolean>(false);

  const renderDoctorDetails = () => {
    return (
      <View style={styles.topView}>
        <Image
          source={require('@aph/mobile-patients/src/images/onboard/onboard.png')}
          style={{ height: 160, width: '100%' }}
        />
        <View style={styles.detailsViewStyle}>
          <Text style={styles.doctorNameStyles}>{doctorDetails.doctorName}</Text>
          <View style={styles.separatorStyle} />
          <Text style={styles.doctorSpecializationStyles}>
            {doctorDetails.specialization} | {doctorDetails.experience}
          </Text>
          <Text style={styles.educationTextStyles}>{doctorDetails.education}</Text>
          <Text style={[styles.educationTextStyles, { paddingBottom: 12 }]}>
            {doctorDetails.awards}
          </Text>

          <View style={styles.separatorStyle} />
          <Text style={[styles.doctorLocation, { paddingTop: 11 }]}>{doctorDetails.location}</Text>
          <Text style={[styles.doctorLocation, { paddingBottom: 11, paddingTop: 4 }]}>
            {doctorDetails.languages.join(' | ')}
          </Text>
          <View style={styles.separatorStyle} />
          <View style={styles.onlineConsultView}>
            <View style={{ flex: 1 }}>
              <Text style={styles.onlineConsultLabel}>Online Consult</Text>
              <Text style={styles.onlineConsultAmount}>Rs. 299</Text>
              <CapsuleView title={'AVAILABLE IN 15 MINS'} />
            </View>
            <View style={styles.horizontalSeparatorStyle} />
            <View style={{ flex: 1 }}>
              <Text style={styles.onlineConsultLabel}>Clinic Visit</Text>
              <Text style={styles.onlineConsultAmount}>Rs. 499</Text>
              <CapsuleView title={'AVAILABLE IN 27 MINS'} isActive={false} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderDoctorClinic = () => {
    return (
      <View style={styles.cardView}>
        <View style={styles.labelView}>
          <Text style={styles.labelStyle}>{doctorDetails.nickName}’s Clinic</Text>
        </View>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            margin: 20,
          }}
        >
          <View
            style={{
              overflow: 'hidden',
              borderRadius: 10,
            }}
          >
            <Image
              source={require('@aph/mobile-patients/src/images/onboard/onboard.png')}
              style={{
                height: 136,
                width: '100%',
              }}
            />
            <View
              style={{
                margin: 20,
              }}
            >
              <Text>SLN Terminus, No 18, 2nd Floor, Gachibowli, Hyderabad</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderDoctorTeam = () => {
    // const startDoctor = string.home.startDoctor;
    return (
      <View style={styles.cardView}>
        <View style={styles.labelView}>
          <Text style={styles.labelStyle}>{doctorDetails.nickName}’s Star Doctor Team</Text>
          <Text style={styles.labelStyle}>{DoctorsList.length} Doctors</Text>
        </View>
        <ScrollView horizontal bounces={false}>
          <FlatList
            contentContainerStyle={{ padding: 12 }}
            // horizontal={true}
            data={DoctorsList}
            bounces={false}
            numColumns={DoctorsList.length / 2}
            renderItem={({ item }) => (
              <View style={{ width: 320 }}>
                <DoctorCard
                  rowData={item}
                  navigation={props.navigation}
                  displayButton={false}
                  style={{
                    marginVertical: 8,
                    marginHorizontal: 10,

                    shadowRadius: 3,
                  }}
                />
              </View>
            )}
          />
        </ScrollView>
      </View>
    );
  };

  const renderAppointmentHistory = () => {
    // const startDoctor = string.home.startDoctor;
    return (
      <View style={styles.cardView}>
        <View style={styles.labelView}>
          <Text style={styles.labelStyle}>Appointment History</Text>
          <Text style={styles.labelStyle}>{DoctorsList.length} Prior Consults</Text>
        </View>
        <FlatList
          // horizontal={true}
          contentContainerStyle={{
            marginVertical: 12,
          }}
          data={Appointments}
          renderItem={({ item }) => (
            <View
              style={{
                ...theme.viewStyles.cardViewStyle,
                marginHorizontal: 20,
                marginVertical: 8,
                padding: 16,
                shadowRadius: 3,
              }}
            >
              <CapsuleView
                isActive={false}
                style={{ position: 'absolute', top: 0, right: 0, width: 112 }}
                title={item.type}
              />
              <Text
                style={{
                  paddingTop: 16,
                  paddingBottom: 4,
                  ...theme.fonts.IBMPlexSansMedium(18),
                  color: theme.colors.SEARCH_DOCTOR_NAME,
                }}
              >
                {item.date}
              </Text>
              <View style={styles.separatorStyle} />
              <View style={{ flexDirection: 'row' }}>
                {item.symptoms.map((name) => (
                  <CapsuleView
                    title={name}
                    isActive={false}
                    style={{ width: 'auto', marginRight: 4, marginTop: 11 }}
                    titleTextStyle={{ color: theme.colors.SKY_BLUE }}
                  />
                ))}
              </View>
            </View>
          )}
        />
      </View>
    );
  };
  console.log(dispalyoverlay, 'dispalyoverlay');
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <Header
          container={{
            zIndex: 2,
            position: 'absolute',
            top: height === 812 || height === 896 ? 40 : 20,
            left: 0,
            right: 0,
            // height: 56,
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
          }}
          leftIcon="backArrowWhite"
          rightComponent={() => <ShareWhite />}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView style={{ flex: 1 }} bounces={false}>
          {renderDoctorDetails()}
          {renderDoctorClinic()}
          {renderDoctorTeam()}
          {renderAppointmentHistory()}
          <View style={{ height: 92 }} />
        </ScrollView>
        <StickyBottomComponent defaultBG>
          <Button
            title={'BOOK CONSULTATION'}
            onPress={() => setdispalyoverlay(true)}
            style={{ marginHorizontal: 60, flex: 1 }}
          />
        </StickyBottomComponent>
      </SafeAreaView>

      {dispalyoverlay && (
        <ConsultOverlay
          setdispalyoverlay={() => setdispalyoverlay(false)}
          navigation={props.navigation}
        />
      )}
    </View>
  );
};
