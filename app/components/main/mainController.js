var padLeft = require('pad-left');
var fs = require('fs');
var chokidar = require('chokidar');
var exec = require('child_process').exec;




angular.module('main')
    .controller('mainController', ['$scope', '$timeout', function MainController($scope, $timeout) {

        var audio = document.getElementById('prismatic-audio');
        var watcher = null;

        $scope.title = 'Prismatic Player';
        $scope.youtubeDownloadLink = 'https://www.youtube.com/watch?v=gPgLmyWiUDc';
        $scope.songName = "...";
        $scope.currentTimer = "00:00";
        $scope.muted = false;
        $scope._time = 0;
        $scope.timeInSeconds = 0;
        $scope.durationInSeconds = 0;
        $scope.isPlaying = false;
        $scope.progressBarBackgroundStyle = "";
        $scope.songList = [];
        $scope.primaryFolder = __dirname + '/' + 'music';
        $scope.youtubeDownloadInProgress = false;


        var visuals = new Visualizer();
        visuals.ini();

        $scope.$watch('primaryFolder', function(newValue, oldValue) {
            if (watcher) {
                watcher.unwatch(oldValue);
            }

            watcher = chokidar.watch(newValue, { ignored: /^\./, persistent: true });
            watcher
                .on('add', function(path) {
                    console.log('File', path, 'has been added');
                    $scope.addSongToPlaylist(path);
                    $scope.$apply();
                })
                .on('change', function(path) { console.log('File', path, 'has been changed'); })
                .on('unlink', function(path) {
                    console.log('File', path, 'has been removed');
                    $scope.removeSongFromPlaylist(path);
                    $scope.$apply();
                })
                .on('error', function(error) { console.error('Error happened', error); })
        });

        $scope.isFormatAvailable = function(fileName) {
            if (!fileName.endsWith(".mp3")) {
                return false;
            }
            return true;
        }

        $scope.addSongToPlaylist = function(songPath) {
            if (!$scope.isFormatAvailable(songPath)) {
                return;
            }

            $scope.songList.push({
                track: songPath
            });
        };

        $scope.removeSongFromPlaylist = function(songPath) {
            if (!$scope.isFormatAvailable(songPath)) {
                return;
            }

            var indexToRemove = -1;
            $scope.songList.forEach(function(songItem, index) {
                if (songItem.track == songPath) {
                    indexToRemove = index;
                }
            });

            if (indexToRemove > -1) {
                $scope.songList.splice(indexToRemove, 1);
            }
        }

        $scope.youtubeDownloadSong = function() {
            var cmd = 'youtube-dl.exe --extract-audio --audio-format mp3 --output "' + $scope.primaryFolder + '/%(title)s.%(ext)s" ' + $scope.youtubeDownloadLink;
            var path = __dirname + '/utils/youtube-dl-win';
            $scope.youtubeDownloadInProgress = true;
            var child = exec(
                cmd, {
                    cwd: path
                },
                function(error, stdout, stderr) {
                    if (error === null) {
                        $scope.youtubeDownloadInProgress = false;
                        console.log('success');
                        $scope.$apply();
                    } else {
                        $scope.youtubeDownloadInProgress = false;
                        console.log('error');
                        console.log(error.message);
                        $scope.$apply();
                    }
                }
            );
        }

        $scope.setSong = function(songName) {
            $scope.currentSong = songName;
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
            $scope.songName = $scope.currentSong;
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