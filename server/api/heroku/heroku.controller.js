'use strict';

var _ = require('lodash');
var herokuToken = require('../../auth/heroku/passport');
var Heroku = require('heroku-client');

// Get list of all heroku apps
exports.index = function(req, res) {
  console.log('list all app api', herokuToken.herokuToken );

  var heroku = new Heroku({ token: herokuToken.herokuToken  });

  heroku.apps().list(function (err, apps) {
     return res.json(apps)
  });
};

// Creates a new heroku app
exports.create = function(req, res) {
  console.log('create app api');

  var heroku = new Heroku({ token: herokuToken.herokuToken  });
  var githubLogin = req.query.githubLogin;
  var githubRepo = req.query.repoName;
  var appName = githubLogin + '-' + githubRepo;
  var attributes = {"source_blob":{"url":"https://github.com/" + githubLogin + "/" + githubRepo + "/archive/heroku.tar.gz"},
                    "app": {"name": appName } };

  var callback = function(){
    console.log(arguments)
    if(arguments['1']) {
      var buildId = arguments['1']['id']
      console.log(buildId)
      res.send('new app created')
      heroku.appSetups(buildId).info(function() {
        console.log('creation info',arguments)
      });
      heroku.apps(appName).configVars().update({'NODE_ENV': 'production'}, function() {
        console.log('config vars', arguments)
      })
    }
    return console.log('new app created'); // making this a return so the server can capture it and we can test it.
  }

  // console.log('create new attributes', attributes);

  heroku.appSetups().create(attributes, callback);
};

// Updates an existing heroku app
exports.update = function(req, res) {
  console.log('update app api');

  var heroku = new Heroku({ token: herokuToken.herokuToken  });
  var githubLogin = req.query.githubLogin;
  var githubRepo = req.query.repoName;
  var appName = githubLogin + '-' + githubRepo;
  var attributes = {"source_blob":{"url":"https://github.com/" + githubLogin + "/" + githubRepo + "/archive/heroku.tar.gz"},
                    "app": {"name": appName } };



  var callback = function(){
    res.send('app updated');
    console.log('update callback', arguments)
    var buildId = arguments['1']['id']
    heroku.apps(appName).builds(buildId).info(function() {
      console.log('builds',arguments)
    });
    return console.log('app updated'); // making this a return so the server can capture it and we can test it.
  };
   console.log('update app attributes', attributes);

  heroku.apps(appName).builds().create(attributes, callback);

};


function handleError(res, err) {
  return res.send(500, err);
}