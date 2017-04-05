var IBM = function(api_key) {
	this.api_key = api_key;
    this.version = "2016-05-20";
    this.api_host = "https://gateway-a.watsonplatform.net/visual-recognition/api/";
};

IBM.prototype.detect = function(image_data, callback, is_url) {
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
            beforeSend: function(xhr){xhr.setRequestHeader('api_key', this.api_key);},
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
