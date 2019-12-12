import { shallow, mount, render } from 'enzyme';
import { Text } from 'react-native';
import React from 'react';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

configure({ adapter: new Adapter() });

describe('<Button /> with other props', () => {
  const initialProps = {
    phoneNumber: '8790101450',
    title: 'hi',
  };
  const container = shallow(<Button {...initialProps} />);
  console.log(container, 'container', container.find(Text), container.find(Text).first());

  it('should have proper props for email field', () => {
    container &&
      container
        .find('TouchableOpacity')
        .first()
        .props()
        .onPress();
  });
});
