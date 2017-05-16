  $(document).ready(function($) {
    $('#photoCanvas').parent().css('min-height', $('#photoCanvas').parent().width() + 50);
    $('#photoCanvas, #camera').css('width', '82%').css('height', $('#photoCanvas').width());

    $('#photoCanvas')[0].width = $('#photoCanvas').width();
    $('#photoCanvas')[0].height = $('#photoCanvas').height();

    $('[data-toggle="tooltip"]').tooltip();

    var scorecard;

    var global_image_data;
    var global_ratio;
    var global_is_sample;

    var boundingBoxes;
    var responsesCount;

    var camera;

    function incrementResponsesCount() {
      responsesCount += 1;
      if (responsesCount == 5) {
        scorecard.setFaceImage(global_image_data);
        $("#results-button").prop('disabled', false);
      }
    }


    // jQuery.urlShortener.settings.apiKey = 'AIzaSyDjW-G7go9ZMvuw0oBS6a_RGZgWKOGLxR8';

    function imageToDataUri(img, width, height) {
      // create an off-screen canvas
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      // set its dimension to target size
      canvas.width = width;
      canvas.height = height;

      // draw source image into the off-screen canvas:
      ctx.drawImage(img, 0, 0, width, height);

      // encode image to data-uri with base64 version of compressed image
      return canvas.toDataURL();
    }

    // drawing method
    function drawBoundingBox(face, color) {
      var imageObj = new Image();
      imageObj.onload = function() {
        var canvas = $('#photoCanvas')[0];
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(imageObj, 0, 0, imageObj.width * global_ratio, imageObj.height * global_ratio);

        if (face) {
          var top = face.top * global_ratio;
          var left = face.left * global_ratio;
          var width = face.width * global_ratio;
          var height = face.height * global_ratio;

          // draw face box
          context.beginPath();
          context.rect(left, top, width, height);
          context.lineWidth = 4;
          context.strokeStyle = color;
          context.stroke();
        }
        $('#photoCanvas').show();
      };
      imageObj.src = global_image_data;
    }

    function microsoftDetectCallback(response) {
      boundingBoxes.microsoft = Microsoft.handleResponse(response, scorecard);
      incrementResponsesCount();
      $('a[href="#microsoft_response"]').removeClass('disabled');
    }

    function ibmDetectCallback(response) {
      boundingBoxes.ibm = IBM.handleResponse(response, scorecard);
      incrementResponsesCount();
      $('#api-name').html('IBM');
      $('a[href="#ibm_response"]').removeClass('disabled').click();
      selectApi('ibm', 'red');
    }

    function kairosDetectCallback(response) {
      boundingBoxes.kairos = Kairos.handleResponse(response, scorecard);
      incrementResponsesCount();
      $('a[href="#kairos_response"]').removeClass('disabled');
    }

    function googleDetectCallback(response) {
      boundingBoxes.google = Google.handleResponse(response, scorecard);
      incrementResponsesCount();
      $('a[href="#google_response"]').removeClass('disabled');
    }

    function facePlusPlusDetectCallback(response) {
      boundingBoxes.faceplusplus = FacePlusPlus.handleResponse(response, scorecard);
      incrementResponsesCount();
      $('a[href="#faceplusplus_response"]').removeClass('disabled');
    }

    function reset() {
      $('#gender-age-display').hide();
      if (!global_is_sample) {
        scorecard = new ScoreCard();
      }
      FormStuff.init();
      responsesCount = 0;

      $('#no-face-detected, #detected-values').hide();

      global_image_data = null;
      global_ratio = null;

      $('.nav-link').addClass('disabled');
      $("#results-button").prop('disabled', true);

      var spinner = '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span>';
      $("#kairos_response, #microsoft_response, #ibm_response, #google_response, #faceplusplus_response").html(spinner);

      boundingBoxes = {
        kairos: undefined,
        microsoft: undefined,
        ibm: undefined,
        google: undefined,
        faceplusplus: undefined
      };
    }

    // get ratio by which to multiply image width and height in order to fit canvas
    function getConversionRatio(imageObj, maxWidth, maxHeight) {
      return Math.min(maxWidth / imageObj.width, maxHeight / imageObj.height);
    }


    function handleFileSelect(file) {
      reset();
      if (file.type.match('image.*')) { // Only process image files
        var reader = new FileReader();
        reader.onload = function(e) {
          var canvas = $('#photoCanvas')[0];
          var context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);

          var imageObj = new Image();
          imageObj.onload = function() {
            var ratio = getConversionRatio(imageObj, canvas.width, canvas.height);
            if (!global_ratio) {
              global_ratio = ratio;
              imageObj.src = imageToDataUri(imageObj, imageObj.width, imageObj.height);
            } else {
              context.drawImage(imageObj, 0, 0, imageObj.width * ratio, imageObj.height * ratio);
              $('#camera').hide();
              $('#photoCanvas').show();
              var image_data = String(imageObj.src);
              image_data = image_data.replace("data:image/jpeg;base64,", "");
              image_data = image_data.replace("data:image/jpg;base64,", "");
              image_data = image_data.replace("data:image/png;base64,", "");
              image_data = image_data.replace("data:image/gif;base64,", "");
              image_data = image_data.replace("data:image/bmp;base64,", "");
              global_image_data = 'data:image/jpeg;base64,' + image_data;

              Kairos.detect(image_data, kairosDetectCallback);
              Google.detect(image_data, googleDetectCallback, is_url = false);

              var dataReader = new FileReader();
              dataReader.onloadend = function(e) {
                Microsoft.detect(e.target.result, microsoftDetectCallback, is_url = false);
              };
              dataReader.readAsArrayBuffer(file);

              var ibmFormData = new FormData();
              ibmFormData.append('images_file', file, file.name);
              IBM.detect(ibmFormData, ibmDetectCallback, is_url = false);

              var facePlusPlusFormData = new FormData();
              facePlusPlusFormData.append('image_file', file, file.name);
              FacePlusPlus.detect(facePlusPlusFormData, facePlusPlusDetectCallback, is_url = false);
            }

          };
          imageObj.src = e.target.result;
        };
        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
      }
    }


    function handleURLSelect(image_url) {
      $("#file").val('');
      var canvas = $('#photoCanvas')[0];
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      reset();
      var imageObj = new Image();

      imageObj.onload = function() {
        var ratio = getConversionRatio(imageObj, canvas.width, canvas.height);
        context.drawImage(imageObj, 0, 0, imageObj.width * ratio, imageObj.height * ratio);
        global_image_data = imageObj.src;
        global_ratio = ratio;

        Kairos.detect(imageObj.src, kairosDetectCallback);
        FacePlusPlus.detect(image_url, facePlusPlusDetectCallback, is_url = true);
        Microsoft.detect(imageObj.src, microsoftDetectCallback, is_url = true);
        IBM.detect(imageObj.src, ibmDetectCallback, is_url = true);
        Google.detect(imageObj.src, googleDetectCallback, is_url = true);
      };
      imageObj.src = image_url;
    }

    var FormStuff = {

      init: function() {
        document.getElementById('actual_values_form').reset();
        this.applyConditionalRequired();
        this.bindUIActions();
      },

      bindUIActions: function() {
        $("input[type='radio'], input[type='checkbox']").on("change", this.applyConditionalRequired);
      },

      applyConditionalRequired: function() {

        $(".require-if-active").each(function() {
          var el = $(this);
          if ($(el.data("require-pair")).is(":checked")) {
            el.prop("required", true);
            el.parents('.reveal-if-active').addClass('revealed');
          } else {
            el.prop("required", false);
            el.parents('.reveal-if-active').removeClass('revealed');
          }
        });

      }

    };

    FormStuff.init();

    $('#file').change(function(evt) {
      $('#camera').hide();
      if ($("#file").val !== '') {
        global_is_sample = false;
        var file = evt.target.files[0];
        handleFileSelect(file);
      }
    });

    $('#submit_photo_url').click(function(evt) {
      if ($('#photo_url').val() !== '') {
        $('#camera').hide();
        global_is_sample = false;
        handleURLSelect($("#photo_url").val());
        $("#photo_url").val('');
        // jQuery.urlShortener({
        //   longUrl: $("#photo_url").val(),
        //   success: function(shortUrl) {
        //     $("#photo_url").val('');
        //     handleURLSelect(shortUrl);
        //   },
        //   error: function(longUrl) {
        //     $("#photo_url").val('');
        //     handleURLSelect(longUrl);
        //   }
        // });
      }
      return false;
    });

    function dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
      else
        byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], {
        type: mimeString
      });
    }

    $('.sample-img').click(function(evt) {
      $('#camera').hide();
      global_is_sample = true;
      scorecard = new ScoreCard();
      var url = $(this).attr('src');
      var attributes = url.substring(url.indexOf('-') + 1, url.indexOf('.')).split('-');
      for (i = 0; i < attributes.length; i++) {
        switch (attributes[i].split('_')[0]) {
          case 'gender':
            var actual_gender = attributes[i].split('_')[1];
            scorecard.setGender(actual_gender);
            break;
          case 'age':
            var actual_age = attributes[i].split('_')[1];
            scorecard.setAge(actual_age);
            break;
          case 'ethnicity':
            var actual_ethnicity = attributes[i].split('_')[1];
            scorecard.setEthnicity(actual_ethnicity);
            break;
        }

      }
      var imageObj = new Image();
      imageObj.onload = function() {
        var blob = dataURItoBlob(imageToDataUri(imageObj, imageObj.width, imageObj.height));
        blob.name = 'blob.png';
        handleFileSelect(blob);
      };
      imageObj.src = url;

      return false;
    });

    var selectApi = function(api, color) {
      drawBoundingBox(boundingBoxes[api], color);
      var faceDetected = $('#comparison_table .' + api + '_gender').html() != 'No face detected';
      $('#no-face-detected').toggle(!faceDetected);
      $('#detected-values').toggle(faceDetected);
      if (faceDetected) {
        $('#detected-values')
          .find('.gender').html($('#comparison_table .' + api + '_gender').html())
          .end()
          .find('.age').html($('#comparison_table .' + api + '_age').html());
      }
      $('#gender-age-display').show();
    };

    $('#apis_nav .nav-link').on('show.bs.tab', function() {
      switch( $(this).attr('href') ) {
        case '#ibm_response':
          $('#api-name').html('IBM');
          selectApi('ibm', 'red');
          break;
        case '#microsoft_response':
          $('#api-name').html('Microsoft');
          selectApi('microsoft', 'green');
          break;
        case '#faceplusplus_response':
          $('#api-name').html('Face++');
          selectApi('faceplusplus', 'purple');
          break;
        case '#kairos_response':
          $('#api-name').html('Kairos');
          selectApi('kairos', 'blue');
          break;
        case '#google_response':
          drawBoundingBox(boundingBoxes.google, 'yellow');
          $('#api-name').html('Google');
          $('#gender-display, #age-display').html('NA');
          $('#no-face-detected').hide();
          $('#detected-values').show();
      }
    });

    $('button.modal-1.usr-img-modal').click(function() {
      $('.modal-2').show();
      $('.modal-1, .sample-img-modal').hide();
    });


    $('button.modal-1.sample-img-modal').click(function() {
      scorecard.updateTotalScore();
      $('#download').addClass('disabled');
      $('.modal-1').hide();
      $('.modal-3').show();
      $('.usr-img-modal').hide();
      $('.modal').scrollTop(0);
      html2canvas($('.modal-body')[0], {
        allowTaint: true,
        background: '#fff',
        height: $('.modal-body').outerHeight()
      }).then(function(canvas) {
        $('#download').removeClass('disabled')[0].href = canvas.toDataURL();
      });
    });

    $('button.modal-2.btn-primary').click(function() {
      $('input.modal-2.btn-primary').click();
    });

    $('input.modal-2.btn-primary').click(function() {
      $('#actual_values_form').submit();
      $('.sample-img-modal').hide();
    });

    $('button.modal-2.btn-secondary').click(function() {
      $('.modal-1').show();
      $('.modal-2, .sample-img-modal').hide();
    });

    $('button.modal-3.usr-img-modal').click(function() {
      $('.modal-2').show();
      $('.modal-3, .sample-img-modal').hide();
    });

    $('button.modal-3.sample-img-modal').click(function() {
      $('.modal-1').show();
      $('.modal-3, .usr-img-modal').hide();
    });

    $('#actual_values_form').submit(function() {
      var gender, age;
      scorecard.setGender();
      if ($('.choice-gender[name="choice-attributes"]:checked').length > 0) {
        var $gender = $('input[name="gender"]:checked');
        if ($gender.length == 1) {
          scorecard.setGender($gender.val());
        } else {
          return false;
        }
      }
      scorecard.setAge();
      if ($('.choice-age[name="choice-attributes"]:checked').length > 0) {
        var $age = $('input[name="age"]');
        if ($.isNumeric($age.val()) && Number($age.attr('min')) <= $age.val() && Number($age.attr('max')) >= $age.val()) {
          scorecard.setAge($age.val());
        } else {
          return false;
        }
      }
      scorecard.setEthnicity();
      if ($('.choice-ethnicity[name="choice-attributes"]:checked').length > 0) {
        var $ethnicity = $('input[name="ethnicity"]');
        if ($ethnicity.val() !== '') {
          scorecard.setEthnicity($ethnicity.val());
        } else {
          return false;
        }
      }
      scorecard.updateTotalScore();
      $('#download').addClass('disabled');
      $('#myModal')
        .find('.modal-3')
        .show()
        .end()
        .find('.modal-2, .sample-img-modal')
        .hide()
        .end()
        .scrollTop(0);
      html2canvas($('#scorecard')[0], {
        allowTaint: true,
        background: '#fff',
        height: $('#scorecard').outerHeight()
      }).then(function(canvas) {
        $('#download').removeClass('disabled')[0].href = canvas.toDataURL();
      });
      return false;
    });

    $('#results-button, button.modal-3.sample-img-modal').click(function() {
      FormStuff.init();
      $('.modal-1').show();
      $('.modal-2, .modal-3').hide();
      if (global_is_sample) {
        $('.usr-img-modal').hide();
      } else {
        $('.sample-img-modal').hide();
      }
    });

    $('#camera-button').click(function() {
      if ($(this).filter('.btn-outline-success').length == 1) {
        $('#camera').show();
        $('#photoCanvas').hide();
        camera = new JpegCamera(container = "#camera").ready(function() {
          this.show_stream();
          $('#photoCanvas, #gender-age-display').hide();
          $('#camera-button.btn-outline-success')
            .addClass('btn-success')
            .removeClass('btn-outline-success')
            .html('Take Snapshot <i class="fa fa-camera" aria-hidden="true"></i>');
        });
      } else if ($(this).filter('.btn-success').length == 1) {
        $('#countdown').TimeCircles().restart().end().show();
        $(this)
          .removeClass('btn-success')
          .addClass('btn-outline-success')
          .html('Webcam');
      }
    });

    $('#countdown').TimeCircles({
      time: {
        Days: {
          show: false
        },
        Hours: {
          show: false
        },
        Minutes: {
          show: false
        },
        Seconds: {
          color: "#C0C8CF"
        }
      },
      total_duration: 4,
      start: false
    });
    $('#countdown').TimeCircles({
      count_past_zero: false
    }).addListener(countdownComplete).end().hide();

    function countdownComplete(unit, value, total) {
      if (total <= 0) {
        $(this).hide();
        var snapshot = camera.capture({
          mirror: true
        });
        snapshot.show();
        snapshot.get_blob(function(blob) {
          blob.name = 'snapshot.png';
          global_is_sample = false;
          camera.stop();
          handleFileSelect(blob);
        });
      }
    }

    $('#sample1').click();

  });