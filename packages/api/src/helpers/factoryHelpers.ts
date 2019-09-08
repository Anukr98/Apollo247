import _random from 'lodash/random';
import _sample from 'lodash/sample';
import _times from 'lodash/times';
import _uniq from 'lodash/uniq';

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
  return _uniq(_times(count != null ? count : _random(0, array.length), () => randomValue(array)));
}
