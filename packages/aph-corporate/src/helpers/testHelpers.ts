export const isTest = () => window.__TEST__ != null;

export const isFirebaseLoginTest = () =>
  isTest() && window.__TEST__.startsWith('Firebase (Captcha Disabled):');
