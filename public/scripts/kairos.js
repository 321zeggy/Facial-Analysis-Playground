var Kairos = {
    api_id: config.KAIROS_API_ID,
    api_key: config.KAIROS_API_KEY,
    api_host: 'https://api.kairos.com/'
};

/* Detect faces in an image */
Kairos.detect = function(image_data, callback) {
    $.ajax({
        url: this.api_host + 'detect',
        headers: {
            'app_id': this.api_id,
            'app_key': this.api_key
        },
        type: 'POST',
        data: JSON.stringify({
            'image': image_data
        }),
        dataType: 'raw', // format of data returned by server
        success: callback,
        error: callback,
        crossDomain: true
    });
};

Kairos.handleResponse = function(response, scorecard) {
    var kairosJSON = JSON.parse(response.responseText);
    if ('Errors' in kairosJSON) {
        $('#comparison_table')
            .find('.kairos_gender, .kairos_age')
            .add('#kairos_response')
            .html('No face detected');
        scorecard.setKairosFaceDetected(false);
        return;
    } else {
        var attributes = kairosJSON.images[0].faces[0].attributes;
        $('#comparison_table')
            .find('.kairos_gender')
            .html((attributes.gender.type).toUpperCase()[0])
            .end()
            .find('.kairos_age')
            .html(attributes.age);
        scorecard.setKairosGender((attributes.gender.type).toUpperCase()[0]);
        scorecard.setKairosAge(parseInt(attributes.age));
        scorecard.setKairosFaceDetected(true);

        var face = kairosJSON.images[0].faces[0];
        var boundingBox = {
            top: face.topLeftY,
            left: face.topLeftX,
            width: face.width,
            height: face.height
        };
        $("#kairos_response").html(JSON.stringify(attributes, null, 4));
        return boundingBox;
    }
};