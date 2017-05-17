  $(document).ready(function($) {
    $('#photoCanvas').parent().css('min-height', $('#photoCanvas').parent().width() + 50);
    $('#photoCanvas, #camera').css('width', '82%').css('height', $('#photoCanvas').width());

    $('#photoCanvas')[0].width = $('#photoCanvas').width();
    $('#photoCanvas')[0].height = $('#photoCanvas').height();

    $('[data-toggle="tooltip"]').tooltip();
    $('#snapshot-button').hide();

    var scorecard;

    var global_image_data;
    var global_ratio;
    var global_is_sample;

    var boundingBoxes;
    var responsesCount;

    var camera;


    /* Upload and Process Image */

    function incrementResponsesCount() {
      responsesCount += 1;
      if (responsesCount == 5) {
        scorecard.setFaceImage(global_image_data);
        $("#results-button").prop('disabled', false);
      }
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

    function reset(image, scaling_factor) {
      $('#gender-age-display').hide();

      var spinner = '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span>';
      $("#kairos_response, #microsoft_response, #ibm_response, #google_response, #faceplusplus_response").html(spinner);

      // scorecards for samples are already reset, so reset for non-sample images 
      if (!global_is_sample) {
        scorecard = new ScoreCard();
      }
      FormStuff.init();
      responsesCount = 0;

      global_image_data = image;
      global_ratio = scaling_factor;

      $('.nav-link').addClass('disabled');
      $("#results-button").prop('disabled', true);

      boundingBoxes = {
        kairos: undefined,
        microsoft: undefined,
        ibm: undefined,
        google: undefined,
        faceplusplus: undefined
      };

      $('#camera').hide();
      $('#photoCanvas').show();
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
            context.drawImage(imageObj, 0, 0, imageObj.width * ratio, imageObj.height * ratio);

            var image_data = String(imageToDataUri(imageObj, imageObj.width, imageObj.height));
            image_data = image_data.replace("data:image/jpeg;base64,", "");
            image_data = image_data.replace("data:image/jpg;base64,", "");
            image_data = image_data.replace("data:image/png;base64,", "");
            image_data = image_data.replace("data:image/gif;base64,", "");
            image_data = image_data.replace("data:image/bmp;base64,", "");
            reset('data:image/jpeg;base64,' + image_data, ratio);

            Kairos.detect(file, kairosDetectCallback, is_url = false);
            Google.detect(file, googleDetectCallback, is_url = false);
            Microsoft.detect(file, microsoftDetectCallback, is_url = false);
            IBM.detect(file, ibmDetectCallback, is_url = false);
            FacePlusPlus.detect(file, facePlusPlusDetectCallback, is_url = false);
          };
          imageObj.src = e.target.result;
        };
        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
      }
    }


    function handleURLSelect(image_url) {
      // update the file input in case it still displays the name of a previously uploaded file
      $("#file").val('');
      var canvas = $('#photoCanvas')[0];
      var context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
      var imageObj = new Image();

      imageObj.onload = function() {
        var ratio = getConversionRatio(imageObj, canvas.width, canvas.height);
        context.drawImage(imageObj, 0, 0, imageObj.width * ratio, imageObj.height * ratio);
        reset(imageObj.src, ratio);

        Kairos.detect(imageObj.src, kairosDetectCallback, is_url = true);
        FacePlusPlus.detect(image_url, facePlusPlusDetectCallback, is_url = true);
        Microsoft.detect(imageObj.src, microsoftDetectCallback, is_url = true);
        IBM.detect(imageObj.src, ibmDetectCallback, is_url = true);
        Google.detect(imageObj.src, googleDetectCallback, is_url = true);
      };
      imageObj.src = image_url;
    }

    $('#file').change(function(evt) {
      // in case camera div was previously shown and not re-hidden
      $('#camera').hide();
      // makes sure the file change wasn't just due to it being reset in handleURLSelect() 
      if ($("#file").val !== '') {
        global_is_sample = false;
        var file = evt.target.files[0];
        handleFileSelect(file);
      }
    });

    // jQuery.urlShortener.settings.apiKey = 'AIzaSyDjW-G7go9ZMvuw0oBS6a_RGZgWKOGLxR8';
    $('#submit_photo_url').click(function(evt) {
      // ignore clicks to the submit button when no URL is given
      if ($('#photo_url').val() !== '') {
        $('#camera').hide();
        global_is_sample = false;
        handleURLSelect($("#photo_url").val());
        $("#photo_url").val(''); // reset the input field
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


    $('.sample-img').click(function(evt) {
      $('#camera').hide();
      global_is_sample = true;
      scorecard = new ScoreCard();
      var url = $(this).attr('src');
      // split the sample's filename to extract values for any (or all) of the possible attributes
      var attributes = url.substring(url.indexOf('-') + 1, url.indexOf('.')).split('-');
      // iterate through the attribute-value pairs, updating the scorecard accordingly
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
      // convert sample file to blob in order to make it compatible with handleFileSelect()
      imageObj.onload = function() {
        var blob = dataURItoBlob(imageToDataUri(imageObj, imageObj.width, imageObj.height));
        blob.name = 'blob.png';
        handleFileSelect(blob);
      };
      imageObj.src = url;

      return false;
    });

    /* View API Results */

    var selectApi = function(api, color) {
      drawBoundingBox(boundingBoxes[api], color, global_image_data, global_ratio);
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
      switch ($(this).attr('href')) {
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
          drawBoundingBox(boundingBoxes.google, 'yellow', global_image_data, global_ratio);
          $('#api-name').html('Google');
          $('#gender-display, #age-display').html('NA');
          $('#no-face-detected').hide();
          $('#detected-values').show();
      }
    });

    /* MODAL */

    function displayComparisonTable() {
      $('.modal-1').show();
      $('.modal-2, .modal-3').hide();
      $('.sample-img-modal').toggle(global_is_sample);
      $('.usr-img-modal').toggle(!global_is_sample);
    }

    function displayGroundTruthForm() {
      $('.modal-2').show();
      $('.modal-1, .modal-3').hide();
    }

    function displayScoreCard() {
      scorecard.updateTotalScore();
      $('#download').addClass('disabled');
      $('.modal-3').show();
      $('.modal-1, .modal-2').hide();
      $('.sample-img-modal').toggle(global_is_sample);
      $('.usr-img-modal').toggle(!global_is_sample);
      $('#myModal').scrollTop(0);
      html2canvas($('#scorecard'), {
        allowTaint: true,
        background: '#fff'
      }).then(function(canvas) {
        $('#download').removeClass('disabled')[0].href = canvas.toDataURL();
      });
    }

    $('#results-button, button.modal-2.btn-secondary, .modal-3.btn-secondary.sample-img-modal').click(displayComparisonTable);
    $('button.modal-1.usr-img-modal, .modal-3.btn-secondary.usr-img-modal').click(displayGroundTruthForm);
    $('button.modal-1.sample-img-modal').click(displayScoreCard);
    $('button.modal-2.btn-primary').click(function() {
      // submit the #actual_values_form
      $('input.modal-2.btn-primary').click();
    });

    $('#actual_values_form').submit(function(event) {
      scorecard.setGender(); // clear any previous gender value
      // handle the case of user opting to include gender on scorecard
      if ($('[name="include-gender"]:checked').length) {
        // check if a gender has been selected
        if ($('[name="gender"]:checked').length) {
          var gender = $('[name="gender"]:checked').val();
          // update the scorecard with the selected gender
          scorecard.setGender(gender);
          // user opted to include gender, but has not actually selected one
        } else {
          // fail validation
          return false;
        }
      }
      scorecard.setAge(); // clear any previous age value
      // handle the case of user opting to include age on scorecard
      if ($('[name="include-age"]:checked').length) {
        var age = $('input[name="age"]').val();
        var minAge = $('input[name="age"]').attr('min');
        var maxAge = $('input[name="age"]').attr('max');
        // check if the given age value is valid (a nonnegetive number no larger than the set max)
        if ($.isNumeric(age) && age >= Number(minAge) && age <= Number(maxAge)) {
          // update the scorecard with the given age
          scorecard.setAge(age);
          // user opted to include age, but failed to submit a valid value
        } else {
          // fail validation
          return false;
        }
      }
      scorecard.setEthnicity(); // clear any previous ethnicity value
      // handle the case of user opting to include ethnicity on scorecard
      if ($('[name="include-ethnicity"]:checked').length) {
        var ethnicity = $('input[name="ethnicity"]').val();
        // check if a valid (nonempty) ethnicity value was given
        if (ethnicity !== '') {
          // update the scorecard with the given ethnicity
          scorecard.setEthnicity(ethnicity);
          // user opted to include ethnicity, but failed to submit a value
        } else {
          // fail validation
          return false;
        }
      }
      // VALIDATION SUCCESSFUL

      // display updated scorecard
      displayScoreCard();

      // prevent form from actually submitting
      event.preventDefault();
    });


    $('#camera-button').click(function() {
      $('#camera').show();
      $('#photoCanvas').hide();
      camera = new JpegCamera("#camera").ready(function() {
        this.show_stream();
        $('#photoCanvas, #gender-age-display').hide();
      });
      $(this).hide();
      $('#snapshot-button').show();
    });

    $('#snapshot-button').click(function() {
      $('#countdown').TimeCircles().restart().end().show();
      $(this).hide();
      $('#camera-button').show();
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
      total_duration: 4, // 4 secs, counting down from 3 to 0,  
      start: false // don't start countdown immediately (waits until user clicks snapshot button)
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