var padLeft = require('pad-left');
var fs = require('fs');

angular.module('main')
    .controller('mainController', ['$scope', '$timeout', function MainController($scope, $timeout) {

        var audio = document.getElementById('prismatic-audio');

        $scope.title = 'Prismatic Player';
        $scope.youtubeDownloadLink = 'music/anime.mp3';
        $scope.songName = "...";
        $scope.currentTimer = "00:00";
        $scope.muted = false;
        $scope._time = 0;
        $scope.timeInSeconds = 0;
        $scope.durationInSeconds = 0;
        $scope.isPlaying = false;
        $scope.progressBarBackgroundStyle = "";
        $scope.songList = [];


        var visuals = new Visualizer();
        visuals.ini();

        fs.readdir(__dirname + '/music', function(err, items) {
            console.log(items);

            for (var i = 0; i < items.length; i++) {
                console.log(items[i]);
                $scope.songList.push({
                    track: items[i]
                })
            }
        });

        $scope.setSong = function(songName) {

            $scope.youtubeDownloadLink = 'music/' + songName;
            $scope.playMusic();

        };

        $scope.playMusic = function() {
            var isPaused = audio.paused;
            $scope.isPlaying = true;
            // if ($scope.isAudioLoaded) {
            //     audio.play();
            // } else {
            $scope.loadAudio();
            audio.play();
            // }
            $scope.songName = $scope.youtubeDownloadLink;
            visuals._visualize();

        };

        $scope.loadAudio = function() {
            $scope.isAudioLoaded = true;
            audio.load();
        };

        $scope.pauseMusic = function() {
            $scope.isPlaying = false;
            audio.pause();
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

        $scope.updateProgressBarStyle = function() {
            var colorPercentage = Math.floor($scope.timeInSeconds / $scope.durationInSeconds * 100.00);
            var percentageDifference = 100 - colorPercentage;

            $scope.colorPercentage = colorPercentage;
            $scope.percentageDifference = percentageDifference;
            var barStyle = "linear-gradient(to left, #E3E3E3 " + percentageDifference + "%, #ca72ff " + colorPercentage + "%)";
            if (colorPercentage >= 50) {
                return "linear-gradient(to right, #ca72ff " + colorPercentage + "%, #E3E3E3 " + percentageDifference + "%)";
            }
            $scope.progressBarBackgroundStyle = barStyle;

            return barStyle;


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
            if (!$scope.isAudioLoaded) return;
            $scope.seeking = true;
        }




        audio.addEventListener("timeupdate", function() {
            if (!$scope.seeking) {
                $scope.updatePlayTimer(Math.floor(audio.currentTime), Math.floor(audio.duration));
                $scope.updateTimeTracker(Math.floor(audio.currentTime), Math.floor(audio.duration));
                $scope.updateProgressBarStyle();
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
    }]);