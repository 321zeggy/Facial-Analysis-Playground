Practice-Run
=====================

*February 24, 2017*
Learned
------------------------------
1. How to start a basic python server from the command line
2. That when sending a request, it's really only the content, not the sender/method of sending, that matters to the server receiving it.
3. That an image's onload function reruns each time the image is assigned a new src

Ideas for Next Iteration
------------------------------
1. Clean up the code. Be more consistant and DRY.
2. Add face bounding boxes for the different APIs.
3. Connect to additional APIs.
4. Read up on HTTP and other relevant topics.

Challenges
------------------------------
1. Converting images to base64 data without getting CORS related errors.
2. Overcomplicating the process of starting a server.
2. Trying to understand the APIs without first fully understanding how requests work.

Triumphs
------------------------------
1. Adding sample images that respond as intended when clicked.
2. Succesfully running a server (fixing the CORS related image errors!)
3. Aquiring authentication keys for all the relevant APIs (aside from Amazon, because it asked for my credit card info).


*February 2, 2017*
Learned
------------------------------
1. I became more comfortable working with HTTP requests.
2. I gained more familiarity with some of jargon that tripped me up a bit at first.
3. I realized that when I'm stuck on something for too long, talking my ideas out with a friend can really help me figure out where I'm getting tripped up.

Ideas for Next Iteration
------------------------------
1. Allow for uploading images by webcam and from web URLs
2. Clean up the code by moving the Betaface specific code into a seperate file
3. Add JSON information from additional APIs.

Challenges
------------------------------
1. It took me some time to get my head around the HTTP requests so that I could figure out how to convert the Betaface XML code into JSON.
2. I was confused for a bit about why the faces in some photos weren't being recognized, but it seems like that is dependent on the file size. I later realized that the Kairos demo has this issue as well. (I'm curious why this is the case, but I didn't have a chance to look more into it yet.)
3. A canvas can be tricky to size properly when its parent's size isn't absolute.
4. The two APIs return the facial attributes in different formats from each other. I ended up using only the age and gender estimates of each API, but even then I had to reformat the information so the two JSON outputs were more simlar to each other.

Triumphs
------------------------------
1. Finally get the Betaface HTTP requests working
2. Succesfully outputting JSON from both Kairos and Betaface! 

