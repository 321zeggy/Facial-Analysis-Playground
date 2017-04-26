var Kairos = {
    api_id: config.KAIROS_API_ID,
    api_key: config.KAIROS_API_KEY,
    api_host: 'https://api.kairos.com/'
};

/* Detect faces in an image */
Kairos.detect = function(image_data, callback) {
    $.ajax({
        url: this.api_host + 'detect',
        headers:  {'app_id': this.api_id, 'app_key': this.api_key},
        type: 'POST',
        data: JSON.stringify({'image': image_data}),
        dataType: 'raw', // format of data returned by server
        success: callback,
        error: callback,
        crossDomain: true
    });
};