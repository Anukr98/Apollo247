import {
  Breadcrumb,
  Props as BreadcrumbProps,
} from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import {
  SelectedFilters,
  SortByOption,
} from '@aph/mobile-patients/src/components/MedicineListing/MedicineListing';
import { MedicineListingEvents } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListingEvents';
import {
  OptionsDisplayView,
  OptionsDisplayViewItem,
} from '@aph/mobile-patients/src/components/MedicineListing/OptionsDisplayView';
import { Badge } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { FilterOutline, SortOutline } from '@aph/mobile-patients/src/components/ui/Icons';
import { ListGridSelectionView } from '@aph/mobile-patients/src/components/ui/ListGridSelectionView';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-elements';

export interface Props {
  searchText: string;
  categoryId: string;
  pageTitle: string;
  titleNavProp: string;
  productsTotal: number;
  filterBy: SelectedFilters;
  sortBy: SortByOption | null;
  breadCrumb: BreadcrumbProps['links'];
  showListView: boolean;
  setShowListView: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setSortByVisible: React.Dispatch<React.SetStateAction<boolean>>;
  showFilterOption: boolean;
}

export const MedicineListingSections: React.FC<Props> = ({
  searchText,
  categoryId,
  pageTitle,
  titleNavProp,
  productsTotal,
  filterBy,
  sortBy,
  breadCrumb,
  showListView,
  setShowListView,
  setFilterVisible,
  setSortByVisible,
  showFilterOption,
}) => {
  const isFiltersApplied = Object.keys(filterBy).find((k) => filterBy[k]?.length);

  // consider heading from API for search (OR) title from navigation prop for category based products
  const _pageTitle = (searchText && pageTitle) || titleNavProp || '';
  const _productsTotal =
    (categoryId || Number(categoryId) == 0) && !searchText && productsTotal
      ? ` | ${productsTotal} Products`
      : '';

  const breadCrumbView = <Breadcrumb links={breadCrumb} />;

  const pageTitleView = !!_pageTitle && (
    <Text style={styles.pageTitle}>
      {_pageTitle}
      {!!_productsTotal && <Text style={styles.productsTotal}>{_productsTotal}</Text>}
    </Text>
  );

  const divider = !!_pageTitle && <Divider style={styles.divider} />;
  const paddingView = <View style={styles.paddingView} />;

  const fireListGridViewEvent = (
    showListView: boolean,
    searchText: string,
    categoryId: string,
    pageTitle: string
  ) => {
    MedicineListingEvents.categoryListGridView({
      Source: searchText ? 'Search' : 'Category',
      Type: showListView ? 'List' : 'Grid',
      'Category id': !searchText ? categoryId : undefined,
      'Category name': !searchText ? pageTitle : undefined,
    });
  };

  const onPressListGridView = (
    showListView: boolean,
    searchText: string,
    categoryId: string,
    pageTitle: string
  ) => {
    setShowListView(showListView);
    fireListGridViewEvent(showListView, searchText, categoryId, pageTitle);
  };

  const sortByOption: OptionsDisplayViewItem = {
    icon: <SortOutline style={styles.iconOutline} />,
    title: 'Sort By',
    subtitle: sortBy?.name || 'Apply sorting',
    onPress: () => setSortByVisible(true),
    containerStyle: styles.sortByContainer,
  };
  const filterByOption: OptionsDisplayViewItem = {
    icon: (
      <View>
        <FilterOutline style={styles.iconOutline} />
        {isFiltersApplied && <Badge containerStyle={styles.filterBadgeContainer} />}
      </View>
    ),
    title: 'Filter By',
    subtitle: isFiltersApplied ? 'Filters applied' : 'Apply filters',
    onPress: () => setFilterVisible(true),
    containerStyle: styles.filterByContainer,
  };
  const listGridSelection: OptionsDisplayViewItem = {
    icon: (
      <ListGridSelectionView
        isListView={showListView}
        onPressGridView={() => onPressListGridView(false, searchText, categoryId, pageTitle)}
        onPressListView={() => onPressListGridView(true, searchText, categoryId, pageTitle)}
      />
    ),
    containerStyle: styles.listGridSelectionContainer,
    onPress: () => {},
  };

  const optionsViewData = showFilterOption
    ? [sortByOption, filterByOption, listGridSelection]
    : [sortByOption, listGridSelection];

  const optionsView = (
    <OptionsDisplayView options={searchText ? [listGridSelection] : optionsViewData} />
  );

  const views = [breadCrumbView, pageTitleView, [divider, optionsView]];

  return (
    <View style={styles.sectionWrapper}>
      {views.map((view, index, array) => [view, index + 1 !== array.length && paddingView])}
    </View>
  );
};

const { text, card } = theme.viewStyles;
const styles = StyleSheet.create({
  paddingView: { width: 20, height: 0 },
  sectionWrapper: {
    ...card(20, 0, 0, '#fff', 5),
    paddingTop: 0,
    paddingBottom: 10,
    marginBottom: 16,
  },
  pageTitle: {
    ...text('SB', 14, '#02475B'),
    marginTop: -8,
  },
  productsTotal: {
    ...text('R', 14, '#02475B'),
  },
  divider: { marginVertical: 10 },
  sortByContainer: { justifyContent: 'flex-start', width: '37%' },
  filterByContainer: { width: '37%' },
  listGridSelectionContainer: { justifyContent: 'flex-end', width: '25%' },
  filterBadgeContainer: {
    width: 6,
    height: 6,
    backgroundColor: '#00B38E',
    top: -2.5,
    right: -2.5,
  },
  iconOutline: { width: 16, height: 17 },
});
