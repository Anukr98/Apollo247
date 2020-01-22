module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['./__mocks__/MockFirebase.tsx', './__mocks__/Mocks.ts'],
};
