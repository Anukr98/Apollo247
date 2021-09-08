import React from 'react';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface medicineBottomFilterProps {
  title: string;
  categoryId: string;
  bottomCategoryId: string;
  navigationCategoryId: string;
  setBottomCategoryId: (category_id: string) => void;
  onBottomCategoryChange: (categoryId: string) => void;
}

const MedicineBottomFilters: React.FC<medicineBottomFilterProps> = ({
  title,
  categoryId,
  bottomCategoryId,
  setBottomCategoryId,
  navigationCategoryId,
  onBottomCategoryChange,
}) => {
  const styles = StyleSheet.create({
    btnStyle: {
      alignSelf: 'center',
      borderColor: categoryId === bottomCategoryId ? '#00B38E' : '#979797',
      borderWidth: categoryId === bottomCategoryId ? 0 : 0.5,
      borderRadius: 5,
      paddingHorizontal: 8,
      backgroundColor: categoryId === bottomCategoryId ? '#00B38E' : '#fff',
      marginHorizontal: 5,
    },
    btnContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    iconStyle: {
      marginLeft: -3,
    },
    txtStyle:
      categoryId === bottomCategoryId
        ? theme.viewStyles.text('R', 10, '#fff', 1, 24, 0)
        : theme.viewStyles.text('R', 10, '#02475B', 1, 24, 0),
    txtStyle2:
      categoryId === bottomCategoryId
        ? theme.viewStyles.text('R', 10, '#fff', 1, 24, 0)
        : theme.viewStyles.text('R', 10, '#02475B', 1, 24, 0),
  });
  return (
    <>
      <TouchableOpacity
        style={styles.btnStyle}
        onPress={() => {
          if (categoryId === bottomCategoryId) {
            setBottomCategoryId(navigationCategoryId);
            onBottomCategoryChange(navigationCategoryId);
          } else {
            setBottomCategoryId(categoryId);
            onBottomCategoryChange(categoryId);
          }
        }}
      >
        {categoryId === bottomCategoryId ? (
          <View style={styles.btnContainer}>
            <Ionicons name="md-close-outline" size={13} color="#fff" style={styles.iconStyle} />
            <Text style={styles.txtStyle}>{title}</Text>
          </View>
        ) : (
          <Text style={styles.txtStyle2}>{title}</Text>
        )}
      </TouchableOpacity>
    </>
  );
};

export default React.memo(MedicineBottomFilters);

