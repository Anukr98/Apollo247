import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import HTML from 'react-native-render-html';

export interface ProductInfoProps {
  description: string;
  isReturnable: boolean;
}

export const ProductInfo: React.FC<ProductInfoProps> = (props) => {
  const { description, isReturnable } = props;
  let productDescription: string = description;
  const isHtmlTag = description.indexOf('&lt;');

  if (isHtmlTag > -1) {
    productDescription = description.substring(0, isHtmlTag);
  }

  const filterHtmlContent = (content: string = '') => {
    return content
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;rn/g, '>')
      .replace(/&gt;r/g, '>')
      .replace(/&gt;/g, '>')
      .replace(/\.t/g, '.');
  };

  const renderDescription = () => {
    const descriptionHtml = filterHtmlContent(description);
    return (
      <View>
        <Text style={styles.subHeading}>Description</Text>
        <Text style={[theme.viewStyles.text('R', 14, '#02475B', 1, 20), { marginBottom: 10 }]}>
          {productDescription}
        </Text>
        {/* <HTML
          html={descriptionHtml}
          baseFontStyle={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}
          imagesMaxWidth={Dimensions.get('window').width}
        /> */}
      </View>
    );
  };

  const renderOtherInformation = () => (
    <View style={styles.otherInfo}>
      <Text style={styles.subHeading}>Other Information</Text>
      <View style={styles.flexRow}>
        <Text style={theme.viewStyles.text('R', 14, '#02475B', 1, 20)}>{`This item is `}</Text>
        <Text style={theme.viewStyles.text('M', 14, '#02475B', 1, 20)}>
          {isReturnable ? `Returnable. ` : `Not Returnable. `}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.cardStyle}>
      <Text style={styles.heading}>Product Detail</Text>
      {!!description && renderDescription()}
      {renderOtherInformation()}
    </View>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    marginVertical: 10,
  },
  heading: {
    ...theme.viewStyles.text('SB', 17, '#02475B', 1, 25, 0.35),
    marginBottom: 2,
  },
  subHeading: {
    ...theme.viewStyles.text('M', 16, '#02475B', 1, 25, 0.35),
    marginVertical: 10,
  },
  flexRow: {
    flexDirection: 'row',
  },
  otherInfo: {
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#02475B',
    borderTopColor: '#02475B',
    borderTopWidth: 0.5,
    borderStyle: 'dashed',
  },
});
