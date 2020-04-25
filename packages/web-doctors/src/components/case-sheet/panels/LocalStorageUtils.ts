let isSupported: boolean | null = null;

const isLocalStorageSupported = () => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    isSupported = true;
  } catch (e) {
    isSupported = false;
  }
};

export const getLocalStorageItem = (id: string) => {
  if (isSupported === null) {
    isLocalStorageSupported();
  }
  if (isSupported) {
    const storageItem = localStorage.getItem(id);
    const storageObject = storageItem ? JSON.parse(storageItem) : null;
    return storageObject;
  }
  return null;
};

export const updateLocalStorageItem = (id: string, obj: any) => {
  localStorage.setItem(id, JSON.stringify(obj));
};
