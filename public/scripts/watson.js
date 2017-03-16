var Watson = function(api_key) {
	this.api_key = api_key;
    this.version = "2016-05-20";
    this.api_host = "https://gateway-a.watsonplatform.net/visual-recognition/api/";
};

Watson.prototype.detect = function(image_data, callback, is_url) {
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
            // data: JSON.stringify(data),
            data: data,
            dataType: 'raw',
            // processData: false,
            beforeSend: function(xhr){xhr.setRequestHeader('api_key', this.api_key);},
            success: callback,
            error: callback
        });
    } else {
    	var watson = this;
        header_settings = {}; 
        data = {
            'images_file': image_data,
            'version': this.version,
            'api_key': this.api_key
        };
    	// data = new FormData();
    	// data.append('images_file', image_data);
    	// data.append('version', watson.version);
    	// data.append('api_key', watson.api_key);
        
        $.ajax(url, {
            headers: {'api_key': this.api_key},
            type: 'POST',
            data: JSON.stringify(image_data),
            // data: data,
            dataType: 'raw',
            processData: false,
            crossDomain: true,
            // beforeSend: function(xhr){xhr.setRequestHeader('api_key', this.api_key); xhr.setRequestHeader('version', this.version);},
            success: callback,
            error: callback
        });
    }
};
