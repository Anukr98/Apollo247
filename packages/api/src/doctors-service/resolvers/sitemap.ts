import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';

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
      const specialtyName = doctor.specialty.name
        .trim()
        .toLowerCase()
        .replace(/\s/g, '-')
        .replace('/', '_')
        .replace('&', '%26');
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
        'specialties/' +
        specialtyName +
        '/' +
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

  sitemapStr += doctorsStr + cmsUrls + '</urlset>';
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
