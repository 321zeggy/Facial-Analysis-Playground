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
    var header_settings = { 
    	'Ocp-Apim-Subscription-Key': this.api_key_1,
    	'Content-type': 'application/json'
    };

    var data;
    // if (is_url) {
        data = JSON.stringify({'url': image_data });
        header_settings['Content-type'] = 'application/json';
        $.ajax(url, {
        headers: header_settings,
        type: 'POST',
        data: data,
        dataType: 'raw',
        processData: false,
        success: callback,
        error: callback
    });
    // } else {
    // 	var xhr = new XMLHttpRequest();
    // 	xhr.open('GET', 'image_data/' + image_data, true);
    // 	xhr.send();

    //     data = image_data;
    //     header_settings['Content-type'] = 'application/octet-stream';
    // }

    // $.ajax(url, {
    //     headers: header_settings,
    //     type: 'POST',
    //     data: data,
    //     dataType: 'raw',
    //     processData: false,
    //     success: callback,
    //     error: callback
    // });
};
