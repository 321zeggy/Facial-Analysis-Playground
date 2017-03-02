var Microsoft = function(api_key_1, api_key_2) {
    this.api_key_1 = api_key_1;
    this.api_key_2 = api_key_2;
    this.api_host = 'https://westus.api.cognitive.microsoft.com/face/v1.0/'
};

Microsoft.prototype.detect = function(image_data, callback, options, is_url = false) {
    var url = this.api_host + 'detect';
    if (options) {
        url += '?' + options;
    }
    console.log(typeof new Blob([image_data]));
    var header_settings = { 'Ocp-Apim-Subscription-Key': this.api_key_1 };

    var data;
    if (is_url) {
        data = JSON.stringify({ 'url': image_data });
        header_settings['Content-type'] = 'application/json';
    } else {
        data = new Blob([image_data]);
        header_settings['Content-type'] = 'application/octet-stream';
    }

    $.ajax(url, {
        headers: header_settings,
        type: 'POST',
        data: data,
        processData: false,
        success: callback,
        error: callback
    });
};
