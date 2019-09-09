import _random from 'lodash/random';
import _sample from 'lodash/sample';
import _sampleSize from 'lodash/sampleSize';

export function randomEnum<T>(anEnum: T): T[keyof T] {
  const enumValues = (Object.values(anEnum) as unknown) as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  const randomEnumValue = enumValues[randomIndex];
  return randomEnumValue;
}

export function randomValue<T>(array: T[]) {
  return _sample(array) as T;
}

export function randomValues<T>(array: T[], count?: number) {
  return _sampleSize(array, count != null ? count : _random(0, array.length - 1));
}
