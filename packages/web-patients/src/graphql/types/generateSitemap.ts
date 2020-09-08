/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: generateSitemap
// ====================================================

export interface generateSitemap_generateSitemap_specialityUrls {
  __typename: "SitemapUrls";
  urlName: string | null;
  url: string | null;
}

export interface generateSitemap_generateSitemap_doctorUrls {
  __typename: "SitemapUrls";
  urlName: string | null;
  url: string | null;
}

export interface generateSitemap_generateSitemap_articleUrls {
  __typename: "SitemapUrls";
  urlName: string | null;
  url: string | null;
}

export interface generateSitemap_generateSitemap_healthAreasUrls {
  __typename: "SitemapUrls";
  urlName: string | null;
  url: string | null;
}

export interface generateSitemap_generateSitemap_shopByCategoryUrls {
  __typename: "SitemapUrls";
  urlName: string | null;
  url: string | null;
}

export interface generateSitemap_generateSitemap_medicinesUrls {
  __typename: "SitemapUrls";
  urlName: string | null;
  url: string | null;
}

export interface generateSitemap_generateSitemap_staticPageUrls {
  __typename: "SitemapUrls";
  urlName: string | null;
  url: string | null;
}

export interface generateSitemap_generateSitemap {
  __typename: "SitemapResult";
  specialityUrls: (generateSitemap_generateSitemap_specialityUrls | null)[] | null;
  doctorUrls: (generateSitemap_generateSitemap_doctorUrls | null)[] | null;
  articleUrls: (generateSitemap_generateSitemap_articleUrls | null)[] | null;
  healthAreasUrls: (generateSitemap_generateSitemap_healthAreasUrls | null)[] | null;
  shopByCategoryUrls: (generateSitemap_generateSitemap_shopByCategoryUrls | null)[] | null;
  medicinesUrls: (generateSitemap_generateSitemap_medicinesUrls | null)[] | null;
  staticPageUrls: (generateSitemap_generateSitemap_staticPageUrls | null)[] | null;
}

export interface generateSitemap {
  generateSitemap: generateSitemap_generateSitemap;
}
