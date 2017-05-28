function imageToDataURI(img) {
    // create an off-screen canvas
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    // set its dimension to target size
    canvas.width = img.width;
    canvas.height = img.height;

    // draw source image into the off-screen canvas:
    ctx.drawImage(img, 0, 0);

    // encode image to data-uri with base64 version of compressed image
    return canvas.toDataURL();
}

function drawBoundingBox(img, scaling_factor, face, color) {
    var imageObj = new Image();
    imageObj.onload = function() {
        var canvas = $('#photoCanvas')[0];
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(imageObj, 0, 0, imageObj.width * scaling_factor, imageObj.height * scaling_factor);

        if (face) {
            var top = face.top * scaling_factor;
            var left = face.left * scaling_factor;
            var width = face.width * scaling_factor;
            var height = face.height * scaling_factor;

            // draw bounding box
            context.beginPath();
            context.rect(left, top, width, height);
            context.lineWidth = 4;
            context.strokeStyle = color;
            context.stroke();
        }
    };
    imageObj.src = img;
}

// get ratio by which to multiply image width and height in order to fit canvas
function getConversionRatio(img, maxWidth, maxHeight) {
    return Math.min(maxWidth / img.width, maxHeight / img.height);
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
