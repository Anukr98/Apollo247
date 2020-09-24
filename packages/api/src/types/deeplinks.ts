export interface DeepLinkInput {
  //brand_domain: string;
  ttl: string;
  data: DeepLinkInputData;
}

export type DeepLinkInputData = {
  pid: string;
  c: string;
  af_channel: string;
  af_dp: string;
  af_sub1: string;
  af_force_deeplink: string;
  af_web_dp: string;
};
