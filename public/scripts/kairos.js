var Kairos = function(app_id, app_key) {
    this.app_id = app_id;
    this.app_key = app_key;
    this.api_host = 'https://api.kairos.com/';
};

/* Detect faces in an image
  @param image_data : this is the base64 data of the image
  @param callback   : your callback function will be called when the request completes 
  @param options    : [Optional] an object containing any additional parameters you wish to append to the request */
Kairos.prototype.detect = function(image_data, callback, options) {
    var data = { 'image': image_data };

    if (! $.isEmptyObject(options)) {
        data = $.extend(data, options);
    }

    var url = this.api_host + 'detect';
    var header_settings = {
        'Content-type': 'application/json',
        'app_id': this.app_id,
        'app_key': this.app_key
    };
    $.ajax(url, {
        headers: header_settings,
        type: 'POST',
        dataType: 'raw',
        data: JSON.stringify(data),
        success: callback,
        error: callback
    });
};
