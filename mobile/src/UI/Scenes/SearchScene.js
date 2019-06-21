
import React from "react";
import { View, SafeAreaView, TextInput, Text, ScrollView, FlatList, Image, TouchableOpacity } from "react-native";
import { BaseScene, Button } from "../common";

class SearchScene extends BaseScene {

    constructor(props) {
        super(props);

        this.state = {
            searchText: '',
            pastSearch: true,
            speialistList: true,
            needHelp: true,
            doctorName: false,
            pastSearches: [
                {
                    search: 'Dr. Alok Mehta'
                },
                {
                    search: 'Cardiology'
                },
                {
                    search: 'Paediatrician'
                },
                {
                    search: 'DR. PARUL VAIDYA'
                }
            ],
            Specialities: [
                {
                    image: { ...this.appImages('GeneralPhysician') },
                    name: 'General Physician'
                },
                {
                    image: { ...this.appImages('Peadatrician') },
                    name: 'Paediatrician'
                },
                {
                    image: { ...this.appImages('Urologist') },
                    name: 'Urologist'
                },
                {
                    image: { ...this.appImages('Neurology') },
                    name: 'Neurologist'
                },
                {
                    image: { ...this.appImages('Urologist') },
                    name: 'Urologist'
                },
                {
                    image: { ...this.appImages('Neurology') },
                    name: 'Neurologist'
                },

            ],
            doctorsList: [
                {
                    image: { ...this.appImages('simran') },
                    doctorName: 'Dr. Simran Rai',
                    starDoctor: true,
                    specialization: 'GENERAL PHYSICIAN',
                    experience: '7 YRS',
                    education: 'MBBS, Internal Medicine',
                    location: 'Apollo Hospitals, Jubilee Hills',
                    time: 'CONSULT NOW',
                    available: true
                },
                {
                    image: { ...this.appImages('narayanRao') },
                    doctorName: 'Dr. Jayanth Reddy',
                    starDoctor: true,
                    specialization: 'GENERAL PHYSICIAN',
                    experience: '5 YRS',
                    education: 'MBBS, Internal Medicine',
                    location: 'Apollo Hospitals, Jubilee Hills',
                    time: 'CONSULT IN 27 MINS',
                    available: false
                }
            ]
        }
        this.onSearchText = this.onSearchText.bind(this);
        this.onSearchIconTapped = this.onSearchIconTapped.bind(this);
        this.onCancelSearchTapped = this.onCancelSearchTapped.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.setFocus = this.setFocus.bind(this)
        this.onClickSearch = this.onClickSearch.bind(this)
    }

    onSearchText() {

    }

    onSearchIconTapped() {

    }

    onCancelSearchTapped() {

    }

    render() {
        const styles = this.styleSheet();

        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
                <ScrollView style={{ flex: 1 }}>
                    {this.renderSearch(styles)}
                    {this.renderPastSearch(styles)}
                    {this.renderSpecialist(styles)}
                    {this.renderHelpView(styles)}
                    {this.renderDoctorSearches(styles)}
                </ScrollView>
            </SafeAreaView>
        );
    }

    renderDoctorSearches(styles) {
        if (this.state.doctorName) {
            return (
                <View>
                    <Text style={styles.pastTextStyle}>Matching Doctors — 1</Text>
                    <FlatList
                        contentContainerStyle={{
                            flexWrap: 'wrap'
                        }}
                        bounces={false}
                        data={this.state.doctorsList}
                        onEndReachedThreshold={0.5}
                        renderItem={({ item, index }) => this.renderSearchDoctorResultsRow(item, index)}
                        keyExtractor={(_, index) => index.toString()}
                    />
                </View>

            );
        }
    }

    renderSearchDoctorResultsRow(rowData, rowID) {
        const styles = this.styleSheet();
        const { Fonts, Colors } = this.theme();
        return (
            <View style={styles.doctorView}>
                <View style={{ flexDirection: 'row' }}>
                    {rowData.available ? <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        borderRadius: 10,
                        backgroundColor: '#ff748e'
                    }}>
                        <Text style={{
                            color: 'white',
                            textAlign: 'center',
                            ...Fonts.IBMPlexSansSemiBold(9),
                            letterSpacing: 0.5,
                            paddingHorizontal: 12,
                            paddingVertical: 7
                        }}>AVAILABLE NOW</Text>
                    </View> : null}
                    <Image {...rowData.image} style={{ margin: 16 }} />
                    <View>
                        <Text style={{
                            paddingTop: 32,
                            paddingLeft: 0,
                            ...Fonts.IBMPlexSansMedium(18),
                            color: Colors.SEARCH_DOCTOR_NAME
                        }}>{rowData.doctorName}</Text>
                        <Text style={{
                            paddingTop: 4,
                            paddingLeft: 0,
                            ...Fonts.IBMPlexSansSemiBold(12),
                            color: Colors.CARD_DESCRIPTION
                        }}>{rowData.specialization} | {rowData.experience}</Text>
                        <Text style={{
                            paddingTop: 12,
                            paddingLeft: 0,
                            ...Fonts.IBMPlexSansMedium(12),
                            color: Colors.SEARCH_EDUCATION_COLOR
                        }}>{rowData.education}</Text>
                        <Text style={{
                            paddingTop: 2,
                            paddingLeft: 0,
                            ...Fonts.IBMPlexSansMedium(12),
                            color: Colors.SEARCH_EDUCATION_COLOR
                        }}>{rowData.location}</Text>
                    </View>
                </View>
                {rowData.available ?
                    <Button title={rowData.time}
                        style={{
                            paddingHorizontal: 0, marginTop: 16,
                            backgroundColor: Colors.APP_YELLOW_COLOR,
                            // borderRadius: 0,
                            height: 44
                        }}
                        titleTextStyle={{ color: 'white' }} />
                    :
                    <View style={{
                        paddingHorizontal: 0, marginTop: 16,
                        alignSelf: 'center',
                        justifyContent: 'center',
                        // height: 44,
                        width: '100%'
                    }}>
                        <View style={{
                            backgroundColor: Colors.CARD_HEADER,
                            opacity: 0.3,
                            marginHorizontal: 16,
                            height: 1
                        }} />
                        <Text style={{
                            paddingLeft: 0,
                            ...Fonts.IBMPlexSansSemiBold(14),
                            color: Colors.SEARCH_CONSULT_COLOR,
                            textAlign: 'center',
                            paddingVertical: 12,
                            lineHeight: 24
                        }}>{rowData.time}</Text>
                    </View>
                }
            </View>

        );
    }

    renderHelpView(styles) {
        if (this.state.needHelp) {
            return (
                <View style={styles.helpView}>
                    <Image  {...this.appImages().ic_mascot} style={{ height: 80, width: 80 }} />
                    <Button title="Need Help?" style={styles.needhelpbuttonStyles} titleTextStyle={styles.titleBtnStyles} />
                </View>
            )
        }
    }

    renderSearch(styles) {
        return (
            <View style={styles.searchContainer}>
                <Text style={styles.TextStyle}>DOCTORS / SPECIALITIES</Text>
                <View style={styles.searchView}>
                    <TextInput
                        ref={o => (this.InputText = o)}
                        style={styles.searchValueStyle}
                        autoCorrect={false}
                        value={this.state.searchText}
                        placeholder="Search doctors or specialities"
                        underlineColorAndroid="transparent"
                        onChangeText={(value) => this.onChangeText(value)}
                        onFocus={this.setFocus}
                    />
                    <View style={styles.separatorStyles} />
                </View>
            </View>
        );
    }

    setFocus() {
        this.setState({
            pastSearch: false,
            needHelp: false,
            speialistList: false
        })
    }

    renderPastSearch(styles) {
        if (this.state.pastSearch) {
            return (
                <View>
                    <Text style={styles.pastTextStyle}>Past Searches</Text>
                    <FlatList
                        contentContainerStyle={{
                            flexWrap: 'wrap'
                        }}
                        bounces={false}
                        data={this.state.pastSearches}
                        onEndReachedThreshold={0.5}
                        renderItem={({ item, index }) => this.renderRow(item, index)}
                        keyExtractor={(_, index) => index.toString()}
                        numColumns={2}
                    />
                </View>

            );
        }
    }

    renderSpecialist(styles) {
        if (this.state.speialistList) {
            return (
                <View>
                    <Text style={styles.pastTextStyle}>Specialities</Text>
                    <FlatList
                        contentContainerStyle={{
                            flexWrap: 'wrap'
                        }}
                        bounces={false}
                        data={this.state.Specialities}
                        onEndReachedThreshold={0.5}
                        renderItem={({ item, index }) => this.renderSpecialistRow(item, index)}
                        keyExtractor={(_, index) => index.toString()}
                        numColumns={2}
                    />
                </View>

            );
        }
    }

    renderSpecialistRow(rowData, rowID) {
        const styles = this.styleSheet();
        return (
            <TouchableOpacity onPress={() => this.onClickSearch()} >
                <View style={styles.listSpecialistView}>
                    <Image {...rowData.image} style={{ marginTop: 10 }} />
                    <Text style={styles.rowSpecialistStyles}>{rowData.name.toUpperCase()}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    renderRow(rowData, rowID) {
        const styles = this.styleSheet();
        return (
            <View style={styles.listView}>
                <Text style={styles.rowTextStyles}>{rowData.search.toUpperCase()}</Text>
            </View>
        );
    }

    onChangeText(value) {

        this.setState({
            searchText: value
        })

        console.log('value', value)
        if (value === 'Simran') {

            this.setState({
                doctorName: true,
                speialistList: false
            })
        } else {
            this.setState({
                speialistList: true
            })
        }
    }

    onClickSearch() {
        this.navigate('DoctorSearchListing')
    }

    defaultStyles() {
        const { Colors, Fonts } = this.theme();
        return {
            searchContainer: {
                height: 124,
                backgroundColor: 'white',
                shadowColor: '#808080',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 5
            },
            listView: {
                marginBottom: 8,
                backgroundColor: 'white',
                shadowColor: '#808080',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 5,
                elevation: 5,
                borderRadius: 10,
                marginLeft: 20,
                marginTop: 8
            },
            doctorView: {
                flex: 1,
                marginHorizontal: 20,
                backgroundColor: 'white',
                shadowColor: '#808080',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 5,
                elevation: 5,
                borderRadius: 10,
                marginVertical: 10
            },
            rowTextStyles: {
                color: Colors.SEARCH_TITLE_COLOR,
                paddingHorizontal: 14,
                paddingVertical: 16,
                ...Fonts.IBMPlexSansSemiBold(14)
            },
            listSpecialistView: {
                width: 152,
                height: 110,
                borderRadius: 10,
                shadowColor: '#808080',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 5,
                elevation: 5,
                borderRadius: 10,
                marginLeft: 20,
                backgroundColor: 'white',
                marginVertical: 8,
                alignItems: 'center',
                justifyContent: 'center'
            },
            rowSpecialistStyles: {
                ...Fonts.IBMPlexSansSemiBold(13),
                paddingHorizontal: 9,
                paddingVertical: 12,
                color: Colors.SEARCH_TITLE_COLOR,
                textAlign: 'center',

            },
            TextStyle: {
                textAlign: 'center',
                color: Colors.SHERPA_BLUE,
                ...Fonts.IBMPlexSansSemiBold(13),
                letterSpacing: 0.5,
                padding: 20
            },
            pastTextStyle: {
                textAlign: 'left',
                color: Colors.SHERPA_BLUE,
                ...Fonts.IBMPlexSansMedium(14),
                paddingHorizontal: 20,
                paddingVertical: 24
            },
            searchView: {
                height: 50,
                margin: 20,
                marginTop: 8
            },
            separatorStyles: {
                backgroundColor: Colors.SEARCH_UNDERLINE_COLOR,
                width: '100%',
                height: 2,
                marginTop: 6
            },
            searchValueStyle: {
                ...Fonts.IBMPlexSansMedium(18),
                color: Colors.SHERPA_BLUE
            },
            helpView: {
                width: '100%',
                height: 212,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'center'
            },
            needhelpbuttonStyles: {
                backgroundColor: 'white',
                height: 50,
                width: 120,
                marginTop: 5
            },
            titleBtnStyles: {
                color: '#0087ba',
                ...Fonts.IBMPlexSansMedium(16)
            }
        }
    }
}

export default SearchScene;
