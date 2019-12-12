/* @jest-environment jsdom */

import { Login } from '@aph/mobile-patients/src/components/Login';
import { mount } from 'enzyme';
import React from 'react';
import 'react-native';
import { Text } from 'react-native';

describe('<Button /> with other props', () => {
  const initialProps = {
    phoneNumber: '8790101450',
  };
  const container = mount(<Login {...initialProps} />);
  console.log(container, 'container', container.find(Text), container.find(Text).first());

  it('find okay', () => {
    const onClickOkay = jest.fn();
    const getButton = container.findWhere((node) => node.prop('testID') === 'okButton');
    console.log(getButton, 'getButton');

    getButton
      .first()
      .props()
      .onPress();
    // container.update();

    expect(getButton).toExist();
  });

  it('signin', () => {
    const phoneNumber = '8790101450';
    const getInput = container.findWhere((node) => node.prop('testID') === 'phoneNumber');
    console.log(getInput);
    expect(getInput.first().prop('value')).toEqual(phoneNumber);
  });
});
