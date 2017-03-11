var padLeft = require('pad-left');

angular.module('main')
    .controller('mainController', ['$scope', function MainController($scope) {

        var audio = document.getElementById('prismatic-audio');

        $scope.title = 'Prismatic Player';
        $scope.youtubeDownloadLink = 'music/anime.mp3';
        $scope.songName = "...";
        $scope.currentTimer = "00:00";
        $scope.muted = false;
        $scope._time = 0;
        $scope.timeInSeconds = 0;
        $scope.durationInSeconds = 0;

        var visuals = new Visualizer();
        visuals.ini();

        $scope.playMusic = function() {
            audio.load();
            audio.play();
            $scope.songName = $scope.youtubeDownloadLink;


            visuals._visualize();
        };

        $scope.updatePlayTimer = function(currentTime, duration) {
            if (!duration) {
                return;
            }
            var timeSeconds = Math.floor(currentTime % 60);
            var timeMinutes = Math.floor(currentTime / 60);

            var durationSeconds = Math.floor(duration % 60);
            var durationMinutes = Math.floor(duration / 60);

            var timeLabel = timeMinutes + ":" + padLeft(timeSeconds, 2, '0');
            var durationLabel = durationMinutes + ":" + durationSeconds;

            $scope.currentTimer = timeLabel + " / " + durationLabel;
            $scope.timeInSeconds = currentTime;
            $scope.durationInSeconds = duration;
        };

        $scope.updateTimeTracker = function(currentTime, duration) {
            if (!duration) {
                return;
            }
            $scope._time = currentTime;
        };

        $scope.seek = function() {
            audio.currentTime = $scope._time;
            $scope.updateTimeTracker(Math.floor(audio.currentTime), Math.floor(audio.duration));
            $scope.seeking = false;
        };

        $scope.startSeek = function() {
            $scope.seeking = true;
        }

        audio.addEventListener("timeupdate", function() {
            if (!$scope.seeking) {
                $scope.updatePlayTimer(Math.floor(audio.currentTime), Math.floor(audio.duration));
                $scope.updateTimeTracker(Math.floor(audio.currentTime), Math.floor(audio.duration));
            }
            $scope.$apply();
        });

        $scope.getCurrentAudioTime = function() {
            return audio.currentTime;
        }

        $scope.mute = function() {
            $scope.muted = !$scope.muted;
        }

        $scope.playStatus = function() {
            return "";
        }

        $scope.mutedStatus = function() {
            return $scope.muted ? 'fa-volume-off' : 'fa-volume-up';
        }

        $scope.volume = 80;

        $scope.$watch('muted', function(newValue, oldValue) {
            if (newValue) {
                audio.volume = 0;
            } else {
                audio.volume = $scope.volume / 100;
            }

        });

        $scope.$watch('volume', function(newValue, oldValue) {
            audio.volume = newValue / 100.00;
        });


        $scope.pauseMusic = function() {
            audio.pause();
        };
    }]);