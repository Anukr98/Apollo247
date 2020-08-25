import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import FlatList from 'flatlist-react';
import { makeStyles, mergeClasses } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { display } from '@material-ui/system';

interface MultiSelectItems {
  value: string;
  responseName: string;
}

interface MultiSelectProps {
  data: {
    value: string;
    responseName: string;
  }[];
  scrollEnabled?: boolean;
  itemSelectionCallback: (item: MultiSelectItems[]) => void;
}

var keysArr: string[] = [];
var callbackPropArr: MultiSelectItems[] = [];

const useStyles = makeStyles((theme: Theme) => {
  return {
    itemContainer: {
      width: '40%',
      float: 'left',
      margin: 15,
    },
    icon: { display: 'inline-block', verticalAlign: 'middle' },
    label: {
      fontSize: 12,
      display: 'inline-block',
      paddingLeft: 10,
    },
  };
});

export const MultiSelectComponent: React.FC<MultiSelectProps> = (props) => {
  const { data, scrollEnabled } = props;
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [refreshFlatList, setRefreshFlatList] = useState<boolean>(false);
  const classes = useStyles({});

  useEffect(() => {
    return function cleanup() {
      keysArr = [];
      callbackPropArr = [];
    };
  }, []);

  const renderMultiSelectItems = (item: MultiSelectItems, index: number) => {
    return (
      <div key={index} className={classes.itemContainer} onClick={() => handleItemOnPress(item)}>
        <img
          className={classes.icon}
          src={
            selectedKeys.includes(item.responseName)
              ? require('images/orangeCheckBoxSelected.png')
              : require('images/greyCheckBox.png')
          }
        />
        <Typography
          className={classes.label}
          style={selectedKeys.includes(item.responseName) ? { color: '#fcb716' } : {}}
        >
          {item.value}
        </Typography>
      </div>
    );
  };

  const handleItemOnPress = (item: MultiSelectItems) => {
    if (keysArr.includes(item.responseName)) {
      keysArr.splice(keysArr.indexOf(item.responseName), 1);
      const removeIndex = callbackPropArr.findIndex((x) => x.responseName == item.responseName);
      callbackPropArr.splice(removeIndex, 1);
    } else {
      keysArr = keysArr.concat(item.responseName);
      callbackPropArr.push({ responseName: item.responseName, value: item.value });
    }
    setSelectedKeys(keysArr);
    setRefreshFlatList(!refreshFlatList);
    props.itemSelectionCallback(callbackPropArr);
  };

  return (
    <FlatList
      list={data}
      renderItem={renderMultiSelectItems}
      keyExtractor={(index: number) => index.toString()}
      extraData={refreshFlatList}
    />
  );
};
