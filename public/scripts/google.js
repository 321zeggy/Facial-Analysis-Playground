var Google = function(api_key) {
    this.api_key = api_key;
    this.api_host = 'https://vision.googleapis.com/v1/';
};

/* Detect faces in an image */
Google.prototype.detect = function(image_data, callback, is_url) {

    if (is_url) {
        image = { 'source': { 'imageUri': image_data } };
    } else {
        image = { 'content': image_data };
    }

    var data = {
        'requests': [{
            'image': image,
            'features': [{ 'type': 'FACE_DETECTION' }]
        }]
    };

    var url = this.api_host + 'images:annotate?key=' + this.api_key;
    var header_settings = {
        'Content-type': 'application/json'
            // 'key': this.api_key
    };

    // $.support.cors = true;
    $.ajax(url, {
        headers: header_settings,
        type: 'POST',
        dataType: 'raw',
        processData: false,
        data: JSON.stringify(data),
        success: callback,
        error: callback
    });
};
