var Betaface = function(api_key, api_secret) {
	this.api_key = api_key;
	this.api_secret = api_secret
	this.api_host = 'http://www.betafaceapi.com/service_json.svc/';
};

/* Authentication checker */
Betaface.prototype.authenticationProvided = function() {
	if ((!this.api_key) || (!this.api_secret)) {
		return false;
	}
	return true;
};

Betaface.prototype.uploadImage = function(detection_flags, image_data, is_url, callback) {
	var msg = {
		"api_key": this.api_key,
		"api_secret": this.api_secret,
		"detection_flags": detection_flags
	};

	if (is_url) {
		msg["url"] = image_data;
	} else {
		msg["image_base64"] = image_data;
	}

	var url = this.api_host + 'uploadImage';
	var betaface = this;

	var inner_callback = function(response) {
		var betafaceJSON = JSON.parse(response.responseText);
		if (betafaceJSON.int_response == 0) {
			betaface.getImageInfo(betafaceJSON.img_uid, callback);
		}
		// error
		else {
			console.info(betafaceJSON.int_response);
			console.info(betafaceJSON.string_response);
			return;
		}
	};

	$.support.cors = true;
	$.ajax(url, {
		crossDomain: true,
		type: 'post',
		contentType: 'application/json',
		data: JSON.stringify(msg),
		dataType: 'raw',
		success: inner_callback,
		error: inner_callback
	});
}

Betaface.prototype.getImageInfo = function(image_uid, callback) {
	var msg = {
		"api_key": this.api_key,
		"api_secret": this.api_secret,
		"img_uid": image_uid
	};

	var url = this.api_host + "GetImageInfo";
	var betaface = this;

	var inner_callback = function(response) {
		var betafaceJSON = JSON.parse(response.responseText);
		if (betafaceJSON.int_response == 1) {
			//image is in the queue
			setTimeout(function() {
				betaface.getImageInfo(image_uid, callback);
			}, 1000);
		} else if (betafaceJSON.int_response == 0) {
			//image processed
			callback(response);
		}
	};

	$.ajax(url, {
		crossDomain: true,
		type: 'post',
		contentType: 'application/json',
		data: JSON.stringify(msg),
		dataType: 'raw',
		success: inner_callback,
		error: inner_callback
	});
};

Betaface.prototype.detect = function(image_data, callback, detection_flags, is_url = false) {
	if (this.authenticationProvided() == false) {
		console.info('Betaface Error: set your api_key and api_secret before calling this method');
		return;
	} else {
		this.uploadImage(detection_flags, image_data, is_url, callback);
	}
};