wikipathways-api-client-js
==============

JS client for WikiPathways.org web services API. Not all API endpoints are handled yet, so pull requests are welcome!

# For Developers

To start developing, first install [Node.js](https://nodejs.org/). Then install gulp globally:

```bash
npm install -g gulp
```

Then in this directory, install the dependencies:

```bash
npm install
```

You can then start the dev environment, which will compile your code on the fly and open and refresh the test home page:

```bash
gulp
```

The production-ready, minified code for the browser will be located at [./dist/wikipathways-api-client-1.0.1.bundle.min.js](https://github.com/wikipathways/wikipathways-api-client-js/blob/master/dist/wikipathways-api-client-1.0.1.bundle.min.js). The dev bundle will be an unminified version of the latest code.
