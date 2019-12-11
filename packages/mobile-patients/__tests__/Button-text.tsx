import { Login } from '@aph/mobile-patients/src/components/Login';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';

let findById = (tree, testID) => {
  if (tree.props && tree.props.testID === testID) {
    return tree;
  }
  if (tree.children && tree.children.length > 0) {
    let childs = tree.children;
    for (let i = 0; i < childs.length; i++) {
      let item = findById(childs[i], testID);
      if (typeof item !== 'undefined') {
        return item;
      }
    }
  }
};

it('renders correctly', () => {
  const tree = renderer.create(<Login />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('find id phoneNumber', () => {
  const tree = renderer.create(<Login />).toJSON();
  expect(findById(tree, 'phoneNumber')).toBeDefined();
});

it('should change the phoneNumber value', () => {
  const number = 8790101450;
  let loginComponent = renderer.create(<Button />).getInstance();

  if (loginComponent) {
    loginComponent.validateAndSetPhoneNumber(number);
    expect(loginComponent.phoneNumber).toEqual(number);
    loginComponent.onClickOkay();
  }
});
