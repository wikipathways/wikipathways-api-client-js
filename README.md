wikipathways-api-client-js
==============

JS client for WikiPathways.org web services API. Not all API endpoints are handled yet, so pull requests are welcome!

## For Developers

To start developing

* Install [Node.js](https://nodejs.org/)

* Install gulp globally
```bash
npm install -g gulp
```
* Clone (download) this repo
```bash
git clone git@github.com:wikipathways/wikipathways-api-client-js.git
cd wikipathways-api-client-js
```
* Install the dependencies
```bash
npm install
```

To build a stand-alone, browser-ready bundle for dev testing, install browserify:
```
npm install -g browserify
```

Then run:

```
browserify ./index.js -o ./dist/wikipathways-api-client.dev.js
```

The output will be located at `./dist/wikipathways-api-client.dev.js`

Then you can include that script and the pre-existing polyfills script in your HTML or PHP (update path as required to match where you store the scripts on your server):

```html
<script src="./dist/wikipathways-api-client-polyfills-1.0.5.bundle.min.js"></script>
<script src="./dist/wikipathways-api-client.dev.js"></script>
```

See `./test/browser-tests/update-pathway.php` for an example.

<!--
TODO The instructions below don't currently work. Get them working again.
* ~~Start the dev environment, which will compile your code on the fly and open and refresh the test home page:~~
```bash
gulp
```

~~The production-ready, minified code for the browser will be located at [./dist/wikipathways-api-client-1.0.10.bundle.min.js](https://github.com/wikipathways/wikipathways-api-client-js/blob/master/dist/wikipathways-api-client-1.0.10.bundle.min.js). The dev bundle will be an unminified version of the latest code.~~
-->
