var FacePlusPlus = function(api_key, api_secret) {
    this.api_key = api_key;
    this.api_secret = api_secret;
    this.api_host = 'https://api-us.faceplusplus.com/facepp/v3/';
};

/* Detect faces in an image */
FacePlusPlus.prototype.detect = function(image_data, callback, is_url) {
    var url = this.api_host + 'detect';
    var data = {'return_attributes': 'age,gender', 'api_secret': this.api_secret, 'api_key': this.api_key, };
    var header_settings = { 'api_key': this.api_key};

    data[(is_url ? 'image_url' : 'image_file')] = image_data;
    
    $.ajax(url, {
        headers: header_settings,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'raw', // format of data returned by server
        success: callback,
        error: callback,
        contentType: 'application/json',
        crossDomain: true
    });
};
