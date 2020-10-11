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

export const getAge = (date) => {
  if (date) {
    const currentDate = new Date(Date.now());
    const birthDate = new Date(date);
    let years = currentDate.getUTCFullYear() - birthDate.getUTCFullYear()
    if (currentDate.getMonth() < birthDate.getMonth() || 
    currentDate.getMonth() == birthDate.getMonth() && currentDate.getDate() < birthDate.getDate()) {
      years--;
    }
    return years.toString();
  }else{
    return '';
  }
};