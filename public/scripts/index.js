  $(document).ready(function($) {


    var kairos = new Kairos(config.KAIROS_API_ID, config.KAIROS_API_KEY);
    // var betaface = new Betaface(config.BETAFACE_API_KEY, config.BETAFACE_API_SECRET);
    var microsoft = new Microsoft(config.MICROSOFT_KEY_1, config.MICROSOFT_KEY_2);
    var ibm = new IBM(config.IBM_API_KEY);
    var google = new Google(config.GOOGLE_API_KEY);
    var faceplusplus = new FacePlusPlus(config.FACEPLUSPLUS_API_KEY, config.FACEPLUSPLUS_API_SECRET);


    var kairosBoundingBox;
    var microsoftBoundingBox;
    var ibmBoundingBox;
    var googleBoundingBox;
    var facePlusPlusBoundingBox;


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
      var imageObj = new Image();
      imageObj.onload = function() {
        $('#loading').show();
        $('#photoCanvas').hide();
        var canvas = $('#photoCanvas')[0];
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
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
        $('#loading').hide();
        $('#photoCanvas').show();
      };
      imageObj.src = global_is_url ? global_image_data : 'data:image/jpeg;base64,' + global_image_data;
    }

    function drawGoogleBoundingBox(face, color) {
      var imageObj = new Image();
      imageObj.onload = function() {
        $('#loading').show();
        $('#photoCanvas').hide();

        var canvas = $('#photoCanvas')[0];
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(imageObj, 0, 0, imageObj.width * global_ratio, imageObj.height * global_ratio);

        if (face) {
          context.lineWidth = 4;
          context.strokeStyle = color;
          context.beginPath();
          for (var vertex in face) {
            context.lineTo(face[vertex].x * global_ratio, face[vertex].y * global_ratio);
          }
          context.lineTo(face[0].x * global_ratio, face[0].y * global_ratio);
          context.stroke();
        }
        $('#loading').hide();
        $('#photoCanvas').show();
      };
      imageObj.src = global_is_url ? global_image_data : 'data:image/jpeg;base64,' + global_image_data;
    }

    function getGender(genderString) {
      return genderString.toUpperCase()[0];
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
          if (relevantAttributes.indexOf(attribute) != -1) {
            attributes.push(tags[i]);
          }
        }
        $("#betaface_response").html(JSON.stringify(attributes, null, 4));
      }
      $("#betaface-toggle").removeClass('disabled');
    }

    function microsoftDetectCallback(response) {
      var microsoftJSON = JSON.parse(response.responseText);
      if (!microsoftJSON[0]) {
        console.log('no images in face response');
        $("#microsoft_response").html('No faces detected');
      } else {
        var attributes = microsoftJSON[0].faceAttributes;
        $("#microsoft_gender").html(getGender(attributes.gender));
        $("#microsoft_age").html(attributes.age);
        var face = microsoftJSON[0].faceRectangle;
        microsoftBoundingBox = {
          top: face.top,
          left: face.left,
          width: face.width,
          height: face.height
        };
        $("#microsoft_response").html(JSON.stringify(attributes, null, 4));
      }
      $("#microsoft-toggle").removeClass('disabled');
    }

    function ibmDetectCallback(response) {
      var ibmJSON = JSON.parse(response.responseText);
      if (!ibmJSON.images[0].faces[0]) {
        console.log('no images in face response');
        $("#ibm_response").html('No faces detected');
      } else {
        var attributes = ibmJSON.images[0].faces[0];
        attributes = {
          "gender": attributes.gender,
          "age": attributes.age
        };
        $("#ibm_gender").html(getGender(attributes.gender.gender));
        $("#ibm_age").html(attributes.age.max);
        var face = ibmJSON.images[0].faces[0].face_location;
        ibmBoundingBox = {
          top: face.top,
          left: face.left,
          width: face.width,
          height: face.height
        };
        $("#ibm_response").html(JSON.stringify(attributes, null, 4));
      }
      $("#ibm-toggle").removeClass('disabled');
    }


    function kairosDetectCallback(response) {
      var kairosJSON = JSON.parse(response.responseText);
      if ('Errors' in kairosJSON) {
        console.log('no images in face response');
        $("#kairos_response").html('No faces detected');
      } else {
        var attributes = kairosJSON.images[0].faces[0].attributes;
        $("#kairos_gender").html(getGender(attributes.gender.type));
        $("#kairos_age").html(attributes.age);
        var face = kairosJSON.images[0].faces[0];
        kairosBoundingBox = {
          top: face.topLeftY,
          left: face.topLeftX,
          width: face.width,
          height: face.height
        };
        $("#kairos_response").html(JSON.stringify(attributes, null, 4));
      }
      $("#kairos-toggle").removeClass('disabled');
      $("#results-button").prop('disabled', false);
      $('#kairos-toggle').click();
    }

    function googleDetectCallback(response) {
      var googleJSON = JSON.parse(response.responseText);
      if (!('faceAnnotations' in googleJSON.responses[0])) {
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
        googleBoundingBox = googleJSON.responses[0].faceAnnotations[0].fdBoundingPoly.vertices;
        $("#google_response").html(JSON.stringify(attributes, null, 4));
      }
      $("#google-toggle").removeClass('disabled');
    }

    function facePlusPlusDetectCallback(response) {
      var facePlusPlusJSON = response;
      if (!facePlusPlusJSON.faces[0]) {
        console.log('no images in face response');
        $("#faceplusplus_response").html('No faces detected');
      } else {
        var attributes = facePlusPlusJSON.faces[0].attributes;
        $("#faceplusplus_gender").html(getGender(attributes.gender.value));
        $("#faceplusplus_age").html(attributes.age.value);
        var face = facePlusPlusJSON.faces[0].face_rectangle;
        facePlusPlusBoundingBox = {
          top: face.top,
          left: face.left,
          width: face.width,
          height: face.height
        };
        $("#faceplusplus_response").html(JSON.stringify(attributes, null, 4));
      }
      $("#faceplusplus-toggle").removeClass('disabled');
    }

    function reset() {
      $('.toggle').addClass('disabled');
      $("#results-button").prop('disabled', true);

      // holder for the image data
      var global_image_data = null;
      var global_is_url = null;
      var global_ratio = null;

      $('.show').collapse('hide');

      $("#photoCanvas").hide();
      $("#loading").show();

      $("#kairos_response").html("<i>(Kairos response will appear here)</i>");
      // $("#betaface_response").html("<i>(Betaface response will appear here)</i>");
      $("#microsoft_response").html("<i>(Microsoft response will appear here)</i>");
      $("#ibm_response").html("<i>(IBM response will appear here)</i>");
      $("#google_response").html("<i>(Google response will appear here)</i>");
      $("#faceplusplus_response").html("<i>(Face++ response will appear here)</i>");

      kairosBoundingBox = null;
      microsoftBoundingBox = null;
      ibmBoundingBox = null;
      facePlusPlusBoundingBox = null;
      googleBoundingBox = null;
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
            var ratio = getConversionRatio(imageObj, 350, 350);
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
              google.detect(image_data, googleDetectCallback, is_url = false);
              microsoftBoundingBox = null;
            }
          };
          imageObj.src = e.target.result;
        };
        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
      }
      var dataReader = new FileReader();
      dataReader.onloadend = function(e) {
        microsoft.detect(e.target.result, microsoftDetectCallback, "returnFaceAttributes=age,gender", is_url = false);
      };
      dataReader.readAsArrayBuffer(file);

      var ibmFormData = new FormData();
      ibmFormData.append('images_file', file, file.name);
      ibm.detect(ibmFormData, ibmDetectCallback, is_url = false);

      var facePlusPlusFormData = new FormData();
      facePlusPlusFormData.append('image_file', file, file.name);
      faceplusplus.detect(facePlusPlusFormData, facePlusPlusDetectCallback, is_url = false);
    }


    function handleURLSelect(image_url) {
      $("#file").val('');
      var canvas = $('#photoCanvas')[0];
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      reset();
      var imageObj = new Image();

      imageObj.onload = function() {
        var ratio = getConversionRatio(imageObj, 350, 350);
        context.drawImage(imageObj, 0, 0, imageObj.width * ratio, imageObj.height * ratio);
        // $('#loading').show();
        global_image_data = imageObj.src;
        global_is_url = true;
        global_ratio = ratio;

        kairos.detect(imageObj.src, kairosDetectCallback);
        // betaface.detect(imageObj.src, betafaceDetectCallback, "classifiers", is_url = true);
        faceplusplus.detect(image_url, facePlusPlusDetectCallback, is_url = true);
        microsoft.detect(imageObj.src, microsoftDetectCallback, "returnFaceAttributes=age,gender", is_url = true);
        ibm.detect(imageObj.src, ibmDetectCallback, is_url = true);
        google.detect(imageObj.src, googleDetectCallback, is_url = true);
      };
      imageObj.src = image_url;
    }



    $('#file').change(
      function(evt) {
        if ($("#file").val !== '') {
          handleFileSelect(evt);
        }
      }
    );
    $('#submit_photo_url').click(
      function(evt) {
        var url = $("#photo_url").val();
        $("#photo_url").val('');
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

    $('#collapseKairos').on('shown.bs.collapse', function() {
      drawBoundingBox(kairosBoundingBox, 'blue');
    });
    // $('#collapseBetaface').on('shown.bs.collapse', function() { drawBoundingBox(); });
    $('#collapseMicrosoft').on('shown.bs.collapse', function() {
      drawBoundingBox(microsoftBoundingBox, 'green');
    });
    $('#collapseIBM').on('shown.bs.collapse', function() {
      drawBoundingBox(ibmBoundingBox, 'red');
    });
    $('#collapseGoogle').on('shown.bs.collapse', function() {
      drawGoogleBoundingBox(googleBoundingBox, 'yellow');
    });
    $('#collapseFacePlusPlus').on('shown.bs.collapse', function() {
      drawBoundingBox(facePlusPlusBoundingBox, 'purple');
    });

    $('.collapse').on('hide.bs.collapse', function() {
      drawBoundingBox();
      $(this).parent().hide();
    });

    $('.collapse').on('show.bs.collapse', function() {
      $(this).parent().show();
    });

    $('.toggle').click(function() {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');  
      } else {
        $('.active').removeClass('active');
        $(this).addClass('active');
      }
      
    });

    $('#sample1').click();

  });