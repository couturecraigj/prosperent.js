import promise from 'core-js/es6/promise'
const Promise = Promise || promise
import axios from 'axios'

const API_KEY_ERROR = new Error('`apiKey` needs to be defined')
const VALUE_NOT_IN_ENUM = new Error('an Enum field you entered a value for does not seem to match any enums')
const ACCESS_KEY_ERROR = new Error('`accessKey` needs to be defined')
const RELEVANCY_THRESHOLD_ERROR = new Error('`relevancyThreshold` needs to be between 0 and 1')
const SCRIPT_INJECTION_ATTEMPT = new Error('There was an attempt to inject script into the query')
const NOTHING_IN_QUERY = new Error('Your Query should include something')
const NO_LOCATION = new Error('You need to include a `location` with your request')

function valueInEnum (value, possibleOptions) {
  if (!value) return true
  if (possibleOptions.includes(value)) return true
  return false
}

function convertArrayToString (arr) {
  if (Array.isArray(arr) && arr.length !== 0) return arr.join('|')
  if (typeof arr === 'boolean') return arr
  return ''
}

function ifTrue (val, result) {
  return val && typeof val !== 'boolean' ? result : ''
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isInteger (candidate) {
  if (!isNumeric(candidate)) return false
  return Number.isSafeInteger(candidate)
}

function falsyReturnEmptyString (candidate) {
  return candidate ? candidate : ''
}

function toFixedNumber (candidate) {
  if (!candidate || isNaN(candidate)) return candidate
  return (+candidate).toFixed('2')
}

function floatOrRange (arr) {
  if (Array.isArray(arr)) {
    if (arr.length === 2) return '' + toFixedNumber(falsyReturnEmptyString(arr[0])) + ',' + toFixedNumber(falsyReturnEmptyString(arr[1]))
    if (arr.length === 1) return '' + toFixedNumber(falsyReturnEmptyString(arr[0]))
  }
  return ''
}

class Prosperent {
  constructor (apiKey, accessKey, { clickMaskDomain, imageMaskDomain, location }: { location: string } = { location: 'http://localhost' }) {
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
    filterBrand: string, // pipe seperated values
    filterCatalogId: string, // pipe seperated values
    filterCategory: string, // pipe seperated values
    filterKeyword: string, // pipe seperated values
    filterKeywords: string, // pipe seperated values
    filterMerchant: string, // pipe seperated values
    filterMerchantId: string, // pipe seperated values
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
    enableFacets: boolean | string, // boolean or pipe seperated facet values
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
  }) {
    if (!options) return Promise.reject(NOTHING_IN_QUERY)
    if (Object.keys(options).map(v => options[v].include && options[v].includes('&')).includes(true)) return Promise.reject(SCRIPT_INJECTION_ATTEMPT)
    if (Object.keys(options).map(v => !(v)).every((el) => el === true)) return Promise.reject(NOTHING_IN_QUERY)

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
    // if (query) query = encodeURIComponent(query)
    if (relevancyThreshold > 1 || relevancyThreshold < 0) return Promise.reject(RELEVANCY_THRESHOLD_ERROR)
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
    return axios.get(`http://api.prosperent.com/api/search?api_key=${this.apiKey
    }&location=${this.location
    }${ifTrue(this.clickMaskDomain,`&clickMaskDomain=${this.clickMaskDomain}`)
    }${ifTrue(query,`&query=${query}`)
    }${ifTrue(this.imageMaskDomain,`&imageMaskDomain=${this.imageMaskDomain}`)
    }${ifTrue(filterBrand,`&filterBrand=${convertArrayToString(filterBrand)}`)
    }${ifTrue(filterPrice, `&filterPrice=${floatOrRange(filterPrice)}`)
    }${ifTrue(filterPriceSale, `&filterPriceSale=${floatOrRange(filterPriceSale)}`)
    }${ifTrue(filterPercentOff, `&filterPercentOff=${floatOrRange(filterPercentOff)}`)
    }${ifTrue(sortBy, `&sortBy=${sortBy}`)
    }${ifTrue(groupBy, `&groupBy=${groupBy}`)
    }${ifTrue(imageSize, `&imageSize=${imageSize}`)
    }${ifTrue(visitorIp, `&visitor_ip=${visitorIp}`)
    }${ifTrue(referrer, `&referrer=${referrer}`)
    }${ifTrue(userAgent, `&userAgent=${userAgent}`)
    }${ifTrue(relevancyThreshold, `&relevancyThreshold=${relevancyThreshold}`)
    }${ifTrue(filterCatalogId,`&filterCatalogId=${convertArrayToString(filterCatalogId)}`)
    }${ifTrue(filterCategory,`&filterCategory=${convertArrayToString(filterCategory)}`)
    }${ifTrue(filterKeyword,`&filterKeyword=${convertArrayToString(filterKeyword)}`)
    }${ifTrue(filterKeywords,`&filterKeywords=${convertArrayToString(filterKeywords)}`)
    }${ifTrue(filterPremier,`&filterPremier=${(filterPremier)}`)
    }${ifTrue(filterMerchant,`&filterMerchant=${convertArrayToString(filterMerchant)}`)
    }${ifTrue(filterMerchantId,`&filterMerchantId=${convertArrayToString(filterMerchantId)}`)
    }${ifTrue(filterProductId,`&filterProductId=${convertArrayToString(filterProductId)}`)
    }${ifTrue(maxPrice,`&maxPrice=${toFixedNumber(maxPrice)}`)
    }${ifTrue(minPrice,`&minPrice=${toFixedNumber(minPrice)}`)
    }${ifTrue(maxPriceSale,`&maxPriceSale=${toFixedNumber(maxPriceSale)}`)
    }${ifTrue(minPriceSale,`&minPriceSale=${toFixedNumber(minPriceSale)}`)
    }${ifTrue(limit,`&limit=${limit}`)
    }${ifTrue(page,`&page=${page}`)
    }${ifTrue(sid, `&sid=${sid}`)
    }${ifTrue(imageSize, `&imageSize=${imageSize}`)
    }${ifTrue(enableFacets, `&enableFacets=${convertArrayToString(enableFacets)}`)
    }${ifTrue(enableQuerySuggestion, `&enableQuerySuggestion=${enableQuerySuggestion}`)
    }${ifTrue(enableFullData, `&enableFullData=${enableFullData}`)
    }${ifTrue(debugMode, `&debugMode=${debugMode}`)
    }${ifTrue(imageSize, `&imageSize=${imageSize}`)
    }`, {
      // headers: {
      //   'Content-type': 'application/x-www-form-urlencoded'
      // },
      withCredentials: true
    })
  }
}

// http://api.prosperent.com/api/search?api_key=a1d234fc7be34ba2bb239f76788dcb3a&query=shoes&filterMerchant=6pm.com

export default Prosperent