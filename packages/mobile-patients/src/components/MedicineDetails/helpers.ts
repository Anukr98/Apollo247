import { MedicineProductDetails } from '@aph/mobile-patients/src/helpers/apiCalls';
import string from '@aph/mobile-patients/src/strings/strings.json';

type OverView = MedicineProductDetails['PharmaOverview'][0]['Overview'];

const strings = string.components.medicineDetails.helpers;

const getDescription = (captionKey: string, overView: OverView) =>
  overView.find(({ Caption }) => Caption === captionKey)?.CaptionDesc || '';

export const getMedicineOverview = (overView: OverView): OverView => {
  const headings = [
    strings.overview,
    strings.usage,
    strings.sideEffects,
    strings.precautions,
    strings.drugWarnings,
    strings.storage,
  ];
  const captionKeys = [
    ['USES'],
    ['HOW TO USE', 'HOW IT WORKS'],
    ['SIDE EFFECTS'],
    [
      'DRUG ALCOHOL INTERACTION',
      'DRUG PREGNANCY INTERACTION',
      'DRUG MACHINERY INTERACTION (DRIVING)',
      'KIDNEY',
      'LIVER',
    ],
    ['DRUGS WARNINGS'],
    ['STORAGE'],
  ];
  const captionPrefix = [
    [],
    [],
    [],
    [strings.alcohol, strings.pregnancy, strings.driving, strings.kidney, strings.liver],
    [],
    [],
  ];

  const finalOverview = Array.from({ length: 6 }).map((_, index) => ({
    caption: headings[index],
    captionDesc: captionKeys[index].map((_, innerIndex) => ({
      key: captionKeys[index][innerIndex],
      prefix: captionPrefix[index][innerIndex],
    })),
  }));

  return finalOverview.map(({ caption, captionDesc }) => {
    const CaptionDesc = captionDesc
      .map(({ key, prefix }) => {
        const desc = getDescription(key, overView);
        return desc ? `${prefix || ''}${desc}` : '';
      })
      .filter((desc) => desc)
      .join('\n');

    return { Caption: caption, CaptionDesc };
  });
};
