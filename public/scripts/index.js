  $(document).ready(function($) {


      var kairos = new Kairos(config.KAIROS_API_ID, config.KAIROS_API_KEY);
      var betaface = new Betaface(config.BETAFACE_API_KEY, config.BETAFACE_API_SECRET);
      var microsoft = new Microsoft(config.MICROSOFT_KEY_1, config.MICROSOFT_KEY_2);
      var watson = new Watson(config.IBM_API_KEY);
      var google = new Google(config.GOOGLE_API_KEY);
      var faceplusplus = new FacePlusPlus(config.FACEPLUSPLUS_API_KEY, config.FACEPLUSPLUS_API_SECRET);


      // holder for the image data
      var global_image_data = null;
      var global_is_url = null;
      var global_ratio = null;

      var kairosBoundingBox = null;
      var microsoftBoundingBox = null;
      var ibmBoundingBox = null;
      var googleBoundingBox = null;

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
      }

      function drawGoogleBoundingBox(face, color) {
          var canvas = $('#photoCanvas')[0];
          var context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          var imageObj = new Image();
          imageObj.onload = function() {
              context.drawImage(imageObj, 0, 0, imageObj.width * global_ratio, imageObj.height * global_ratio);
              context.lineWidth = 4;
              context.strokeStyle = color;
              context.beginPath();
              for (var vertex in face) {
                  context.lineTo(face[vertex].x * global_ratio, face[vertex].y * global_ratio);
              }
              context.lineTo(face[0].x * global_ratio, face[0].y * global_ratio);
              context.stroke();
          };
          imageObj.src = global_is_url ? global_image_data : 'data:image/jpeg;base64,' + global_image_data;
      }


      function betafaceDetectCallback(response) {
          var betafaceJSON = JSON.parse(response.responseText);
          if (betafaceJSON.faces.length === 0) {
              console.log('no images in face response');
              $("#betaface_response").html('No faces detected');
          } else {
              var tags = betafaceJSON.faces[0].tags;
              var attributes = [];
              for (var i in tags) {
                  var attribute = tags[i].name;
                  var relevantAttributes = ['gender', 'age', 'race'];
                  // check if attribute is in relevantAttributes
                  if (relevantAttributes.indexOf(attribute) != -1) { attributes.push(tags[i]); }
              }
              $("#betaface_response").html(JSON.stringify(attributes, null, 4));
          }
      }

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
      }

      function watsonDetectCallback(response) {
          var watsonJSON = JSON.parse(response.responseText);
          if (!watsonJSON.images[0].faces[0]) {
              console.log('no images in face response');
              $("#ibm_response").html('No faces detected');
          } else {
              var attributes = watsonJSON.images[0].faces[0];
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
      }


      function kairosDetectCallback(response) {
          var kairosJSON = JSON.parse(response.responseText);
          if (!kairosJSON.images[0].faces[0]) {
              console.log('no images in face response');
              $("#kairos_response").html('No faces detected');
          } else {
              var attributes = kairosJSON.images[0].faces[0].attributes;

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
      }

      function googleDetectCallback(response) {
          var googleJSON = JSON.parse(response.responseText);
          if (!googleJSON.responses[0].faceAnnotations[0]) {
              console.log('no images in face response');
              $("#google_response").html('No faces detected');
          } else {
              var attributes = googleJSON.responses[0].faceAnnotations[0];
              attributes = {
                  detectionConfidence: attributes.detectionConfidence,
                  joyLikelihood: attributes.joyLikelihood,
                  sorrowLikelihood: attributes.sorrowLikelihood,
                  angerLikelihood: attributes.angerLikelihood,
                  surpriseLikelihood: attributes.surpriseLikelihood,
                  underExposedLikelihood: attributes.underExposedLikelihood,
                  blurredLikelihood: attributes.blurredLikelihood,
                  headwearLikelihood: attributes.headwearLikelihood
              };
              $("#google_response").html(JSON.stringify(attributes, null, 4));
              var face = googleJSON.responses[0].faceAnnotations[0].fdBoundingPoly.vertices;
              googleBoundingBox = face;

          }
      }

      function reset() {
          $("#kairos_response").html("<i>(Kairos response will appear here)</i>");
          $("#betaface_response").html("<i>(Betaface response will appear here)</i>");
          $("#microsoft_response").html("<i>(Microsoft response will appear here)</i>");
          $("#ibm_response").html("<i>(IBM response will appear here)</i>");
          $("#google_response").html("<i>(Google response will appear here)</i>");

          kairosBoundingBox = {};
          microsoftBoundingBox = {};
          ibmBoundingBox = {};

          $('.show').collapse('hide');
      }

      // get ratio by which to multiply image width and height in order to fit canvas
      function getConversionRatio(imageObj, maxWidth, maxHeight) {
          return Math.min(maxWidth / imageObj.width, maxHeight / imageObj.height);
      }


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
                  var imageObj = new Image();
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
                          betaface.detect(image_data, betafaceDetectCallback, "classifiers", is_url = false);
                          google.detect(image_data, googleDetectCallback, is_url = false);
                          // watson.detect(image_data, watsonDetectCallback, is_url = false); 
                          // faceplusplus.detect(image_data, console.log, is_url = false);
                          microsoftBoundingBox = null;
                      }
                  };
                  imageObj.src = e.target.result;
              };
              // Read in the image file as a data URL.
              reader.readAsDataURL(file);
          }
          var dataReader = new FileReader();
          dataReader.onload = function(e) {
              // microsoft.detect(e.target.result, microsoftDetectCallback, "returnFaceAttributes=age,gender", is_url = false);
          };
          dataReader.readAsArrayBuffer(file);
          // watson.detect(file, watsonDetectCallback, is_url = false);
      }


      function handleURLSelect(image_url) {
          reset();

          var canvas = $('#photoCanvas')[0];
          var context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          var imageObj = new Image();

          imageObj.onload = function() {
              var ratio = getConversionRatio(imageObj, 400, 400);
              context.drawImage(imageObj, 0, 0, imageObj.width * ratio, imageObj.height * ratio);

              global_image_data = imageObj.src;
              global_is_url = true;
              global_ratio = ratio;

              kairos.detect(imageObj.src, kairosDetectCallback);
              betaface.detect(imageObj.src, betafaceDetectCallback, "classifiers", is_url = true);
              // faceplusplus.detect(image_url, console.log, is_url = true);
              microsoft.detect(imageObj.src, microsoftDetectCallback, "returnFaceAttributes=age,gender", is_url = true);
              watson.detect(imageObj.src, watsonDetectCallback, is_url = true);
              google.detect(imageObj.src, googleDetectCallback, is_url = true);
          };
          imageObj.src = image_url;
      }



      $('#file').change(handleFileSelect);
      $('#submit_photo_url').click(
          function(evt) {
              var url = $("#photo_url").val();
              handleURLSelect(url);
              return false;
          }
      );
      $('.sample-img').click(
          function(evt) {
              var url = $(this).data("url");
              handleURLSelect(url);
              return false;
          }
      );

      $('#sample1').click();

      $('#collapseKairos').on('show.bs.collapse', function() { drawBoundingBox(kairosBoundingBox, 'blue'); });
      $('#collapseBetaface').on('show.bs.collapse', function() { drawBoundingBox(); });
      $('#collapseMicrosoft').on('show.bs.collapse', function() { drawBoundingBox(microsoftBoundingBox, 'green'); });
      $('#collapseIBM').on('show.bs.collapse', function() { drawBoundingBox(ibmBoundingBox, 'red'); });
      $('#collapseGoogle').on('show.bs.collapse', function() { drawGoogleBoundingBox(googleBoundingBox, 'yellow'); });

  });
