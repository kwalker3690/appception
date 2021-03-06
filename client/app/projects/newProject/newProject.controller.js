'use strict';

angular.module('appceptionApp')
  .controller('NewProjectCtrl', function ($scope, $state, github, Auth, indexedDB, $window, $location, repoTemplates) {
    $scope.repoName = '';
    $scope.creating = false;

    $scope.generator = 'beginner';
    $scope.allTemplates;
    $scope.renderedTemplate;
    $scope.templateNames = [];

    $scope.deploymentProvider='';

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };


    $scope.createRepo = function(repoName, generator, deployment) {
      console.log('generator', generator)
      console.log('deployment', deployment)

      indexedDB.emptyLocalDB().then(function(res) {console.log('res', res)});

      $scope.creating = true;
      Auth.isLoggedInAsync(function(boolean) {
        if(boolean === true){
          var user = Auth.getCurrentUser()
          // create a new repo in Github
          github.createRepo(user.github.login, repoName, generator, deployment).then(function(res) {

            // empties the user's browser's local database
            indexedDB.emptyLocalDB()
              .then(function(){
                // inserts file templates in browser's local database
                indexedDB.insertRepoIntoLocalDB(repoName, res.data);
                // redirect to files page
                $state.go('files');
              }
            );
          })
        }else {
          $scope.files = 'Sorry, there has been an error while creating your repo.';
        }
      })
    };

    $scope.renderTemplate = function(repo) {
      $scope.allTemplates.forEach(function(value) {
        if(repo === value.name) {
          console.log(value)
          $scope.renderedTemplate = [value]
        }
      })
    }

    repoTemplates.getTemplates()
      .then(function(res) {
        console.log(res.data)
        $scope.allTemplates = res.data;
        $scope.allTemplates.forEach(function(value) {
          $scope.templateNames.push(value.name)
        })
        $scope.renderTemplate('beginner')
      });
  });
