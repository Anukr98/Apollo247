
import React from "react";
import { View, SafeAreaView, TextInput, Text, ScrollView, FlatList, Image, TouchableOpacity } from "react-native";
import { BaseScene, Button } from "../common";

class DoctorSearchListing extends BaseScene {

    render() {
        const styles = this.styleSheet();
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
                <ScrollView style={{ flex: 1 }}>
                    {this.renderTopView(styles)}
                </ScrollView>
            </SafeAreaView>
        );
    }

    renderTopView(styles) {
        return (
            <View style={styles.topView}>
                <View style={{ justifyContent: 'space-between', alignItems: 'flex-start', alignContent: 'flex-end', flexDirection: 'row' }}>
                    <Image {...this.appImages('backArrow')} />
                    <View style={{ flexDirection: 'row' }}>
                        <Image {...this.appImages('noLocation')} />
                        <Image {...this.appImages('filter')} />
                    </View>
                </View>
            </View>
        );
    }

    defaultStyles() {
        const { Colors, Fonts } = this.theme();
        return {
            topView: {
                height: 124,
                backgroundColor: 'white',
                shadowColor: '#808080',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 5,
                elevation: 5,
                borderTopWidth: 0
            }
        }
    }
}

export default DoctorSearchListing;