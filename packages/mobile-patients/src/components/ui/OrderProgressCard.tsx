import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  LayoutChangeEvent,
  TouchableOpacityProps,
  TouchableOpacity,
} from 'react-native';
import {
  OrderPlacedIcon,
  OrderTrackerSmallIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ChatWithUs } from '@aph/mobile-patients/src/components/ui/ChatWithUs';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { MEDICINE_ORDER_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '../../strings/AppConfig';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    marginBottom: 8,
    flex: 1,
  },
  containerStyle1: {
    marginBottom: 8,
    flex: 1,
  },
  viewRowStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: 0.0,
    color: theme.colors.SHERPA_BLUE,
    flex: 1,
    textTransform: 'capitalize',
  },
  dateTimeStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.1,
    marginTop: 7,
    marginBottom: 8,
  },
  statusIconStyle: {
    height: 28,
    width: 28,
  },
  statusIconSmallStyle: {
    height: 15,
    width: 15,
  },
  graphicalStatusViewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    marginRight: 18,
  },
  verticalProgressLine: { flex: 1, width: 4, alignSelf: 'center' },
  newItemsOuterView: { paddingHorizontal: 16, flexDirection: 'row' },
  descriptionSubtextText: {
    ...theme.viewStyles.text('R', 12, '#02475b', 1, 13, 0.03),
  },
  newItemsTouch: { alignSelf: 'flex-end', marginVertical: 6, paddingBottom: 5 },
  customOrangeOption: { ...theme.viewStyles.text('B', 14, '#FC9916') },
});

interface OrderDescription {
  heading?: string;
  description?: string;
  onPress?: () => void;
  component?: React.FC;
}

interface NewOrderDescription extends OrderDescription {
  showOption?: boolean;
}

export interface OrderProgressCardProps {
  status: string;
  isStatusDone: boolean;
  showCurrentStatusDesc?: boolean | null;
  getOrderDescription?: OrderDescription | null;
  nextItemStatus: 'DONE' | 'NOT_DONE' | 'NOT_EXIST';
  date?: string;
  time?: string;
  description?: string; // if falsy value it renders date & time
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
  showReUploadPrescription?: boolean;
  showChatWithUs?: boolean;
  reUploadPrescription?: TouchableOpacityProps['onPress'];
  isOnHold?: boolean;
  showDescriptionChatOption?: boolean | null;
  showNewItemsDescription?: boolean | null;
  newItemsDescription?: NewOrderDescription | null;
  onPressViewSummary?: TouchableOpacityProps['onPress'];
  shouldShowReUploadOption?: boolean | null;
  orderType?: string | null;
  isPrescriptionUploaded?: string | null;
}

export const OrderProgressCard: React.FC<OrderProgressCardProps> = (props) => {
  const renderGraphicalStatus = () => {
    return (
      <View style={styles.graphicalStatusViewStyle}>
        {props.isStatusDone ? (
          <OrderPlacedIcon style={styles.statusIconStyle} />
        ) : (
          <OrderTrackerSmallIcon style={styles.statusIconSmallStyle} />
        )}
        <View
          style={[
            styles.verticalProgressLine,
            {
              backgroundColor:
                props.nextItemStatus == 'NOT_EXIST'
                  ? 'transparent'
                  : !props.isStatusDone
                  ? 'rgba(0,135,186,0.3)'
                  : theme.colors.SKY_BLUE,
            },
          ]}
        />
      </View>
    );
  };

  const renderCustomDescriptionOrDateAndTime = () => {
    return (
      <View style={styles.viewRowStyle}>
        <Text style={styles.dateTimeStyle}>{props.date}</Text>
        <Text style={styles.dateTimeStyle}>{props.time}</Text>
      </View>
    );
  };

  const renderUploadPrescription = () => {
    return (
      <View
        style={[styles.newItemsTouch, { paddingBottom: 0 }]}
        pointerEvents={props.shouldShowReUploadOption ? 'auto' : 'none'}
      >
        <Text
          onPress={props.reUploadPrescription}
          style={{
            ...theme.viewStyles.text(
              'B',
              14,
              props.shouldShowReUploadOption ? '#FC9916' : '#c4c2bc'
            ),
          }}
        >
          RE-UPLOAD PRESCRIPTION
        </Text>
      </View>
    );
  };
  const headingColor = props.isOnHold ? '#890000' : '#00b38e';
  const orderStatusForNewItems =
    props.orderType! == MEDICINE_ORDER_TYPE.CART_ORDER ? 'Order Verified' : 'Order Placed';
  return (
    <View style={{ flexDirection: 'row' }} onLayout={(event) => props.onLayout!(event)}>
      {renderGraphicalStatus()}
      <View style={[styles.containerStyle1]}>
        <View
          style={[
            styles.containerStyle,
            props.style,
            !props.isStatusDone ? { backgroundColor: '#f7f8f5' } : {},
          ]}
        >
          {!props.isStatusDone ? (
            <>
              <Text
                style={[
                  styles.statusStyle,
                  { color: 'rgba(1,71,91,0.35)' },
                  props.status == 'Order Ready at Store' && { textTransform: 'none' },
                ]}
              >
                {props.status}
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.statusStyle,
                  props.status == 'Order Ready at Store' && { textTransform: 'none' },
                  props.status == 'Order Cancelled' && { color: '#890000' },
                  props.status == 'Lost' && { color: '#890000' },
                ]}
              >
                {props.status == 'Lost' ? 'Order cancelled' : props.status}
              </Text>
              {(props.date && props.time) || props.description ? (
                <>
                  <View style={styles.separator} />
                  {renderCustomDescriptionOrDateAndTime()}
                </>
              ) : null}
            </>
          )}
        </View>
        {props.showCurrentStatusDesc &&
          props.getOrderDescription &&
          props.getOrderDescription.description != '' && (
            <View style={{ paddingHorizontal: 16, flexDirection: 'row' }}>
              <Text
                style={{ ...theme.viewStyles.text('R', 12, headingColor, 1, 13, 0.03) }}
                {...(props.getOrderDescription.onPress
                  ? { onPress: props.getOrderDescription.onPress }
                  : {})}
              >
                {props.getOrderDescription.heading}
                <Text style={styles.descriptionSubtextText}>
                  {props.getOrderDescription.description}
                </Text>
              </Text>
            </View>
          )}
        {props.showCurrentStatusDesc && props.getOrderDescription?.component
          ? props.getOrderDescription?.component
          : null}
        {props.showCurrentStatusDesc && props.showReUploadPrescription
          ? renderUploadPrescription()
          : null}
        {props.status == orderStatusForNewItems && props.showNewItemsDescription && (
          <View>
            <View style={styles.newItemsOuterView}>
              <Text style={{ ...theme.viewStyles.text('R', 12, headingColor, 1, 13, 0.03) }}>
                {props.newItemsDescription?.heading!}
                <Text style={styles.descriptionSubtextText}>
                  {props.newItemsDescription?.description}
                </Text>
              </Text>
            </View>
            {props.newItemsDescription?.showOption ? (
              <View>
                <TouchableOpacity onPress={props.onPressViewSummary} style={styles.newItemsTouch}>
                  <Text style={styles.customOrangeOption}>VIEW ORDER SUMMARY</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
};

OrderProgressCard.defaultProps = {
  showReUploadPrescription: false,
  showChatWithUs: false,
};

