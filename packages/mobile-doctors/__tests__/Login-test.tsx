/**
 * @format
 */

import 'react-native';
import React from 'react';
import { Login } from '@aph/mobile-doctors/src/components/Login';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
// import ShallowRenderer from 'react-test-renderer/shallow'; // ES6

type JestJsonTreeType = {
  type: string;
  props: {
    testID: string | undefined;
    // and rest of the props
  };
  children: string[];
};

// It's throwing " TypeError: Cannot read property 'TabBar' of undefined "
// jest.mock('../src/components/NavigatorContainer.tsx', () => {});
// jest.mock('react-native-gesture-handler', () => { });
// jest.mock('../src/components/TabBar.tsx', () => { });
// jest.mock('../node_modules/react-native-gesture-handler/Directions.js', () => { })
// jest.mock('../src/hooks/authHooks.ts', () => {
//   return {
//     useAuth: {
//       analytics: {
//         setCurrentScreen: (str: any) => { }
//       },
//       currentUser: {},
//       authError: {}
//     }
//   }
// });

beforeEach(() => {});

it('renders correctly', () => {
  const c = renderer.create(<Login navigation={{} as any} />);
  // console.log(c.toJSON());
});

test('testing functions', () => {
  // const component = renderer.create(
  //   <Login navigation={{} as any} />
  // );
  // const _renderer = ShallowRenderer.createRenderer();
  // _renderer.render(<Login navigation={{} as any} />);
  // // console.log(_renderer.getMountedInstance ())
  // const result = _renderer.getRenderOutput();
});
