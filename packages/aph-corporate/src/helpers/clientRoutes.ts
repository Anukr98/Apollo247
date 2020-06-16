import { webPatientsBaseUrl } from "@aph/universal/dist/aphRoutes";

export const clientRoutes = {
  patients: () => "/patients",
  cartPoc: () => "/cart-poc",
  storagePoc: () => "/storage-poc",
  welcome: () => "/",
  termsConditions: () => "/terms",
  privacy: () => "/privacy",
  FAQ: () => "/faq",
  partnerSBI: () => "/partners/sbi",
  contactUs: () => "/contact",
  aboutUs: () => "/aboutUs",
  needHelp: () => "/needHelp",
};

export const clientBaseUrl = () => webPatientsBaseUrl();
