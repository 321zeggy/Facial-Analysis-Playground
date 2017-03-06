var Watson = function(api_key) {
    this.api_key = api_key;
    this.version = "2016-05-20";
    this.api_host = "https://gateway-a.watsonplatform.net/visual-recognition/api/";
};

Watson.prototype.detect = function(image_data, callback, is_url = false) {
    var url = this.api_host + 'v3/detect_faces';
    var header_settings = {
        // 'api_key': this.api_key,
    };

    var data;
    if (is_url) {
        data = {
            url: image_data,
            version: this.version,
            api_key: this.api_key
        };

        $.ajax(url, {
            headers: header_settings,
            type: 'GET',
            data: data,
            dataType: 'raw',
            // processData: false,
            success: callback,
            error: callback
        });
    } else {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'image_data/' + image_data, true);
        xhr.send();

        data = image_data;
    }

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
