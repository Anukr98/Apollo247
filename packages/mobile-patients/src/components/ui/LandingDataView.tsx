import React from 'react';
import { StyleSheet, View, Image, Text, Dimensions, FlatList } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  titleStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 24,
    color: theme.colors.CARD_HEADER,
    flexWrap: 'wrap',
  },
  descriptionStyle: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    color: theme.colors.GRAY,
    flexWrap: 'wrap',
  },
  topText: {
    color: theme.colors.CARD_HEADER,
    ...theme.fonts.IBMPlexSansSemiBold(18),
    textAlign: 'left',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    marginTop: 20,
  },
  iconStyle: {
    width: 80,
    height: 60,
    marginRight: 6,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: 20,
  },
  bannerUrl: {
    marginTop: 3,
    width: '100%',
    marginBottom: 20,
  },
});

interface LandingDataViewProps {}

const LandingDataView: React.FC<LandingDataViewProps> = (props) => {
  const { loginSection } = useAppCommonData();
  const bigScreenDevice = height >= 812 || width >= 812;

  const renderItem = (item: any, index: number) => {
    return (
      <View style={styles.innerContainer} key={index}>
        <Image source={{ uri: item?.iconUrl }} style={styles.iconStyle} resizeMode="contain" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.titleStyle]}>{item?.title}</Text>
          <Text style={styles.descriptionStyle}>{item?.description}</Text>
        </View>
      </View>
    );
  };

  const renderHeaderComponent = () => {
    return (
      <View style={{ marginHorizontal: 20 }}>
        <Image
          source={{ uri: loginSection?.bannerUrl }}
          style={[
            styles.bannerUrl,
            {
              height: bigScreenDevice ? 164 : 148,
            },
          ]}
          resizeMode="stretch"
        />
        <Text style={styles.topText}>{loginSection?.mainTitle}</Text>
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={loginSection?.data}
      keyExtractor={(_, index: Number) => `${index}`}
      renderItem={({ item, index }) => renderItem(item, index)}
      ListHeaderComponent={renderHeaderComponent}
    />
  );
};

export default React.memo(LandingDataView);
