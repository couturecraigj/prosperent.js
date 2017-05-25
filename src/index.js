// @flow

import promise from 'core-js/es6/promise'
const Promise = Promise || promise
import axios from 'axios'
if (process.env.NODE_ENV === 'test') {
  axios.defaults.adapter = require('axios/lib/adapters/http')
}

const API_KEY_ERROR = new Error('`apiKey` needs to be defined')
const VALUE_NOT_IN_ENUM = new Error('an Enum field you entered a value for does not seem to match any enums')
const ACCESS_KEY_ERROR = new Error('`accessKey` needs to be defined')
const RELEVANCY_THRESHOLD_ERROR = new Error('`relevancyThreshold` needs to be between 0 and 1')
const SCRIPT_INJECTION_ATTEMPT = new Error('There was an attempt to inject script into the query')
const NOTHING_IN_QUERY = new Error('Your Query should include something')
const NO_URL_INCLUDED = new Error('URL is a required Parameter')
const NO_PHRASE_INCLUDED = new Error('Phrase is a required Parameter')
const NO_LOCATION = new Error('This endpoint requires a location to be valid')

const dateFormat = /\d{4}-[0,1]\d-[0-3]\d/

function valueInEnum (value: T, possibleOptions: Array<T>): boolean {
  if (!value) return true
  if (possibleOptions.includes(value)) return true
  return false
}

function removeSpacesAndUnusedQueryParams (strings, ...rest) {
  let value = ''
  strings.map((str, i) => {
    value = value + str + (rest[i] ? rest[i] : '')
  })
  
  var urlRegexp = /(\w+)=(?!\w)&?/g

  for (const match = urlRegexp.exec(value); match !== null;) {
    const replace = value.substr(match.index, match[0].length)
    value = value.replace(replace, "")
  }

  if (value[value.length - 1] === '&') value = value.substr(0, value.length - 1)
  
  return value.replace(/(\s|\n|\t)/g, '')
}

function sortByValidator (candidate: ?(string | Array<string>), possibleOptions: Array<string>): string | boolean {
  if (!candidate) return ''
  if (typeof candidate === 'string' && !valueInEnum(candidate, possibleOptions)) return encodeURIComponent(candidate)
  if (Array.isArray(candidate)) {
    if (candidate.map((opt: string): string => !valueInEnum(opt, possibleOptions)).includes(false)) return false
    return candidate.map((opt: string): string => encodeURIComponent(opt)).join('|')
  }
}

function convertArrayToString (arr: Array<string>): string {
  if (Array.isArray(arr) && arr.length !== 0) return encodeURIComponent(arr.join('|'))
  if (typeof arr === 'boolean') return arr
  return ''
}

function ifTrue (val: any, result: T): T {
  return val && typeof val !== 'boolean' ? result ? result : val : ''
}

functionRemoveSpaces () {

}

function yearMonthDateFormatChecker (candidate: string): boolean | string {
  if (dateFormat.test(candidate)) {
    return candidate.match(dateFormat)[0]
  }
  return false
}

// function isNumeric (n: any): boolean {
//   return !isNaN(parseFloat(n)) && isFinite(n)
// }

// function isInteger (candidate: any): boolean {
//   if (!isNumeric(candidate)) return false
//   return Number.isSafeInteger(candidate)
// }

function falsyReturnEmptyString (candidate: T): T | string {
  return candidate ? candidate : ''
}

function toFixedNumber (candidate: any): string {
  if (!candidate || isNaN(candidate)) return candidate
  return (+candidate).toFixed('2')
}

function floatOrRange (arr: Array<any>): string {
  if (Array.isArray(arr)) {
    if (arr.length === 2) return '' + toFixedNumber(falsyReturnEmptyString(arr[0])) + ',' + toFixedNumber(falsyReturnEmptyString(arr[1]))
    if (arr.length === 1) return '' + toFixedNumber(falsyReturnEmptyString(arr[0]))
  }
  return ''
}

function dateOrRange (arr: Array<any>): string {
  if (Array.isArray(arr)) {
    if (arr.length === 2) return '' + yearMonthDateFormatChecker(falsyReturnEmptyString(arr[0])) + ',' + yearMonthDateFormatChecker(falsyReturnEmptyString(arr[1]))
    if (arr.length === 1) return '' + yearMonthDateFormatChecker(falsyReturnEmptyString(arr[0]))
  }
  return ''
}

class Prosperent {
  constructor (apiKey: string, accessKey: string, { clickMaskDomain, imageMaskDomain, location }: { location: string } = { location: 'http://localhost' }) {
    if (!apiKey) throw API_KEY_ERROR
    if (!accessKey) throw ACCESS_KEY_ERROR
    this.apiKey = apiKey
    this.accessKey = accessKey
    this.clickMaskDomain = clickMaskDomain
    this.imageMaskDomain = imageMaskDomain
    this.location = encodeURIComponent(location)
  }
  usProducts (options: {
    query: string,
    visitorIp: string,
    referrer: string,
    userAgent: string,
    relevancyThreshold: number, // float
    filterBrand: string, // pipe separated values
    filterCatalogId: string, // pipe separated values
    filterCategory: string, // pipe separated values
    filterKeyword: string, // pipe separated values
    filterKeywords: string, // pipe separated values
    filterMerchant: string, // pipe separated values
    filterMerchantId: string, // pipe separated values
    filterPercentOff: number, // float or range
    filterPremier: boolean,
    filterPrice: number,  // float or range
    filterPriceSale: number,  // float or range
    filterProductId: string,  // float or range
    sortBy: string, // enum
    groupBy: string, // enum
    maxPrice: number, // float
    minPrice: number, // float
    maxPriceSale: number, // float
    minPriceSale: number, // float
    limit: number, // integer
    page: number, // integer
    imageSize: string, // enum
    sid: string,
    enableFacets: boolean | string, // boolean or pipe separated facet values
    enableQuerySuggestion: boolean,
    enableFullData: boolean,
    imageMaskDomain: string,
    clickMaskDomain: string,
    debugMode: boolean
  } = {
    relevancyThreshold: .7,
    filterPremier: false,
    limit: 10,
    page: 1,
    imageSize: '250x250',
    enableFacets: false,
    enableQuerySuggestion: false,
    enableFullData: false,
    debugMode: false
  }): any {
    if (!options) return Promise.reject(NOTHING_IN_QUERY)
    if (Object.keys(options).map((v: string): boolean => options[v].includes && options[v].includes('&')).includes(true)) return Promise.reject(SCRIPT_INJECTION_ATTEMPT)
    if (Object.keys(options).map((v: any): boolean => !(v)).every((el: boolean): boolean => el === true)) return Promise.reject(NOTHING_IN_QUERY)

    let {
      query,
      visitorIp,
      referrer,
      userAgent,
      relevancyThreshold,
      filterBrand,
      filterCatalogId,
      filterCategory,
      filterKeyword,
      filterKeywords,
      filterMerchant,
      filterMerchantId,
      filterPercentOff,
      filterPremier,
      filterPrice,
      filterPriceSale,
      filterProductId,
      sortBy,
      groupBy,
      maxPrice,
      minPrice,
      maxPriceSale,
      minPriceSale,
      limit,
      page,
      imageSize,
      sid,
      enableFacets,
      enableQuerySuggestion,
      enableFullData,
      imageMaskDomain,
      clickMaskDomain,
      debugMode
    } = options
    if (referrer) referrer = encodeURIComponent(referrer)
    if (query) query = encodeURIComponent(query)
    if (imageMaskDomain) imageMaskDomain = encodeURIComponent(imageMaskDomain)
    if (clickMaskDomain) clickMaskDomain = encodeURIComponent(clickMaskDomain)
    if (relevancyThreshold > 1 || relevancyThreshold < 0) return Promise.reject(RELEVANCY_THRESHOLD_ERROR)
    if (sortByValidator(sortBy, [
      'relevance',
      'keyword',
      'brand',
      'merchant',
      'merchantId',
      'merchantId',
      'price',
      'price_sale',
      'minPrice',
      'maxPrice',
      'minPriceSale',
      'maxPriceSale',
      'percentOff',
      'groupCount'
    ]) === false) return Promise.reject(VALUE_NOT_IN_ENUM)
    else sortBy = sortByValidator(sortBy, [
      'relevance',
      'keyword',
      'brand',
      'merchant',
      'merchantId',
      'merchantId',
      'price',
      'price_sale',
      'minPrice',
      'maxPrice',
      'minPriceSale',
      'maxPriceSale',
      'percentOff',
      'groupCount'
    ])
    if (!valueInEnum(sortBy, [
      'relevance',
      'keyword',
      'brand',
      'merchant',
      'merchantId',
      'merchantId',
      'price',
      'price_sale',
      'minPrice',
      'maxPrice',
      'minPriceSale',
      'maxPriceSale',
      'percentOff',
      'groupCount'
    ])) return Promise.reject(VALUE_NOT_IN_ENUM)
    if (!valueInEnum(groupBy, [
      'brand',
      'category',
      'brand',
      'merchant',
      'merchantId',
      'productId'
    ])) return Promise.reject(VALUE_NOT_IN_ENUM)
    if (!valueInEnum(imageSize, [
      '75x75',
      '125x125',
      '250x250',
      '500x500'
    ])) return Promise.reject(VALUE_NOT_IN_ENUM)
    return axios.get(removeSpacesAndUnusedQueryParams`http://api.prosperent.com/api/search?api_key=${
      this.apiKey
    }&location=${
      this.location
    }&clickMaskDomain=${
      ifTrue(this.clickMaskDomain)
    }&query=${
      ifTrue(query)
    }&imageMaskDomain=${
      ifTrue(this.imageMaskDomain)
    }&filterBrand=${
      ifTrue(convertArrayToString(filterBrand))
    }&filterPrice=${
      ifTrue(floatOrRange(filterPrice))
    }&filterPriceSale=${
      ifTrue(floatOrRange(filterPriceSale))
    }&filterPercentOff=${
      ifTrue(floatOrRange(filterPercentOff))
    }&sortBy=${
      ifTrue(sortBy)
    }&groupBy=${
      ifTrue(groupBy)
    }&imageSize=${
      ifTrue(imageSize)
    }&visitor_ip=${
      ifTrue(visitorIp)
    }&referrer=${
      ifTrue(referrer)
    }&userAgent=${
      ifTrue(userAgent)
    }&relevancyThreshold=${
      ifTrue(relevancyThreshold)
    }&filterCatalogId=${
      ifTrue(convertArrayToString(filterCatalogId))
    }&filterCategory=${
      ifTrue(convertArrayToString(filterCategory))
    }&filterKeyword=${
      ifTrue(convertArrayToString(filterKeyword))
    }&filterKeywords=${
      ifTrue(convertArrayToString(filterKeywords))
    }&filterPremier=${
      ifTrue(filterPremier)
    }&filterMerchant=${
      ifTrue(convertArrayToString(filterMerchant))
    }&filterMerchantId=${
      ifTrue(convertArrayToString(filterMerchantId))
    }&filterProductId=${
      ifTrue(convertArrayToString(filterProductId))
    }&maxPrice=${
      ifTrue(toFixedNumber(maxPrice))
    }&minPrice=${
      ifTrue(toFixedNumber(minPrice))
    }&maxPriceSale=${
      ifTrue(toFixedNumber(maxPriceSale))
    }&minPriceSale=${
      ifTrue(toFixedNumber(minPriceSale))
    }&limit=${
      ifTrue(limit)
    }&page=${
      ifTrue(page)
    }&sid=${
      ifTrue(sid)
    }&imageSize=${
      ifTrue(imageSize)
    }&enableFacets=${
      ifTrue(convertArrayToString(enableFacets))
    }&enableQuerySuggestion=${
      ifTrue(enableQuerySuggestion)
    }&enableFullData=${
      ifTrue(enableFullData)
    }&debugMode=${
      ifTrue(debugMode)
    }&imageMaskDomain=${
      ifTrue(imageMaskDomain)
    }&clickMaskDomain=${
      ifTrue(clickMaskDomain)
    }&imageSize=${
      ifTrue(imageSize)
    }`, {
      // headers: {
      //   'Content-type': 'application/x-www-form-urlencoded'
      // },
      withCredentials: true
    })
  }
  linkAffiliator (options: { url: string, referrer: string, sid: string }): any {
    let { url, referrer, sid } = options
    if (!url) return Promise.reject(NO_URL_INCLUDED)
    url = encodeURIComponent(url)
    if (!this.location) return Promise.reject(NO_LOCATION)
    return axios.get(removeSpacesAndUnusedQueryParams`http://prosperent.com/api/linkaffiliator/url?apiKey=${
      this.apiKey
    }&url=${
      url
    }&location=${
      this.location
    }&referrer=${
      encodeURIComponent(referrer)
    }&sid=${
      sid
    }`, {
      withCredentials: true
    })
  }
  linkOptimizer (options: { url: string, referrer: string, sid: string }): any {
    let { url, referrer, sid } = options
    if (!url) return Promise.reject(NO_URL_INCLUDED)
    url = encodeURIComponent(url)
    if (!this.location) return Promise.reject(NO_LOCATION)
    return axios.get(removeSpacesAndUnusedQueryParams`http://prosperent.com/api/linkoptimizer/url?apiKey=${
      this.apiKey
    }&url=${
      url
    }&location=${
      this.location
    }&referrer=${
      encodeURIComponent(referrer)
    }&sid=${
      sid
    }`, {
      withCredentials: true
    })
  }
  phraseLinker (options: { phrase: string, referrer: string, sid: string }): any {
    let { phrase, referrer, sid } = options
    if (!phrase) return Promise.reject(NO_PHRASE_INCLUDED)
    phrase = encodeURIComponent(phrase)
    if (!this.location) return Promise.reject(NO_LOCATION)
    return axios.get(removeSpacesAndUnusedQueryParams`http://prosperent.com/api/linkoptimizer/url?apiKey=${
      this.apiKey
    }&phrase=${
      phrase
    }&location=${
      this.location
    }$&referrer=${
      encodeURIComponent(referrer)
    }&sid=${
      sid
    }`, {
      withCredentials: true
    })
  }
  merchant (options: {
    filterAverageCommission: Array<string>,
    filterAveragePaymentPercentage: Array<float>,
    filterCategory: Array<string>,
    filterConversionRate: Array<string>,
    filterDateActive: Array<string>,
    filterDeepLinking: boolean,
    filterDomain: string,
    filterEpc: number,
    filterMaxPaymentPercentage: number,
    filterMerchantId: number,
    filterMerchant: string,
    filterMerchantWeight: number,
    filterMinPaymentPercentage: number,
    filterNumCouponsUS: number,
    filterNumLocalDealsUS: number,
    filterNumProductsCA: number,
    filterNumProducts: number,
    filterNumProductsUK: number,
    filterNumTravelOffersUS: number,
    filterProductDatafeed: boolean,
    sortBy: Array<string>,
    groupBy: string,
    limit: number,
    page: number,
    imageSize: string,
    imageMaskDomain: string,
    imageType: string
  }): any {
    let {
      filterDateActive,
      filterAveragePaymentPercentage,
      filterEpc,
      filterMaxPaymentPercentage,
      filterMerchantWeight,
      filterMinPaymentPercentage,
      sortBy,
      groupBy,
      imageSize,
      imageType
    } = options
    if (filterAveragePaymentPercentage) filterAveragePaymentPercentage = floatOrRange(filterAveragePaymentPercentage)
    if (filterEpc) filterEpc = floatOrRange(filterEpc)
    if (filterMaxPaymentPercentage) filterMaxPaymentPercentage = floatOrRange(filterMaxPaymentPercentage)
    if (filterMerchantWeight) filterMerchantWeight = floatOrRange(filterMerchantWeight)
    if (filterMinPaymentPercentage) filterMinPaymentPercentage = floatOrRange(filterMinPaymentPercentage)
    if (filterDateActive) filterDateActive = dateOrRange(filterDateActive)
    if (sortByValidator(sortBy, [
      'averageCommission',
      'averagePaymentPercentage',
      'category',
      'conversionRate',
      'dateActive',
      'deepLinking',
      'domain',
      'epc',
      'groupCount',
      'maxPaymentPercentage',
      'merchant',
      'merchantId',
      'merchantWeight',
      'minPaymentPercentage',
      'numProducts',
      'numProductsCA',
      'numProductsUK',
      'numCouponsUS',
      'numTravelOffersUS',
      'numTravelOffersUS',
      'productDatafeed'
    ]) === false) return Promise.reject(VALUE_NOT_IN_ENUM)
    else sortBy = sortByValidator(sortBy, [
      'averageCommission',
      'averagePaymentPercentage',
      'category',
      'conversionRate',
      'dateActive',
      'deepLinking',
      'domain',
      'epc',
      'groupCount',
      'maxPaymentPercentage',
      'merchant',
      'merchantId',
      'merchantWeight',
      'minPaymentPercentage',
      'numProducts',
      'numProductsCA',
      'numProductsUK',
      'numCouponsUS',
      'numTravelOffersUS',
      'numTravelOffersUS',
      'productDatafeed'
    ])
    if (!valueInEnum(groupBy, [
      'category',
      'deepLinking',
      'productDatafeed'
    ])) return Promise.reject(VALUE_NOT_IN_ENUM)
    if (!valueInEnum(imageSize, [
      '60x30',
      '120x60'
    ])) return Promise.reject(VALUE_NOT_IN_ENUM)
    if (!valueInEnum(imageType, [
      'original',
      'black',
      'white'
    ])) return Promise.reject(VALUE_NOT_IN_ENUM)
    return axios.get(removeSpacesAndUnusedQueryParams`http://api.prosperent.com/api/merchant?apiKey=${
      this.apiKey
    }`, {
      withCredentials: true
    })
  }
  brand (options: {
    limit: ?number,
    page: ?number,
    imageSize: ?string,
    imageMaskDomain: ?string,
    filterBrand: ?(string | Array<string>)
  }): any {
    const {
      limit,
      page,
      imageMaskDomain,
      filterBrand,
      imageSize
    } = options
    return axios.get(removeSpacesAndUnusedQueryParams`http://api.prosperent.com/api/brand?apiKey=${
      this.apiKey
    }&limit=${
      Math.floor(limit)
    }&page=${
      Math.floor(page)
    }&imageMaskDomain=${
      encodeURIComponent(imageMaskDomain)
    }&filterBrand=${
      encodeURIComponent(filterBrand)
    }&imageSize=${
      imageSize
    }`, {
      withCredentials: true
    })
  }
  trends (options: {
    filterCommissionDate: string, // DATE format YYYYMMDD
    enableFacets: boolean,
    query: string,
    relevancyThreshold: number,
    filterBrand: string | string[],
    filterBrowser: string | string[],
    filterBrowserType: string | string[],
    filterBrowserVersion: string | string[],
    filterCatalog: string | string[],
    filterCatalogId: string | string[],
    filterCategory: string | string[],
    filterCity: string | string[],
    filterClickDate: string | string[], // DATE format YYYYMMDD
    filterCountry: string | string[],
    filterDeviceBrand: string | string[],
    filterDeviceModel: string | string[],
    filterInterface: string | string[],
    filterKeyword: string | string[],
    filterMerchantId: number | number[],
    filterMerchant: string | string[],
    filterOperatingSystem: number | number[],
    filterOperatingSystemVersion: number | number[],
    filterOrganic: boolean,
    filterProductId: string | string[],
    filterRegion: string | string[],
    filterRequestUri: string | string[],
    filterScreenResolution: string,
    limit: number,
    page: number
  }): any {
    const {
      relevancyThreshold,
      query
    } = options
    return axios.get(removeSpacesAndUnusedQueryParams`
    http://api.prosperent.com/api/trends?
    `)
  }
}

module.exports = Prosperent
export default Prosperent