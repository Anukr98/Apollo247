import { PhysicalPrescription } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { UPLOAD_DOCUMENT } from '@aph/mobile-patients/src/graphql/profiles';
import {
  PRISM_DOCUMENT_CATEGORY,
  UPLOAD_FILE_TYPES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  uploadDocument,
  uploadDocumentVariables,
} from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import ApolloClient from 'apollo-client';

/**
 * This function will update un-uploaded prescriptions URLs and merge
 * with the given prescriptions and return them
 */
export const updatePrescriptionUrls = async (
  client: ApolloClient<object>,
  patientId: string,
  prescriptions: PhysicalPrescription[]
) => {
  if (prescriptions.length) {
    const uploadedPresResult = await uploadDocuments(client, patientId, prescriptions);
    const newUploadedPres = prescriptions.map(
      (item, index) =>
        ({
          ...item,
          uploadedUrl: uploadedPresResult?.[index]?.data?.uploadDocument?.filePath,
          prismPrescriptionFileId: uploadedPresResult?.[index]?.data?.uploadDocument?.fileId,
        } as PhysicalPrescription)
    );
    return Promise.resolve([...newUploadedPres]);
  } else {
    return Promise.resolve(prescriptions);
  }
};

export const uploadDocuments = (
  client: ApolloClient<object>,
  patientId: string,
  documents: PhysicalPrescription[]
) => {
  const requests = documents.map(({ base64, fileType }) => {
    const variables: uploadDocumentVariables = {
      UploadDocumentInput: {
        base64FileInput: base64,
        category: PRISM_DOCUMENT_CATEGORY.HealthChecks,
        fileType:
          fileType?.toLowerCase() === 'png'
            ? UPLOAD_FILE_TYPES.PNG
            : fileType?.toLowerCase() === 'pdf'
            ? UPLOAD_FILE_TYPES.PDF
            : UPLOAD_FILE_TYPES.JPEG,
        patientId,
      },
    };
    return client.mutate<uploadDocument, uploadDocumentVariables>({
      mutation: UPLOAD_DOCUMENT,
      variables,
      fetchPolicy: 'no-cache',
    });
  });

  return Promise.all(requests);
};
