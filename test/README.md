TESTING
=======
Note that the JS client has special requirements because it can run on both the backend (Node.js) and the frontend (browser). When run on the backend,  authentication is done the same way as it's done for the other clients, but when running on the frontend, authentication is handled differently from any other client.

## Backend Testing
Note that it's not possible to test webservice.wikipathways.org from the staging server. The obvious reason is that there is only one *webservice* subdomain, meaning it's always the production version. There also have been issues with CORS, because calling webservice.wikipathways.org from www.wikipathways.org means origins are not the same.

Run the update pathway test with this command:

```bash
node ./manual-tests/update-pathway.js
```

## Frontend Testing
To update the files on the staging server, `cd` to the top-level `wikipathways-api-client-js` directory and run this (of course, update `your_username` with the appropriate value):

```bash
rsync -rIl ./ your_username@pvjs.wikipathways.org:/var/www/wikipathways/wpi/pvjs.wikipathways.org/wikipathways-api-client-js
```

Then visit this page and give it a try:

http://pvjs.wikipathways.org/wpi/webservicetest/wikipathways-api-client-js/test/browser-tests/update-pathway.php

Updating the production server is the same, except for a few URI/path changes.

```bash
rsync -rIl ./ your_username@wikipathways.org:/var/www/wikipathways/wpi/webservicetest/wikipathways-api-client-js
```

http://www.wikipathways.org/wpi/webservicetest/wikipathways-api-client-js/test/browser-tests/update-pathway.php

If you update any files on one of the servers, you can get those updates on your local machine by running the following commands (*WARNING: this will overwrite any existing changes to these files on your local machine!*):

First, `cd` to the top-level `wikipathways-api-client-js` directory on your local machine. Then from your local machine run either this:

```bash
rsync -rIl your_username@wikipathways.org:/var/www/wikipathways/wpi/webservicetest/wikipathways-api-client-js/lib/*.js ./lib/
rsync your_username@wikipathways.org:/var/www/wikipathways/wpi/webservicetest/wikipathways-api-client-js/test/browser-tests/update-pathway.php ./test/browser-tests/update-pathway.php
```

or this:

```bash
rsync -rIl your_username@pvjs.wikipathways.org:/var/www/pvjs.wikipathways.org/wpi/webservicetest/wikipathways-api-client-js/lib/*.js ./lib/
rsync your_username@pvjs.wikipathways.org:/var/www/pvjs.wikipathways.org/wpi/webservicetest/wikipathways-api-client-js/test/browser-tests/update-pathway.php ./test/browser-tests/update-pathway.php
```
