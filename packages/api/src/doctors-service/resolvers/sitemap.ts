import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';
import { keyCache, hgetAllCache } from 'doctors-service/database/connectRedis';
import { log } from 'customWinstonLogger';

export const sitemapTypeDefs = gql`
  type SitemapUrls {
    urlName: String
    url: String
  }

  type SitemapResult {
    specialityUrls: [SitemapUrls]
    doctorUrls: [SitemapUrls]
    articleUrls: [SitemapUrls]
    healthAreasUrls: [SitemapUrls]
    shopByCategoryUrls: [SitemapUrls]
    medicinesUrls: [SitemapUrls]
    staticPageUrls: [SitemapUrls]
    sitemapFilePath: String
  }
  extend type Mutation {
    generateSitemap: SitemapResult!
  }
`;

type SitemapUrls = {
  urlName: string;
  url: string;
};

type SitemapResult = {
  specialityUrls: SitemapUrls[];
  doctorUrls: SitemapUrls[];
  articleUrls: SitemapUrls[];
  healthAreasUrls: SitemapUrls[];
  shopByCategoryUrls: SitemapUrls[];
  medicinesUrls: SitemapUrls[];
  staticPageUrls: SitemapUrls[];
  sitemapFilePath: string;
};

function readableParam(param: string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return param
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

const generateSitemap: Resolver<null, {}, DoctorsServiceContext, SitemapResult> = async (
  parent,
  args,
  { doctorsDb }
) => {
  console.log(await hgetAllCache('apollo247:staticpages:*'), 'static pages');
  const specialtyRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const specialityUrls: SitemapUrls[] = [],
    doctorUrls: SitemapUrls[] = [],
    articleUrls: SitemapUrls[] = [],
    healthAreasUrls: SitemapUrls[] = [],
    shopByCategoryUrls: SitemapUrls[] = [],
    medicinesUrls: SitemapUrls[] = [],
    staticPageUrls: SitemapUrls[] = [];

  const specialitiesList = await specialtyRepo.findAll();
  let sitemapStr =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n<!-- Doctor Specilaities -->\n';
  let doctorsStr = '';
  const modifiedDate =
    format(new Date(), 'yyyy-MM-dd') + 'T' + format(new Date(), 'hh:mm:ss') + '+00:00';
  if (specialitiesList.length > 0) {
    specialitiesList.forEach(async (specialty) => {
      const specialtyName = readableParam(specialty.name);
      const url = process.env.SITEMAP_BASE_URL + 'specialties/' + specialtyName;
      const urlInfo: SitemapUrls = {
        url,
        urlName: specialtyName,
      };
      specialityUrls.push(urlInfo);
      const specialtyStr =
        '<url>\n<loc>' + url + '</loc>\n<lastmod>' + modifiedDate + '</lastmod>\n</url>\n';
      sitemapStr += specialtyStr;
    });
  }
  doctorsStr = '\n<!-- Doctors -->\n';
  const doctorList = await doctorRepo.getListBySpecialty();
  if (doctorList.length > 0) {
    doctorList.forEach((doctor) => {
      const doctorName = readableParam(doctor.displayName) + '-' + doctor.id;
      const url = process.env.SITEMAP_BASE_URL + 'doctors/' + doctorName;
      const urlInfo: SitemapUrls = {
        url,
        urlName: doctor.displayName,
      };
      doctorUrls.push(urlInfo);
      const docStr =
        '<url>\n<loc>' + url + '</loc>\n<lastmod>' + modifiedDate + '</lastmod>\n</url>\n';
      doctorsStr += docStr;
    });
  }
  //const fetch = require('node-fetch');
  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  let cmsUrls = '\n<!--CMS url-->\n';
  const listResp = await fetch(
    process.env.CMS_ARTICLES_SLUG_LIST_URL ? process.env.CMS_ARTICLES_SLUG_LIST_URL : '',
    {
      method: 'GET',
      headers: { Authorization: process.env.CMS_TOKEN ? process.env.CMS_TOKEN : '' },
    }
  );
  const textRes = await listResp.text();
  const cmsUrlsList = JSON.parse(textRes);

  if (cmsUrlsList && cmsUrlsList.data.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cmsUrlsList.data.forEach((link: any) => {
      let url = process.env.SITEMAP_BASE_URL + 'covid19/';
      if (link.type == 'ARTICLE') {
        url += 'article' + link.slug;
      } else {
        url += 'report' + link.slug;
      }
      const urlInfo: SitemapUrls = {
        url,
        urlName: link.slug,
      };
      articleUrls.push(urlInfo);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    healthAreasUrlsList.healthareas.forEach((link: any) => {
      const url = process.env.SITEMAP_BASE_URL + 'medicine/healthareas/' + link.url_key;
      const urlInfo: SitemapUrls = {
        url,
        urlName: link.title,
      };
      healthAreasUrls.push(urlInfo);
      healthAreaUrls +=
        '<url>\n<loc>' + url + '</loc>\n<lastmod>' + modifiedDate + '</lastmod>\n</url>\n';
    });
  }
  let ShopByCategory = '\n<!--Shop By Category links-->\n';
  if (healthAreasUrlsList.shop_by_category && healthAreasUrlsList.shop_by_category.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    healthAreasUrlsList.shop_by_category.forEach((link: any) => {
      const url = process.env.SITEMAP_BASE_URL + 'medicine/shop-by-category/' + link.url_key;
      const urlInfo: SitemapUrls = {
        url,
        urlName: link.title,
      };
      shopByCategoryUrls.push(urlInfo);
      ShopByCategory +=
        '<url>\n<loc>' + url + '</loc>\n<lastmod>' + modifiedDate + '</lastmod>\n</url>\n';
    });
  }

  const redisMedKeys = await keyCache('medicine:sku:*');
  let medicineUrls = '\n<!--Medicines list-->\n';
  if (redisMedKeys && redisMedKeys.length > 0) {
    let medCount = redisMedKeys.length;
    if (
      process.env.NODE_ENV == 'local' ||
      process.env.NODE_ENV == 'dev' ||
      process.env.NODE_ENV == 'staging'
    ) {
      medCount = 100;
    }
    for (let k = 0; k < medCount; k++) {
      //console.log(redisMedKeys[k], 'key');
      const skuDets = await hgetAllCache(redisMedKeys[k]);
      //console.log(skuDets, 'indise key');
      if (
        skuDets &&
        skuDets.url_key &&
        (skuDets.status == 'Enabled' || skuDets.status == 'enabled')
      ) {
        const url = process.env.SITEMAP_BASE_URL + 'medicine/' + skuDets.url_key.toString();
        const urlInfo: SitemapUrls = {
          url,
          urlName: decodeURIComponent(skuDets.name),
        };
        medicinesUrls.push(urlInfo);
        medicineUrls += `<url>\n<loc>${url}</loc>\n<lastmod>${modifiedDate}</lastmod>\n</url>\n`;
      }
    }
  }

  //read static page urls from redis cache
  const staticPages = await keyCache('apollo247:staticpages:*');
  console.log(staticPages, 'staticPages');
  if (staticPages && staticPages.length > 0) {
    for (let k = 0; k < staticPages.length; k++) {
      const pageDets = await hgetAllCache(staticPages[k]);
      console.log(pageDets, 'page dets');
      if (pageDets) {
        const urlInfo: SitemapUrls = {
          url: pageDets.pageUrl,
          urlName: pageDets.pageName,
        };
        staticPageUrls.push(urlInfo);
      }
    }
  }

  sitemapStr +=
    doctorsStr +
    brandsPage +
    healthAreaUrls +
    ShopByCategory +
    cmsUrls +
    medicineUrls +
    '</urlset>';
  const fileName = 'sitemap.xml';
  const uploadPath = assetsDir + '/' + fileName;
  fs.writeFile(uploadPath, sitemapStr, {}, (err) => {
    log(
      'doctorServiceLogger',
      'sitemamap generateSitemap error',
      'sitemamap()->generateSitemap()',
      '',
      JSON.stringify(err)
    );
  });
  //return 'Sitemap generated :) ' + uploadPath;
  return {
    sitemapFilePath: uploadPath,
    specialityUrls,
    doctorUrls,
    articleUrls,
    healthAreasUrls,
    shopByCategoryUrls,
    medicinesUrls,
    staticPageUrls,
  };
};

export const sitemapResolvers = {
  Mutation: {
    generateSitemap,
  },
};
