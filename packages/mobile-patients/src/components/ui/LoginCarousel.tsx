import React, { useEffect, useState } from 'react'
import { View, Text, Dimensions, Image, StyleSheet } from 'react-native'
import Carousel from 'react-native-snap-carousel'
import { colors } from '@aph/mobile-patients/src/theme/colors'

export const LoginCarousel: React.FC = () => {

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
                    image: require('@aph/mobile-patients/src/images/home/loginBanner1.png'),
                    text: consult?.title
                },
                {
                    image: require('@aph/mobile-patients/src/images/home/loginBanner2.png'),
                    text: diagnostic?.title
                },
                {
                    image: require('@aph/mobile-patients/src/images/home/loginBanner3.png'),
                    text: pharma?.title
                }
            ])
        })
    }

    const [slideIndex, setSlideIndex] = useState(0)
    const { width } = Dimensions.get('window')

    const renderLoginCarousel = ({ item }: { item: Data }) => {
        return <View>
            <Image source={item?.image} resizeMode='contain' style={{ aspectRatio: 16/7, transform: [{ translateX: -30 }], height: 200 }} />
            <View style={{ alignItems: 'center', marginTop: '4%' }}>
                <Text>{item?.text}</Text>
            </View>
        </View>
    }

    const renderDot = (active: boolean) => <View
        style={[
        styles.sliderDots,
        {
            backgroundColor: active
            ? colors.LOGIN_CAROUSEL_ACTIVE_DOT
            : colors.CAROUSEL_INACTIVE_DOT,
        },
        ]}
    />

    return (
        <View style={{ marginTop: '5%' }}>
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
        marginTop: '6%'
    },

    sliderDots: {
        height: 2,
        borderRadius: 60,
        marginHorizontal: 4,
        marginTop: 14,
        width: 20,
        justifyContent: 'flex-start',
    }
})