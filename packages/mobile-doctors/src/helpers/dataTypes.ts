export type chatFilesType = {
  isTyping: boolean | null;
  prismId: string | null;
  url: string;
  fileType: 'pdf' | 'image';
  fileName: string | null;
  messageDate: string;
  message: '^^#DocumentUpload';
  id: string;
  timetoken: string; //17-digit unix token
  urlTimeToken: string; //17-digit unix token
};
