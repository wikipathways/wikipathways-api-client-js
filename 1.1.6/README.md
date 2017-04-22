wikipathways-api-client-js
==============

JS client for WikiPathways.org web services API. Note that not all API endpoints are handled yet. Pull requests welcome!

## How To Use

### JS Library ([demo](http://wikipathways.github.io/wikipathways-api-client-js/1.1.6/), [docs](https://wikipathways.github.io/wikipathways-api-client-js/1.1.6/docs))
Install via NPM
```bash
npm install --save wikipathways-api-client
```

Or include `script` tags in your HTML
```html
<script src="//wikipathways.github.io/wikipathways-api-client-js/1.1.6/dist/bundle.min.js"></script>
```

### Command Line (CLI)
* Install [Node.js](https://nodejs.org/)
* Install client and view help
```bash
npm install -g wikipathways-api-client
wikipathways-api-client --help
```

## Contribute to Development

* Install [Node.js](https://nodejs.org/)
* Clone this repo
```bash
git clone https://github.com/wikipathways/wikipathways-api-client-js.git
cd wikipathways-api-client-js
```
* Install dependencies
```bash
npm install
```
* Start dev mode (rebuilds on save)
```bash
npm run dev
```
* Refactor files in `src` directory and try out result `dist/bundle.js`
