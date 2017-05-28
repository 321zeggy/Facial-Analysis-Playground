var Kairos = {
    api_id: config.KAIROS_API_ID,
    api_key: config.KAIROS_API_KEY,
    api_host: 'https://api.kairos.com/'
};

// send facial analysis request to Kairos's API
Kairos.detect = function(image_data, callback, is_url) {
    var imageObj = new Image();
    imageObj.onload = function() {
        if (is_url) {
            data = image_data;
        } else {
            data = String(imageToDataURI(imageObj));
            data = data.replace("data:image/jpeg;base64,", "");
            data = data.replace("data:image/jpg;base64,", "");
            data = data.replace("data:image/png;base64,", "");
            data = data.replace("data:image/gif;base64,", "");
            data = data.replace("data:image/bmp;base64,", "");
        }
        $.ajax({
            url: Kairos.api_host + 'detect',
            headers: {
                'app_id': Kairos.api_id,
                'app_key': Kairos.api_key
            },
            type: 'POST',
            data: JSON.stringify({
                'image': data
            }),
            dataType: 'raw', // format of data returned by server
            success: callback,
            error: callback,
            crossDomain: true
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

// process Kairos's API's facial analysis response
Kairos.handleResponse = function(response, scorecard) {
    var kairosJSON = JSON.parse(response.responseText);
    if ('Errors' in kairosJSON) {
        $('#comparison_table')
            .find('.kairos_gender, .kairos_age')
            .add('#kairos-response')
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
        $("#kairos-response").html(JSON.stringify(attributes, null, 4));
        return boundingBox;
    }
};