var Microsoft = {
    api_key: config.MICROSOFT_KEY_1,
    api_host: 'https://westus.api.cognitive.microsoft.com/face/v1.0/'
};

Microsoft.detect = function(image_data, callback, is_url) {
    var data;
    var header_settings = {
        'Ocp-Apim-Subscription-Key': this.api_key
    };
    if (is_url) {
        header_settings['Content-type'] = 'application/json';
        data = JSON.stringify({
            'url': image_data
        });
    } else {
        header_settings['Content-type'] = 'application/octet-stream';
        data = image_data;
    }

    $.ajax({
        url: this.api_host + 'detect?returnFaceAttributes=age,gender',
        headers: header_settings,
        type: 'POST',
        data: data,
        dataType: 'raw',
        processData: false,
        success: callback,
        error: callback
    });
};

Microsoft.handleResponse = function(response, scorecard) {
    var microsoftJSON = JSON.parse(response.responseText);
    if (!microsoftJSON[0]) {
        scorecard.setMicrosoftFaceDetected(false);
        $('#comparison_table')
            .find('.microsoft_gender, .microsoft_age')
            .add('#microsoft_response')
            .html('No face detected');
        return;
    } else {
        var attributes = microsoftJSON[0].faceAttributes;
        $('#comparison_table')
            .find('.microsoft_gender')
            .html((attributes.gender).toUpperCase()[0])
            .end()
            .find('.microsoft_age')
            .html(attributes.age);
        scorecard.setMicrosoftGender((attributes.gender).toUpperCase()[0]);
        scorecard.setMicrosoftAge(parseFloat(attributes.age));
        scorecard.setMicrosoftFaceDetected(true);

        var face = microsoftJSON[0].faceRectangle;
        var boundingBox = {
            top: face.top,
            left: face.left,
            width: face.width,
            height: face.height
        };
        $("#microsoft_response").html(JSON.stringify(attributes, null, 4));
        return boundingBox;
    }
};