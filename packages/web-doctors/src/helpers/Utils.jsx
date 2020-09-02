export const Compare = (a, b, key) => {
  if (key === 'itemname' && (a[key] === undefined || b[key] === undefined)) key = 'itemName';

  if (key && a[key] && b[key]) {
    if (a[key].toLowerCase() < b[key].toLowerCase()) {
      return -1;
    }
    if (a[key].toLowerCase() > b[key].toLowerCase()) {
      return 1;
    }
  }
  return 0;
};
