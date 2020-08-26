import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Text, TextInput, Keyboard, Platform } from 'react-native';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { colors } from '@aph/mobile-doctors/src/theme/colors';
import { AirbnbRating } from 'react-native-elements';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { AudioActive, AudioInactive, VideoActive, VideoInactive } from '@aph/mobile-doctors/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import { MultiSelectComponent } from '@aph/mobile-doctors/src/components/ui/MultiSelectComponent';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScrollView } from 'react-navigation';
import { CALL_FEEDBACK_RESPONSES_TYPES } from '@aph/mobile-doctors/src/graphql/types/globalTypes';

export interface RateCallProps {
    submitRatingCallback: (data: {
        rating: number;
        feedbackResponseType: CALL_FEEDBACK_RESPONSES_TYPES | null;
        audioFeedbacks: {}[];
        videoFeedbacks: {}[];
    }) => void;
    visible: boolean
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
    const [feedbackResponseType, setFeedbackResponseType] = useState<string>(callType[0].title);
    const [othersAudioFeedback, setOthersAudioFeedback] = useState<string>('');
    const [othersVideoFeedback, setOthersVideoFeedback] = useState<string>('');
    const [audioFeedbacks, setAudioFeedbacks] = useState<{}[]>([]);
    const [videoFeedbacks, setVideoFeedbacks] = useState<{}[]>([]);
    const [refreshState, setRefreshState] = useState<boolean>(false);
    const [isOtherAudioFeedback, setIsOtherAudioFeedback] = useState<boolean>(false);
    const [isOtherVideoFeedback, setIsOtherVideoFeedback] = useState<boolean>(false);
    const hasFeedbackIssue = rating !== 0 && rating < 3;
    const isBtnDisabled = rating < 3 && audioFeedbacks.length === 0 && videoFeedbacks.length === 0;

    useEffect(() => {
        const otherAudioFeedback = audioFeedbacks.filter((item: any) => item.responseName === "AUDIO_OTHER");
        if (otherAudioFeedback && otherAudioFeedback.length > 0) {
            setIsOtherAudioFeedback(true);
        } else {
            setIsOtherAudioFeedback(false);
        }

        const otherVideoFeedback = videoFeedbacks.filter((item: any) => item.responseName === "VIDEO_OTHER");
        if (otherVideoFeedback && otherVideoFeedback.length > 0) {
            setIsOtherVideoFeedback(true);
        } else {
            setIsOtherVideoFeedback(false);
        }
    }, [refreshState])

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
            <View style={{ display: hasFeedbackIssue ? "flex" : "none" }}>
                {renderCalltypeTab()}
                {feedbackResponseType === string.case_sheet.audio ? renderAudioQuestions() : renderVideoQuestions()}
            </View>
        )
    }

    const renderCalltypeTab = () => {
        return (
            <TabsComponent
                style={styles.tab}
                data={callType}
                onChange={(feedbackResponseType: string) => {
                    setFeedbackResponseType(feedbackResponseType);
                }}
                selectedTab={feedbackResponseType}
                showTextIcons={true}
                isVerticalTextIcons={true}
                height={90}
                textStyle={styles.tabTextStyle}
            />
        )
    }

    const audioFeedbackCallback = (data: {
        responseValue: string;
        responseName: string
    }[]) => {
        setAudioFeedbacks(data);
        setRefreshState(!refreshState)
    }

    const videoFeedbackCallback = (data: {
        responseValue: string;
        responseName: string
    }[]) => {
        setVideoFeedbacks(data);
        setRefreshState(!refreshState)
    }

    const renderAudioQuestions = () => {
        return (
            <View>
                <MultiSelectComponent
                    data={string.case_sheet.audioReviews}
                    itemSelectionCallback={(data) => audioFeedbackCallback(data)}
                />
                {isOtherAudioFeedback
                    ?
                    <TextInput
                        placeholder={string.case_sheet.othersReasonPlaceholder}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={colors.LIGHT_BLUE}
                        style={styles.othersInputStyle}
                        value={othersAudioFeedback}
                        onChangeText={(value) => setOthersAudioFeedback(value)}
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
                    itemSelectionCallback={(data) => videoFeedbackCallback(data)}
                />
                {isOtherVideoFeedback
                    ?
                    <TextInput
                        placeholder={string.case_sheet.othersReasonPlaceholder}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={colors.LIGHT_BLUE}
                        style={styles.othersInputStyle}
                        value={othersVideoFeedback}
                        onChangeText={(value) => setOthersVideoFeedback(value)}
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
                disabled={isBtnDisabled}
                onPress={() => {
                    Keyboard.dismiss();
                    const newAudioFeedbacks = audioFeedbacks.filter((item: any) => item.responseName.includes("AUDIO"));
                    const filteredAudioFeedbacks = newAudioFeedbacks.map((item: any) => {
                        var obj = Object.assign({}, item);
                        if (obj.responseName === "AUDIO_OTHER") {
                            obj.comment = othersAudioFeedback;
                            obj.responseName = "OTHER"
                        }
                        return obj
                    });

                    const newVideoFeedbacks = videoFeedbacks.filter((item: any) => item.responseName.includes("VIDEO"));
                    const filteredVideoFeedbacks = newVideoFeedbacks.map((item: any) => {
                        var obj = Object.assign({}, item);
                        if (obj.responseName === "VIDEO_OTHER") {
                            obj.comment = othersVideoFeedback;
                            obj.responseName = "OTHER"
                        }
                        return obj
                    });
                    props.submitRatingCallback({
                        rating: rating,
                        feedbackResponseType: hasFeedbackIssue ? filteredAudioFeedbacks.length > 0 && filteredVideoFeedbacks.length > 0 ? CALL_FEEDBACK_RESPONSES_TYPES.AUDIOVIDEO : filteredAudioFeedbacks.length > 0 ? CALL_FEEDBACK_RESPONSES_TYPES.AUDIO : CALL_FEEDBACK_RESPONSES_TYPES.VIDEO : null,
                        audioFeedbacks: hasFeedbackIssue ? filteredAudioFeedbacks : [],
                        videoFeedbacks: hasFeedbackIssue ? filteredVideoFeedbacks : []
                    });
                    cleanupState();
                }}
            />
        )
    }

    const cleanupState = () => {
        setRating(0);
        setFeedbackResponseType(callType[0].title);
        setAudioFeedbacks([]);
        setVideoFeedbacks([]);
        setOthersAudioFeedback('');
        setOthersVideoFeedback('');
        setIsOtherAudioFeedback(false);
        setIsOtherVideoFeedback(false);
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={props.visible}
        >
            <View style={styles.mainView}>
                <View style={styles.cardView}>
                    <KeyboardAwareScrollView bounces={false} showsVerticalScrollIndicator={false} extraHeight={180} keyboardShouldPersistTaps="handled">
                        <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
                            <Text style={styles.title}>{string.case_sheet.howWasYourExperience}</Text>
                            {renderRating()}
                            {rating !== 0 && <Text style={styles.thankyouTxt}>{hasFeedbackIssue ? string.case_sheet.what_went_wrong : string.case_sheet.thankYou}</Text>}
                            {rating !== 0 && <Text style={styles.thankyouSubtitle}>{hasFeedbackIssue ? string.case_sheet.let_us_know : string.case_sheet.thankyou_subtitle}</Text>}
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
        marginTop: Platform.OS === 'ios' ? 20 : 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.LIGHT_BLUE,
        paddingBottom: Platform.OS === 'ios' ? 8 : 0,
        ...theme.fonts.IBMPlexSansLight(11),
        color: colors.LIGHT_BLUE
    }
})