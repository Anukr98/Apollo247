import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Text,
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { renderConsultPackageListShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import string from '@aph/mobile-patients/src/strings/strings.json';
import HTML from 'react-native-render-html';
import { getConsultPackages } from '@aph/mobile-patients/src/helpers/apiCalls';

export interface ConsultPackageListProps extends NavigationScreenProps<{}> {}

const styles = StyleSheet.create({
  noBookingTitle: {
    marginTop: 200,
    alignSelf: 'center',
    ...theme.viewStyles.text('R', 20, '#646464'),
  },
  orangeCTA: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: theme.colors.APP_YELLOW,
    alignSelf: 'flex-end',
  },
  noBookingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusStripText: {
    ...theme.viewStyles.text('M', 11, theme.colors.WHITE),
  },

  packageListContainer: {
    flex: 1,
    marginTop: 8,
    width: '100%',
  },

  packageItemCardContainer: {
    ...theme.viewStyles.cardViewStyle,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 7,
    marginHorizontal: 16,
    marginBottom: 7,
  },

  packageName: {
    ...theme.viewStyles.text('M', 16, theme.colors.BLACK_COLOR),
    marginRight: 90,
  },
  packageDescription: {
    ...theme.viewStyles.text('R', 12, theme.colors.BLACK_COLOR),
    marginTop: 3,
    marginBottom: 16,
  },
  startingAt: {
    ...theme.viewStyles.text('R', 12, theme.colors.BLACK_COLOR),
  },
  packagePrice: {
    ...theme.viewStyles.text('M', 12, theme.colors.GREEN),
    marginLeft: 3,
  },
  specialityImageContainer: {
    flexDirection: 'row',
    width: '50%',
    marginBottom: 18,
    marginLeft: -5,
  },
  startingAtContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  viewDetailsButton: {
    bottom: 0,
    right: 0,
    marginBottom: 0,
    flex: 1,
  },
  bestSellerTagContainer: {
    width: 90,
    backgroundColor: theme.colors.APP_GREEN,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bestSellerTagText: {
    ...theme.viewStyles.text('M', 9, theme.colors.WHITE),
    marginHorizontal: 10,
    marginVertical: 6,
  },
  specialityIcon: {
    width: 24,
    height: 24,
    marginHorizontal: 8,
  },
});

export const ConsultPackageList: React.FC<ConsultPackageListProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [packageList, setPackageList] = useState<[]>();

  useEffect(() => {
    setLoading(true);
    getConsultPackages()
      .then((response) => {
        setPackageList(response?.data?.data);
      })
      .catch((error) => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const renderHeader = (props) => {
    return (
      <Header
        leftIcon="backArrow"
        title={string.consultPackageList.consultationPackages}
        container={{ borderBottomWidth: 0 }}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderPackageListItem = (packageItem: any, index: any) => {
    return (
      <TouchableOpacity
        style={styles.packageItemCardContainer}
        onPress={() => {
          openPackageDetail(packageItem);
        }}
      >
        {packageItem?.PackageBestSeller ? (
          <View style={styles.bestSellerTagContainer}>
            <Text style={styles.bestSellerTagText}>BESTSELLER</Text>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row' }}>
          {packageItem?.PackagePlanDetails?.length > 0 &&
          packageItem?.PackagePlanDetails[0]?.PackagePlanType === 'Individual' &&
          packageItem?.SpecailtyIcons?.length > 0 ? (
            <Image
              source={{ uri: packageItem?.SpecailtyIcons[0]?.MobileIcon }}
              style={[styles.specialityIcon, { marginLeft: -5 }]}
            />
          ) : null}
          <Text style={styles.packageName}>{packageItem.PackageName || ''}</Text>
        </View>

        <HTML
          html={packageItem?.PackageDescription || ''}
          baseFontStyle={styles.packageDescription}
          ignoredStyles={[
            'line-height',
            'margin-bottom',
            'color',
            'text-align',
            'font-size',
            'font-family',
          ]}
        />

        {packageItem?.PackagePlanDetails?.length > 0 &&
        packageItem?.PackagePlanDetails[0]?.PackagePlanType === 'Multiple' ? (
          <ScrollView
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            horizontal
            style={styles.specialityImageContainer}
          >
            {packageItem?.SpecailtyIcons?.map((icon: any) => (
              <Image source={{ uri: icon.MobileIcon }} style={styles.specialityIcon} />
            ))}
          </ScrollView>
        ) : null}

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}
        >
          {packageItem?.PackagePlanDetails?.length > 0 ? (
            <View style={styles.startingAtContainer}>
              <Text style={styles.startingAt}>Starting at</Text>
              <Text style={styles.packagePrice}>
                ₹{packageItem?.PackagePlanDetails[0]?.PackagePlanFinalPrice}
              </Text>
            </View>
          ) : (
            <View style={styles.startingAtContainer} />
          )}

          <Button
            title={string.consultPackageList.viewDetails}
            style={styles.viewDetailsButton}
            onPress={() => {
              openPackageDetail(packageItem);
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const openPackageDetail = (packageItem: any) => {
    let isOneTapConsult =
      packageItem?.PackagePlanDetails?.length > 0 &&
      packageItem?.PackagePlanDetails[0]?.PackagePlanIsOneTap;

    props.navigation.navigate(AppRoutes.ConsultPackageDetail, {
      planId: packageItem?.PackageIdentifier,
      isOneTap: isOneTapConsult,
    });
  };

  const renderNoPackages = () => {
    return <Text style={styles.noBookingTitle}>{string.consultPackageList.noPackages}</Text>;
  };

  const renderPackageList = () => {
    return (
      <View style={styles.packageListContainer}>
        <FlatList
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          data={packageList || []}
          renderItem={({ item, index }) => renderPackageListItem(item, index)}
          keyExtractor={(_, index) => index.toString()}
          numColumns={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialNumToRender={packageList ? packageList.length : 0}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {renderHeader(props)}
      {loading
        ? renderConsultPackageListShimmer()
        : packageList?.length == 0
        ? renderNoPackages()
        : renderPackageList()}
    </SafeAreaView>
  );
};
