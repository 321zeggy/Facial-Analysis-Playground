var Microsoft = function(api_key_1, api_key_2) {
    this.api_key_1 = api_key_1;
    this.api_key_2 = api_key_2;
    this.api_host = 'https://westus.api.cognitive.microsoft.com/face/v1.0/';
};

Microsoft.prototype.detect = function(image_data, callback, options, is_url) {
    var url = this.api_host + 'detect';
    if (options) { url += '?' + options; }
    var data;
    var header_settings = { 'Ocp-Apim-Subscription-Key': this.api_key_1 };
    if (is_url) {
        header_settings['Content-type'] = 'application/json';
        data = JSON.stringify({ 'url': image_data });
    } else {
        header_settings['Content-type'] = 'application/octet-stream';
        data = image_data;
    }

    $.ajax(url, {
        headers: header_settings,
        type: 'POST',
        data: data,
        dataType: 'raw',
        processData: false,
        success: callback,
        error: callback
    });
};
