import React, { useEffect, useState } from 'react'
import { View, Text, Dimensions, Image, StyleSheet, Animated } from 'react-native'
import Carousel from 'react-native-snap-carousel'
import { colors } from '@aph/mobile-patients/src/theme/colors'
import { theme } from '@aph/mobile-patients/src/theme/theme'

interface Props {
    focused: boolean;
}

export const LoginCarousel: React.FC<Props> = ({ focused }) => {

    interface Data {
        image: string,
        text: string
    }
    const [data, setdata] = useState<Array<Data>>([])

    useEffect(() => {
        getBannerTexts()
    },[])

    const getBannerTexts = async () => {
        await fetch('https://uatcms.apollo247.com/api/app-config', {
            headers: {
            Authorization : `Basic Y29udGVudDp3YWxtYXJ0TlVUdG9reW9IZWlzdA==`
            },
        })
        .then(res => res.json())
        .then(res => {
            const { consult, diagnostic, pharma } = res?.data || {}
            setdata([
                {
                    image: require('@aph/mobile-patients/src/images/home/loginBanner1.webp'),
                    text: consult?.title
                },
                {
                    image: require('@aph/mobile-patients/src/images/home/loginBanner2.webp'),
                    text: diagnostic?.title
                },
                {
                    image: require('@aph/mobile-patients/src/images/home/loginBanner3.webp'),
                    text: pharma?.title
                }
            ])
        })
    }

    const [slideIndex, setSlideIndex] = useState(0)
    const { width, height } = Dimensions.get('window')
    let ImageHeight = height * 0.25;
    const translateX = -width*.09

    const renderLoginCarousel = ({ item }: { item: Data }) => {
        return <View>
            <Image source={item?.image} resizeMode='contain' style={{ aspectRatio: 16/7, transform: [{ translateX }], height: ImageHeight }} />
            <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={styles.imageTitle}>{'medicine delivery in 2 hours'}</Text>
            </View>
        </View>
    }

    const renderDot = (active: boolean) => <View
        style={[
        styles.sliderDots,
        {
            backgroundColor: active
            ? colors.TURQUOISE_LIGHT_BLUE
            : colors.CAROUSEL_INACTIVE_DOT,
        },
        ]}
    />

    return (
        <View style={{ marginTop: '5%', height: height>650 ? height*0.4 : height*.35 }}>
            <Carousel
                onSnapToItem={setSlideIndex}
                sliderWidth={width}
                itemWidth={width}
                loop
                autoplay
                data={data}
                renderItem={renderLoginCarousel}
            />
            <View style={styles.dotsContainer}>
                {
                    data.map((_, index) => index == slideIndex ? renderDot(true) : renderDot(false))
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    sliderDots: {
        height: 2,
        borderRadius: 60,
        marginHorizontal: 4,
        width: 20,
        justifyContent: 'flex-start',
    },
    imageTitle: {
        ...theme.fonts.IBMPlexSansMedium(18),
        color: theme.colors.LOGIN_BANNER_TEXT
    }
})