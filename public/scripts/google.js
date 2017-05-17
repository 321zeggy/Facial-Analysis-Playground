var Google = {
  api_key: config.GOOGLE_API_KEY,
  api_host: 'https://vision.googleapis.com/v1/'
};

/* Detect faces in an image */
Google.detect = function(image_data, callback, is_url) {
  var imageObj = new Image();
  imageObj.onload = function() {
    var image;
    if (is_url) {
      image = {
        'source': {
          'imageUri': image_data
        }
      };
    } else {
      var dataString = String(imageToDataUri(imageObj, imageObj.width, imageObj.height));
      dataString = dataString.replace("data:image/jpeg;base64,", "");
      dataString = dataString.replace("data:image/jpg;base64,", "");
      dataString = dataString.replace("data:image/png;base64,", "");
      dataString = dataString.replace("data:image/gif;base64,", "");
      dataString = dataString.replace("data:image/bmp;base64,", "");
      image = {
        'content': dataString
      };
    }
    var data = {
      'requests': [{
        'image': image,
        'features': [{
          'type': 'FACE_DETECTION'
        }]
      }]
    };
    var url = Google.api_host + 'images:annotate?key=' + Google.api_key;
    $.ajax(url, {
      type: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      data: JSON.stringify(data),
      processData: false,
      dataType: 'raw',
      success: callback,
      error: callback
    });
  };

  if (is_url) {
    imageObj.src = image_data;
  } else {
    var reader = new FileReader();
    reader.onload = function(e) {
      imageObj.src = e.target.result;
    };
    reader.readAsDataURL(image_data);
  }



};


Google.handleResponse = function(response, scorecard) {
  var googleJSON = JSON.parse(response.responseText);
  if (('error' in googleJSON.responses[0])) {
    $("#google_response").html('Photo incompatible with Google');
    scorecard.setGoogleFaceDetected(false);
    return;
  } else if (!('faceAnnotations' in googleJSON.responses[0])) {
    $("#google_response").html('No face detected');
    scorecard.setGoogleFaceDetected(false);
    return;
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
    var face = googleJSON.responses[0].faceAnnotations[0].fdBoundingPoly.vertices;

    var boundingBox = {
      top: face[0].y,
      left: face[0].x,
      width: face[2].x - face[0].x,
      height: face[2].y - face[0].y
    };
    $("#google_response").html(JSON.stringify(attributes, null, 4));
    scorecard.setGoogleFaceDetected(true);
    return boundingBox;
  }
}