var Kairos = function(api_id, api_key) {
    this.api_id = api_id;
    this.api_key = api_key;
    this.api_host = 'https://api.kairos.com/';
};

/* Detect faces in an image */
Kairos.prototype.detect = function(image_data, callback) {
    var url = this.api_host + 'detect';
    var data = { 'image': image_data };
    var header_settings = { 'app_id': this.api_id, 'app_key': this.api_key };

    $.ajax(url, {
        headers: header_settings,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'raw', // format of data returned by server
        success: callback,
        error: callback,
        crossDomain: true
    });
};
