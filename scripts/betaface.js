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

Betaface.prototype.uploadImage = function(detection_flags, image_data, is_url) {
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

	console.log(msg);

	var url = this.api_host + 'uploadImage';

	var callback = function(response) {
		console.log(response);
		var betafaceJSON = JSON.parse(response.responseText);
		if (betafaceJSON.int_response == 0) {
			console.log(betafaceJSON.img_uid);
			return betafaceJSON.img_uid;
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
		success: callback,
		error: callback
	});
}

Betaface.prototype.getImageInfo = function(image_uid) {
	var msg = {
		"api_key": this.api_key,
		"api_secret": this.api_secret,
		"img_uid": image_uid
	};

	var url = this.api_host + "GetImageInfo";

	var callback = function(response) {
		var betafaceJSON = JSON.parse(response.responseText);
		if (betafaceJSON.int_response == 1) {
			//image is in the queue
			setTimeout(function() {
				getImageInfo(image_uid);
			}, 500);
		} else if (betafaceJSON.int_response == 0) {
			//image processed
			return response;
		}
	};

	$.ajax(url, {
		crossDomain: true,
		type: 'post',
		contentType: 'application/json',
		data: JSON.stringify(msg),
		dataType: 'raw',
		success: callback,
		error: callback
	});
};

Betaface.prototype.detect = function(image_data, callback, detection_flags, is_url = false) {
	if (this.authenticationProvided() == false) {
		console.log('Betaface Error: set your api_key and api_secret before calling this method');
		return;
	} else {
		var img_uid = this.uploadImage(detection_flags, image_data, is_url);
		console.log(img_uid);
		return this.getImageInfo(img_uid);
	}
};