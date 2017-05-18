import Prosperent from '.'
import axios from 'axios'
import httpAdapter from 'axios/lib/adapters/http'
import nock from 'nock'

const host = 'http://api.prosperent.com/api'
const location = 'http://localhost'

axios.defaults.adapter = httpAdapter
axios.defaults.host = host


test('constructor should throw errors when no API Key or Access Key is given', () => {
  try {
    const p = new Prosperent()
  } catch (e) {
    expect(e instanceof Error).toBe(true)
  }
})

test('`usProducts should reject an empty query`', () => {
  try {
    const p = new Prosperent('123', '123')
    p.usProducts().catch(err => {
      expect(err instanceof Error).toBe(true)
    })
  } catch (e) {
    expect(e).toBe(null)
  }
})

test('`usProducts` should reject an empty object', () => {
  try {
    const p = new Prosperent('123', '123')
    p.usProducts({}).catch(err => {
      expect(err instanceof Error).toBe(true)
    })
  } catch (e) {
    console.log(e)
    expect(e).toBe(null)
  }
})

test('`usProducts` should reject any injected `&`', () => {
  try {
    const p = new Prosperent('123', '123')
    p.usProducts({ query: '&' }).catch(err => {
      expect(err instanceof Error).toBe(true)
    })
  } catch (e) {
    console.log(e)
    expect(e).toBe(null)
  }
})

test('`usProducts` return something when at least query is filled', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    location,
    query: 'this'
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this'
  }).then(({ data }) => data))
  .resolves
  .toEqual({ this: 'is it' })
})

test('`usProducts` converts Array to Pipe separated String', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    location,
    filterBrand: 'Canon|Apple'
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    filterBrand: ['Canon', 'Apple']
  })
  .then(({ data }) => data))
  .resolves
  .toEqual({ this: 'is it' })
})

test('`usProducts` allows you to provide a max on a filter (filterPrice)', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    location,
    filterPrice: ',15.00'
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    filterPrice: [undefined ,15.00]
  })
  .then(({ data }) => data))
  .resolves
  .toEqual({ this: 'is it' })
})

test('`usProducts` allows you to provide a min on a filter (filterPrice)', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    location,
    filterPrice: '15.00,'
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    location,
    filterPrice: [15.00, undefined]
  })
  .then(({ data }) => data))
  .resolves
  .toEqual({ this: 'is it' })
})

test('`usProducts` allows you to provide a min and a max on a filter (filterPrice)', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    location,
    filterPrice: '15.00,18.00'
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    filterPrice: [15.00, 18.00]
  })
  .then(({ data }) => data))
  .resolves
  .toEqual({ this: 'is it' })
})

test('`usProducts` filter to exact price (filterPrice)', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    location,
    filterPrice: '15.00'
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    filterPrice: [15.00]
  })
  .then(({ data }) => data))
  .resolves
  .toEqual({ this: 'is it' })
})

test('`usProducts` `relevancyThreshold` should fail when over 1', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    location,
    relevancyThreshold: 2
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    relevancyThreshold: 2
  }))
  .rejects
  .toEqual(new Error('`relevancyThreshold` needs to be between 0 and 1'))
})

test('`usProducts` `relevancyThreshold` should fail when under 0', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    location,
    relevancyThreshold: -1
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    relevancyThreshold: 2
  }))
  .rejects
  .toEqual(new Error('`relevancyThreshold` needs to be between 0 and 1'))
})

test('`usProducts` filter to exact price (enableFacets)', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    enableFacets: 'merchant|brand',
    location
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    enableFacets: ['merchant', 'brand']
  })
  .then(({ data }) => data))
  .resolves
  .toEqual({ this: 'is it' })
})

test('`usProducts` pipe all piping values', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    filterBrand: 'merchant|brand',
    filterCatalogId: 'merchant|brand',
    filterCategory: 'merchant|brand',
    filterKeyword: 'merchant|brand',
    filterKeywords: 'merchant|brand',
    filterMerchant: 'merchant|brand',
    filterMerchantId: 'merchant|brand',
    filterProductId: 'merchant|brand',
    location
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    filterBrand: ['merchant', 'brand'],
    filterCatalogId: ['merchant', 'brand'],
    filterCategory: ['merchant', 'brand'],
    filterKeyword: ['merchant', 'brand'],
    filterKeywords: ['merchant', 'brand'],
    filterMerchant: ['merchant', 'brand'],
    filterMerchantId: ['merchant', 'brand'],
    filterProductId: ['merchant', 'brand']
  })
  .then(({ data }) => data))
  .resolves
  .toEqual({ this: 'is it' })
})

test('`usProducts` prevent non enums with sortBy', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    filterBrand: 'merchant|brand',
    sortBy: 'poop',
    location
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    sortBy: 'poop'
  })
  .then(({ data }) => data))
  .rejects
  .toEqual(new Error('an Enum field you entered a value for does not seem to match any enums'))
})

test('`usProducts` allow enums with sortBy', async () => {
  nock(host)
  .get('/search')
  .query({ 
    api_key: 123,
    query: 'this',
    sortBy: 'relevance',
    location
   })
  .reply(200, {
    this: 'is it'
  })
  const p = new Prosperent('123', '123')
  await expect(p.usProducts({
    query: 'this',
    sortBy: 'relevance'
  })
  .then(({ data }) => data))
  .resolves
  .toEqual({ this: 'is it' })
})

