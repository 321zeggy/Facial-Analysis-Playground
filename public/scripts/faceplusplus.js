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
    var header_settings = {'return_attributes': 'age,gender'};
    // var header_settings = { 'api_key': this.api_key};
    var data;
    // console.log(image_data);
    if (is_url) {
        // url += '&image_url=' + image_data;
        data = {'image_url' : image_data};
    } else {
        // url += '&image_file=' + image_data;
        data = {'image_base64' : image_data};
    }
    // data[(is_url ? 'image_url' : 'image_file')] = image_data;
    
    $.ajax(url, {
        // headers: header_settings,
        type: 'POST',
        data: data,
        // dataType: 'json', // format of data returned by server
        success: callback,
        error: callback,
        // contentType: 'application/json',
        crossDomain: true
    });
};
