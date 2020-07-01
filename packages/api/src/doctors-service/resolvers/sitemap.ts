import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import path from 'path';
import fs from 'fs';
import { ApiConstants } from 'ApiConstants';
import { format } from 'date-fns';
import { Tedis } from 'redis-typescript';

export const sitemapTypeDefs = gql`
  extend type Mutation {
    generateSitemap: String
  }
`;

const generateSitemap: Resolver<null, {}, DoctorsServiceContext, string> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const specialtyRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const specialitiesList = await specialtyRepo.findAll();
  let sitemapStr =
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n<!-- Doctor Specilaities -->\n';
  let doctorsStr = '';
  if (specialitiesList.length > 0) {
    specialitiesList.forEach(async (specialty) => {
      const specialtyName = specialty.name
        .trim()
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace('/', '_')
        .replace('&', '%26');
      const modifiedDate =
        format(new Date(), 'yyyy-MM-dd') + 'T' + format(new Date(), 'hh:mm:ss') + '+00:00';
      const specialtyStr =
        '<url>\n<loc>' +
        process.env.SITEMAP_BASE_URL +
        'specialties/' +
        specialtyName +
        '</loc>\n<lastmod>' +
        modifiedDate +
        '</lastmod>\n</url>\n';
      sitemapStr += specialtyStr;
    });
  }
  doctorsStr = '\n<!-- Doctors -->\n';
  const doctorList = await doctorRepo.getListBySpecialty();
  if (doctorList.length > 0) {
    doctorList.forEach((doctor) => {
      const doctorName =
        doctor.displayName
          .trim()
          .toLowerCase()
          .replace(/\s/g, '-') +
        '-' +
        doctor.id;
      const modifiedDate =
        format(new Date(), 'yyyy-MM-dd') + 'T' + format(new Date(), 'hh:mm:ss') + '+00:00';
      const docStr =
        '<url>\n<loc>' +
        process.env.SITEMAP_BASE_URL +
        'doctors/' +
        doctorName +
        '</loc>\n<lastmod>' +
        modifiedDate +
        '</lastmod>\n</url>\n';
      doctorsStr += docStr;
    });
  }

  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const listResp = await fetch(
    process.env.CMS_ARTICLES_SLUG_LIST_URL ? process.env.CMS_ARTICLES_SLUG_LIST_URL : '',
    {
      method: 'GET',
      headers: { Authorization: process.env.CMS_TOKEN ? process.env.CMS_TOKEN : '' },
    }
  );
  const textRes = await listResp.text();
  const cmsUrlsList = JSON.parse(textRes);
  const modifiedDate =
    format(new Date(), 'yyyy-MM-dd') + 'T' + format(new Date(), 'hh:mm:ss') + '+00:00';
  let cmsUrls = '\n<!--CMS links-->\n';
  if (cmsUrlsList && cmsUrlsList.data.length > 0) {
    cmsUrlsList.data.forEach((link: string) => {
      const url = process.env.CMS_BASE_URL + link;
      cmsUrls += '<url>\n<loc>' + url + '</loc>\n<lastmod>' + modifiedDate + '</lastmod>\n</url>\n';
    });
  }
  const brandsPage =
    '\n<!--Brands url-->\n<url>\n<loc>' +
    process.env.SITEMAP_BASE_URL +
    'medicine/brands</loc>\n<lastmod>' +
    format(new Date(), 'yyyy-MM-dd') +
    'T' +
    format(new Date(), 'hh:mm:ss') +
    '+00:00</lastmod>\n</url>\n';

  const healthAreaListResp = await fetch(
    process.env.PHARMACY_MED_PROD_SEARCH_BY_BRAND
      ? process.env.PHARMACY_MED_PROD_SEARCH_BY_BRAND
      : '',
    {
      method: 'GET',
      headers: {
        Authorization: process.env.PHARMACY_MED_AUTH_TOKEN
          ? process.env.PHARMACY_MED_AUTH_TOKEN
          : '',
      },
    }
  );
  const healthAreaTextRes = await healthAreaListResp.text();
  const healthAreasUrlsList = JSON.parse(healthAreaTextRes);
  let healthAreaUrls = '\n<!--Health Area links-->\n';
  if (healthAreasUrlsList.healthareas && healthAreasUrlsList.healthareas.length > 0) {
    healthAreasUrlsList.healthareas.forEach((link: any) => {
      const url = process.env.SITEMAP_BASE_URL + 'medicine/healthareas/' + link.url_key;
      healthAreaUrls +=
        '<url>\n<loc>' + url + '</loc>\n<lastmod>' + modifiedDate + '</lastmod>\n</url>\n';
    });
  }
  let ShopByCategory = '\n<!--Shop By Category links-->\n';
  if (healthAreasUrlsList.shop_by_category && healthAreasUrlsList.shop_by_category.length > 0) {
    healthAreasUrlsList.shop_by_category.forEach((link: any) => {
      const url = process.env.SITEMAP_BASE_URL + 'medicine/shop-by-category/' + link.url_key;
      ShopByCategory +=
        '<url>\n<loc>' + url + '</loc>\n<lastmod>' + modifiedDate + '</lastmod>\n</url>\n';
    });
  }
  const tedis = new Tedis({
    port: <number>ApiConstants.REDIS_PORT,
    host: ApiConstants.REDIS_URL.toString(),
    password: ApiConstants.REDIS_PWD.toString(),
  });
  const redisMedKeys = await tedis.keys('medicine:sku:*');
  let medicineUrls = '\n<!--Medicines list-->\n';
  if (redisMedKeys && redisMedKeys.length > 0) {
    for (let k = 0; k < redisMedKeys.length; k++) {
      //console.log(redisMedKeys[k], 'key');
      const skuDets = await tedis.hgetall(redisMedKeys[k]);
      //console.log(skuDets, 'indise key');
      if (skuDets && skuDets.url_key && skuDets.status == 'Enabled') {
        medicineUrls +=
          '<url>\n<loc>' +
          process.env.SITEMAP_BASE_URL +
          'medicine/' +
          skuDets.url_key.toString() +
          '</loc>\n<lastmod>' +
          modifiedDate +
          '</lastmod>\n</url>\n';
        //console.log(medicineUrls, 'medurl');
      }
    }
  }

  sitemapStr +=
    doctorsStr +
    cmsUrls +
    brandsPage +
    healthAreaUrls +
    ShopByCategory +
    medicineUrls +
    '</urlset>';
  const fileName = 'sitemap.xml';
  const uploadPath = assetsDir + '/' + fileName;
  fs.writeFile(uploadPath, sitemapStr, {}, (err) => {
    console.log(err, 'err');
  });
  return 'Sitemap generated :) ' + uploadPath;
};

export const sitemapResolvers = {
  Mutation: {
    generateSitemap,
  },
};
