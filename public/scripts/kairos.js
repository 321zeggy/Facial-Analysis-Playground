/* * * Kairos Javascript SDK * * * *
* Authored by Eric Turner 
* http://kairos.com
*/



// "app_id: 10f87749" -H "app_key: 5683a80e0c5b3845b5b07a027037ddab"
/* Constructor - Creates and returns an instance of the Kairos client
  @param app_id  : your app_id
  @param app_key : your app_key */
var Kairos = function(app_id, app_key) 
{
  this.app_id   = app_id;
  this.app_key  = app_key;
  this.api_host = 'https://api.kairos.com/';
};


/* Authentication checker */
Kairos.prototype.authenticationProvided = function() {
    
  if((!this.app_key) || (!this.app_id))
  {
      return false;
  }

  return true;
}



/* Detect faces in an image
  @param image_data : this is the base64 data of the image
  @param callback   : your callback function will be called when the request completes 
  @param options    : [Optional] an object containing any additional parameters you wish to append to the request */
Kairos.prototype.detect = function(image_data, callback, options) {

  if(this.authenticationProvided() == false) {
    console.log('Kairos Error: set your app_id and app_key before calling this method');
    return;
  }

  if(!image_data) {
    console.log('Kairos Error: the image_data parameter is required');
    return;
  }

  if(!callback || !jQuery.isFunction(callback)) {
    console.log('Kairos Error: the callback parameter is required and must be of type [function]');
    return;
  }
  
  var url = this.api_host + 'detect';

	var data = { 'image' : image_data };

  if(!jQuery.isEmptyObject(options)) {
      data = jQuery.extend(data, options);
  }

	var header_settings = {
		'Content-type': 'application/json',
    'app_id': this.app_id,
    'app_key': this.app_key
  };

	jQuery.ajax(url, {
      headers  : header_settings,
      type     : 'POST',
      dataType : 'raw',
      data     : JSON.stringify(data),
      success  : callback,
      error    : callback
    });
};

