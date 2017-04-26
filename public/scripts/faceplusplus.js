var FacePlusPlus = {
    api_key: config.FACEPLUSPLUS_API_KEY,
    api_secret: config.FACEPLUSPLUS_API_SECRET,
    api_host: 'https://api-us.faceplusplus.com/facepp/v3/'
};

/* Detect faces in an image */
FacePlusPlus.detect = function(image_data, callback, is_url) {
    var url = this.api_host + 'detect';
    url += '?return_attributes=age,gender&';
    url += '&api_key=' + this.api_key + '&api_secret=' + this.api_secret;
    var data;
    if (is_url) {
        data = {};
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
