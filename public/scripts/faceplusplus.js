var FacePlusPlus = function(api_key, api_secret) {
    this.api_key = api_key;
    this.api_secret = api_secret;
    this.api_host = 'https://api-us.faceplusplus.com/facepp/v3/';
};

/* Detect faces in an image */
FacePlusPlus.prototype.detect = function(image_data, callback, is_url) {
    var url = this.api_host + 'detect';
    url += '?return_attributes=age,gender&';
    url += '&api_key=' + this.api_key + '&api_secret=' + this.api_secret;
    var data = {};
    if (is_url) {
        url += '&image_url=' + image_data;
    } else {
        data = image_data;
    }    
    $.ajax(url, {
        type: 'POST',
        data: data,
        processData: false,
        success: callback,
        error: callback,
        contentType: false,
    });
};
