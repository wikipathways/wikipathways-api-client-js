TESTING
=======

Run the update pathway test with this command:

```bash
node ./manual-tests/update-pathway.js
```

To update the files on the staging server, `cd` to the top-level `wikipathways-api-client-js` directory and run:

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

If you update any files on one of the servers, you can get those updates on your local machine by running the following steps (*WARNING: this will overwrite any existing changes to these files on your local machine!*):

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
