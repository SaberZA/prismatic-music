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
        $scope.youtubeDownloadLink = 'music/anime.mp3';

        $scope.playMusic = function() {
            audio.load();
            audio.play();

            var visuals = new Visualizer();
            visuals.ini();
            visuals._visualize();
        };

        $scope.updatePlayTimer = function(currentTime, duration) {
            var timeSeconds = Math.floor(currentTime % 60);
            var timeMinutes = Math.floor(currentTime / 60);

            var durationSeconds = Math.floor(duration % 60);
            var durationMinutes = Math.floor(duration / 60);

            var timeLabel = timeMinutes + ":" + timeSeconds;
            var durationLabel = durationMinutes + ":" + durationSeconds;

            $scope.currentTimer = timeLabel + " / " + durationLabel;
            $scope.$apply();
        };

        audio.addEventListener("timeupdate", function() {
            $scope.updatePlayTimer(Math.floor(audio.currentTime), Math.floor(audio.duration));
        });

        $scope.volume = 80;

        $scope.$watch('volume', function(newValue, oldValue) {
            audio.volume = newValue / 100.00;
        });


        $scope.pauseMusic = function() {
            audio.pause();
        };
    }]);