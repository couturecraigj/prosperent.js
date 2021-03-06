# prosperent.js
Prosperent is an affiliate network to make money from visitors

I created this module because they do not have anything out there to handle node.js as most of their stuff is PHP.

## Install

### **TODO**

```shell
npm i -S prosperent
```

## Purpose
It is always nice to try and monetize what you have done and people love personalized suggestions.  This is a module to assist with connecting up to _Prosperent_ to get their data back and presenting it to your end users.

## Dependencies
this is only dependent on `axios` and because of that promises.  I have used a `core-js` polyfill to make sure that Promises are created in environments that are missing them.  Because of the lack of dependencies this should work both in the browser and on `Node.js` though it is not attached to window so you will have to import it and attach it to a global object if you want it available in all contexts.

## API

### Simple Usage

```javascript

import Prosperent from 'prosperent'
const prosper = new Prosperent('<APIKEY>', '<ACCESSKEY>')
prosper.usProducts({ query: 'Shoes' })
.then(({ data }) => console.log(data))

```

### Constructor

`new Prosperent(apiKey, accessKey, options)`

`options`
* **clickMaskDomain**
  * _HIDE THE PROSPERENT URLS FOR ANCHORS_ mask the Urls that People click to make them appear that they come from your server
* **imageMaskDomain**
  * _HIDE THE PROSPERENT URLS FOR IMAGES_ mask the Images so that everything appears to be local
* **location**
  * _URL OF YOUR SITE_ this is required in some instances and it is nice to do it at the constructor to prevent the need of doing it on each call

### Methods

`usProducts(options)`

`options`
* **query**: string
* **visitorIp**: string,
* **referrer**: string,
* **userAgent**: string,
* **relevancyThreshold**: number, // float
* **filterBrand**: string, // pipe separated values
* **filterCatalogId**: string, // pipe separated values
* **filterCategory**: string, // pipe separated values
* **filterKeyword**: string, // pipe separated values
* **filterKeywords**: string, // pipe separated values
* **filterMerchant**: string, // pipe separated values
* **filterMerchantId**: string, // pipe separated values
* **filterPercentOff**: number, // float or range
* **filterPremier**: boolean,
* **filterPrice**: number,  // float or range
* **filterPriceSale**: number,  // float or range
* **filterProductId**: string,  // float or range
* **sortBy**: string, // enum
* **groupBy**: string, // enum
* **maxPrice**: number, // float
* **minPrice**: number, // float
* **maxPriceSale**: number, // float
* **minPriceSale**: number, // float
* **limit**: number, // integer
* **page**: number, // integer
* **imageSize**: string, // enum
* **sid**: string,
* **enableFacets**: boolean | string, // boolean or pipe separated facet values
* **enableQuerySuggestion**: boolean,
* **enableFullData**: boolean,
* **imageMaskDomain**: string,
* **clickMaskDomain**: string,
* **debugMode**: boolean


So the idea behind this is to have a promise interface that will fail fast if you try to do something that is outside of what they suggest.  Example being sortBy on `US Products` is supposed to be one of a list of enumerable values.  I want to make it so you do not ever need to question why something is failing so I an rejecting requests that do not fit their expectations before hitting that endpoint.

