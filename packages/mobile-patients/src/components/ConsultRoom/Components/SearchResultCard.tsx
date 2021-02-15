import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DoctorPlaceholderImage } from '@aph/mobile-patients/src/components/ui/Icons';
const { width } = Dimensions.get('window');
import { SymptomTrackerCard } from '@aph/mobile-patients/src/components/ConsultRoom/Components/SymptomTrackerCard';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';

interface SearchResultProps {
  data: any;
  showAllData: boolean;
  componentName: 'speciality' | 'doctor' | 'procedures' | 'symptoms';
  onPressCallback: (item: any, index: number) => void;
  navigation: NavigationScreenProp<NavigationRoute<{}>, {}>;
  postSymptomTrackEvent?: (() => void) | null;
  visibleDataCount?: number;
}

export const SearchResultCard: React.FC<SearchResultProps> = (props) => {
  const {
    data,
    showAllData,
    componentName,
    onPressCallback,
    postSymptomTrackEvent,
    navigation,
    visibleDataCount,
  } = props;

  const renderItems = (item: any, index: number) => {
    let itemSymptom = item?.symptoms || '';
    itemSymptom = itemSymptom?.charAt(0)?.toUpperCase() + itemSymptom?.slice(1); // capitalize first character
    const symptom = itemSymptom?.replace(/,\s*([a-z])/g, (d, e) => ', ' + e?.toUpperCase()); // capitalize first character after comma (,)
    const isSpecialityCard = componentName === 'speciality';
    const isProcedureCard = componentName === 'symptoms' || componentName === 'procedures';

    const title =
      isSpecialityCard || isProcedureCard
        ? item?.name
        : componentName === 'doctor'
        ? item?.displayName
        : '';
    const subTitle = isSpecialityCard
      ? symptom
      : componentName === 'doctor'
      ? item?.specialtydisplayName
      : '';
    const imageUrl = isSpecialityCard
      ? item?.image
      : componentName === 'doctor'
      ? item?.thumbnailUrl
      : '';
    const titleWidth = isSpecialityCard ? width - 190 : width - 174;
    return (
      <View>
        <TouchableOpacity
          key={index}
          style={styles.card}
          onPress={() => onPressCallback(item, index)}
        >
          {!!imageUrl ? (
            <Image
              source={{
                uri: imageUrl,
              }}
              resizeMode={'contain'}
              style={styles.doctorProfile}
            />
          ) : componentName === 'doctor' ? (
            <DoctorPlaceholderImage style={styles.doctorProfile} />
          ) : null}
          <View
            style={[
              styles.spaceRow,
              {
                alignItems: !isProcedureCard ? 'flex-start' : 'center',
              },
            ]}
          >
            <View style={{ marginLeft: !isProcedureCard ? 12 : 0, width: titleWidth }}>
              <Text style={styles.title}>{title}</Text>
              {subTitle ? (
                <Text style={isSpecialityCard ? styles.subtitle : styles.speciality}>
                  {subTitle}
                </Text>
              ) : null}
            </View>
            <Text style={styles.grayText}>{componentName?.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
        {componentName === 'symptoms' && index === data?.length - 1 && renderTrackSymptoms()}
      </View>
    );
  };

  const renderTrackSymptoms = () => {
    return (
      <SymptomTrackerCard
        style={{ marginVertical: 0, marginBottom: 12 }}
        onPressTrack={() => {
          navigation.navigate(AppRoutes.SymptomTracker);
          postSymptomTrackEvent!();
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        keyExtractor={(_, index) => index.toString()}
        data={
          visibleDataCount === -1
            ? data
            : data?.length > 2 && !showAllData
            ? data?.slice(0, visibleDataCount ? visibleDataCount : 2)
            : data
        }
        renderItem={({ item, index }) => renderItems(item, index)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
  },
  card: {
    ...theme.viewStyles.cardViewStyle,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
  },
  doctorProfile: {
    height: 40,
    borderRadius: 20,
    width: 40,
  },
  title: {
    ...theme.viewStyles.text('M', 15, theme.colors.LIGHT_BLUE),
    width: width - 174,
    textTransform: 'capitalize',
  },
  speciality: {
    ...theme.viewStyles.text('SB', 11, theme.colors.SKY_BLUE),
    marginTop: 2,
    width: width - 120,
    textTransform: 'capitalize',
  },
  subtitle: {
    ...theme.viewStyles.text('M', 10, theme.colors.GRAY),
    marginTop: 2,
    width: width - 120,
    textTransform: 'capitalize',
  },
  grayText: {
    ...theme.viewStyles.text('SB', 11, theme.colors.LIGHTISH_GRAY),
  },
  spaceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
});
