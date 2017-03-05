  $(document).ready(function() {

      var kairos = new Kairos(config.KAIROS_APP_ID, config.KAIROS_APP_KEY);
      var betaface = new Betaface(config.BETAFACE_API_KEY, config.BETAFACE_API_SECRET);
      var microsoft = new Microsoft(config.MICROSOFT_KEY_1, config.MICROSOFT_KEY_2);


      // holder for the image data
      var global_image_data;
      var global_is_url;

      function imageToDataUri(img, width, height) {

          // create an off-screen canvas
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');

          // set its dimension to target size
          canvas.width = width;
          canvas.height = height;

          // draw source image into the off-screen canvas:
          ctx.drawImage(img, 0, 0, width, height);

          // encode image to data-uri with base64 version of compressed image
          return canvas.toDataURL();
      }

      // drawing method
      function myDrawMethod(face) {
          var canvas = document.getElementById('myCanvas');
          var context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          var imageObj = new Image();

          imageObj.onload = function() {
              context.drawImage(imageObj, 0, 0);

              // draw face box
              context.beginPath();
              context.rect(face.topLeftX, face.topLeftY, face.width, face.height);
              context.lineWidth = 4;
              context.strokeStyle = '#139C8A';
              context.stroke();

              // draw left eye
              context.beginPath();
              context.moveTo(face.leftEyeCenterX, (face.leftEyeCenterY + (face.height / 25)));
              context.lineTo(face.leftEyeCenterX, (face.leftEyeCenterY - (face.height / 25)));
              context.stroke();

              // draw right eye
              context.beginPath();
              context.moveTo(face.rightEyeCenterX, (face.rightEyeCenterY + (face.height / 25)));
              context.lineTo(face.rightEyeCenterX, (face.rightEyeCenterY - (face.height / 25)));
              context.stroke();
          };

          imageObj.src = global_is_url ? global_image_data : 'data:image/jpeg;base64,' + global_image_data;
      };

      function betafaceDetectCallback(response) {
          var betafaceJSON = JSON.parse(response.responseText);
          if (betafaceJSON.faces.length == 0) {
              console.log('no images in face response');
              return;
          }
          var tags = betafaceJSON.faces[0].tags;
          var attributes = {};
          for (var i in tags) {
              var name = tags[i]['name'];
              var value = tags[i]['value'];
              if (name == "gender" || name == "age") {
                  attributes[name] = value;
              }
          }
          $("#betaface_response").html(JSON.stringify(attributes, null, 4));
      };

      function microsoftDetectCallback(response) {
          console.log(response);
          var microsoftJSON = JSON.parse(response.responseText);
          console.log(microsoftJSON);
          if (!microsoftJSON[0]) {
              console.log('no images in face response');
              return;
          };
          attributes = microsoftJSON[0].faceAttributes;
          attributes = {
              "gender": attributes["gender"],
              "age": attributes["age"]
          };
          $("#microsoft_response").html(JSON.stringify(attributes, null, 4));
      };


      function kairosDetectCallback(response) {
        console.log(response);
          $response = $("#kairos_response");
          var kairosJSON = JSON.parse(response.responseText);
          if (!kairosJSON.images[0].faces[0]) {
              console.log('no images in face response');
              return;
          };
          attributes = kairosJSON.images[0].faces[0].attributes;
          attributes = {
              "gender": attributes["gender"]["type"],
              "age": attributes["age"]
          };
          $("#kairos_response").html(JSON.stringify(attributes, null, 4));

          // call custom drawing method
          myDrawMethod(kairosJSON.images[0].faces[0]);
      };

      function handleFileSelect(evt) {
          $("#kairos_response").html("<i>(Kairos response will appear here)</i>");
          $("#betaface_response").html("<i>(Betaface response will appear here)</i>");

          evt.stopPropagation();
          evt.preventDefault();

          var files = evt.target.files; // FileList object.

          // Loop through the FileList and render image files as thumbnails.
          for (var i = 0, f; f = files[i]; i++) {

              // Only process image files.
              if (!f.type.match('image.*')) {
                  continue;
              }

              var reader = new FileReader();

              reader.onload = (function(theFile) {
                  return function(e) {

                      var canvas = $('#myCanvas');
                      var context = myCanvas.getContext('2d');
                      context.clearRect(0, 0, canvas.width, canvas.height);
                      var imageObj = new Image;
                      imageObj.onload = function() {
                          context.drawImage(imageObj, 0, 0); // Or at whatever offset you like
                      };
                      imageObj.src = e.target.result;

                      var image_data = e.target.result;

                      var maxWidth = 400;
                      if (imageObj.width > maxWidth) {
                          var ratio = maxWidth / imageObj.width;
                          image_data = imageToDataUri(imageObj, imageObj.width * ratio, imageObj.height * ratio);
                          imageObj.src = image_data;
                      }

                      image_data = String(image_data);
                      image_data = image_data.replace("data:image/jpeg;base64,", "");
                      image_data = image_data.replace("data:image/jpg;base64,", "");
                      image_data = image_data.replace("data:image/png;base64,", "");
                      image_data = image_data.replace("data:image/gif;base64,", "");
                      image_data = image_data.replace("data:image/bmp;base64,", "");
                      global_image_data = image_data;
                      global_is_url = false;

                      var options = {
                          "selector": "FULL"
                      };

                      // pass your callback method to the Detect function
                      kairos.detect(image_data, kairosDetectCallback, {
                          "selector": "FULL"
                      });
                      betaface.detect(image_data, betafaceDetectCallback, "classifiers");


                  };
              })(f);

              // Read in the image file as a data URL.
              reader.readAsDataURL(f);

          }
      }

      function handleSampleSelect(evt) {
          $("#kairos_response").html("<i>(Kairos response will appear here)</i>");
          $("#betaface_response").html("<i>(Betaface response will appear here)</i>");

          evt.stopPropagation();
          evt.preventDefault();

          var canvas = $('#myCanvas');
          var context = myCanvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          var imageObj = new Image;
          imageObj.crossOrigin = "Anonymous";
          imageObj.onload = function() {
              var maxWidth = 400;
              if (this.width > maxWidth) {
                  var ratio = maxWidth / imageObj.width;
                  this.src = imageToDataUri(imageObj, imageObj.width * ratio, imageObj.height * ratio);
              } else {
                  context.drawImage(imageObj, 0, 0); // Or at whatever offset you like

                  var image_data = imageToDataUri(imageObj, imageObj.width, imageObj.height);
                  image_data = String(image_data);
                  image_data = image_data.replace("data:image/jpeg;base64,", "");
                  image_data = image_data.replace("data:image/jpg;base64,", "");
                  image_data = image_data.replace("data:image/png;base64,", "");
                  image_data = image_data.replace("data:image/gif;base64,", "");
                  image_data = image_data.replace("data:image/bmp;base64,", "");
                  global_image_data = image_data;
                  global_is_url = false;

                  kairos.detect(image_data, kairosDetectCallback, { "selector": "FULL" });
                  betaface.detect(image_data, betafaceDetectCallback, "classifiers");
                  // microsoft.detect(image_data, console.log, "returnFaceAttributes=age,gender");
              };

          };
          imageObj.src = $(this).attr('src');
          global_is_url = true;
          global_image_data = $(this).data('url'); 
          microsoft.detect($(this).data('url'), microsoftDetectCallback, "returnFaceAttributes=age,gender", is_url=true);
      };


      function handleURLSelect(evt) {
          $("#kairos_response").html("<i>(Kairos response will appear here)</i>");
          $("#betaface_response").html("<i>(Betaface response will appear here)</i>");

          evt.stopPropagation();
          evt.preventDefault();

          var canvas = $('#myCanvas');
          var context = myCanvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          var imageObj = new Image;
          imageObj.crossOrigin = "Anonymous";
          imageObj.onload = function() {
              var maxWidth = 400;
              if (this.width > maxWidth) {
                  var ratio = maxWidth / imageObj.width;
                  this.src = imageToDataUri(imageObj, imageObj.width * ratio, imageObj.height * ratio);
              } else {
                  context.drawImage(imageObj, 0, 0); // Or at whatever offset you like

                  var image_data = imageToDataUri(imageObj, imageObj.width, imageObj.height);
                  image_data = String(image_data);
                  image_data = image_data.replace("data:image/jpeg;base64,", "");
                  image_data = image_data.replace("data:image/jpg;base64,", "");
                  image_data = image_data.replace("data:image/png;base64,", "");
                  image_data = image_data.replace("data:image/gif;base64,", "");
                  image_data = image_data.replace("data:image/bmp;base64,", "");
                  global_image_data = image_data;
                  global_is_url = false;

                  var options = {
                      "selector": "FULL"
                  };

                  // pass your callback method to the Detect function
                  kairos.detect(image_data, kairosDetectCallback, {
                      "selector": "FULL"
                  });
                  betaface.detect(image_data, betafaceDetectCallback, "classifiers");
              };

          };

          imageObj.src = $("#photo_url").val();

      };






      // $("#kairos_response").html("<i>(Kairos response will appear here)</i>");
      // $("#betaface_response").html("<i>(Betaface response will appear here)</i>");

      // evt.stopPropagation();
      // evt.preventDefault();

      // var url = $("#photo_url").val();

      // var canvas = $('#myCanvas');
      // var context = myCanvas.getContext('2d');
      // context.clearRect(0, 0, canvas.width, canvas.height);
      // var imageObj = new Image;
      // imageObj.onload = function() {
      //     context.drawImage(imageObj, 0, 0); // Or at whatever offset you like
      // };
      // imageObj.src = url;

      // var image_data = url;

      // global_image_data = image_data;
      // global_is_url = true;

      // var options = {
      //     "selector": "FULL"
      // };

      // // pass your callback method to the Detect function
      // kairos.detect(image_data, kairosDetectCallback, {
      //     "selector": "FULL"
      // });

      // betaface.detect(image_data, betafaceDetectCallback, "classifiers", is_url = true);


      // };

      $('#file').change(handleFileSelect);
      $('#submit_photo_url').click(handleURLSelect);
      $('.sample-img').click(handleSampleSelect);

      $('#sample1').click();

  });
