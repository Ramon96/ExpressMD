var express = require('express');
var router = express.Router();
const fs = require('fs');
const ytdl = require('ytdl-core');

const sampleData = ['k3bunkZJ4c4', 'X8WeCtU_cuQ', '88g3YrG0HtY', 'H2C9JoTJlHw', 'cphMyCM7JfA', 'f-LUH-AndV0', 'PBWLsUPs2i0', 'NhWORAzjm3k', 'ibyrCG-RRi4', 'Xu1rGfQCu9o', 'GBJDHzLz16Q', 'rQ96NUJrsBg', '-6uBXQjT5Yg', 'zefRH1-kUlg', 'S3y6dpW4-AQ', 'qlIMdDUwZNI', '5kVLFs3Fdv0', 'CMuSlI4NRZY', 'WpyIyuLfdpE', 'gn71phi7YrU', '4r78JWnX37Q', 'jmpIpws5EVE', 'dtlfBW2oRhw', 'jpUhiX-8_qs', 'HF3D9YWBVgU', 'QbgIlsTKF6U', 'FNiaQynpNWU', 'e2nS8MUSVlc', 'CAfrmorosFo', 'F1uxC5GLi_4', 'xILHGOFoViU', 'FXvBqvNICO0', 'SYdr1tWWoqQ', 'BZ8sVLwdX2g', 'bUJ2OPF1Mc4', 'cRmAoolmGHY', '78BJRwiGK-o', 'udAHeLovEME', '9LfVP3ILwxw', 'i6Uc3gVkZNY', 'Hw3__9gY2v0', '7GDm_iDptrc', 'h4Uur_jAStU', 'JlJpFzLpw2I', 'thhmzSgUhU4', 'vd6xM9DEE4c', 'y4sUFF-qjZY', 'wZb2LWTljXE', '7W9IOhk1-z4', 'GUMegkHvF_c'];

/* GET home page. */
router.post('/', async (req, res, next) => {
  const { body: data } = req;


    try {
      const getVideos = async () => {
        const videos = Promise.all(sampleData.map(id => ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`)));
        return videos;
      }

      getVideos().then(async videos => {
        videos.map( async video => {
          let file = `${video.videoDetails.title}`;
          var cleanFileName = file.replace(/[^a-zA-Z0-9]/g, '_');

          await ytdl(video.videoDetails.video_url, {
            filter: 'audioonly'
          }).pipe(await fs.createWriteStream(`./songs/${cleanFileName}.mp3`));

          // const song = `./songs/${cleanFileName}.mp3`;
          // res.download(song);
        })
      })
      .then((res) => {
        //get all the files 
        // const files = await fs.readdirSync('./songs');
        // console.log(files)

      })
    }
    catch (err) {
      console.log(err);
    }

  res.render('index', { title: 'Express' });
});

module.exports = router;
