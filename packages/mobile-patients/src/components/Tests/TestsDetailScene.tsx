import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { MedicineIcon, MedicineRxIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = StyleSheet.create({
    headerContainerStyle: {
        borderBottomWidth: 0,
        ...theme.viewStyles.shadowStyle
    },
    headerTitleStyle: {
        marginHorizontal: 10
    },
    scrollViewStyle: {
        paddingBottom: 90
    },
    cardStyle: {
        ...theme.viewStyles.cardViewStyle,
        ...theme.viewStyles.shadowStyle,
        padding: 16,
        marginHorizontal: 20,
        backgroundColor: theme.colors.CARD_BG,
        alignItems: 'flex-start',
        marginTop: 20,
        marginBottom: 16
    },
    noteContainerStyle: {
        width: '100%',
        marginTop: 1
    },
    noteSubContainerStyle: {
        width: '100%',
        flexDirection: 'row'
    },
    noteText: {
        ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, 0.6, 20, 0.04),
    },
    noteIconStyle: {
        top: -1,
        right: 0,
        position: 'absolute'
    },
    separatorStyle: {
        height: 1,
        opacity: 0.1,
        backgroundColor: theme.colors.LIGHT_BLUE,
        marginTop: 17,
        marginBottom: 24,
    },
    titleTextStyle: {
        ...theme.fonts.IBMPlexSansMedium(14),
        color: theme.colors.LIGHT_BLUE,
        lineHeight: 20,
        paddingBottom: 8,
    },
    descriptionTextStyle: {
        ...theme.fonts.IBMPlexSansMedium(16),
        color: theme.colors.SKY_BLUE,
        lineHeight: 24,
        paddingBottom: 16
    },
    stickyBottomStyle: {
        height: 'auto'
    },
    bottonButtonContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 0,
        paddingTop: 14,
        paddingBottom: 20
    },
    bottomButtonStyle: {
        flex: 1,
    },
    bottomWhiteButtonStyle: {
        flex: 1,
        backgroundColor: theme.colors.WHITE,
    },
    bottomWhiteButtonTextStyle: {
        color: theme.colors.APP_YELLOW
    },
    buttonSeperatorStyle: {
        width: 16
    }
})

type ItemData = {
    title: string,
    descripiton: string
}

const itemData: ItemData[] = [
    {
        title: 'How It Works',
        descripiton: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.'
    },
    {
        title: 'Diagnostic pre-requisite',
        descripiton: 'Any warnings related to medicine intake if there’s alcohol usage / pregnancy / breast feeding'
    },
    {
        title: 'Test Includes',
        descripiton: '1. Test a\n2. Test b\n3. Test c\n4. Test d\n5. Test e\n6. Test f\n7. Test g\n8. Test h'
    },
    {
        title: 'Preparation / Warnings',
        descripiton: 'quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.'
    },
    {
        title: 'Diagnostic Type',
        descripiton: 'Sample pickup / Hospital Visit'
    },
];

let is_prescription_required = false

export interface TestsDetailSceneProps
    extends NavigationScreenProps<{
        title: string,
        sku: string
    }> { }

export const TestsDetailScene: React.FC<TestsDetailSceneProps> = (props) => {

    const renderNote = () => {
        if (is_prescription_required) {
            return (
                <View style={styles.noteContainerStyle}>
                    <View style={styles.noteSubContainerStyle}>
                        <Text style={styles.noteText}>{string.orders.test_prec_req}</Text>
                        <MedicineRxIcon style={styles.noteIconStyle} />
                    </View>
                    <View style={styles.separatorStyle} />
                </View>
            );
        } else {
            return (
                <View style={styles.noteContainerStyle}>
                    <View style={styles.noteSubContainerStyle}>
                        <Text style={styles.noteText}>{string.orders.test_prec_not_req}</Text>
                        <MedicineIcon style={styles.noteIconStyle} />
                    </View>
                    <View style={styles.separatorStyle} />
                </View>
            );
        }
    };

    const renderDetails = () => {
        const detailList = itemData.map(({ title, descripiton }) => {
            return (
                <View>
                    <Text style={styles.titleTextStyle}>
                        {title}
                    </Text>
                    <Text style={styles.descriptionTextStyle}>
                        {descripiton}
                    </Text>
                </View>
            );
        })
        return detailList
    }

    const renderCard = () => {
        return (
            <ScrollView bounces={false} contentContainerStyle={styles.scrollViewStyle}>
                <View style={styles.cardStyle}>
                    {renderNote()}
                    {renderDetails()}
                </View>
            </ScrollView>
        );
    }

    const renderButtons = () => {
        return (
            <StickyBottomComponent style={styles.stickyBottomStyle} defaultBG>
                <View style={styles.bottonButtonContainer}>
                    <Button
                        onPress={() => {
                            console.log('Call')
                        }}
                        title={string.orders.call_us}
                        style={styles.bottomWhiteButtonStyle}
                        titleTextStyle={styles.bottomWhiteButtonTextStyle}
                    />
                    <View style={styles.buttonSeperatorStyle} />
                    <Button
                        onPress={() => {
                            console.log('Added')
                        }}
                        title={string.orders.add_to_cart}
                        style={styles.bottomButtonStyle}
                    />
                </View>
            </StickyBottomComponent>
        )
    }

    return (
        <SafeAreaView style={theme.viewStyles.container}>
            <Header
                leftIcon="backArrow"
                onPressLeftIcon={() => props.navigation.goBack()}
                title={props.navigation.getParam('title').toUpperCase()}
                titleStyle={styles.headerTitleStyle}
                container={styles.headerContainerStyle}
            />
            {renderCard()}
            {renderButtons()}
        </SafeAreaView>
    );
}
