import React, { useState } from 'react';
import { View, Modal, StyleSheet, Text, TextInput, Keyboard } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { colors } from '@aph/mobile-doctors/src/theme/colors';
import { AirbnbRating } from 'react-native-elements';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import {AudioActive, AudioInactive, VideoActive, VideoInactive} from '@aph/mobile-doctors/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { MultiSelectComponent } from '@aph/mobile-doctors/src/components/ui/MultiSelectComponent';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScrollView } from 'react-navigation';

export interface RateCallProps {
    submitRatingCallback: (data: {
        rating: number;
        selectedCalltype: string;
        audioProblems: string[];
        videoProblems: string[];
        othersAudioProblem: string;
        othersVideoProblem: string;
    }) => void;
}

export const RateCall: React.FC<RateCallProps> = (props) => {

    const callType = [
        {
            title: string.case_sheet.audio,
            selectedIcon: <AudioActive />,
            unselectedIcon: <AudioInactive />,
        },
        {
            title: string.case_sheet.video,
            selectedIcon: <VideoActive />,
            unselectedIcon: <VideoInactive />,
        },
    ];

    const [rating, setRating] = useState<number>(0);
    const [selectedCalltype, setSelectedCalltype] = useState<string>(callType[0].title);
    const [othersAudioProblem, setOthersAudioProblem] = useState<string>('');
    const [othersVideoProblem, setOthersVideoProblem] = useState<string>('');
    const [audioProblems, setAudioProblems] = useState<string[]>([]);
    const [videoProblems, setVideoProblems] = useState<string[]>([]);

    const hasProblem = rating !== 0 && rating < 3;
    const hasOthersAudioProblem = audioProblems.includes(string.case_sheet.audioReviews[string.case_sheet.audioReviews.length - 1].value);
    const hasOthersVideoProblem = videoProblems.includes(string.case_sheet.videoReviews[string.case_sheet.videoReviews.length - 1].value);
    const filteredAudioResults = audioProblems.filter(item => item !== string.case_sheet.audioReviews[string.case_sheet.audioReviews.length - 1].value);
    const filteredVideoResults = videoProblems.filter(item => item !== string.case_sheet.videoReviews[string.case_sheet.videoReviews.length - 1].value);
    const disableBtn = rating < 3 && filteredAudioResults.length === 0 && filteredVideoResults.length === 0 && !othersAudioProblem && !othersVideoProblem;

    const handleRating = (rating: number) => {
        setRating(rating);
    }

    const renderRating = () => {
        return (
            <AirbnbRating
                count={5}
                defaultRating={0}
                size={24}
                reviews={[""]}
                selectedColor={colors.RATING_YELLOW}
                unselectedColor="red"
                onFinishRating={handleRating}
            />
        )
    }

    const renderMultiSelectQuestions = () => {
        return (
            <View style={{ display: hasProblem ? "flex" : "none" }}>
                {renderCalltypeTab()}
                {selectedCalltype === string.case_sheet.audio ? renderAudioQuestions() : renderVideoQuestions()}
            </View>
        )
    }

    const renderCalltypeTab = () => {
        return (
            <TabsComponent
                style={styles.tab}
                data={callType}
                onChange={(selectedCalltype: string) => {
                    setSelectedCalltype(selectedCalltype);
                }}
                selectedTab={selectedCalltype}
                showTextIcons={true}
                isVerticalTextIcons={true}
                height={90}
                textStyle={styles.tabTextStyle}
            />
        )
    }

    const audioProblemsCallback = (data: {
        value: string;
        key: string
    }[]) => {
        const filteredAudioResults = data.filter(item => item.key.includes('A'));
        const convertedResult = filteredAudioResults.map(function (obj) {
            return obj.value;
        });
        setAudioProblems(convertedResult);
    }

    const videoProblemsCallback = (data: {
        value: string;
        key: string
    }[]) => {
        const filteredVideoResults = data.filter(item => item.key.includes('V'));
        const convertedResult = filteredVideoResults.map(function (obj) {
            return obj.value;
        });
        setVideoProblems(convertedResult);
    }

    const renderAudioQuestions = () => {
        return (
            <View>
                <MultiSelectComponent
                    data={string.case_sheet.audioReviews}
                    itemSelectionCallback={(data) => audioProblemsCallback(data)}
                />
                {hasOthersAudioProblem // If includes others as reason
                    ?
                    <TextInput
                        placeholder={string.case_sheet.othersReasonPlaceholder}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={colors.LIGHT_BLUE}
                        style={styles.othersInputStyle}
                        value={othersAudioProblem}
                        onChangeText={(value) => setOthersAudioProblem(value)}
                        selectionColor={colors.LIGHT_BLUE}
                    />
                    : <View />
                }
            </View>
        )
    }

    const renderVideoQuestions = () => {
        return (
            <View>
                <MultiSelectComponent
                    data={string.case_sheet.videoReviews}
                    itemSelectionCallback={(data) => videoProblemsCallback(data)}
                />
                {hasOthersVideoProblem // If includes others as reason
                    ?
                    <TextInput
                        placeholder={string.case_sheet.othersReasonPlaceholder}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={colors.LIGHT_BLUE}
                        style={styles.othersInputStyle}
                        value={othersVideoProblem}
                        onChangeText={(value) => setOthersVideoProblem(value)}
                        selectionColor={colors.LIGHT_BLUE}
                    />
                    : <View />
                }
            </View>
        )
    }

    const renderSubmitBtn = () => {
        return (
            <Button
                title={string.buttons.submit}
                style={styles.submitBtn}
                disabled={disableBtn}
                onPress={() => {
                    Keyboard.dismiss();
                    props.submitRatingCallback({
                        rating: rating,
                        selectedCalltype: hasProblem ? audioProblems.length > 0 && videoProblems.length > 0 ? "Video+Audio" : audioProblems.length > 0 ? "Audio" : "Video" : "",
                        audioProblems: hasProblem ? filteredAudioResults : [],
                        videoProblems: hasProblem ? filteredVideoResults : [],
                        othersAudioProblem: hasProblem && hasOthersAudioProblem ? othersAudioProblem : "",
                        othersVideoProblem: hasProblem && hasOthersVideoProblem ? othersVideoProblem : ""
                    });
                }}
            />
        )
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={true}
        >
            <View style={styles.mainView}>
                <View style={styles.cardView}>
                    <KeyboardAwareScrollView bounces={false} showsVerticalScrollIndicator={false} extraHeight={180} keyboardShouldPersistTaps="handled">
                        <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
                            <Text style={styles.title}>{string.case_sheet.howWasYourExperience}</Text>
                            {renderRating()}
                            {rating !== 0 && <Text style={styles.thankyouTxt}>{hasProblem ? string.case_sheet.what_went_wrong : string.case_sheet.thankYou}</Text>}
                            {rating !== 0 && <Text style={styles.thankyouSubtitle}>{hasProblem ? string.case_sheet.let_us_know : string.case_sheet.thankyou_subtitle}</Text>}
                            {renderMultiSelectQuestions()}
                            {rating !== 0 && renderSubmitBtn()}
                        </ScrollView>
                    </KeyboardAwareScrollView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    mainView: {
        backgroundColor: 'white',
        flex: 1,
        padding: 20,
        justifyContent: 'center'
    },
    cardView: {
        ...theme.viewStyles.cardViewStyle,
        ...theme.viewStyles.shadowStyle,
        borderRadius: 0,
        padding: 30
    },
    title: {
        ...theme.fonts.IBMPlexSansMedium(18),
        color: colors.TITLE_GREEN
    },
    thankyouTxt: {
        marginTop: 20,
        ...theme.fonts.IBMPlexSansRegular(18),
        color: colors.LIGHT_BLACK
    },
    thankyouSubtitle: {
        marginTop: 5,
        ...theme.fonts.IBMPlexSansRegular(),
        color: colors.LIGHT_BLACK
    },
    submitBtn: {
        marginTop: 30,
        width: 118
    },
    tab: {
        backgroundColor: theme.colors.CARD_BG,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(2, 71, 91, 0.3)',
        marginTop: 20
    },
    tabTextStyle: {
        marginLeft: 0,
        marginTop: 0
    },
    othersInputStyle: {
        marginTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.LIGHT_BLUE,
        paddingBottom: 8,
        ...theme.fonts.IBMPlexSansLight(11),
        color: colors.LIGHT_BLUE
    }
})