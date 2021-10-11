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

  const renderOffer = (offer: any) => {
    const imageUrl = `${AppConfig.Configuration.offerIconBaseUrl}${offer?.offer_description?.sponsored_by}.png`;
    return (
      <View style={styles.offer}>
        <View style={{ flexDirection: 'row', marginHorizontal: 16 }}>
          <Image style={{ height: 18, width: 18 }} source={{ uri: imageUrl }} />
          <Text style={styles.offerTitle}>{offer?.offer_description?.title}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 2, marginHorizontal: 16 }}>
          <Text style={styles.offerDescription}>
            {offer?.offer_description?.description}
            <Text style={styles.TnC} onPress={() => onPressTnC(offer)}>
              {'  '}
              TnC Apply
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  const renderOffers = () => {
    return (
      <View style={styles.ChildComponent}>
        {showMore ? (
          <FlatList data={offers} renderItem={(item: any) => renderOffer(item?.item)} />
        ) : (
          renderOffer(offers[0])
        )}

        {renderShowMore()}
      </View>
    );
  };

  const renderShowMore = () => {
    return (
      <TouchableOpacity style={styles.showMoreCont} onPress={() => setShowMore(!showMore)}>
        <Text style={styles.showMore}>Show More</Text>
        <DownOrange
          style={{ ...styles.downArrow, transform: [{ rotate: showMore ? '180deg' : '0deg' }] }}
        />
      </TouchableOpacity>
    );
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
    backgroundColor: '#F6FFFF',
  },
  header: {
    alignItems: 'center',
    marginHorizontal: 20,
    flexDirection: 'row',
    paddingBottom: 10,
    marginTop: 20,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  heading: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#01475B',
    marginLeft: 4,
  },
  offerIcon: {
    height: 16,
    width: 16,
  },
  offer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  offerTitle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 8,
  },
  offerDescription: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 18,
    color: '#01475B',
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
    marginVertical: 10,
    marginHorizontal: 16,
  },
  TnC: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: '#FC9916',
    marginLeft: 6,
  },
});
