var express = require('express');
var router = express.Router();
const fs = require('fs');
const ytdl = require('ytdl-core');
var AdmZip = require("adm-zip");

const COOKIE = 'YSC=W0QppGN9uEM; CONSENT=YES+yt.427436887.en+FX+070; VISITOR_INFO1_LIVE=-ee-Yb5K8Cs; HSID=AxYV37TMaFeiVBoC0; SSID=Apd3cNHGMHxh3NB-r; APISID=oGkpIs6vurg9no2A/AmVafRsjnFuE_pSL6; SAPISID=P8clkdSNI_bWlQy7/AhZEZWk52CxzRhFkr; __Secure-1PAPISID=P8clkdSNI_bWlQy7/AhZEZWk52CxzRhFkr; __Secure-3PAPISID=P8clkdSNI_bWlQy7/AhZEZWk52CxzRhFkr; LOGIN_INFO=AFmmF2swRAIgUF9kR-wh23QU6RO56vz_r8SeS4cI_5bKRQzebHnR-8QCIEDugpJrrKzI-CJ5eXyKeVa8dDX4xq_Vp81i2EgIt_wH:QUQ3MjNmeUZmV3YzTzdPM1ZRNlF0RDRPRDZHTWJMSFVaNXVfdGU1b1NNY3JRN1dlZE0ybjctOEoyZ2VFMDkwY0NxREtuMjkxSmE5VzVrdEJDb0FWb1JZWHAyR0ROeDBCaUJFU0dWbmdMNW5NT2pqclpvOEt4NDZwRi00dHRFaEZfRl90YjZYeWdIeW5yRTZxOHZuMVV0N19nSFUxU2tneHJiNDJsOF9zWllkR2RQUDhXTG5EUXlreVRweUdHYi13YUNEc1QwRzA5REI2UXVIRGE2WWlKR3dkRFNGN1VTNF9YZw==; SID=KAhdJgPjrAmQXxt9s4w112gdu9Qo7Ptv4QSuFGBorNrpx3Q_2ziqDIJbvpNDpyjbhlxUJg.; __Secure-1PSID=KAhdJgPjrAmQXxt9s4w112gdu9Qo7Ptv4QSuFGBorNrpx3Q_N5kV4DpGLvDUUSK1arUBaw.; __Secure-3PSID=KAhdJgPjrAmQXxt9s4w112gdu9Qo7Ptv4QSuFGBorNrpx3Q_GKuy7Q006B7PSxvfyWP9Kg.; wide=1; PREF=tz=Europe.Amsterdam&f6=40000000&f5=20000&volume=35; SIDCC=AJi4QfEf6PMW6Zel-RMCM6jvxfQ9O4-Ya7BtMhJ5WNe9FyubybxV041CUasJQD6TBa1Xe37xq_4; __Secure-3PSIDCC=AJi4QfGV2ofJTIuTmiP2y_pYN3kwxY34H7PmVGDr1Z70t-ZBgZyDHRI6-ecZvlgZk_LqH6dMjvs';

router.post('/', async (req, res, next) => {
    const playlistName = req.body.name;
    const playlistSongs = req.body.songs;

    console.log(playlistName);
    console.log(playlistSongs);

    if(!playlistName || !playlistSongs) {
        res.status(400).send('Missing playlist name or songs');
        return;
    }

    try {
      const getVideos = async () => {
        const videos = Promise.all(playlistSongs.map(id => ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`)));
        return videos;
      }

      getVideos().then(async videos => {
  
        const downloadVideos = await videos.map( async video => {

          let file = `${video.videoDetails.title}`;
          var cleanFileName = file.replace(/[^a-zA-Z0-9]/g, '_');

          let downloadedVideo = {
            path: '',
            name: ''
          }

          const download = new Promise((resolve, reject) => {
            ytdl(video.videoDetails.video_url, {
              requestOptions: {
                headers: {
                  cookie: COOKIE
                }
              },
              filter: 'audioonly'
            })
            .pipe(fs.createWriteStream(`./songs/${cleanFileName}.mp3`))
            .on('finish', () => {
              downloadedVideo.path = `./songs/${cleanFileName}.mp3`;
              downloadedVideo.name = file;
              resolve(downloadedVideo);
            });
          });

          console.log(`Downloading ${file}`);

          return download;
        });

        const songs = await Promise.all(downloadVideos);
        return songs;
      }).then(() => {
        // get all the songs in the folder 
        const songs = fs.readdirSync('./songs');
        const zip = new AdmZip();

        // filter out the mp3 files
        const filteredSongs = songs.filter(song => song.endsWith('.mp3'));

        // bundle the songs into an array
        const songList = filteredSongs.map(song => {
          return {
            name: song,
            path: `/songs/${song}`
          }
        });

        zip.addLocalFolder('./songs');

        // save the zip file
        zip.writeZip(`./songs/${playlistName}.zip`);

        // remove the songs from the folder
        filteredSongs.forEach(song => {
          fs.unlinkSync(`./songs/${song}`);
        });

        console.log('Done');

        // send the zip file to the client and remove it from the server
        res.download(`./songs/${playlistName}.zip`, `${playlistName}.zip`, () => {
          fs.unlinkSync(`./songs/${playlistName}.zip`);
        });
      })
    }
    catch (err) {
      console.log(err);
    }
});

module.exports = router;