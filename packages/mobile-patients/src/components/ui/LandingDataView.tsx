import React from 'react';
import { StyleSheet, View, Image, Text, Dimensions, FlatList } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { DeviceHelper } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
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
    paddingLeft: 20,
    paddingRight: 20,
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
  },
  bannerUrl: {
    marginTop: 10,
    width: '100%',
    marginBottom: 20,
  },
});

interface LandingDataViewProps {
  showRemoteBanner?: boolean;
}

export const LandingDataView: React.FC<LandingDataViewProps> = (props) => {
  const { showRemoteBanner } = props;
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
      <View>
        {showRemoteBanner && (
          <Image
            source={{ uri: loginSection?.bannerUrl }}
            style={[
              styles.bannerUrl,
              {
                height: bigScreenDevice ? 155 : 142,
              },
            ]}
            resizeMode="stretch"
          />
        )}
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
