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
