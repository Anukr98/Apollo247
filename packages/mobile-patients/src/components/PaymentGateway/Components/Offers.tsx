import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DownOrange, OfferBlueIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface offersProps {
  offers: any;
  onPressTnC: (offer: any) => void;
}

export const Offers: React.FC<offersProps> = (props) => {
  const { offers, onPressTnC } = props;
  const [showMore, setShowMore] = useState<boolean>(false);

  const renderOffer = (offer: any, index: number) => {
    const imageUrl = `${AppConfig.Configuration.offerIconBaseUrl}${offer?.offer_description?.sponsored_by}.png`;
    return (
      <View style={{ ...styles.offer, borderTopWidth: index == 0 ? 0 : 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', flex: 0.8 }}>
            <Image style={{ height: 18, width: 18 }} source={{ uri: imageUrl }} />
            <Text style={styles.offerTitle}>{offer?.offer_description?.title}</Text>
          </View>
          <Text style={styles.TnC} onPress={() => onPressTnC(offer)}>
            {'T&C Apply'}
          </Text>
        </View>
        <View style={styles.offerCont}>
          <Text style={styles.offerDescription}>{offer?.offer_description?.description}</Text>
        </View>
      </View>
    );
  };

  const renderOffers = () => {
    return (
      <View style={styles.ChildComponent}>
        {showMore ? (
          <FlatList
            data={offers}
            renderItem={(item: any) => renderOffer(item?.item, item?.index)}
          />
        ) : (
          renderOffer(offers[0], 0)
        )}

        {renderShowMore()}
      </View>
    );
  };

  const renderShowMore = () => {
    return offers?.length > 1 ? (
      <TouchableOpacity style={styles.showMoreCont} onPress={() => setShowMore(!showMore)}>
        <Text style={styles.showMore}>{showMore ? 'SHOW LESS' : 'SHOW ALL OFFERS'}</Text>
        <DownOrange
          style={{ ...styles.downArrow, transform: [{ rotate: showMore ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>
    ) : null;
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <OfferBlueIcon style={styles.offerIcon} />
        <Text style={styles.heading}>BANK OFFERS</Text>
      </View>
    );
  };

  return !!offers?.length ? (
    <View>
      {renderHeader()}
      {renderOffers()}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#FFF9EF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
  },
  header: {
    alignItems: 'center',
    marginHorizontal: 16,
    flexDirection: 'row',
    paddingBottom: 8,
    marginTop: 16,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 4,
  },
  offerIcon: {
    height: 16,
    width: 16,
  },
  offer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    marginHorizontal: 12,
  },
  offerTitle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 8,
  },
  offerCont: {
    marginTop: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  offerDescription: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 18,
    color: '#01475B',
    marginTop: 2,
  },
  showMore: {
    ...theme.fonts.IBMPlexSansBold(12),
    lineHeight: 20,
    color: '#FC9916',
  },
  downArrow: {
    height: 5.5,
    width: 10,
    marginLeft: 10,
    marginTop: 2,
  },
  showMoreCont: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  TnC: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: '#FC9916',
    marginLeft: 6,
    flex: 0.2,
    textAlign: 'right',
  },
});
