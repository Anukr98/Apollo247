import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Clipboard,
  StyleSheet,
  TouchableOpacity,
  Image as ImageNative,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  filterHtmlContent,
  couponThumbnailUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import HTML from 'react-native-render-html';
import { SpecialOffersCouponsData } from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';
import moment from 'moment';
import {
  UpOrange,
  DownOrange,
  YellowTickIcon,
  CopyBlue,
} from '@aph/mobile-patients/src/components/ui/Icons';

export const CouponsSection = (props: { offersdata: SpecialOffersCouponsData[] }) => {
  const { offersdata } = props;
  const newOffersData = offersdata.map((ele: any) => ({ ...ele, knowMoreOption: false }));
  const [couponOffersData, setCouponOffersData] = useState(newOffersData);
  const [visibleOffers, setVisibleOffers] = useState<number>(
    couponOffersData?.length === 1 ? couponOffersData?.length : 2
  );
  const [showPopup, setShowPopup] = useState<Boolean>(false);
  const [popupText, setPopupText] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string>();
  const [showViewMoreButton, setShowViewMoreButton] = useState<boolean>(true);

  const getFormattedDaySubscript = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const getFormattedDate = (time: string) => {
    const day = parseInt(moment(time).format('D'));
    const getDaySubscript = getFormattedDaySubscript(day);
    const finalDateTime =
      day + getDaySubscript + ' ' + moment(time).format('MMMM') + ',' + moment(time).format('YYYY');

    return finalDateTime;
  };

  const copyToClipboard = (code: string) => {
    Clipboard.setString(code);
    setCopiedCode(code);
  };

  const updateKnowMore = (position: number) => {
    const array = [...couponOffersData];
    array[position].knowMoreOption = !array[position].knowMoreOption;
    setCouponOffersData(array);
  };

  const renderItem = (imgUrl: string, item, index) => {
    const couponCodePresent = item?.couponCode ? true : false;
    const coupon = copiedCode;
    const validTillDate = getFormattedDate(new Date(item.endDate).toString());

    return (
      <View style={styles.offerContainer}>
        <View style={styles.singleOffer}>
          <View style={{ flexDirection: 'row' }}>
            <View style={styles.imageContainer}>
              <ImageNative
                source={{ uri: imgUrl }}
                style={styles.imageStyles}
                resizeMode="contain"
              />
            </View>
            <View style={{ flexDirection: 'column', flex: 1 }}>
              <Text style={styles.headerStyle}>{item.header}</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.subHeaderStyle, { alignSelf: 'flex-start' }]}>
                  Valid till -{' '}
                </Text>
                <Text style={[styles.subHeaderStyle, styles.subHeaderAdditionalStyle]}>
                  {validTillDate}
                </Text>
                <Text style={[styles.subHeaderStyle, { paddingRight: 21 }]}> | </Text>
                {couponCodePresent ? (
                  <View style={styles.couponCodeContainer}>
                    <Text style={[styles.subHeaderStyle, { alignSelf: 'flex-end' }]}>
                      Use Code -
                    </Text>
                    <Text
                      style={[styles.subHeaderStyle, { fontWeight: '500', alignSelf: 'flex-end' }]}
                    >
                      {item?.couponCode}
                    </Text>
                  </View>
                ) : (
                  <View style={{ paddingRight: 10, flex: 1, justifyContent: 'flex-end' }}>
                    <Text style={[styles.subHeaderStyle, { alignSelf: 'flex-end' }]}>
                      Code Not Required
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.couponAndKnowMoreContainer}>
                <TouchableOpacity onPress={() => updateKnowMore(index)}>
                  <View style={{ flexDirection: 'row', paddingRight: 12 }}>
                    <Text style={[styles.bottomHeaderStyle, { alignSelf: 'flex-start' }]}>
                      {item?.knowMoreOption ? `Know Less ` : `Know More `}
                    </Text>
                    {item?.knowMoreOption ? (
                      <UpOrange style={styles.arrowIconStyles} />
                    ) : (
                      <DownOrange style={styles.arrowIconStyles} />
                    )}
                  </View>
                </TouchableOpacity>
                {couponCodePresent && (
                  <TouchableOpacity onPress={() => copyToClipboard(item?.couponCode)}>
                    <View style={{ flexDirection: 'row', paddingRight: 12 }}>
                      <Text style={[styles.bottomHeaderStyle, { alignSelf: 'flex-end' }]}>
                        {'Copy Code'}
                      </Text>
                      {coupon === item?.couponCode ? (
                        <YellowTickIcon style={[styles.arrowIconStyles, styles.copyIconStyles]} />
                      ) : (
                        <CopyBlue style={[styles.arrowIconStyles, styles.copyIconStyles]} />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
        {item?.knowMoreOption && (
          <View style={styles.singleOffer}>
            <Text style={styles.couponKnowMoreText}>
              {string.specialOffersScreen.couponKnowMore}
            </Text>
            <View style={{ paddingLeft: 15 }}>
              <HTML html={filterHtmlContent(item.knowMore)} baseFontStyle={styles.htmlContent} />
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowPopup(true);
                setPopupText(item.terms);
              }}
            >
              <Text style={[styles.couponKnowMoreText, styles.termsConditions]}>
                {string.specialOffersScreen.readTermsAndConditions}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderViewAllOffersButton = () => {
    return (
      <View style={styles.buttonContainerStyle}>
        <TouchableOpacity
          onPress={() => {
            visibleOffers < couponOffersData?.length
              ? setVisibleOffers(couponOffersData?.length)
              : setVisibleOffers(couponOffersData?.length === 1 ? couponOffersData?.length : 2);
            setShowViewMoreButton(!showViewMoreButton);
          }}
          style={{ flexDirection: 'row', justifyContent: 'center' }}
        >
          {showViewMoreButton ? (
            <Text style={styles.viewAllText}>VIEW ALL ({couponOffersData?.length}) OFFERS </Text>
          ) : (
            <Text style={styles.viewAllText}>VIEW LESS </Text>
          )}
          {showViewMoreButton ? (
            <DownOrange style={styles.upDownArrayStyles} />
          ) : (
            <UpOrange style={styles.upDownArrayStyles} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderTermsPopup = () => {
    return (
      <Overlay
        onRequestClose={() => {
          setShowPopup(false);
        }}
        onBackdropPress={() => setShowPopup(false)}
        isVisible={true}
        windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
        overlayStyle={[styles.overlayStyle, styles.susbtituteOverlay]}
      >
        <View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowPopup(false);
            }}
          >
            <Text style={{ color: '#02475B' }}>X</Text>
          </TouchableOpacity>
          <HTML html={filterHtmlContent(popupText)} />
        </View>
      </Overlay>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        bounces={false}
        keyExtractor={(_, index) => `${index}`}
        data={
          visibleOffers < couponOffersData.length
            ? couponOffersData.slice(0, visibleOffers)
            : couponOffersData
        }
        renderItem={({ item, index }) => {
          const imgUrl = couponThumbnailUrl(item?.logo);
          return renderItem(imgUrl, item, index);
        }}
      />
      {renderViewAllOffersButton()}

      {showPopup && renderTermsPopup()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
  },
  offerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  singleOffer: {
    width: '90%',
    backgroundColor: '#F7F8F5',
    paddingBottom: 15,
    paddingTop: 10,
  },
  imageContainer: {
    paddingRight: 10,
    paddingLeft: 15,
    paddingTop: 5,
  },
  imageStyles: {
    height: 70,
    width: 70,
    alignSelf: 'center',
  },
  headerStyle: {
    ...theme.fonts.IBMPlexSansRegular(10),
    color: '#02475B',
    paddingBottom: 10,
    paddingRight: 10,
    fontWeight: '600',
    lineHeight: 15,
  },
  subHeaderStyle: {
    ...theme.fonts.IBMPlexSansRegular(8),
    color: '#02475B',
    opacity: 0.7,
    paddingBottom: 10,
  },
  subHeaderAdditionalStyle: {
    paddingRight: 21,
    fontWeight: '500',
    alignSelf: 'flex-start',
  },
  couponCodeContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  bottomHeaderStyle: {
    ...theme.fonts.IBMPlexSansRegular(9),
    color: '#FFA92C',
    paddingRight: 5,
    fontWeight: '500',
  },
  couponKnowMoreText: {
    ...theme.fonts.IBMPlexSansRegular(10),
    color: '#007C9D',
    paddingBottom: 10,
    paddingLeft: 15,
    lineHeight: 18,
    fontWeight: '400',
  },
  htmlContent: {
    ...theme.fonts.IBMPlexSansRegular(10),
    color: '#007C9D',
  },
  termsConditions: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  buttonContainerStyle: {
    ...theme.viewStyles.shadowStyle,
    backgroundColor: '#FFFFFF',
    width: '90%',
    alignSelf: 'center',
    paddingTop: 15,
    paddingBottom: 15,
    borderRadius: 5,
    marginBottom: 5,
  },
  viewAllText: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: '#FC9916',
    textAlign: 'center',
  },
  overlayStyle: {
    padding: 0,
    width: 'auto',
    height: 'auto',
    backgroundColor: '#02475B',
    elevation: 0,
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  susbtituteOverlay: {
    backgroundColor: '#FFFFFF',
    width: '75%',
    paddingVertical: 20,
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    backgroundColor: theme.colors.WHITE,
    padding: 3,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 30,
    zIndex: 9,
    top: -45,
    right: -20,
  },
  arrowIconStyles: {
    height: 6,
    width: 6,
    alignSelf: 'center',
    opacity: 0.7,
    paddingTop: 5,
  },
  copyIconStyles: {
    height: 8,
    width: 8,
  },
  upDownArrayStyles: {
    height: 10,
    width: 10,
    paddingTop: 3,
    alignSelf: 'center',
  },
  couponAndKnowMoreContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
});
