import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Up, Down, OrderPlacedCheckedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets } from '@aph/mobile-patients/src/graphql/types/getMedicineOrderCancelReasonsV2';

export interface OrderCancelComponentProps {
  showReasons: boolean;
  setShowReasons: (showReason: boolean) => void;
  selectedReason: string;
  setSelectedReason: (reason: string) => void;
  selectedSubReason: string;
  setSelectedSubReason: (subReason: string) => void;
  comment: string;
  setComment: (comment: string) => void;
  isCancelVisible: boolean;
  setCancelVisible: (cancelVisible: boolean) => void;
  showSpinner: boolean;
  onPressConfirmCancelOrder: () => void;
  newCancellationReasonsBucket: getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets[];
  selectedReasonBucket: getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets[];
  setSelectedReasonBucket: (
    bucketItem: getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets[]
  ) => void;
  setClick?: (click: string) => void;
  setSubheading?: (heading: string) => void;
}

export const OrderCancelComponent: React.FC<OrderCancelComponentProps> = (props) => {
  const {
    showReasons,
    setShowReasons,
    selectedReason,
    setSelectedReason,
    selectedSubReason,
    setSelectedSubReason,
    comment,
    setComment,
    isCancelVisible,
    setCancelVisible,
    showSpinner,
    onPressConfirmCancelOrder,
    newCancellationReasonsBucket,
    selectedReasonBucket,
    setSelectedReasonBucket,
    setClick,
    setSubheading,
  } = props;

  const [isReasonSelected, setIsReasonSelected] = useState<boolean>(false);
  const [isSubReasonSelected, setIsSubReasonSelected] = useState<boolean>(false);
  const [showSubReasons, setShowSubReasons] = useState<boolean>(false);
  const [isUserCommentRequired, setUserCommentRequired] = useState<boolean>(false);

  let minCommentLength = 0;
  let maxCommentLength = Infinity;
  if (selectedSubReason && !!selectedReasonBucket?.[0]?.reasons) {
    selectedReasonBucket?.[0]?.reasons.filter((item) => {
      if (!!item?.config && item?.config?.userCommentRequired) {
        minCommentLength = item?.config?.commentMinLength || 0;
        maxCommentLength = item?.config?.commentMaxLength || Infinity;
      }
    });
  }
  const content = () => {
    return (
      <View style={styles.contentContainerStyle}>
        <TouchableOpacity
          onPress={() => {
            setShowReasons(!showReasons);
          }}
        >
          <View style={styles.flexRow}>
            <View style={{ flex: 0.9, flexDirection: 'row' }}>
              <Text style={styles.reasonHeadingStyle} numberOfLines={1}>
                Please select your reason
              </Text>
              <Text style={styles.reasonHeadingStyle}>*</Text>
            </View>
            <View style={{ flex: 0.1, marginHorizontal: -5 }}>
              {!showReasons ? (
                <Up style={{ alignSelf: 'flex-end' }} />
              ) : (
                <Down style={{ alignSelf: 'flex-end' }} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {showReasons && (
          <View style={{ paddingVertical: 12 }}>
            {newCancellationReasonsBucket
              .sort((a, b) => a?.sortOrder > b?.sortOrder)
              .map((item) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedReason(item?.bucketName!);
                    setSelectedReasonBucket([item]);
                    setIsReasonSelected(true);
                    setShowReasons(false);
                    setShowSubReasons(true);
                    setSelectedSubReason('');
                  }}
                >
                  <View style={[styles.flexRow, styles.itemContainerStyle]}>
                    <Text style={styles.textStyle}>{item?.bucketName}</Text>
                    <View style={{ flex: 0.1 }}>
                      <OrderPlacedCheckedIcon
                        style={[
                          styles.iconStyle,
                          item?.bucketName === selectedReason
                            ? {}
                            : { tintColor: theme.colors.LIGHT_GRAY_3 },
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}
        {isReasonSelected && !showReasons && (
          <View>
            <View style={[styles.flexRow, { paddingVertical: 12 }]}>
              <Text
                style={styles.textStyle}
                onPress={() => {
                  setShowReasons(true);
                }}
              >
                {selectedReason}
              </Text>
              <View style={{ flex: 0.1 }}>
                <OrderPlacedCheckedIcon style={styles.iconStyle} />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowSubReasons(!showSubReasons);
              }}
            >
              <View style={styles.flexRow}>
                <View style={{ flex: 0.9, flexDirection: 'row' }}>
                  <Text style={styles.reasonHeadingStyle} numberOfLines={1}>
                    Please select the sub-reason
                  </Text>
                  <Text style={styles.reasonHeadingStyle}>*</Text>
                </View>
                <View style={{ flex: 0.1, marginHorizontal: -5 }}>
                  {!showSubReasons ? (
                    <Up style={{ alignSelf: 'flex-end' }} />
                  ) : (
                    <Down style={{ alignSelf: 'flex-end' }} />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {showSubReasons && (
              <View style={{ paddingVertical: 12 }}>
                {selectedReasonBucket?.[0]?.reasons &&
                  selectedReasonBucket?.[0]?.reasons.map((item, i) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedSubReason(item?.description);
                        setIsSubReasonSelected(true);
                        setShowSubReasons(false);
                        item?.description === 'Others (please specify)'
                          ? setUserCommentRequired(true)
                          : setUserCommentRequired(false);
                      }}
                    >
                      <View style={[styles.flexRow, styles.itemContainerStyle]}>
                        <Text style={styles.textStyle}>{item?.description}</Text>
                        <View style={{ flex: 0.1 }}>
                          <OrderPlacedCheckedIcon
                            style={[
                              styles.iconStyle,
                              item?.description === selectedSubReason
                                ? {}
                                : { tintColor: theme.colors.LIGHT_GRAY_3 },
                            ]}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
            {isSubReasonSelected && !showSubReasons && (
              <View style={{ paddingVertical: 12 }}>
                <View style={styles.flexRow}>
                  <Text
                    style={styles.textStyle}
                    onPress={() => {
                      setShowSubReasons(true);
                    }}
                  >
                    {selectedSubReason}
                  </Text>
                  <View style={{ flex: 0.1 }}>
                    <OrderPlacedCheckedIcon style={styles.iconStyle} />
                  </View>
                </View>
                {selectedSubReason === 'Others (please specify)' && (
                  <View style={{ marginTop: 20 }}>
                    <TextInputComponent
                      inputStyle={{ ...theme.fonts.IBMPlexSansMedium(13) }}
                      value={comment}
                      onChangeText={(text) => {
                        setComment(text);
                      }}
                      placeholder={'Enter your comments here'}
                      maxLength={maxCommentLength}
                    />
                    {comment?.length < minCommentLength && (
                      <Text style={{ ...theme.fonts.IBMPlexSansRegular(12), color: '#553344' }}>
                        Minimum characters required are {minCommentLength}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
        {isReasonSelected &&
        !showReasons &&
        isSubReasonSelected &&
        !showSubReasons &&
        selectedReasonBucket &&
        selectedReasonBucket?.[0]?.reasons?.find((item) => selectedSubReason === item?.description)
          ?.nudgeConfig?.enabled === true ? (
          <View>
            <View style={styles.nudgeTopBorderStyle}></View>
            <Text style={styles.nudgeText}>
              {selectedReasonBucket &&
                selectedReasonBucket?.[0]?.reasons?.find(
                  (item) => selectedSubReason === item?.description
                )?.nudgeConfig?.message}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const bottomButton = () => {
    return (
      <Button
        style={styles.buttonStyle}
        onPress={onPressConfirmCancelOrder}
        disabled={
          (!!selectedReason && !!selectedSubReason && showSpinner) ||
          selectedReason === '' ||
          selectedSubReason === '' ||
          (isUserCommentRequired && comment?.length < minCommentLength)
        }
        title={'SUBMIT REQUEST'}
      />
    );
  };

  return (
    isCancelVisible && (
      <TouchableWithoutFeedback
        onPress={() => {
          setCancelVisible(false);
          setShowReasons(false);
          setShowSubReasons(false);
          setIsReasonSelected(false);
          setIsSubReasonSelected(false);
          setSelectedReasonBucket([]);
          setSelectedReason('');
          setSelectedSubReason('');
          setClick && setClick('');
          setSubheading && setSubheading('');
        }}
      >
        <View style={styles.container}>
          <View style={{ justifyContent: 'flex-end', flex: 1 }}>
            <View style={styles.bottomSheetStyle}>
              {content()}
              {bottomButton()}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  bottomSheetStyle: {
    backgroundColor: theme.colors.HEX_WHITE,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  buttonStyle: {
    marginHorizontal: 30,
    width: 'auto',
    marginBottom: 25,
    marginTop: 16,
    borderRadius: 5,
    backgroundColor: theme.colors.BUTTON_ORANGE,
  },
  contentContainerStyle: {
    paddingVertical: 15,
    paddingLeft: 15,
    paddingRight: 25,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContainerStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
    paddingVertical: 12,
  },
  reasonHeadingStyle: {
    ...theme.fonts.IBMPlexSansRegular(16),
    color: theme.colors.SHERPA_BLUE,
    fontWeight: '500',
    lineHeight: 24,
  },
  textStyle: {
    flex: 0.9,
    ...theme.fonts.IBMPlexSansRegular(12),
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 18,
    fontWeight: '500',
  },
  iconStyle: {
    width: 14,
    height: 14,
    alignSelf: 'flex-end',
  },
  nudgeTopBorderStyle: {
    borderTopWidth: 1,
    borderTopColor: '#000000',
    opacity: 0.1,
    paddingTop: 20,
  },
  nudgeText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SKY_BLUE,
    lineHeight: 16,
    fontWeight: '600',
  },
});
