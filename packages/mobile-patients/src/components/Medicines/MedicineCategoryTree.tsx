import { ArrowLeft, ArrowRight, Invoice } from '@aph/mobile-patients/src/components/ui/Icons';
import { Category } from '@aph/mobile-patients/src/helpers/apiCalls';
// import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View, ViewProps } from 'react-native';
import { ListItem } from 'react-native-elements';

export interface Props {
  onPressCategory: (category: Category, categoryTree: Category[]) => void;
  categories: Category[];
  containerStyle: ViewProps['style'];
}

export const MedicineCategoryTree: React.FC<Props> = ({
  onPressCategory,
  // categories,
  containerStyle,
}) => {
  const categories = [
    {
      category_id: '24',
      url_key: 'mom-baby',
      title: 'Baby Care',
      image_url: '/catalog/category/RDS.PNG',
      Child: [
        {
          category_id: '25',
          url_key: 'baby-diapers',
          title: 'Diapering',
          Child: [
            {
              category_id: '26',
              url_key: 'diapers',
              title: 'Diapers',
            },
            {
              category_id: '27',
              url_key: 'rash-creams',
              title: 'Rash Creams',
            },
            {
              category_id: '28',
              url_key: 'wipes',
              title: 'Wipes',
            },
          ],
        },
        {
          category_id: '29',
          url_key: 'feeding-nursing',
          title: 'Feeding & Nursing',
          Child: [
            {
              category_id: '30',
              url_key: 'bottles-feeding-aids',
              title: 'Bottle & Feeding Aids',
            },
            {
              category_id: '33',
              url_key: 'nursing-aids',
              title: 'Sterilizers & Cleaning Accessories',
            },
          ],
        },
        {
          category_id: '37',
          url_key: 'health-safety',
          title: 'Baby Personal Care',
          Child: [
            {
              category_id: '38',
              url_key: 'health-needs',
              title: 'Baby Bath',
            },
            {
              category_id: '39',
              url_key: 'safety',
              title: 'Baby Hair Care',
            },
            {
              category_id: '40',
              url_key: 'others',
              title: 'Baby Skin Care',
            },
            {
              category_id: '41',
              url_key: 'cleaners-laundry-detergents',
              title: 'Baby Oral Care',
            },
            {
              category_id: '49',
              url_key: 'oils',
              title: 'Baby Gift Sets',
            },
          ],
        },
        {
          category_id: '46',
          url_key: 'personal-care',
          title: 'Baby Food',
          Child: [
            {
              category_id: '50',
              url_key: 'creams-lotions',
              title: 'Formula Milk',
            },
            {
              category_id: '51',
              url_key: 'bath-gel',
              title: 'Baby Cereals',
            },
            {
              category_id: '1012',
              url_key: 'grooming',
              title: 'Baby Digestion',
            },
          ],
        },
      ],
    },
    {
      category_id: '6',
      url_key: 'nutrition',
      title: 'Health & Nutrition',
      image_url: '/catalog/category/RDS_1.PNG',
      Child: [
        {
          category_id: '7',
          url_key: 'vitamins-supplements',
          title: 'Vitamins & Supplements',
          Child: [
            {
              category_id: '9',
              url_key: 'immunity-anti-oxidants',
              title: 'Single Vitamins',
            },
            {
              category_id: '13',
              url_key: 'joint-bone-care',
              title: 'Speciality Supplements',
            },
            {
              category_id: '151',
              url_key: 'herbals',
              title: 'Omega 3',
            },
            {
              category_id: '164',
              url_key: 'digestive-health',
              title: 'Daily Supplements',
            },
            {
              category_id: '165',
              url_key: 'liver-health',
              title: 'Honey',
            },
            {
              category_id: '232',
              url_key: 'hair-skin-nail',
              title: 'Minerals',
            },
            {
              category_id: '1014',
              url_key: 'heart-health',
              title: 'Multivitamins',
            },
          ],
        },
        {
          category_id: '11',
          url_key: 'weight-management',
          title: 'Weight Management',
          Child: [
            {
              category_id: '12',
              url_key: 'fat-burners',
              title: 'Fat Burner Supplements',
            },
            {
              category_id: '66',
              url_key: 'green-tea',
              title: 'Green Tea',
            },
            {
              category_id: '68',
              url_key: 'omega-amino-acids',
              title: 'Weight Gain Supplements',
            },
          ],
        },
        {
          category_id: '17',
          url_key: 'special-nutrition-needs',
          title: 'Special Nutrition Needs',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '64',
          url_key: 'sexual-wellness',
          title: 'Sexual Health Supplements',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '132',
          url_key: 'foods-drinks',
          title: 'Health Food & Drinks',
          Child: [
            {
              category_id: '133',
              url_key: 'nutritional-drinks',
              title: 'Pet Food',
            },
            {
              category_id: '134',
              url_key: 'instant-food',
              title: 'Chocolates & Biscuits',
            },
            {
              category_id: '135',
              url_key: 'breakfast-snacks',
              title: 'Breakfast & Snacks',
            },
            {
              category_id: '136',
              url_key: 'biscuits',
              title: 'Health Food',
            },
            {
              category_id: '137',
              url_key: 'bars',
              title: 'Health Drinks',
            },
          ],
        },
        {
          category_id: '144',
          url_key: 'sports-nutrition',
          title: 'Sports Nutrition',
          Child: [
            {
              category_id: '145',
              url_key: 'pre-workout',
              title: 'Protein Bars',
            },
            {
              category_id: '146',
              url_key: 'proteins',
              title: 'Pre Workout',
            },
            {
              category_id: '147',
              url_key: 'glutamine',
              title: 'Protein Powders & Drinks',
            },
            {
              category_id: '148',
              url_key: 'muscle-mass-builders',
              title: 'Whey Protein',
            },
            {
              category_id: '150',
              url_key: 'post-workout',
              title: 'Post Workout',
            },
            {
              category_id: '1366',
              url_key: 'other-accessories-76',
              title: 'Muscle Mass Builders',
            },
            {
              category_id: '20336',
              url_key: 'shakers',
              title: 'Shakers',
            },
          ],
        },
        {
          category_id: '20220',
          url_key: 'immunity-boosters',
          title: 'Immunity Boosters',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
      ],
    },
    {
      category_id: '14',
      url_key: 'personal-care',
      title: 'Personal Care',
      image_url: '/catalog/category/PageSpeed_Desktop.PNG',
      Child: [
        {
          category_id: '15',
          url_key: 'skin-care',
          title: 'Skin Care',
          Child: [
            {
              category_id: '16',
              url_key: 'face',
              title: 'Beauty',
            },
            {
              category_id: '181',
              url_key: 'body',
              title: 'Bath & Body',
            },
            {
              category_id: '229',
              url_key: 'eyes',
              title: 'Face Care',
            },
            {
              category_id: '230',
              url_key: 'lips',
              title: 'Lip Care',
            },
            {
              category_id: '231',
              url_key: 'sun-care',
              title: 'Foot & Hand Care',
            },
            {
              category_id: '20217',
              url_key: 'facial-wipes',
              title: 'Facial Wipes',
            },
            {
              category_id: '20218',
              url_key: 'massage-essential-oils',
              title: 'Massage & Essential Oils',
            },
            {
              category_id: '20304',
              url_key: 'hand-wash-sanitizers',
              title: 'Hand Wash & Sanitizers',
            },
          ],
        },
        {
          category_id: '22',
          url_key: 'hair-care',
          title: 'Hair Care',
          Child: [
            {
              category_id: '23',
              url_key: 'hair-appliances',
              title: 'Gels & Serums',
            },
            {
              category_id: '203',
              url_key: 'oils-treatment',
              title: 'Hair Oils',
            },
            {
              category_id: '204',
              url_key: 'conditioners',
              title: 'Conditioners',
            },
            {
              category_id: '205',
              url_key: 'shampoos',
              title: 'Shampoos',
            },
            {
              category_id: '206',
              url_key: 'hair-colour',
              title: 'Hair Creams & Packs',
            },
            {
              category_id: '207',
              url_key: 'hair-styling',
              title: 'Hair Colors',
            },
            {
              category_id: '20219',
              url_key: 'accessories',
              title: 'Accessories',
            },
          ],
        },
        {
          category_id: '176',
          url_key: 'bath-body',
          title: 'Mens Grooming',
          Child: [
            {
              category_id: '177',
              url_key: 'shower-gel-body-wash',
              title: 'Catridges',
            },
            {
              category_id: '178',
              url_key: 'soap',
              title: 'Gels & After Shave Lotions',
            },
            {
              category_id: '179',
              url_key: 'kits-accessories',
              title: 'Shaving Creams & Foams',
            },
            {
              category_id: '180',
              url_key: 'bath-oils',
              title: 'Razors & Shaving Brush',
            },
          ],
        },
        {
          category_id: '191',
          url_key: 'fragrance',
          title: 'Fragrances',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '216',
          url_key: 'oral-care',
          title: 'Oral Care',
          Child: [
            {
              category_id: '217',
              url_key: 'tooth-paste',
              title: 'Tooth Paste',
            },
            {
              category_id: '218',
              url_key: 'tooth-brush',
              title: 'Tooth Brush & Tongue Cleaner',
            },
            {
              category_id: '219',
              url_key: 'accessories-packs',
              title: 'Mouth & Teeth Relief',
            },
            {
              category_id: '220',
              url_key: 'mouthwash-freshener',
              title: 'Mouth Wash',
            },
            {
              category_id: '221',
              url_key: 'cleaning-whitening',
              title: 'Mouth Freshners',
            },
          ],
        },
        {
          category_id: '223',
          url_key: 'sexual-wellness',
          title: 'Sexual Wellness',
          Child: [
            {
              category_id: '224',
              url_key: 'men',
              title: 'Condoms',
            },
            {
              category_id: '225',
              url_key: 'women',
              title: 'Performance Enhancers & Accessories',
            },
          ],
        },
        {
          category_id: '242',
          url_key: 'adult-care',
          title: 'Adult Diapers',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
      ],
    },
    {
      category_id: '71',
      url_key: 'healthcare-devices',
      title: 'Health Devices',
      image_url: '/catalog/category/health_devices.png',
      Child: [
        {
          category_id: '72',
          url_key: 'diabetes-management',
          title: 'Supports & Splints',
          Child: [
            {
              category_id: '73',
              url_key: 'devices-supplies',
              title: 'Abdominal Supports',
            },
            {
              category_id: '20224',
              url_key: 'arm-wrist-supports',
              title: 'Arm & Wrist Supports',
            },
            {
              category_id: '20225',
              url_key: 'knee-leg-supports',
              title: 'Knee & Leg Supports',
            },
            {
              category_id: '20226',
              url_key: 'neck-support',
              title: 'Neck Support',
            },
          ],
        },
        {
          category_id: '76',
          url_key: 'health-accessories',
          title: 'Health Accessories',
          Child: [
            {
              category_id: '77',
              url_key: 'others',
              title: 'Ortho Slippers',
            },
            {
              category_id: '1223',
              url_key: 'air-purifiers-and-masks',
              title: 'Gloves',
            },
            {
              category_id: '20227',
              url_key: 'corona-kits',
              title: 'Corona Kits',
            },
            {
              category_id: '20228',
              url_key: 'air-purifier',
              title: 'Air Purifier',
            },
            {
              category_id: '20229',
              url_key: 'neck-pillow',
              title: 'Neck Pillow',
            },
            {
              category_id: '20230',
              url_key: 'other-health-accessories',
              title: 'Other Health Accessories',
            },
            {
              category_id: '20231',
              url_key: 'face-mask',
              title: 'Face Mask',
            },
          ],
        },
        {
          category_id: '78',
          url_key: 'home-healthcare',
          title: 'BP Monitors',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '88',
          url_key: 'home-testing-kits',
          title: 'Home Testing Kits',
          Child: [
            {
              category_id: '89',
              url_key: 'pregnancy-ovulation',
              title: 'Pregnancy test Kit',
            },
            {
              category_id: '90',
              url_key: 'diabetes',
              title: 'Sugar test Kits',
            },
            {
              category_id: '20221',
              url_key: 'thermometers',
              title: 'Thermometers',
            },
            {
              category_id: '20222',
              url_key: 'nebulizer',
              title: 'Nebulizer',
            },
            {
              category_id: '20223',
              url_key: 'weighing-machine',
              title: 'Weighing Machine',
            },
            {
              category_id: '22585',
              url_key: 'oximeters',
              title: 'Oximeters',
            },
          ],
        },
      ],
    },
    {
      category_id: '234',
      url_key: 'special-offers',
      title: 'OTC',
      image_url: '/catalog/category/',
      Child: [
        {
          category_id: '1180',
          url_key: 'offer2',
          title: 'Cold & Cough',
          Child: [
            {
              category_id: '20232',
              url_key: 'capsules-lozenges',
              title: 'Capsules & Lozenges',
            },
            {
              category_id: '20233',
              url_key: 'syrups',
              title: 'Syrups',
            },
            {
              category_id: '20234',
              url_key: 'vaporub',
              title: 'Vaporub',
            },
            {
              category_id: '20235',
              url_key: 'nasal-spray-inhaler',
              title: 'Nasal Spray & Inhaler',
            },
          ],
        },
        {
          category_id: '1195',
          url_key: 'offer1',
          title: 'Pain Relief',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '1200',
          url_key: 'offer3',
          title: 'Wound Care',
          Child: [
            {
              category_id: '20239',
              url_key: 'bandages',
              title: 'Bandages',
            },
            {
              category_id: '20240',
              url_key: 'ointment',
              title: 'Ointment',
            },
            {
              category_id: '20241',
              url_key: 'gauze-swabs',
              title: 'Gauze Swabs',
            },
            {
              category_id: '20242',
              url_key: 'cotton',
              title: 'Cotton',
            },
            {
              category_id: '20243',
              url_key: 'liquid-solution',
              title: 'Liquid Solution',
            },
            {
              category_id: '20244',
              url_key: 'first-aid-kit',
              title: 'First Aid Kit',
            },
          ],
        },
        {
          category_id: '1202',
          url_key: 'offer5',
          title: 'Eye care',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '1203',
          url_key: 'offer6',
          title: 'Other Otc',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '1205',
          url_key: 'offer8',
          title: 'Indigestion',
          Child: [
            {
              category_id: '20236',
              url_key: 'acidity-gas-relief',
              title: 'Acidity & Gas Relief',
            },
            {
              category_id: '20238',
              url_key: 'constipation',
              title: 'Constipation',
            },
          ],
        },
      ],
    },
    {
      category_id: '20246',
      url_key: 'womens-care',
      title: 'Women Care',
      image_url: '/catalog/category/women_care.png',
      Child: [
        {
          category_id: '20247',
          url_key: 'feminine-care',
          title: 'Feminine Care',
          Child: [
            {
              category_id: '20248',
              url_key: 'womens-hygiene',
              title: 'Women Hygiene',
            },
            {
              category_id: '20249',
              url_key: 'hair-removal',
              title: 'Hair Removal',
            },
          ],
        },
        {
          category_id: '20250',
          url_key: 'mothers-care',
          title: 'Mother Care',
          Child: [
            {
              category_id: '20251',
              url_key: 'mother-supplements',
              title: 'Mother Supplements',
            },
            {
              category_id: '20252',
              url_key: 'mother-skin-care',
              title: 'Mother Skin Care',
            },
          ],
        },
        {
          category_id: '20253',
          url_key: 'women-supplements',
          title: 'Women Supplements',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '20254',
          url_key: 'sanitary-pads',
          title: 'Sanitary Pads',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
      ],
    },
    {
      category_id: '20255',
      url_key: 'home-essentials',
      title: 'Home Essentials',
      image_url: '/catalog/category/home_essentials.png',
      Child: [
        {
          category_id: '20256',
          url_key: 'covid-essentials',
          title: 'Covid Essentials',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '20257',
          url_key: 'insect-killers',
          title: 'Insect Killers',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '20258',
          url_key: 'antiseptic-liquids',
          title: 'Antiseptic Liquids',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '20259',
          url_key: 'room-freshners',
          title: 'Room Freshners',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '20260',
          url_key: 'cleaning-essentials',
          title: 'Cleaning Essentials',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
        {
          category_id: '20261',
          url_key: 'batteries',
          title: 'Batteries',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
      ],
    },
    {
      category_id: '680',
      url_key: 'apollo-products',
      title: 'Apollo Life',
      image_url: '/catalog/category/ic_apollo.png',
      Child: [
        {
          category_id: '681',
          url_key: 'personal-care',
          title: 'Personal Care',
          Child: [
            {
              category_id: '682',
              url_key: 'skin-care',
              title: 'Skin Care',
            },
            {
              category_id: '694',
              url_key: 'oral-care',
              title: 'Oral Care',
            },
            {
              category_id: '734',
              url_key: 'sexual-wellness',
              title: 'Sexual Wellness',
            },
            {
              category_id: '765',
              url_key: 'feminine-care',
              title: 'Sanitary Pads',
            },
            {
              category_id: '776',
              url_key: 'adult-care',
              title: 'Adult Diapers',
            },
            {
              category_id: '815',
              url_key: 'bath-body',
              title: 'Mens Grooming',
            },
          ],
        },
        {
          category_id: '685',
          url_key: 'nutrition',
          title: 'Food & Drink',
          Child: [
            {
              category_id: '743',
              url_key: 'special-nutrition-needs',
              title: 'ORS Drinks',
            },
            {
              category_id: '801',
              url_key: 'sexual-wellness',
              title: 'Juices',
            },
            {
              category_id: '1022',
              url_key: 'sports-nutrition',
              title: 'Multi Grain Food',
            },
          ],
        },
        {
          category_id: '725',
          url_key: 'beauty',
          title: 'OTC',
          Child: [
            {
              category_id: '799',
              url_key: 'beauty-accessories',
              title: 'Cold & Cough',
            },
            {
              category_id: '1023',
              url_key: 'make-up',
              title: 'Pain Relief',
            },
            {
              category_id: '20262',
              url_key: 'eye-ear-care',
              title: 'Eye & Ear Care',
            },
            {
              category_id: '20263',
              url_key: 'indigestion',
              title: 'Indigestion',
            },
            {
              category_id: '20264',
              url_key: 'first-aid',
              title: 'First Aid',
            },
            {
              category_id: '20265',
              url_key: 'other-otc',
              title: 'Other OTC',
            },
          ],
        },
        {
          category_id: '1154',
          url_key: 'baby-mother',
          title: 'Baby Care',
          Child: [
            {
              category_id: '1155',
              url_key: 'baby-diapers',
              title: 'Diapers & Wipes',
            },
            {
              category_id: '1156',
              url_key: 'feeding-nursing',
              title: 'Feeding & Nursing',
            },
            {
              category_id: '1157',
              url_key: 'gifts-accessories',
              title: 'Skin & Oral Care',
            },
          ],
        },
        {
          category_id: '1162',
          url_key: 'healthcare-devices',
          title: 'Vitamins & Supplements',
          Child: [
            {
              category_id: '1163',
              url_key: 'health-accessories',
              title: 'Vitamins',
            },
            {
              category_id: '1164',
              url_key: 'home-healthcare',
              title: 'Supplements',
            },
            {
              category_id: '1165',
              url_key: 'diabetes-management',
              title: 'Honey',
            },
            {
              category_id: '1166',
              url_key: 'home-testing-kits',
              title: 'Nutrition Powders',
            },
          ],
        },
        {
          category_id: '20266',
          url_key: 'health-accessories',
          title: 'Health Accessories',
          Child: [
            {
              category_id: '20267',
              url_key: 'hand-foot-care',
              title: 'Hand & Foot Care',
            },
            {
              category_id: '20268',
              url_key: 'testing-kits',
              title: 'Testing Kits',
            },
            {
              category_id: '20269',
              url_key: 'supports',
              title: 'Supports',
            },
            {
              category_id: '20270',
              url_key: 'other-health-accessories',
              title: 'Other Health Accessories',
            },
            {
              category_id: '22586',
              url_key: 'corona-essentials',
              title: 'Corona Essentials',
            },
          ],
        },
        {
          category_id: '20271',
          url_key: 'weight-management',
          title: 'Weight Management',
          Child: [
            {
              category_id: null,
              url_key: null,
              title: null,
            },
          ],
        },
      ],
    },
    {
      category_id: '97',
      url_key: 'holland-barrett',
      title: 'Holland & Barrett',
      image_url: '/catalog/category/ic_holland.png',
      Child: [
        {
          category_id: '1240',
          url_key: 'sports-nutrition-59',
          title: 'Sports Nutrition',
          Child: [
            {
              category_id: '1247',
              url_key: 'sports-supplements',
              title: 'Protein Powders & Drinks',
            },
            {
              category_id: '1309',
              url_key: 'amino-acids',
              title: 'Whey Protein',
            },
            {
              category_id: '1317',
              url_key: 'creatine',
              title: 'Protein Bars',
            },
            {
              category_id: '1320',
              url_key: 'energy-endurance',
              title: 'Pre Workout',
            },
            {
              category_id: '1322',
              url_key: 'pre-workout-support',
              title: 'Post Workout',
            },
            {
              category_id: '1324',
              url_key: 'protein',
              title: 'Muscle Mass Builders',
            },
            {
              category_id: '1330',
              url_key: 'sports-accessories',
              title: 'Shakers',
            },
            {
              category_id: '20272',
              url_key: 'energy-drinks',
              title: 'Energy Drinks',
            },
          ],
        },
        {
          category_id: '1241',
          url_key: 'vitamins-supplements',
          title: 'Vitamins & Supplements',
          Child: [
            {
              category_id: '1248',
              url_key: 'condition',
              title: 'Single Vitamins',
            },
            {
              category_id: '1249',
              url_key: 'herbal-licensed-remedies',
              title: 'Multi Vitamins',
            },
            {
              category_id: '1250',
              url_key: 'minerals',
              title: 'Minerals',
            },
          ],
        },
      ],
    },
  ];
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const renderItem = ({ item }: ListRenderItemInfo<Category>) => {
    const { category_id, title, Child } = item;
    const onPress = () => {
      if (Child?.length) {
        setCategoryTree([item, ...categoryTree]);
      } else {
        onPressCategory(item, [...categoryTree.reverse(), item]);
      }
    };
    return (
      <ListItem
        key={category_id}
        title={title}
        rightIcon={<ArrowRight />}
        titleStyle={styles.itemTitle}
        containerStyle={styles.listItemContainer}
        onPress={onPress}
        topDivider
      />
    );
  };

  const renderTitle = () => {
    const title = categoryTree?.[0]?.title?.toUpperCase() || 'Shop by Category';
    const onPress = () => {
      if (categoryTree.length) {
        setCategoryTree(categoryTree.slice(1, categoryTree.length));
      }
    };
    const isCategorySelected = !!categoryTree?.[0];

    return (
      <ListItem
        title={title}
        titleStyle={isCategorySelected ? styles.sectionTitleSelected : styles.sectionTitle}
        containerStyle={[styles.listItemContainer, { marginLeft: -25 }]}
        pad={0}
        leftIcon={isCategorySelected ? <ArrowLeft /> : <Invoice />}
        onPress={onPress}
      />
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderTitle()}
      <FlatList
        keyExtractor={({ category_id }) => `${category_id}`}
        bounces={false}
        data={categoryTree?.[0]?.Child || categories}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const { LIGHT_BLUE, APP_GREEN, WHITE } = theme.colors;
const { text } = theme.viewStyles;

const styles = StyleSheet.create({
  container: { backgroundColor: WHITE, paddingHorizontal: 35, paddingVertical: 15 },
  itemTitle: { ...text('R', 14, LIGHT_BLUE) },
  sectionTitleSelected: { ...text('B', 16, APP_GREEN) },
  sectionTitle: { ...text('B', 16, LIGHT_BLUE) },
  listItemContainer: { paddingHorizontal: 0, paddingVertical: 8 },
});
