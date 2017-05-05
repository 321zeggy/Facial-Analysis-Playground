var ScoreCard = function() {
	this.microsoft_gender = undefined;
	this.ibm_gender = undefined;
	this.faceplusplus_gender = undefined;
	this.kairos_gender = undefined;

	this.microsoft_age = undefined;
	this.ibm_age = undefined;
	this.faceplusplus_age = undefined;
	this.kairos_age = undefined;

	this.microsoft_face_detected = undefined;
	this.ibm_face_detected = undefined;
	this.faceplusplus_face_detected = undefined;
	this.kairos_face_detected = undefined;
	this.google_face_detected = undefined;

	this.actual_gender = undefined;
	this.actual_age = undefined;
	this.actual_ethnicity = undefined;

	// SET SCORECARD HEADER CONTENT //
	this.setFaceImage = function(image) {
		this.face_image = image;
		$('#face_image').attr('src', image);
	};
	this.setGender = function(gender) {
		this.actual_gender = gender[0];
		$('#actual_gender').html(gender);
	};
	this.setAge = function(age) {
		this.actual_age = age;
		$('#actual_age').html(age);
	};
	this.setEthnicity = function(ethnicity) {
		this.ethnicity = ethnicity;
		$('#actual_ethnicity').html(ethnicity);
		$('#scorecard .ethnicity').show();
	};


	this.updateGenderScores = function(true_gender) {
		var total_correct = 0;
		var apis = ['microsoft', 'ibm', 'faceplusplus', 'kairos'];
		for (i = 0; i < apis.length; i++) {
			var className = apis[i] + '_gender';
			var selecter = '#scorecard .' + className;
			$(selecter).replaceWith('<td class="' + className + ' text-white"></td');
			if (this[apis[i] + '_face_detected']) {
				if (this[className] == true_gender) {
					total_correct += 1;
					$(selecter).html(this[className]).addClass('bg-success');
				} else {
					$(selecter).html(this[className]).addClass('bg-danger');
				}
			} else {
				// $(selecter).html('No Face Detected').addClass('bg-danger');
				$(selecter).replaceWith(
					'<td class="' + className + ' bg-danger text-white"><i class="fa fa-2x fa-times"></i></td>');
			}
		}
		$('#gender_score').html(total_correct + '/' + apis.length);
		return total_correct;
	};
	this.updateAgeScores = function(true_age) {
		var total_correct = 0;
		var apis = ['microsoft', 'ibm', 'faceplusplus', 'kairos'];
		if (this.ibm_age_range) {
			$('.alert.ibm-range').hide();
		}
		for (i = 0; i < apis.length; i++) {
			var className = apis[i] + '_age';
			var selecter = '#scorecard .' + className;
			$(selecter).replaceWith('<td class="' + className + ' text-white"></td');
			if (this[apis[i] + '_face_detected']) {
				if (apis[i] == 'ibm' && this.ibm_age_range) {
					if (true_age >= this.ibm_age_range[0] && true_age <= this.ibm_age_range[1])	{
						total_correct += 1;
						$(selecter).html(this[className]).addClass('bg-success');
					} else {
						$(selecter).html(this[className]).addClass('bg-danger');
					}
					$(selecter).append('<sup><strong>**</strong></sup>');
					// $('[data-toggle="tooltip"]').tooltip();
					$('.alert.ibm-range').html('<strong>**</strong> This value is the average of the age range ' + this.ibm_age_range[0] + '-' + this.ibm_age_range[1] + 
						' estimated by IBM').show();
				}
				else if (Math.abs(this[className] - true_age) <= 5) {
					total_correct += 1;
					$(selecter).html(this[className]).addClass('bg-success');
				} else {
					$(selecter).html(this[className]).addClass('bg-danger');
				}
			} else {
				// $(selecter).html('No Face Detected').addClass('bg-danger');
				$(selecter).replaceWith(
					'<td class="' + className + ' bg-danger text-white"><i class="fa fa-2x fa-times"></i></td>');
			}
		}
		$('#age_score').html(total_correct + '/' + apis.length);
		return total_correct;
		
	};
	this.updateFaceDetectedScores = function() {
		var total_correct = 0;
		var apis = ['microsoft', 'ibm', 'faceplusplus', 'kairos', 'google'];
		for (i = 0; i < apis.length; i++) {
			var className = apis[i] + '_face_detected';
			var selecter = '#scorecard .' + className;
			if (this[apis[i] + '_face_detected']) {
				total_correct += 1;
				$(selecter).replaceWith(
					'<td class="' + className + ' bg-success text-white"><i class="fa fa-2x fa-check"></i></td>');
			} else {
				$(selecter).replaceWith(
					'<td class="' + className + ' bg-danger text-white"><i class="fa fa-2x fa-times"></i></td>');
			}
		}
		$('#detected_score').html(total_correct + '/' + apis.length);
		return total_correct;
	};


	this.updateTotalScore = function() {
		var total_correct = 0;
		var total_overall = 5;
		if (this.actual_gender) {
			$('#scorecard .gender').show();
			total_correct += this.updateGenderScores(this.actual_gender[0]); 
			total_overall += 4;
		} else {
			$('#scorecard .gender').hide();
		}
		if (this.actual_age) {
			$('#scorecard .age').show();
			total_correct += this.updateAgeScores(this.actual_age);
			total_overall += 4; 
		} else {
			$('#scorecard .age').hide();
		}
		total_correct += this.updateFaceDetectedScores();
		$('#total_score').html(total_correct + '/' + total_overall);
	};
	this.setMicrosoftGender = function(gender) {
		this.microsoft_gender = gender;
	};
	this.setIBMGender = function(gender) {
		this.ibm_gender = gender;
	};
	this.setFacePlusPlusGender = function(gender) {
		this.faceplusplus_gender = gender;
	};
	this.setKairosGender = function(gender) {
		this.kairos_gender = gender;
	};
	this.setMicrosoftAge = function(age) {
		this.microsoft_age = Math.round(age);
	};
	this.setIBMAge = function(min_age, max_age) {
		if (min_age) {
			if (max_age) {
				this.ibm_age_range = [min_age, max_age];
				this.ibm_age = Math.round((min_age + max_age) / 2);
			} else this.ibm_age = min_age;
		} else this.ibm_age = max_age;
	};
	this.setFacePlusPlusAge = function(age) {
		this.faceplusplus_age = age;
	};
	this.setKairosAge = function(age) {
		this.kairos_age = age;
	};
	this.setMicrosoftFaceDetected = function(face_detected) {
		this.microsoft_face_detected = face_detected;
	};
	this.setIBMFaceDetected = function(face_detected) {
		this.ibm_face_detected = face_detected;
	};
	this.setFacePlusPlusFaceDetected = function(face_detected) {
		this.faceplusplus_face_detected = face_detected;
	};
	this.setKairosFaceDetected = function(face_detected) {
		this.kairos_face_detected = face_detected;
	};
	this.setGoogleFaceDetected = function(face_detected) {
		this.google_face_detected = face_detected;
	};
};