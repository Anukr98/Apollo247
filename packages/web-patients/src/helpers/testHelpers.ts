export const isTest = () => window.__TEST__ != null;

export const isFirebaseLoginTest = () => window.__TEST__ === 'Can do a real login with firebase';
