import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import React, { useState } from 'react';

const client = new AphStorageClient(
  process.env.AZURE_STORAGE_CONNECTION_STRING_WEB_PATIENTS,
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

export const StoragePoc: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  return (
    <div style={{ color: 'black' }}>
      Storage POC
      <br /> <br />
      <input
        type="file"
        onChange={async (e) => {
          setIsUploading(false);
          setUploadedFileUrl(null);
          const files = e.currentTarget.files;
          const file = files && files.length > 0 ? files[0] : null;
          if (file) {
            setIsUploading(true);
            const aphBlob = await client.uploadBrowserFile({ file }).catch((error) => {
              throw error;
            });
            const url = client.getBlobUrl(aphBlob.name);
            console.log(aphBlob, url);
            setUploadedFileUrl(url);
            setIsUploading(false);
          }
        }}
      />
      <br />
      {isUploading && 'Uploading...'}
      <br />
      {uploadedFileUrl && (
        <a
          style={{ color: 'blue' }}
          href={uploadedFileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {uploadedFileUrl}
        </a>
      )}
    </div>
  );
};
