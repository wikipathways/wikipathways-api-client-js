<?php 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

chdir(dirname(realpath(__FILE__)) . "/../../../../");
// loads WikiPathways environment variables
require_once('wpi.php');

//var_dump($wgUser);

function getUsername(){
        global $wgUser;
        return $wgUser->mName;
}

function getToken(){
        global $wgUser;
        return $wgUser->mToken;
}

// TODO
function getNextPathwayVersion(){
        return 0;
}


//require_once('WSFault.php');
//require_once('search.php');
//require_once('extensions/otag/OntologyFunctions.php');
chdir($dir);
?>


<html>

  <head>
    <?php echo '<script type="text/javascript">'; ?>
      <?php echo 'window.wikipathwaysUsername = "' . getUsername() . '";'; ?>
      <?php echo 'window.wikipathwaysToken = "' . getToken() . '";'; ?>
      <?php echo 'window.nextPathwayVersion = "' . getNextPathwayVersion() . '";'; ?>
    <?php echo '</script>'; ?>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
    <script src="../../dist/wikipathways-api-client-polyfills-1.0.5.bundle.min.js"></script>
    <script src="../../dist/wikipathways-api-client.dev.js"></script>
  </head>

  <body>
    <h1>Update Pathway Test</h1>
    <p>Paste the GPML for pathway WP4 below and save. This will update it at the wikipathways.org server you are currently visiting.</p>
    <textarea id="gpml" rows="30" style="width: 500px; "></textarea>
    <br>
    <button id="update-btn" type="submit" href="#">Save</button>

    <script>
      var wikipathwaysApiClientInstance = new WikipathwaysApiClient();

      $('#update-btn').click(function() {
        var gpml = $('#gpml').val();
        wikipathwaysApiClientInstance.updatePathway({
          identifier: 'WP4',
          version: nextPathwayVersion,
          gpml: gpml,
          description: 'Testing update from wikipathways-api-client-js in browser',
          username: wikipathwaysUsername,
          auth: wikipathwaysToken
        })
        .then(function(response) {
          console.log('response');
          console.log(response);
        });
      });

    </script>
  </body>

</html>
