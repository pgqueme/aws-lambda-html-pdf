//var fs = require('fs');
var pdf = require('html-pdf');
var options = { format: 'Letter', phantomPath: './phantomjs_lambda/phantomjs_linux-x86_64' };

//var MemoryStream = require('memorystream'); //Maybe won't use
var AWS = require('aws-sdk');

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

exports.handler = function(event, context) {
  /*var memStream = new MemoryStream();
  var html_utf8 = new Buffer(event.html_base64, 'base64').toString('utf8');

  wkhtmltopdf(html_utf8, event.options, function(code, signal) {
    var pdf = memStream.read();
    var s3 = new AWS.S3();

    var params = {
      Bucket : "my-bucket",
      Key : "test.pdf",
      Body : pdf
    }

    s3.putObject(params, function(err, data) {
      if (err) {
        console.log(err)
      } else {
        context.done(null, { pdf_base64: pdf.toString('base64') });
      }
    });
  }).pipe(memStream);*/


  var htmlString = event.htmlString;
  var fileName = event.fileName;

  //pdf.create(htmlString, options).toFile("../public/archivos/" + fileName + ".pdf", function(err, resFile) {
  pdf.create(htmlString, options).toBuffer(function(err, buffer){
      if (err) return console.log(err);
      var s3 = new AWS.S3();
      var params = {
          Bucket : "lexglobal-pdf",
          Key : fileName + '.pdf',
          Body : buffer
      }

      s3.putObject(params, function(err, data) {
          if (err) {
              console.log(err)
          } else {
              context.done(null, { result: 'Created PDF file' });
          }
      });
  });

  /*console.log('Archivo HTML creado');
  var html = fs.readFileSync("../public/archivos/" + fileName + ".html", 'utf8');
  console.log('Archivo HTML leído');
  
  pdf.create(html, options).toFile("../public/archivos/" + fileName + ".pdf", function(err, resFile) {
      if (err) return console.log(err);
      console.log("PDF guardado");
      res.status(201).send({ filePath: resFile });
      console.log('Ruta PDF enviada');
  });*/
};