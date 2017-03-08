  $(document).ready(function($) {
      var kairos = new Kairos(config.KAIROS_APP_ID, config.KAIROS_APP_KEY);
      var betaface = new Betaface(config.BETAFACE_API_KEY, config.BETAFACE_API_SECRET);
      var microsoft = new Microsoft(config.MICROSOFT_KEY_1, config.MICROSOFT_KEY_2);
      var watson = new Watson(config.IBM_API_KEY);


      // holder for the image data
      var global_image_data;
      var global_is_url;
      var global_ratio;

      var kairosBoundingBox;
      var microsoftBoundingBox;
      var ibmBoundingBox;

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
      function drawBoundingBox(face, color) {
          var canvas = $('#photoCanvas')[0];
          var context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          var imageObj = new Image();
          imageObj.onload = function() {
              context.drawImage(imageObj, 0, 0, imageObj.width * global_ratio, imageObj.height * global_ratio);

              if (face) {
                  var top = face.top * global_ratio;
                  var left = face.left * global_ratio;
                  var width = face.width * global_ratio;
                  var height = face.height * global_ratio;


                  // draw face box
                  context.beginPath();
                  context.rect(left, top, width, height);
                  context.lineWidth = 4;
                  context.strokeStyle = color;
                  context.stroke();
              }
          };

          imageObj.src = global_is_url ? global_image_data : 'data:image/jpeg;base64,' + global_image_data;
      };

      function betafaceDetectCallback(response) {
          var betafaceJSON = JSON.parse(response.responseText);
          if (betafaceJSON.faces.length == 0) {
              console.log('no images in face response');
              $("#betaface_response").html('No faces detected');
          } else {
              var tags = betafaceJSON.faces[0].tags;
              attributes = [];
              for (var i in tags) {
                  var attribute = tags[i]['name'];
                  var relevantAttributes = ['gender', 'age', 'race'];
                  // check if attribute is in relevantAttributes
                  if (relevantAttributes.indexOf(attribute) != -1) { attributes.push(tags[i]); }
              };
              $("#betaface_response").html(JSON.stringify(attributes, null, 4));
          }
      };

      function microsoftDetectCallback(response) {
          var microsoftJSON = JSON.parse(response.responseText);
          if (!microsoftJSON[0]) {
              console.log('no images in face response');
              $("#microsoft_response").html('No faces detected');
          } else {
              var attributes = microsoftJSON[0].faceAttributes;
              var face = microsoftJSON[0].faceRectangle;
              microsoftBoundingBox = {
                  top: face.top,
                  left: face.left,
                  width: face.width,
                  height: face.height
              };
              $("#microsoft_response").html(JSON.stringify(attributes, null, 4));
          }
      };

      function watsonDetectCallback(response) {
          var watsonJSON = JSON.parse(response.responseText);
          if (!watsonJSON.images[0].faces[0]) {
              console.log('no images in face response');
              $("#ibm_response").html('No faces detected');
          } else {
              attributes = watsonJSON.images[0].faces[0];
              attributes = {
                  "gender": attributes.gender,
                  "age": attributes.age
              };
              $("#ibm_response").html(JSON.stringify(attributes, null, 4));
              var face = watsonJSON.images[0].faces[0].face_location;
              ibmBoundingBox = {
                  top: face.top,
                  left: face.left,
                  width: face.width,
                  height: face.height
              };
          }
      };


      function kairosDetectCallback(response) {
          $response = $("#kairos_response");
          var kairosJSON = JSON.parse(response.responseText);
          if (!kairosJSON.images[0].faces[0]) {
              console.log('no images in face response');
              $("#kairos_response").html('No faces detected');
          } else {
              attributes = kairosJSON.images[0].faces[0].attributes;

              // call custom drawing method
              var face = kairosJSON.images[0].faces[0];
              kairosBoundingBox = {
                  top: face.topLeftY,
                  left: face.topLeftX,
                  width: face.width,
                  height: face.height
              };
              $("#kairos_response").html(JSON.stringify(attributes, null, 4));
              // $('#collapseKairos').collapse('show');
              // drawBoundingBox(kairosBoundingBox, 'blue');
          }
      };

      function reset() {
          $("#kairos_response").html("<i>(Kairos response will appear here)</i>");
          $("#betaface_response").html("<i>(Betaface response will appear here)</i>");
          $("#microsoft_response").html("<i>(Microsoft response will appear here)</i>");
          $("#ibm_response").html("<i>(IBM response will appear here)</i>");

          kairosBoundingBox = {};
          microsoftBoundingBox = {};
          ibmBoundingBox = {};

          $('.show').collapse('hide');
      };

      // get ratio by which to multiply image width and height in order to fit canvas
      function getConversionRatio(imageObj, maxWidth, maxHeight) {
          return Math.min(maxWidth / imageObj.width, maxHeight / imageObj.height);
      };


      function handleFileSelect(evt) {
          reset();
          global_ratio = null;
          var file = evt.target.files[0];
          if (file.type.match('image.*')) { // Only process image files
              var reader = new FileReader();
              reader.onload = function(e) {
                  var canvas = $('#photoCanvas')[0];
                  var context = canvas.getContext('2d');
                  context.clearRect(0, 0, canvas.width, canvas.height);
                  var imageObj = new Image;
                  imageObj.onload = function() {
                      var ratio = getConversionRatio(imageObj, 400, 400);
                      if (!global_ratio) {
                          global_ratio = ratio;
                          imageObj.src = imageToDataUri(imageObj, imageObj.width, imageObj.height);
                      } else {
                          context.drawImage(imageObj, 0, 0, imageObj.width * ratio, imageObj.height * ratio);

                          var image_data = String(imageObj.src);
                          image_data = image_data.replace("data:image/jpeg;base64,", "");
                          image_data = image_data.replace("data:image/jpg;base64,", "");
                          image_data = image_data.replace("data:image/png;base64,", "");
                          image_data = image_data.replace("data:image/gif;base64,", "");
                          image_data = image_data.replace("data:image/bmp;base64,", "");
                          global_image_data = image_data;
                          global_is_url = false;

                          kairos.detect(image_data, kairosDetectCallback);
                          betaface.detect(image_data, betafaceDetectCallback, "classifiers");
                          microsoftBoundingBox = null;
                      }
                  };
                  imageObj.src = e.target.result;
              };
              // Read in the image file as a data URL.
              reader.readAsDataURL(file);
          };
          var dataReader = new FileReader();
          dataReader.onload = function(e) {
            microsoft.detect(e.target.result, microsoftDetectCallback, "returnFaceAttributes=age,gender");
            // watson.detect(e.target.result, watsonDetectCallback);
          };
          dataReader.readAsArrayBuffer(file);
      };


      function handleURLSelect(url) {
          reset();
          $('.show').collapse('hide');

          var canvas = $('#photoCanvas')[0];
          var context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          var imageObj = new Image;
          imageObj.crossOrigin = "Anonymous";
          imageObj.onload = function() {
              var ratio = getConversionRatio(imageObj, 400, 400);
              context.drawImage(imageObj, 0, 0, imageObj.width * ratio, imageObj.height * ratio);

              global_image_data = url;
              global_is_url = true;
              global_ratio = ratio;
          };
          imageObj.src = url;

          kairos.detect(url, kairosDetectCallback);
          betaface.detect(url, betafaceDetectCallback, "classifiers", is_url = true);
          microsoft.detect(url, microsoftDetectCallback, "returnFaceAttributes=age,gender", is_url = true);
          watson.detect(url, watsonDetectCallback, is_url = true);
      };



      $('#file').change(handleFileSelect);
      $('#submit_photo_url').click(
          function(evt) {
              url = $("#photo_url").val();
              handleURLSelect(url);
          }
      );
      $('.sample-img').click(
          function(evt) {
              var url = $(this).data("url");
              handleURLSelect(url);
          }
      );

      $('#sample1').click();

      $('#collapseKairos').on('show.bs.collapse', function() { drawBoundingBox(kairosBoundingBox, 'blue') });
      $('#collapseBetaface').on('show.bs.collapse', function() { drawBoundingBox() });
      $('#collapseMicrosoft').on('show.bs.collapse', function() { drawBoundingBox(microsoftBoundingBox, 'green') });
      $('#collapseIBM').on('show.bs.collapse', function() { drawBoundingBox(ibmBoundingBox, 'red') });

  });
