import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import MultiSelectStyles from '@aph/mobile-doctors/src/components/ui/MultiSelectComponent.styles';
import { colors } from '@aph/mobile-doctors/src/theme/colors';
import { CheckboxGrey, CheckboxOrangeSelected } from '@aph/mobile-doctors/src/components/ui/Icons';

const styles = MultiSelectStyles;

interface MultiSelectItems {
    value: string;
    key: string
}

interface MultiSelectProps {
    data: {
        value: string;
        key: string
    }[];
    scrollEnabled?: boolean;
    itemSelectionCallback: (item: MultiSelectItems[]) => void;
}

var keysArr: string[] = [];
var callbackPropArr: MultiSelectItems[] = [];

export const MultiSelectComponent: React.FC<MultiSelectProps> = (props) => {
    const { data, scrollEnabled } = props;
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [refreshFlatList, setRefreshFlatList] = useState<boolean>(false);

    useEffect(() => {
        return function cleanup() {
            keysArr = [];
        }
    }, [])

    const renderMultiSelectItems = (
        item: MultiSelectItems,
        index: number
    ) => {
        return (
            <TouchableOpacity key={index} style={styles.container} onPress={() => handleItemOnPress(item)}>
                {selectedKeys.includes(item.key) ? <CheckboxOrangeSelected /> : <CheckboxGrey />}
                <Text style={[styles.itemText, {
                    color: selectedKeys.includes(item.key) ? colors.APP_YELLOW : colors.LIGHT_BLUE
                }]}>{item.value}</Text>
            </TouchableOpacity>
        )
    }

    const handleItemOnPress = (item: MultiSelectItems) => {
        if (keysArr.includes(item.key)) {
            keysArr.splice(keysArr.indexOf(item.key), 1);
            const removeIndex = callbackPropArr.findIndex(x => x.key == item.key);
            callbackPropArr.splice(removeIndex, 1);
        } else {
            keysArr = keysArr.concat(item.key);
            callbackPropArr.push({ key: item.key, value: item.value })
        }
        setSelectedKeys(keysArr);
        setRefreshFlatList(!refreshFlatList);
        props.itemSelectionCallback(callbackPropArr);
    }

    return (
        <View>
            <FlatList
                data={data}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => renderMultiSelectItems(item, index)}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={scrollEnabled ? scrollEnabled : false}
                extraData={refreshFlatList}
            />
        </View>
    )
}