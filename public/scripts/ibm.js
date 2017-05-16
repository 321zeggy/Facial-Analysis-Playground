var IBM = {
    api_key: config.IBM_API_KEY,
    version: "2016-05-20",
    api_host: "https://gateway-a.watsonplatform.net/visual-recognition/api/"
};

IBM.detect = function(image_data, callback, is_url) {
    var url = this.api_host + 'v3/detect_faces';
    var header_settings = {};
    var data;
    if (is_url) {
        data = {
            'url': image_data,
            'version': this.version,
            'api_key': this.api_key
        };

        $.ajax(url, {
            headers: header_settings,
            type: 'GET',
            data: data,
            dataType: 'raw',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('api_key', this.api_key);
            },
            success: callback,
            error: callback
        });
    } else {
        url += '?api_key=' + this.api_key + '&version=' + this.version;
        $.ajax(url, {
            type: 'POST',
            data: image_data,
            dataType: 'raw',
            processData: false,
            contentType: false,
            success: callback,
            error: callback
        });
    }
};

IBM.handleResponse = function(response, scorecard) {
    var ibmJSON = JSON.parse(response.responseText);
    if (!ibmJSON.images[0].faces[0]) {
        $("#comparison_table")
            .find('.ibm_gender, .ibm_age')
            .add('#ibm_response')
            .html('No face detected');
        scorecard.setIBMFaceDetected(false);
        return;
    } else {
        var attributes = ibmJSON.images[0].faces[0];
        attributes = {
            "gender": attributes.gender,
            "age": attributes.age
        };
        scorecard.setIBMGender((attributes.gender.gender).toUpperCase()[0]);
        $("#comparison_table .ibm_gender")
            .html((attributes.gender.gender).toUpperCase()[0]);
        if ('min' in attributes.age) {
            if ('max' in attributes.age) {
                scorecard.setIBMAge(
                    min_age = parseInt(attributes.age.min),
                    max_age = parseInt(attributes.age.max)
                );
                $("#comparison_table .ibm_age")
                    .html(attributes.age.min + '-' + attributes.age.max);
            } else {
                $("#comparison_table .ibm_age")
                    .html(attributes.age.min);
                scorecard.setIBMAge(min_age = parseInt(attributes.age.min));
            }
        } else {
            scorecard.setIBMAge(max_age = parseInt(attributes.age.max));
            $("#comparison_table .ibm_age").html(attributes.age.max);
        }
        scorecard.setIBMFaceDetected(true);
        var face = ibmJSON.images[0].faces[0].face_location;
        var boundingBox = {
            top: face.top,
            left: face.left,
            width: face.width,
            height: face.height
        };
        $("#ibm_response").html(JSON.stringify(attributes, null, 4));
        return boundingBox;

    }
}