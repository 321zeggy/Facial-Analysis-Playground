var Scorecard = function() {
	this.Microsoft_gender = null;
	this.IBM_gender = null;
	this.FacePlusPlus_gender = null;
	this.Kairos_gender = null;

	this.Microsoft_age_range = null;
	this.IBM_age_range = null;
	this.FacePlusPlus_age_range = null;
	this.Kairos_age_range = null;

	this.Microsoft_face_detected = null;
	this.IBM_face_detected = null;
	this.FacePlusPlus_face_detected = null;
	this.Kairos_face_detected = null;
	this.Google_face_detected = null;
};

Scorecard.prototype.updateGenderScores = function(true_gender) {
	var total_correct = 0;
	if (this.Microsoft_face_detected) {
		if (self.Microsoft_gender == true_gender) {
			total_correct += 1;
			// update table data with check-mark
		} else {
			// update table data with ex-mark
		}
	}
	if (this.IBM_face_detected) {
		if (self.IBM_gender == true_gender) {
			total_correct += 1;
			// update table data with check-mark	
		} else {
			// update table data with ex-mark
		}
	}
	if (self.FacePlusPlus_face_detected) {
		if (self.FacePlusPlus_gender == true_gender) {
			total_correct += 1;
			// update table data with check-mark	
		} else {
			// update table data with ex-mark
		}
	}
	if (self.Kairos_face_detected) {
		if (self.Kairos_gender == true_gender) {
			total_correct += 1;
			// update table data with check-mark	
		} else {
			// update table data with ex-mark
		}
	}
	// update gender score table data with total_correct + '/4' 
	return total_correct;
};

Scorecard.prototype.updateAgeScores = function(true_age) {
	var total_correct = 0;
	if (self.Microsoft_face_detected) {
		if (self.Microsoft_age_range[0] <= true_age || self.Microsoft_age_range[1] >= true_age) {
			total_correct += 1;
			// update table data with check-mark
		} else {
			// update table data with ex-mark
		}
	}
	if (self.IBM_face_detected) {
		if (self.IBM_age_range[0] <= true_age || self.IBM_age_range[1] >= true_age) {
			total_correct += 1;
			// update table data with check-mark	
		} else {
			// update table data with ex-mark
		}
	}
	if (self.FacePlusPlus_face_detected) {
		if (self.FacePlusPlus_age_range[0] <= true_age || self.FacePlusPlus_age_range[1] >= true_age) {
			total_correct += 1;
			// update table data with check-mark	
		} else {
			// update table data with ex-mark
		}
	}
	if (self.Kairos_face_detected) {
		if (self.Kairos_age_range[0] <= true_age || self.Kairos_age_range[1] >= true_age) {
			total_correct += 1;
			// update table data with check-mark	
		} else {
			// update table data with ex-mark
		}
	}
	// update age score table data with total_correct + '/4'  
};

Scorecard.prototype.updateFaceDetectedScores = function() {
	var total_correct = 0;
	if (self.Microsoft_face_detected) {
		total_correct += 1;
		// update table data with check-mark
	} else {
		// update table data with ex-mark
	}
	if (self.IBM_face_detected) {
		total_correct += 1;
		// update table data with check-mark	
	} else {
		// update table data with ex-mark
	}
	if (self.FacePlusPlus_face_detected) {
		total_correct += 1;
		// update table data with check-mark	
	} else {
		// update table data with ex-mark
	}
	if (self.Kairos_face_detected) {
		total_correct += 1;
		// update table data with check-mark	
	} else {
		// update table data with ex-mark
	}
	if (self.Google_face_detected) {
		total_correct += 1;
		// update table data with check-mark
	} else {
		// update table data with ex-mark
	}
	// update age score table data with total_correct + '/5'  
};

Scorecard.prototype.updateTotalScore = function(true_gender, true_age) {
	var total_correct = 0;
	total_correct += this.updateGenderScores(true_gender) + this.updateAgeScores(true_age) + this.updateFaceDetectedScores();
	// update coded gaze score with total_correct + '/13'
};




Scorecard.prototype.setMicrosoftGender = function(gender) {
	self.Microsoft_gender = gender;
};
Scorecard.prototype.setIBMGender = function(gender) {
	self.IBM_gender = gender;
};
Scorecard.prototype.setFacePlusPlusGender = function(gender) {
	self.Face_gender = gender;
};
Scorecard.prototype.setKairosGender = function(gender) {
	self.Kairos_gender = gender;
};


Scorecard.prototype.setMicrosoftAgeRange = function(age) {
	self.Microsoft_age_range = [age - 5, age + 5];
};
Scorecard.prototype.setIBMAgeRange = function(min_age, max_age) {
	if (min_age) {
		if (max_age) {
			self.IBM_age_range = [min_age, max_age];
		} else {
			self.IBM_age_range = [min_age - 5, min_age + 5];
		}
	} else {
		self.IBM_age_range = [max_age - 5, max_age + 5];
	}
};
Scorecard.prototype.setFacePlusPlusAgeRange = function(age) {
	self.FacePlusPlus_age_range = [age - 5, age + 5];
};
Scorecard.prototype.setKairosAgeRange = function(age) {
	self.Kairos_age_range = [age - 5, age + 5];
};


Scorecard.prototype.setMicrosoftFaceDetected = function(face_detected) {
	self.Microsoft_face_detected = face_detected;
};
Scorecard.prototype.setIBMFaceDetected = function(face_detected) {
	self.IBM_face_detected = face_detected;
};
Scorecard.prototype.setFacePlusPlusFaceDetected = function(face_detected) {
	self.FacePlusPlus_face_detected = face_detected;
};
Scorecard.prototype.setKairosFaceDetected = function(face_detected) {
	self.Kairos_face_detected = face_detected;
};
Scorecard.prototype.setGoogleFaceDetected = function(face_detected) {
	self.Google_face_detected = face_detected;
};