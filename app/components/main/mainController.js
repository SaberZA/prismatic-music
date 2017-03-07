angular.module('main')
    .controller('mainController', ['$scope', function MainController($scope) {
        // Tail = require('tail').Tail;

        // tail = new Tail("./app.log");

        // tail.on("line", function(data) {
        //     console.log(data);
        // });

        // tail.on("error", function(error) {
        //     console.log('ERROR: ', error);
        // });

        var audio = document.getElementById('prismatic-audio');

        $scope.title = 'Prismatic Player';
        $scope.youtubeDownloadLink = 'music/hiphop.mp3';

        $scope.playMusic = function() {
            audio.load();
            audio.play();

            var visuals = new Visualizer();
            visuals.ini();
            visuals._visualize();
        };

        $scope.pauseMusic = function() {
            audio.pause();
        };
    }]);