const router = require('express').Router();
const File = require('../models/file');

router.get('/:uuid', async (req, res) => {
   // Extract link and get file from storage send download stream 
   try {
      const file = await File.findOne({ uuid: req.params.uuid });
      // Link expired
      if(!file) {
         throw new Error('Link has been expired.');
      } 
      const response = await file.save();
      const filePath = `${__dirname}/../${file.path}`;
      res.download(filePath);
   } catch (error) {
       return res.render('download', { error: error.message});
   }
});


module.exports = router;