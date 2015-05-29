var fs = require('fs');
var onlyScripts = require('./util/script-filter');
var localTasks = fs.readdirSync('./gulp/tasks/').filter(onlyScripts);

localTasks.forEach(function(task) {
  console.log('task in wp');
  console.log(task);
  require('./tasks/' + task);
});
