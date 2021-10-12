import React, { useEffect, useState } from 'react';
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
import {
  BrandData,
  getProductsByCategoryApi,
  MedicineProduct,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import AsyncStorage from '@react-native-community/async-storage';
import { USER_AGENT } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { MedicineListing } from '../MedicineListing/MedicineListing';
import { MedicineListingProducts } from '../MedicineListing/MedicineListingProducts';
import { ProductPageViewedSource } from '../../helpers/CleverTapEvents';

export interface BrandPagesProps
  extends NavigationScreenProps<{
    movedFrom?: 'home';
    brandData?: BrandData[];
    category_id?: string;
    title?: string;
  }> {}

export const BrandPages: React.FC<BrandPagesProps> = (props) => {
  const movedFrom = props.navigation.getParam('movedFrom');
  const brandData = props.navigation.getParam('brandData');
  const categoryId = props.navigation.getParam('category_id') || '';
  const title = props.navigation.getParam('title');

  const menu = brandData?.[0]?.brandMenuList.map((ele) => {
    return ele?.MenuName;
  });
  menu?.splice(0, 0, 'Home');
  menu?.splice(1, 0, 'All Products');

  const imgHeight = 175;
  const imageUrl = brandData?.[0]?.brandMainBannerImg;
  const [userAgent, setUserAgent] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<number>(0);
  const [selectedMenuItemName, setSelectedMenuItemName] = useState<string>('Home');
  const [menuItemType, setMenuItemType] = useState('');

  AsyncStorage.getItem(USER_AGENT).then((userAgent) => {
    setUserAgent(userAgent || '');
  });

  const renderHeader = () => {
    return <MedicineListingHeader navigation={props.navigation} movedFrom={movedFrom} />;
  };

  const renderMainBanner = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        // onPress={handleOnPress}
      >
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

  //   const navigationToScreens = (menuName: string) => {
  //     if (menuName === 'All Products') {
  //       props.navigation.navigate(AppRoutes.MedicineListing, {
  //         category_id: categoryId,
  //         title: title || 'Products',
  //       });
  //     }
  //   };

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
            setSelectedMenuItem(index);
            setSelectedMenuItemName(item);
            renderOtherMenuItemsContent(item);
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

  //   const handleOnPressBanner = (item) => {
  //     if (item.category_id) {
  //       props.navigation.navigate(AppRoutes.MedicineListing, {
  //         category_id: item.category_id,
  //         title: item.name || 'Products',
  //       });
  //     } else if (item.sku) {
  //       props.navigation.navigate(AppRoutes.ProductDetailPage, {
  //         sku: item.sku,
  //         movedFrom: ProductPageViewedSource.BANNER,
  //       });
  //     }
  //   };

  const renderOtherBanner = (imgUrl: string) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        //   onPress={handleOnPressBanner}
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

  const renderOtherMenuItemsContent = (item) => {
    //   const urlString =
    // const urlString = 'category#1372#http://gokonnect.com';
    // const urlString = 'searchText#apollo life#http://gokonnect.com';
    const urlString = 'PDP#HIM0426#http://gokonnect.com';
    if (item !== 'Home' && item !== 'All Products') {
      if (urlString.startsWith('category')) {
        const x = urlString.split('#');
        props.navigation.setParams({ category_id: x[1] });
        setMenuItemType('category');
        //   return <MedicineListing navigation={props.navigation} brandsPageSeComing={true} />;
      } else if (urlString.startsWith('searchText')) {
        const y = urlString.split('#');
        const searchText1 = 'apollo life';
        props.navigation.setParams({ searchText: searchText1 });
        setMenuItemType('category');
        //   <MedicineListing navigation={props.navigation} brandsPageSeComing={true} />;
      } else if (urlString.startsWith('PDP')) {
        const z = urlString.split('#');
        setMenuItemType('PDP');
        // for once check product page viewed source
        props.navigation.navigate(AppRoutes.ProductDetailPage, {
          sku: z[1],
          movedFrom: ProductPageViewedSource.BANNER,
        });
        // set the index of Home Page
        setSelectedMenuItem(0);
        setSelectedMenuItemName('Home');
      }
    }
    // return (
    //   <View>
    //     <Text>Other Sections</Text>
    //   </View>
    // );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView>
        {renderMainBanner()}
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
              return renderOtherBanner(imgUrl);
            }}
          />
        )}
        {selectedMenuItemName === 'All Products' && (
          <MedicineListing
            navigation={props.navigation}
            brandsPageSeComing={true}
            category_id={categoryId}
            title={title || 'Products'}
          />
        )}
        {/* {selectedMenuItemName !== 'Home' &&
          selectedMenuItemName !== 'All Products' &&
          renderOtherMenuItemsContent()} */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  menuContainer: {
    height: 49,
    marginLeft: 10,
    // backgroundColor: '#229977',
  },
  menuItemContainer: {
    // backgroundColor: '#229977',
    marginRight: 13,
    justifyContent: 'center',
    paddingHorizontal: 15,
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
