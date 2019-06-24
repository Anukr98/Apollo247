import { Button } from 'app/src/UI/common';
import { AppImages } from 'app/src/__new__/images/AppImages';
import { theme } from 'app/src/__new__/theme/theme';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ScrollView, TouchableHighlight } from 'react-native-gesture-handler';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  // const { Colors, Fonts } = this.theme();
  viewName: {
    backgroundColor: 'white',
    marginTop: 10,
    width: '100%',
    height: 294,
  },
  gotItStyles: {
    backgroundColor: 'transparent',
    height: 40,
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 100,
  },
  gotItTextStyles: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#fc9916',
  },
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  subViewPopup: {
    backgroundColor: 'white',
    width: '100%',
    height: 200,
    top: height - 230,
    borderRadius: 10,
  },
  congratulationsTextStyle: {
    marginLeft: 24,
    marginTop: 28,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  congratulationsDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  nameTextStyle: {
    marginLeft: 20,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    width: 108,
    backgroundColor: '#00b38e',
    marginLeft: 60,
    marginTop: 5,
  },
  descriptionTextStyle: {
    marginLeft: 20,
    marginTop: 12,
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  buttonStyles: {
    backgroundColor: '#fcb716',
    height: 40,
    width: 160,
    borderRadius: 10,
    marginLeft: 20,
    marginTop: 16,
  },
  needhelpbuttonStyles: {
    backgroundColor: 'white',
    height: 50,
    width: 120,
    marginTop: 5,
  },
  titleBtnStyles: {
    color: '#0087ba',
  },
  doctorView: {
    width: '100%',
    height: 277,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 1,
    backgroundColor: 'white',
  },
  doctorStyle: {
    marginLeft: 20,
    marginTop: 16,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  helpView: {
    width: '100%',
    height: 212,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popUpView: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    margin: 0,
    width: '100%',
    height: '100%',
  },
});

type ArrayTest = {
  title: string;
  descripiton: string;
};

const arrayTest: ArrayTest[] = [
  {
    title: 'Are you looking for a particular doctor?',
    descripiton: 'SEARCH SPECIALIST',
  },
  {
    title: 'Do you want to buy some medicines?',
    descripiton: 'SEARCH MEDICINE',
  },
  {
    title: 'Do you want to get some tests done?',
    descripiton: 'BOOK A TEST',
  },
];

type ArrayDoctor = {
  name: string;
  status: string;
  Program: string;
  doctors: string;
  Patients: string;
};

const arrayDoctor: ArrayDoctor[] = [
  {
    name: 'Dr. Narayana Rao’s',
    status: 'AVAILABLE',
    Program: 'Star Cardiology Program',
    doctors: '09',
    Patients: '18',
  },
  {
    name: 'Dr. Simran Rao',
    status: 'AVAILABLE',
    Program: 'Star Cardiology Program',
    doctors: '05',
    Patients: '20',
  },
  {
    name: 'Dr. Sekhar Rao’s',
    status: 'AVAILABLE',
    Program: 'Star Cardiology Program',
    doctors: '12',
    Patients: '10',
  },
];

export interface ConsultRoomProps {}
export const ConsultRoom: React.FC<ConsultRoomProps> = (props) => {
  const appIntroSliderRef = React.useRef<any>(null);
  const scrollViewWidth = arrayTest.length * 250 + arrayTest.length * 20;

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
        <ScrollView style={{ flex: 1 }}>
          <View style={{ width: '100%', height: 427 }}>
            <View style={styles.viewName}>
              <Image {...AppImages.appLogo} />
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 18,
                  alignItems: 'center',
                }}
              >
                <Text style={styles.nameTextStyle}>hi surj!</Text>
                <Image {...AppImages.dropDown} />
              </View>
              <View style={styles.seperatorStyle} />
              <Text style={styles.descriptionTextStyle}>Are you not feeling well today?</Text>
              <Button
                title="CONSULT A DOCTOR"
                style={styles.buttonStyles}
                // onPress={() => this.consultDoctorBtnClicked()}
              />
            </View>
            {/* <Image {...AppImages.doctorImage} /> */}
          </View>
          <View>
            {arrayTest.map((serviceTitle, i) => (
              <View key={i}>
                <TouchableHighlight key={i}>
                  <View
                    style={{
                      borderRadius: 10,
                      height: 104,
                      marginHorizontal: 20,
                      backgroundColor: '#f7f8f5',
                      flexDirection: 'row',
                      marginBottom: 16,
                      shadowColor: '#808080',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                      elevation: 21,
                    }}
                    key={i}
                  >
                    <View style={{ width: width - 128 }}>
                      <Text
                        style={{
                          marginLeft: 16,
                          marginTop: 16,
                          color: '#02475b',
                          lineHeight: 24,
                          textAlign: 'left',
                          ...theme.fonts.IBMPlexSansMedium(14),
                        }}
                      >
                        {serviceTitle.title}
                      </Text>
                      <Text
                        style={{
                          marginHorizontal: 16,
                          marginTop: 8,
                          color: '#fc9916',
                          textAlign: 'left',
                          ...theme.fonts.IBMPlexSansBold(13),
                        }}
                      >
                        {serviceTitle.descripiton}
                      </Text>
                    </View>
                    <View>
                      <Image {...AppImages.placeHolderImage} />
                    </View>
                  </View>
                </TouchableHighlight>
              </View>
            ))}
          </View>
          <View style={styles.doctorView}>
            <Text style={styles.doctorStyle}>Learn about Apollo Star Doctor Program</Text>
            <ScrollView
              style={{ backgroundColor: 'transparent' }}
              contentContainerStyle={{
                marginLeft: 8,
                marginRight: 8,
                flexDirection: 'row',
                paddingHorizontal: 3,
                width: scrollViewWidth,
              }}
              horizontal={true}
              automaticallyAdjustContentInsets={false}
              showsHorizontalScrollIndicator={false}
              directionalLockEnabled={true}
            >
              {arrayDoctor.map((serviceTitle, i) => (
                <View key={i}>
                  <TouchableHighlight key={i}>
                    <View
                      style={{
                        marginTop: 20,
                        marginLeft: 8,
                        marginRight: 8,
                        marginBottom: 16,
                        width: 244,
                        height: 207,
                        backgroundColor: 'white',
                        shadowColor: '#808080',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.5,
                        shadowRadius: 5,
                        elevation: 21,
                        borderRadius: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 0.1,
                        borderColor: 'rgba(0,0,0,0.4)',
                        position: 'relative',
                        borderBottomWidth: 0,
                      }}
                      key={i}
                    >
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          width: 77,
                          height: 24,
                          borderRadius: 5,
                          backgroundColor: '#ff748e',
                        }}
                      >
                        <Text
                          style={{
                            color: 'white',
                            textAlign: 'center',
                            ...theme.fonts.IBMPlexSansSemiBold(9),
                          }}
                        >
                          AVAILABLE
                        </Text>
                      </View>
                      <Image {...AppImages.placeHolderDoctorImage} />
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(18),
                          color: '#02475b',
                          textAlign: 'center',
                        }}
                      >
                        {serviceTitle.name}
                      </Text>
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(12),
                          color: '#0087ba',
                          textAlign: 'center',
                        }}
                      >
                        {serviceTitle.Program}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginTop: 16,
                          alignItems: 'center',
                        }}
                      >
                        <View>
                          <Text
                            style={{
                              ...theme.fonts.IBMPlexSansMedium(14),
                              color: '#02475b',
                              textAlign: 'center',
                            }}
                          >
                            {serviceTitle.doctors}
                          </Text>
                          <Text
                            style={{
                              ...theme.fonts.IBMPlexSansMedium(10),
                              color: '#02475b',
                              textAlign: 'center',
                            }}
                          >
                            Doctors
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: '#02475b',
                            width: 1,
                            height: 31,
                            marginLeft: 40,
                            marginRight: 16,
                          }}
                        />
                        <View>
                          <Text
                            style={{
                              ...theme.fonts.IBMPlexSansMedium(14),
                              color: '#02475b',
                              textAlign: 'center',
                            }}
                          >
                            {serviceTitle.Patients}
                          </Text>
                          <Text
                            style={{
                              ...theme.fonts.IBMPlexSansMedium(10),
                              color: '#02475b',
                              textAlign: 'center',
                            }}
                          >
                            Patients Enrolled
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableHighlight>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.helpView}>
            <Image {...AppImages.ic_mascot} style={{ width: 80, height: 80 }} />
            <Button
              title="Need Help?"
              style={styles.needhelpbuttonStyles}
              titleTextStyle={styles.titleBtnStyles}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      {
        // showPopUp && (
        <View style={styles.showPopUp}>
          <View style={styles.subViewPopup}>
            <Text style={styles.congratulationsTextStyle}>Congratulations! :)</Text>
            <Text style={styles.congratulationsDescriptionStyle}>
              Welcome to the Apollo family. You can add more family members any time from ‘My
              Account’.
            </Text>
            <Button
              title="OK, GOT IT"
              style={styles.gotItStyles}
              titleTextStyle={styles.gotItTextStyles}
              // onPress={() => this.GotItBtnClicked()}
            />
            <Image
              {...AppImages.ic_mascot}
              style={{ position: 'absolute', height: 80, width: 80, top: -40, right: 20 }}
            />
          </View>
        </View>
        // )
      }
    </View>
  );
};
