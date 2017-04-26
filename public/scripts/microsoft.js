var Microsoft = {
    api_key: config.MICROSOFT_KEY_1,
    api_host: 'https://westus.api.cognitive.microsoft.com/face/v1.0/'
};

Microsoft.detect = function(image_data, callback, is_url) {
    var data;
    var header_settings = { 'Ocp-Apim-Subscription-Key': this.api_key };
    if (is_url) {
        header_settings['Content-type'] = 'application/json';
        data = JSON.stringify({ 'url': image_data });
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
