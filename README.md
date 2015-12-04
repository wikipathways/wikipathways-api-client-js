wikipathways-api-client-js
==============

JS client for WikiPathways.org web services API. Not all API endpoints are handled yet, so pull requests are welcome!

# For Developers

## To start developing

1. Install [Node.js](https://nodejs.org/)

2. Install gulp globally

```bash
npm install -g gulp
```

3. Clone (download) this repo

```bash
git clone git@github.com:wikipathways/wikipathways-api-client-js.git
cd wikipathways-api-client-js
```

4. Install the dependencies

```bash
npm install
```

5. ~~Start the dev environment, which will compile your code on the fly and open and refresh the test home page:~~Not currently working

```bash
gulp
```

The production-ready, minified code for the browser will be located at [./dist/wikipathways-api-client-1.0.8.bundle.min.js](https://github.com/wikipathways/wikipathways-api-client-js/blob/master/dist/wikipathways-api-client-1.0.8.bundle.min.js). The dev bundle will be an unminified version of the latest code.
