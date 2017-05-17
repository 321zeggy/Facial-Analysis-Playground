var Microsoft = {
    api_key: config.MICROSOFT_KEY_1,
    api_host: 'https://westus.api.cognitive.microsoft.com/face/v1.0/'
};

Microsoft.detect = function(image_data, callback, is_url) {
    var header_settings = {
        'Ocp-Apim-Subscription-Key': Microsoft.api_key
    };
    if (is_url) {
        header_settings['Content-type'] = 'application/json';
        $.ajax({
            url: Microsoft.api_host + 'detect?returnFaceAttributes=age,gender',
            headers: header_settings,
            type: 'POST',
            data: JSON.stringify({
                'url': image_data
            }),
            dataType: 'raw',
            processData: false,
            success: callback,
            error: callback
        });
    } else {
        header_settings['Content-type'] = 'application/octet-stream';
        var dataReader = new FileReader();
        dataReader.onloadend = function(e) {
            $.ajax({
                url: Microsoft.api_host + 'detect?returnFaceAttributes=age,gender',
                headers: header_settings,
                type: 'POST',
                data: e.target.result,
                dataType: 'raw',
                processData: false,
                success: callback,
                error: callback
            });
        };
        dataReader.readAsArrayBuffer(image_data);
    }
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