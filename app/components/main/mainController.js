angular.module('main')
    .controller('mainController', ['$scope', function MainController($scope) {

         var audio = document.getElementById('prismatic-audio');

        $scope.title = 'Prismatic Player';
        $scope.youtubeDownloadLink = 'music/hiphop.mp3';

        $scope.playMusic = function() {
            audio.load();
            audio.play();
        };

        $scope.pauseMusic = function() {
            audio.pause();
        };
    }]);