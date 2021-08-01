const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const { genrateError, parseError } = require("../utils")

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/') ,
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
              cb(null, uniqueName)
    } ,
});

let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, });//100mb

router.post('/',upload.single('myfile'), async (req, res) => {

  try {
    console.log(req.body);
      if (!req.file) {
        throw new Error(genrateError(400,'you must upload a file'));
    }

    const _file = new File({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
    });

    const file = await _file.save();

    return res.status(200).json({
      file : `${process.env.APP_BASE_URL}/files/${file.uuid}`
    })
  } catch (error) {
    error = parseError(error.message);
    console.log(error);
    return res.status(error.status).json({
      message: error.message
    });
  }
});




router.post('/send', async (req, res) => {
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;
  
  // Get data from db 
  try {

    if(!uuid || !emailTo || !emailFrom) {
      throw new Error(generateError(422, 'All fields are required except expiry.'));
  }
    const file = await File.findOne({ uuid: uuid });
    if(file.sender) {
      throw new Error(generateError(422, 'Email already sent once.'));
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    // send mail
    const sendMail = require('../services/mailService');
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'inShare file sharing',
      text: `${emailFrom} shared a file with you.`,
      html: require('../services/emailTemplate')({
                emailFrom, 
                downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email` ,
                size: parseInt(file.size/1000) + ' KB',
                expires: '24 hours'
            })
    }).then(() => {
      return res.json({success: true});
    }).catch(err => {
      throw new Error(genrateError(500,'Error in email sending.'))
    });
} catch(err) {
     error = parseError(error.message);
    console.log(error);
    return res.status(error.status).json({
      message: error.message
    });
}

});



module.exports = router;