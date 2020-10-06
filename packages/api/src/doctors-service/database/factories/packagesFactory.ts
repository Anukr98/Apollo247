import { Packages } from 'doctors-service/entities';
import _random from 'lodash/random';
import _sample from 'lodash/sample';

export const allPackageNames = [
  '1 Online Consult + 1 Physical Consult',
  '2 Online Consults + 2 Physical Consults',
  '3 Online Consults + 3 Physical Consults',
];

export const buildPackage = (attrs?: Partial<Packages>) => {
  const packages = new Packages();
  packages.name = _sample(allPackageNames) as string;
  packages.fees = _random(99, 999);
  return Object.assign(packages, attrs);
};
