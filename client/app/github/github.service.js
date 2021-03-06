'use strict';

// This factory interacts with the Github API
angular.module('appceptionApp')
  .factory('github', function ($http, Auth) {

    // Get all repos for the logged in user.
    var getRepos = function(githubLogin) {
      return $http({
        method: 'GET',
        url: '/api/projects',
        params: {githubLogin: githubLogin}
      });
    };

    //Get list and content of repo files for the logged in user.
    var getRepoFiles = function(githubLogin, repoName, githubBranch) {
      return $http({
        method: 'GET',
        url: '/api/projects/files',
        params: {
          githubLogin: githubLogin,
          repoName: repoName,
          githubBranch: githubBranch
        }
      });
    };

    var getRepoFilesClient = function(githubLogin, repoName, githubBranch) {
      return $http({
        method: 'GET',
        url: 'https://github.org/' + githubLogin + '/' + repoName + '/zipball/' + githubBranch,
      });
    };

    var createRepo = function(githubLogin, repoName, generator, deployment) {
      console.log('inside service createRepo');
      return $http({
        method: 'GET',
        url: '/api/projects/new',
        params: {
          githubLogin: githubLogin,
          repoName: repoName,
          generator: generator,
          deployment: deployment
        }
      })
    };

    var createCommit = function(githubLogin, repoName, branches, message, filesArray) {
      console.log('inside createCommit')
      return $http({
        method: 'POST',
        url: '/api/projects/commit',
        data: {
          githubLogin: githubLogin,
          repoName: repoName,
          message: message,
          filesArray: JSON.stringify(filesArray),
          branches: branches
        }
      })
    }

    var insertRepoIntoLocalDB = function(repo, items){
      var filer = new Filer.FileSystem({
        name: 'files',
        provider: new Filer.FileSystem.providers.Fallback('makedrive')
      });

      // iterate through the items from the repo.
      for(var i =0; i < items.length; i++){
        var item = items[i];

        var filePath = '/'+repo + '/' + item[0].path.replace(/^.*?\//, '');

        // if item has no content, create a directory
        if(! item[0].hasOwnProperty('content')) {
          filer.mkdir( filePath , function(err){
            if(err) throw err;
          })
        // if item has content, create a file
        }  else {
          filer.writeFile(filePath , item[0].content, function(error) {
            if(error) throw error;
          });
        }
      }
    }

    var exportLocalDB = function(repo) {
      var filer = new Filer.FileSystem({
        name: 'files',
        provider: new Filer.FileSystem.providers.Fallback('makedrive')
      });
    }

    var getBranches = function(githubLogin, repoName) {
      return $http({
        method: 'GET',
        url: '/api/projects/branches',
        params: {
          githubLogin: githubLogin,
          repoName: repoName
        }
      })
    };

    var createBranch = function(githubLogin, repoName, baseBranchName, newBranchName) {
      return $http({
        method: 'GET',
        url: '/api/projects/createbranch',
        params: {
          githubLogin: githubLogin,
          repoName: repoName,
          baseBranchName: baseBranchName,
          newBranchName: newBranchName
        }
      })
    };

    var currentRepoInformation = {
      repoName: '',
      branch: ''
    }

    // TEMPORARY - MOVE THIS TO A BETTER SPOT PLZ KELLY
    var getTemplates = function() {
      return $http({
        method: 'GET',
        url: '/api/projects/templates'
      })
    }

    return {
      getRepos: getRepos,
      getRepoFiles: getRepoFiles,
      createRepo: createRepo,
      createCommit: createCommit,
      createBranch: createBranch,
      getBranches: getBranches,
      getTemplates: getTemplates,
      currentRepoInformation: currentRepoInformation
    };
  });
