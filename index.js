
var pdf = require('html-pdf');
var AWS = require('aws-sdk');

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

var options = { format: 'Letter', phantomPath: './phantomjs_lambda/phantomjs_linux-x86_64' };
var S3config = { bucketName: 'your-bucket' }; //Change to your bucket name

exports.handler = function(event, context, callback) {
  //Get the values from the request
  var htmlString = event.htmlString;
  var fileName = event.fileName;

  //Create the PDF file from the HTML string
  pdf.create(htmlString, options).toBuffer(function(err, buffer){
      if (err){
        console.log("There was an error generating the PDF file");
        console.log(err);
        var error = new Error("There was an error generating the PDF file");
        callback(error);
      }
      else {
        var s3 = new AWS.S3();
        var params = {
            Bucket : S3config.bucketName,
            Key : 'pdfs/' + fileName + '.pdf',
            Body : buffer
        }

        s3.putObject(params, function(err, data) {
            if (err) {
                console.log("There was an error while saving the PDF to S3");
                console.log(err);
                var error = new Error("There was an error while saving the PDF to S3");
                callback(error);
            } else {
                console.log('Created PDF with data:');
                console.log(data);

                context.done(null, { result: 'Created PDF file' });
            }
        });
      }
  });
};