import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { DeviceHelper } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useState } from 'react';
import { Alert, Dimensions, Keyboard, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    yellowTextStyle: {
        ...theme.viewStyles.yellowTextStyle,
        padding: 16,
    },
    optionsView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingBottom: 16,
    },
    buttonStyle: {
        width: 'auto',
        marginRight: 8,
        marginTop: 12,
        backgroundColor: theme.colors.WHITE,
    },
    buttonTextStyle: {
        paddingHorizontal: 12,
        color: theme.colors.APP_GREEN,
        ...theme.fonts.IBMPlexSansMedium(15),
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
    },
    buttonViewStyle: {
        width: '30%',
        backgroundColor: 'white',
    },
    selectedButtonViewStyle: {
        backgroundColor: theme.colors.APP_GREEN,
    },
    buttonTitleStyle: {
        color: theme.colors.APP_GREEN,
    },
    selectedButtonTitleStyle: {
        color: theme.colors.WHITE,
    },
    placeholderViewStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        borderBottomWidth: 2,
        paddingTop: 0,
        paddingBottom: 3,
        borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    },
    placeholderStyle: {
        color: theme.colors.placeholderTextColor,
    },
    placeholderTextStyle: {
        color: '#01475b',
        ...theme.fonts.IBMPlexSansMedium(18),
    },
});

type genderOptions = {
    name: string;
};
type Profile = {
    pid: string;
    name: string;
};

const GenderOptions: genderOptions[] = [
    {
        name: 'Male',
    },
    {
        name: 'Female',
    },
    {
        name: 'Other',
    },
];

export interface AddProfileProps {
    setdisplayoverlay: (args0: boolean) => void;
    setProfile: (args0: Profile) => void;
}

export const AddProfile: React.FC<AddProfileProps> = (props) => {

    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
    const { isIphoneX } = DeviceHelper();
    const isValidProfile = firstName && lastName && date && gender

    const renderHeader = () => {
        return (
            <Header
                container={{
                    ...theme.viewStyles.cardViewStyle,
                    borderRadius: 0,
                }}
                leftIcon={'backArrow'}
                title={'Add New Profile'}
                onPressLeftIcon={() => props.setdisplayoverlay(false)}
            />
        );
    }
    const renderButtons = () => {
        return (
            <StickyBottomComponent style={styles.stickyBottomStyle} defaultBG>
                <View style={styles.bottonButtonContainer}>
                    <Button
                        onPress={() => {
                            props.setdisplayoverlay(false)
                        }}
                        title={'CANCEL'}
                        style={styles.bottomWhiteButtonStyle}
                        titleTextStyle={styles.bottomWhiteButtonTextStyle}
                    />
                    <View style={styles.buttonSeperatorStyle} />
                    <Button
                        onPress={() => {
                            props.setProfile({ pid: date, name: firstName + ' ' + lastName })
                            props.setdisplayoverlay(false)
                        }}
                        disabled={!isValidProfile}
                        title={'SAVE & USE'}
                        style={styles.bottomButtonStyle}
                    />
                </View>
            </StickyBottomComponent>
        )
    }
    return (
        <View
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, .8)',
                zIndex: 5,
            }}
        >
            <View style={{
                paddingHorizontal: 20
            }}>
                <View
                    style={{
                        alignItems: 'flex-end',
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => props.setdisplayoverlay(false)}
                        style={{
                            marginTop: Platform.OS === 'ios' ? isIphoneX ? 58 : 34 : 14,
                            backgroundColor: 'white',
                            height: 28,
                            width: 28,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 14,
                            marginRight: 0,
                        }}
                    >
                        <CrossPopup />
                    </TouchableOpacity>
                </View>
                <View style={{
                    ...theme.viewStyles.cardViewStyle,
                    marginTop: 16,
                    height: 'auto',
                    maxHeight: height - 108, overflow: 'hidden'
                }}>
                    {renderHeader()}
                    <ScrollView bounces={false} style={{ backgroundColor: '#f7f8f5', padding: 16 }}>
                        <TextInputComponent
                            label={'Full Name'}
                            value={`${firstName}`}
                            onChangeText={(fname) => setFirstName(fname)}
                            placeholder={'First Name'}
                        />
                        <TextInputComponent
                            value={`${lastName}`}
                            onChangeText={(lname) => setLastName(lname)}
                            placeholder={'Last Name'}
                        />
                        <TextInputComponent label={'Date Of Birth'} noInput={true} />
                        <View style={{ marginTop: -5 }}>
                            <View style={{ paddingTop: 0, paddingBottom: 10 }}>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    style={styles.placeholderViewStyle}
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        setIsDateTimePickerVisible(true);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.placeholderTextStyle,
                                            ,
                                            date !== '' ? null : styles.placeholderStyle,
                                        ]}
                                    >
                                        {date !== '' ? date : 'DD/MM/YYYY'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <DatePicker
                            isDateTimePickerVisible={isDateTimePickerVisible}
                            handleDatePicked={(date) => {
                                const formatDate = Moment(date).format('DD/MM/YYYY');
                                setDate(formatDate);
                                setIsDateTimePickerVisible(false);
                                Keyboard.dismiss();
                            }}
                            hideDateTimePicker={() => {
                                setIsDateTimePickerVisible(false);
                                Keyboard.dismiss();
                            }}
                        />
                        <TextInputComponent label={'Gender'} noInput={true} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 2 }}>
                            {GenderOptions.map((option) => (
                                <Button
                                    key={option.name}
                                    title={option.name}
                                    style={[
                                        styles.buttonViewStyle,
                                        gender === option.name ? styles.selectedButtonViewStyle : null,
                                    ]}
                                    titleTextStyle={
                                        gender === option.name ? styles.selectedButtonTitleStyle : styles.buttonTitleStyle
                                    }
                                    onPress={() => (
                                        setGender(option.name)
                                    )}
                                />
                            ))}
                        </View>
                        <View style={{ height: 96 }} />
                    </ScrollView>
                    {renderButtons()}
                </View>
            </View>
        </View>
    )
};
