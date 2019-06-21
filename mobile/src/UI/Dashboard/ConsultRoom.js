
import React from "react";
import { View, Image, ScrollView, SafeAreaView, Text, TouchableHighlight, TouchableOpacity, Dimensions } from "react-native";
import { BaseScene, Button } from "../common";
const { width, height } = Dimensions.get('window')

class ConsultRoom extends BaseScene {

    constructor(props) {
        super(props);
        this.state = {
            arrayTest: [
                {
                    title: "Are you looking for a particular doctor?",
                    descripiton: 'SEARCH SPECIALIST'
                },
                {
                    title: "Do you want to buy some medicines?",
                    descripiton: 'SEARCH MEDICINE'
                },
                {
                    title: "Do you want to get some tests done?",
                    descripiton: 'BOOK A TEST'
                }
            ],
            arrayDoctor: [
                {
                    name: 'Dr. Narayana Rao’s',
                    status: 'AVAILABLE',
                    Program: 'Star Cardiology Program',
                    doctors: '09',
                    Patients: '18'
                },
                {
                    name: 'Dr. Simran Rao',
                    status: 'AVAILABLE',
                    Program: 'Star Cardiology Program',
                    doctors: '05',
                    Patients: '20'
                },
                {
                    name: 'Dr. Sekhar Rao’s',
                    status: 'AVAILABLE',
                    Program: 'Star Cardiology Program',
                    doctors: '12',
                    Patients: '10'
                }
            ],
            showPopUp: true
        }
    }

    render() {
        const styles = this.styleSheet();
        return (
            <View style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
                    <ScrollView style={{ flex: 1 }}>
                        {this.renderTopView(styles)}
                        {this.renderMiddleView(styles)}
                        {this.renderStarDoctorView(styles)}
                        {this.renderHelpView(styles)}
                    </ScrollView>
                </SafeAreaView >
                {this.renderPopupView(styles)}
            </View >
        );
    }

    renderPopupView(styles) {
        if (this.state.showPopUp) {
            return (
                <View style={styles.showPopUp}>
                    <View style={styles.subViewPopup}>
                        <Text style={styles.congratulationsTextStyle}>Congratulations! :)</Text>
                        <Text style={styles.congratulationsDescriptionStyle}>Welcome to the Apollo family. You can add more family members any time from ‘My Account’.</Text>
                        <Button title="OK, GOT IT"
                            style={styles.gotItStyles}
                            titleTextStyle={styles.gotItTextStyles}
                            onPress={() => this.GotItBtnClicked()} />
                    </View>

                    <Image  {...this.appImages().ic_mascot} style={{ position: "absolute", height: 80, width: 80, left: width - 100, bottom: 141 }} />
                </View>
            );

        }

    }

    GotItBtnClicked() {
        this.setState({
            showPopUp: false
        })
    }

    consultDoctorBtnClicked() {
        this.navigate('SearchScene')
    }

    renderTopView(styles) {
        return (
            <View style={{ width: '100%', height: 427 }}>
                <View style={styles.viewName} >
                    <Image  {...this.appImages().appLogo} />
                    <View style={{
                        flexDirection: 'row',
                        marginTop: 18,
                        alignItems: 'center'
                    }}>
                        <Text style={styles.nameTextStyle}>hi surj!</Text>
                        <Image  {...this.appImages().dropDown} />
                    </View>
                    <View style={styles.seperatorStyle} />
                    <Text style={styles.descriptionTextStyle}>Are you not feeling well today?</Text>
                    <Button
                        title="CONSULT A DOCTOR"
                        style={styles.buttonStyles}
                        onPress={() => this.consultDoctorBtnClicked()} />
                </View>
                <Image  {...this.appImages().doctorImage} />
            </View>
        );
    }

    renderMiddleView(styles) {
        const { Colors, Fonts } = this.theme();
        return (
            <View>
                {this.state.arrayTest.map((serviceTitle, i) =>
                    <View key={i}>
                        <TouchableHighlight key={i}>
                            <View style={{
                                borderRadius: 10, height: 104, marginHorizontal: 20, backgroundColor: '#f7f8f5', flexDirection: 'row',
                                marginBottom: 16,
                                shadowColor: '#808080',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.5,
                                shadowRadius: 10,
                                elevation: 1,
                            }} key={i}>
                                <View style={{ width: width - 128 }}>
                                    <Text style={{ marginLeft: 16, marginTop: 16, color: '#02475b', lineHeight: 24, textAlign: 'left', ...Fonts.IBMPlexSansMedium(14) }}>{serviceTitle.title}</Text>
                                    <Text style={{ marginLeft: 16, marginTop: 8, color: '#fc9916', textAlign: 'left', ...Fonts.IBMPlexSansBold(13) }}>{serviceTitle.descripiton}</Text>
                                </View>
                                <View>
                                    <Image  {...this.appImages().placeHolderImage} />
                                </View>
                            </View>
                        </TouchableHighlight>
                    </View>
                )}
            </View>
        );
    }

    renderStarDoctorView(styles) {
        const scrollViewWidth = (this.state.arrayTest.length * 250) + (this.state.arrayTest.length * 20)
        const { Colors, Fonts } = this.theme();
        return (
            <View style={styles.doctorView}>
                <Text style={styles.doctorStyle}>Learn about Apollo Star Doctor Program</Text>
                <ScrollView style={{ marginTop: 20, backgroundColor: 'transparent' }}
                    contentContainerStyle={{ flexDirection: 'row', paddingHorizontal: 3, width: scrollViewWidth }}
                    horizontal={true}
                    automaticallyAdjustContentInsets={false}
                    showsHorizontalScrollIndicator={false}
                    directionalLockEnabled={true}>
                    {this.state.arrayDoctor.map((serviceTitle, i) =>
                        <View key={i}>
                            <TouchableHighlight key={i}>
                                <View style={{
                                    marginLeft: 20,
                                    marginRight: 0,
                                    width: 244,
                                    height: 207,
                                    backgroundColor: 'white',
                                    shadowColor: '#808080',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 5,
                                    elevation: 10,
                                    borderRadius: 5,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderWidth: 0.1,
                                    borderColor: 'rgba(0,0,0,0.4)'
                                }} key={i}>
                                    <View style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        width: 77,
                                        height: 24,
                                        borderRadius: 5,
                                        backgroundColor: '#ff748e'
                                    }}>
                                        <Text style={{
                                            color: 'white',
                                            textAlign: 'center',
                                            ...Fonts.IBMPlexSansSemiBold(9)
                                        }}>AVAILABLE</Text>
                                    </View>
                                    <Image  {...this.appImages().placeHolderDoctorImage} />
                                    <Text style={{ ...Fonts.IBMPlexSansMedium(18), color: '#02475b', textAlign: 'center' }}>{serviceTitle.name}</Text>
                                    <Text style={{ ...Fonts.IBMPlexSansMedium(12), color: '#0087ba', textAlign: 'center' }}>{serviceTitle.Program}</Text>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' }}>
                                        <View>
                                            <Text style={{ ...Fonts.IBMPlexSansMedium(14), color: '#02475b', textAlign: 'center' }}>{serviceTitle.doctors}</Text>
                                            <Text style={{ ...Fonts.IBMPlexSansMedium(10), color: '#02475b', textAlign: 'center' }}>Doctors</Text>
                                        </View>
                                        <View style={{ backgroundColor: '#02475b', width: 1, height: 31, marginLeft: 40, marginRight: 16 }} />
                                        <View>
                                            <Text style={{ ...Fonts.IBMPlexSansMedium(14), color: '#02475b', textAlign: 'center' }}>{serviceTitle.Patients}</Text>
                                            <Text style={{ ...Fonts.IBMPlexSansMedium(10), color: '#02475b', textAlign: 'center' }}>Patients Enrolled</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    }

    renderHelpView(styles) {
        return (
            <View style={styles.helpView}>
                <Image  {...this.appImages().ic_mascot} style={{ height: 80, width: 80 }} />
                <Button title="Need Help?" style={styles.needhelpbuttonStyles} titleTextStyle={styles.titleBtnStyles} />
            </View>
        )
    }

    defaultStyles() {
        const { Colors, Fonts } = this.theme();
        return {
            viewName: {
                backgroundColor: 'white',
                marginTop: 10,
                width: '100%',
                height: 294
            },
            gotItStyles: {
                backgroundColor: 'transparent',
                height: 40,
                position: 'absolute',
                right: 20,
                bottom: 30,
                width: 100
            },
            gotItTextStyles: {
                ...Fonts.IBMPlexSansBold(13),
                lineHeight: 24,
                color: '#fc9916',
            },
            showPopUp: {
                backgroundColor: 'rgba(0,0,0,0.2)',
                position: 'absolute',
                width: '100%',
                height: '100%'
            },
            subViewPopup: {
                backgroundColor: 'white',
                width: '100%',
                height: 200,
                top: height - 230,
                borderRadius: 10
            },
            congratulationsTextStyle: {
                marginLeft: 24,
                marginTop: 28,
                color: '#02475b',
                ...Fonts.IBMPlexSansSemiBold(18)
            },
            congratulationsDescriptionStyle: {
                marginHorizontal: 24,
                marginTop: 8,
                color: '#0087ba',
                ...Fonts.IBMPlexSansMedium(17),
                lineHeight: 24
            },
            nameTextStyle: {
                marginLeft: 20,
                color: '#02475b',
                ...Fonts.IBMPlexSansSemiBold(36)
            },
            seperatorStyle: {
                height: 2,
                width: 108,
                backgroundColor: '#00b38e',
                marginLeft: 60,
                marginTop: 5
            },
            descriptionTextStyle: {
                marginLeft: 20,
                marginTop: 12,
                color: '#0087ba',
                ...Fonts.IBMPlexSansMedium(17),
                lineHeight: 24
            },
            buttonStyles: {
                backgroundColor: '#fcb716',
                height: 40,
                width: 160,
                borderRadius: 10,
                marginLeft: 20,
                marginTop: 16
            },
            needhelpbuttonStyles: {
                backgroundColor: 'white',
                height: 50,
                width: 120,
                marginTop: 5
            },
            titleBtnStyles: {
                color: '#0087ba'
            },
            doctorView: {
                width: '100%',
                height: 277,
                shadowColor: '#808080',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 1,
                backgroundColor: 'white'
            },
            doctorStyle: {
                marginLeft: 20,
                marginTop: 16,
                color: '#02475b',
                ...Fonts.IBMPlexSansMedium(15)
            },
            helpView: {
                width: '100%',
                height: 212,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'center'
            },
            popUpView: {
                backgroundColor: 'rgba(0,0,0,0.2)',
                position: 'absolute',
                margin: 0,
                width: '100%',
                height: '100%'
            }
        }
    }
}

export default ConsultRoom;