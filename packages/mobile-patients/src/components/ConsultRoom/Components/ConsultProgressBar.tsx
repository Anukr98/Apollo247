import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { OrderPlacedCheckedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
const { width } = Dimensions.get('window');

interface ConsultProgressProps {
  data: { title: string; isCompleted: boolean }[];
}
export const ConsultProgressBar: React.FC<ConsultProgressProps> = (props) => {
  const { data } = props;
  const lastItem = data?.length - 1;
  return (
    <View style={styles.container}>
      {data?.map((item: any, index: number) => {
        return (
          <View style={styles.listView}>
            {item?.isCompleted ? (
              <OrderPlacedCheckedIcon style={styles.icon} />
            ) : (
              <View style={styles.bulletView} />
            )}
            {index !== lastItem && (
              <View
                style={[
                  styles.progressLine,
                  {
                    width:
                      index !== data.length - 2 ? width / lastItem - 20 : width / lastItem - 45,
                    opacity: item?.isCompleted ? 1 : 0.2,
                  },
                ]}
              />
            )}
            <Text style={styles.text}>{item?.title}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 11,
  },
  icon: {
    width: 12,
    height: 12,
    backgroundColor: 'white',
    zIndex: 1,
  },
  text: {
    ...theme.viewStyles.text('M', 10, theme.colors.SEARCH_UNDERLINE_COLOR),
    marginTop: 2,
  },
  listView: {
    alignItems: 'center',
  },
  progressLine: {
    height: 1,
    width: width / 3 - 20,
    backgroundColor: theme.colors.APP_GREEN,
    position: 'absolute',
    left: '50%',
    top: 6,
  },
  bulletView: {
    width: 12,
    height: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderRadius: 6,
    zIndex: 1,
  },
});
