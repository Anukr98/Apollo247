import { UPLOAD_FILE_TYPES } from 'profiles-service/entities';

export function getFileTypeFromMime(mimeType: string): string {
  const fileType = mimeType.split('/')[1].toUpperCase();
  let uploadFileType = UPLOAD_FILE_TYPES.JPG;

  switch (fileType) {
    case 'JPG':
      uploadFileType = UPLOAD_FILE_TYPES.JPG;
      break;
    case 'PNG':
      uploadFileType = UPLOAD_FILE_TYPES.PNG;
      break;
    case 'JPEG':
      uploadFileType = UPLOAD_FILE_TYPES.JPEG;
      break;
    case 'PDF':
      uploadFileType = UPLOAD_FILE_TYPES.PDF;
      break;
  }
  return uploadFileType;
}
