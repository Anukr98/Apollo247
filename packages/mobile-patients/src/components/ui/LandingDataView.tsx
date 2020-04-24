import { StyleSheet, View, Image, Text, ImageSourcePropType, StyleProp, ImageStyle } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';

const styles = StyleSheet.create({
    anytime_imageStyle: {
        width: 112,
        height: 84,
    },
    doorstep_imageStyle: {
        width: 96,
        height: 72,
    },
    healthrecord_imageStyle: {
        width: 95,
        height: 71,
    },
    titleStyle: {
        ...theme.fonts.IBMPlexSansMedium(15),
        lineHeight: 24,
        color: theme.colors.CARD_HEADER,
    },
    descriptionStyle: {
        ...theme.fonts.IBMPlexSansRegular(12),
        lineHeight: 16,
        color: theme.colors.BLACK_COLOR,
        opacity: 0.5,
    },
    topText: {
        color: theme.colors.CARD_HEADER,
        ...theme.fonts.IBMPlexSansSemiBold(16),
        textAlign: 'left',
    },
});

interface landingText {
    id: number,
    title: string,
    description: string,
    image?: ImageSourcePropType,
    imageStyle?: StyleProp<ImageStyle>;
}

interface LandingDataViewProps { }
export const LandingDataView: React.FC<LandingDataViewProps> = (props) => {
    const landingData: landingText[] = [
        {
            id: 1,
            title: 'Apollo Doctor @ Home',
            description:
                'Over 20000 successful consults completed this month by 2000+ Apollo doctors across 51 specialities. Consultation from home on Video, Audio and Chat.',
            image: require('@aph/mobile-patients/src/images/onboard/img_onboarding_anytime.png'),
            imageStyle: styles.anytime_imageStyle,
        },
        {
            id: 2,
            title: 'Apollo Pharmacy @ Home',
            description:
                'We fulfill 5,00,000 Medicine order daily across India. 10% discount on chronic medicines and FREE home delivery.',
            image: require('@aph/mobile-patients/src/images/onboard/img_onboarding_doorstep.png'),
            imageStyle: styles.doorstep_imageStyle,
        },
        {
            id: 3,
            title: 'Apollo Medical Tests @ Home',
            description:
                'FREE home sample collection for medical tests at Apollo centers. Great packages and reports on App.',
            image: require('@aph/mobile-patients/src/images/onboard/img_onboarding_healthrecord.png'),
            imageStyle: styles.healthrecord_imageStyle,
        },
        {
            id: 3,
            title: '… and so much more!',
            description: '',
            image: {},
            imageStyle: {},
        },
    ];

    return (
        <View style={{ paddingLeft: 20, paddingRight: 20, marginTop: 20 }}>
            <View style={{ marginBottom: 17, marginLeft: 13 }}>
                <Text style={styles.topText}>Wondering what’s in store for you?</Text>
            </View>
            {landingData.map((item, index) => {
                return (
                    <View
                        style={{
                            flexDirection: 'row',
                            // margin: 16,
                        }}
                    >
                        <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start', width: 120 }}>
                            <Image source={item.image} style={item.imageStyle} resizeMode="cover" />
                        </View>
                        <View style={{ alignItems: 'flex-start', justifyContent: 'center', flex: 1 }}>
                            <Text
                                style={[
                                    styles.titleStyle,
                                    index == landingData.length - 1 ? { marginTop: 20 } : { marginTop: 14, marginBottom: 6 },
                                ]}
                            >
                                {item.title}
                            </Text>
                            <Text style={styles.descriptionStyle}>{item.description}</Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};
