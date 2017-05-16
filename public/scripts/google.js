var Google = {
    api_key: config.GOOGLE_API_KEY,
    api_host: 'https://vision.googleapis.com/v1/'
};

/* Detect faces in an image */
Google.detect = function(image_data, callback, is_url) {

    var image = is_url ? { 'source': { 'imageUri': image_data } } : { 'content': image_data };
    var data = {
        'requests': [{
            'image': image,
            'features': [{ 'type': 'FACE_DETECTION' }]
        }]
    };

    var url = this.api_host + 'images:annotate?key=' + this.api_key;

    $.ajax(url, {
        type: 'POST',
        headers: {'Content-type': 'application/json'},
        data: JSON.stringify(data),
        processData: false,
        dataType: 'raw',
        success: callback,
        error: callback
    });
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