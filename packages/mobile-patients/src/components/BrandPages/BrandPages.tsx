import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image as ImageNative,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { MedicineListingHeader } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingHeader';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { BrandData } from '@aph/mobile-patients/src/helpers/apiCalls';
import AsyncStorage from '@react-native-community/async-storage';
import { USER_AGENT } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { MedicineListing } from '../MedicineListing/MedicineListing';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { handleOpenURL, pushTheView } from '@aph/mobile-patients/src/helpers/deeplinkRedirection';

export interface BrandPagesProps
  extends NavigationScreenProps<{
    movedFrom?: 'home';
    brandData?: BrandData[];
    category_id?: string;
    title?: string;
  }> {}

export const BrandPages: React.FC<BrandPagesProps> = (props) => {
  const brandData = props.navigation.getParam('brandData');

  const menu = brandData?.[0]?.brandMenuList.map((ele) => {
    if (ele?.MenuRedirectionUrl) {
      return ele?.MenuName;
    }
  });
  menu?.includes('Home') === false
    ? menu?.splice(0, 0, 'Home')
    : menu?.indexOf('Home') !== 0
    ? (menu?.splice(menu?.indexOf('Home'), 1), menu?.splice(0, 0, 'Home'))
    : '';
  menu?.splice(1, 0, 'All Products');

  const imgHeight = 175;
  const movedFromBrandPages = true;
  const imageUrl = brandData?.[0]?.brandMobileBannerImg
    ? brandData?.[0]?.brandMobileBannerImg
    : brandData?.[0]?.brandMainBannerImg;
  const [userAgent, setUserAgent] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<number>(0);
  const [selectedMenuItemName, setSelectedMenuItemName] = useState<string>('Home');
  const [categoryID, setCategoryID] = useState(props.navigation.getParam('category_id'));
  const [title, setTitle] = useState(props.navigation.getParam('title'));

  AsyncStorage.getItem(USER_AGENT).then((userAgent) => {
    setUserAgent(userAgent || '');
  });

  const renderHeader = () => {
    return (
      <MedicineListingHeader
        navigation={props.navigation}
        movedFrom={'brandPages'}
        navSrcForSearchSuccess={'Brand Pages'}
      />
    );
  };

  const renderMainBanner = () => {
    return (
      <TouchableOpacity activeOpacity={1}>
        <ImageNative
          resizeMode="stretch"
          style={{ width: '100%', minHeight: imgHeight }}
          source={{
            uri: imageUrl,
            headers: {
              'User-Agent': userAgent,
            },
          }}
          progressiveRenderingEnabled={true}
        />
      </TouchableOpacity>
    );
  };

  const handleOnPressBanner = (brandRedirectionUrl: string) => {
    if (brandRedirectionUrl.startsWith('category')) {
      const arr = brandRedirectionUrl.split('#');
      props.navigation.navigate(AppRoutes.MedicineListing, {
        category_id: arr[1],
        title: categoryID === arr[1] ? title : 'Products',
      });
    } else if (brandRedirectionUrl.startsWith('PDP')) {
      const arr = brandRedirectionUrl.split('#');
      props.navigation.navigate(AppRoutes.ProductDetailPage, {
        sku: arr[1],
        movedFrom: ProductPageViewedSource.BRAND_PAGES,
      });
    } else {
      const res = handleOpenURL(brandRedirectionUrl);
      if (res?.routeName !== 'ConsultRoom') {
        pushTheView(
          props.navigation,
          res?.routeName,
          res?.id ? res?.id : undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          movedFromBrandPages
        );
      }
    }
  };

  const renderOtherBanner = (imgUrl: string, item) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          handleOnPressBanner(item?.brandRedirectionUrl);
        }}
      >
        <ImageNative
          resizeMode="stretch"
          style={{ width: '100%', minHeight: imgHeight }}
          source={{
            uri: imgUrl,
            headers: {
              'User-Agent': userAgent,
            },
          }}
          progressiveRenderingEnabled={true}
        />
      </TouchableOpacity>
    );
  };

  const renderMenuItems = (item: string, index: number) => {
    return (
      <View
        style={
          index === selectedMenuItem
            ? [styles.selectedMenuItemStyle, styles.menuItemContainer]
            : styles.menuItemContainer
        }
      >
        <TouchableOpacity
          onPress={() => {
            onPressMenuItem(item, index);
          }}
        >
          <Text
            style={
              index === selectedMenuItem
                ? [styles.menuTextStyle, styles.selectedMenuTextStyle]
                : styles.menuTextStyle
            }
          >
            {item}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const onPressMenuItem = (item: string, index: number) => {
    setSelectedMenuItem(index);
    setSelectedMenuItemName(item);
    if (item === 'Home' || item === 'All Products') {
      props.navigation.setParams({ category_id: categoryID || '' });
      props.navigation.setParams({ title: title || 'Products' });
      props.navigation.setParams({ searchText: '' });
    } else {
      const menuRedirectionUrl = brandData?.[0]?.brandMenuList.map((ele) => {
        if (ele?.MenuName === item) {
          return ele;
        }
      });
      renderOtherMenuItemsContent(item, index, menuRedirectionUrl);
    }
  };

  const renderOtherMenuItemsContent = (item: string, index: number, menuRedirectionUrl) => {
    const urlString = menuRedirectionUrl?.[index - 2]?.MenuRedirectionUrl;
    if (item !== 'Home' && item !== 'All Products') {
      if (urlString.startsWith('category')) {
        const arr = urlString.split('#');
        props.navigation.setParams({ category_id: arr[1] });
        props.navigation.setParams({ title: categoryID === arr[1] ? title : 'Products' });
        props.navigation.setParams({ searchText: '' });
      } else if (urlString.startsWith('search')) {
        const arr = urlString.split('#');
        props.navigation.setParams({ searchText: arr[1] });
        props.navigation.setParams({ category_id: '' });
        props.navigation.setParams({ title: 'Products' });
      } else if (urlString.startsWith('PDP')) {
        const arr = urlString.split('#');
        props.navigation.navigate(AppRoutes.ProductDetailPage, {
          sku: arr[1],
          movedFrom: ProductPageViewedSource.BRAND_PAGES,
        });
        setSelectedMenuItem(0);
        setSelectedMenuItemName('Home');
      } else {
        const res = handleOpenURL(urlString);
        if (res?.routeName !== 'ConsultRoom') {
          pushTheView(
            props.navigation,
            res?.routeName,
            res?.id ? res?.id : undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            movedFromBrandPages
          );
        }
        setSelectedMenuItem(0);
        setSelectedMenuItemName('Home');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView>
        {imageUrl !== '' && renderMainBanner()}
        <View style={styles.menuContainer}>
          <FlatList
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            keyExtractor={(_, index) => `${index}`}
            data={menu}
            renderItem={({ item, index }) => {
              return renderMenuItems(item, index);
            }}
          />
        </View>
        {selectedMenuItemName === 'Home' && (
          <FlatList
            bounces={false}
            keyExtractor={(_, index) => `${index}`}
            data={brandData?.[0]?.brandBannersList}
            renderItem={({ item, index }) => {
              const imgUrl = item?.brandBannerImgUrl;
              return renderOtherBanner(imgUrl, item);
            }}
          />
        )}
        {selectedMenuItemName === 'All Products' && (
          <MedicineListing
            navigation={props.navigation}
            comingFromBrandPage={true}
            currentBrandPageTab={selectedMenuItemName}
          />
        )}
        {selectedMenuItemName !== 'Home' && selectedMenuItemName !== 'All Products' ? (
          <MedicineListing
            navigation={props.navigation}
            comingFromBrandPage={true}
            currentBrandPageTab={selectedMenuItemName}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  menuContainer: {
    height: 49,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.HEX_WHITE,
  },
  menuItemContainer: {
    marginRight: 13,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  selectedMenuItemStyle: {
    borderColor: theme.colors.CONSULT_SUCCESS_TEXT,
    borderBottomWidth: 2,
  },
  menuTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(15),
    fontWeight: '400',
    lineHeight: 24,
    color: theme.colors.LIGHT_BLUE,
  },
  selectedMenuTextStyle: {
    fontWeight: '500',
  },
});
