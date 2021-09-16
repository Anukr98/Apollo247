import {
  ArrowLeft,
  ArrowRight,
  ShopByCategoryIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Category } from '@aph/mobile-patients/src/helpers/apiCalls';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
  Image,
} from 'react-native';
import { ListItem } from 'react-native-elements';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface Props {
  onPressCategory: (category: Category, categoryTree: Category[]) => void;
  categories: Category[];
  containerStyle: ViewProps['style'];
}

export const MedicineCategoryTree: React.FC<Props> = ({
  onPressCategory,
  categories,
  containerStyle,
}) => {
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const categoryLevel1 = categoryTree?.[0];

  const renderItem = ({ item }: ListRenderItemInfo<Category>) => {
    const { category_id, title, Child } = item;
    const onPress = () => {
      if (Child?.length) {
        setCategoryTree([item, ...categoryTree]);
      } else {
        onPressCategory(item, [...categoryTree.reverse(), item]);
      }
    };
    const onPressListItem = () => {
      onPressCategory(item, [...categoryTree.reverse(), item]);
    };
    const rightIcon = (
      <TouchableOpacity onPress={onPress}>{Child?.length ? <ArrowRight /> : null}</TouchableOpacity>
    );
    const leftIcon = (
      <Image
        style={styles.categoryImage}
        source={{ uri: `${AppConfig.Configuration.IMAGES_BASE_URL[0]}${item?.image_url}` }}
        resizeMode={'contain'}
      />
    );
    return (
      <ListItem
        key={category_id}
        title={title}
        rightIcon={rightIcon}
        leftIcon={leftIcon}
        titleStyle={styles.itemTitle}
        containerStyle={styles.listItemContainer}
        onPress={onPressListItem}
        topDivider
      />
    );
  };

  const renderTitle = () => {
    const title = categoryLevel1?.title?.toUpperCase() || string.shopByCategory;
    const onPress = () => {
      if (categoryTree.length) {
        setCategoryTree(categoryTree.slice(1, categoryTree.length));
      }
    };

    return (
      <ListItem
        title={title}
        titleStyle={categoryLevel1 ? styles.sectionTitleSelected : styles.sectionTitle}
        titleProps={{ onPress }}
        containerStyle={[styles.listItemContainer, { marginLeft: -30 }]}
        pad={5}
        leftIcon={
          <TouchableOpacity onPress={onPress}>
            {categoryLevel1 ? <ArrowLeft /> : <ShopByCategoryIcon />}
          </TouchableOpacity>
        }
      />
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderTitle()}
      <FlatList
        keyExtractor={({ category_id }) => `${category_id}`}
        bounces={false}
        data={categoryLevel1?.Child || categories}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const string = {
  shopByCategory: 'Shop by Category',
};

const { LIGHT_BLUE, APP_GREEN, WHITE } = theme.colors;
const { text } = theme.viewStyles;

const styles = StyleSheet.create({
  container: { backgroundColor: WHITE, paddingHorizontal: 35, paddingVertical: 15 },
  itemTitle: { ...text('R', 14, LIGHT_BLUE) },
  sectionTitleSelected: { ...text('B', 16, APP_GREEN) },
  sectionTitle: { ...text('B', 16, LIGHT_BLUE) },
  listItemContainer: { paddingHorizontal: 0, paddingVertical: 8 },
  categoryImage: {
    resizeMode: 'contain',
    width: 30,
    height: 30,
  },
});
