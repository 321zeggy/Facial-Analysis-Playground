# Facial-Analysis-Playground
------------------------------
## **March 16, 2017**
#### Learned
1. Event handlers called upon the submission of an HTML input element must return false in order to prevent the page from reloadind.

#### Ideas for Next Iteration
1. Add bounding box for Google API
2. Finish debugging problems with uploading images by URL
3. Continue cleaning up code.
4. Finish fully including Face++

#### Challenges
1. Figuring out why the page reloaded upon submitting a photo URL. (It was because I hadn't set the input element submit event handler to return false.)
2. Getting Face++ to work. It seems to think I'm not including the API Key, despite my definitely including it.

#### Triumphs
1. Making slow, but genuine, progress at cleaning up my code.
2. Added Google and Face++ APIs (though both are still works in progress)

------------------------------
## **March 9, 2017**
#### Learned
1. How to send binary data (not only in string form) as the data payload of a POST request
2. A better high-level understanding of Node.js
3. GitHub Flavored Markdown

#### Ideas for Next Iteration
1. Continue cleaning up code.
2. Add option for usapers to take photos of themselves directly on the site, using their webcam, and then upload those photos.
3. Get IBM Watson API results to output for image file uploads, not just for image URLs.
4. Add Google Cloud's Vision API.

#### Challenges
1. Learning to work with different types of request payload data (URLs, base64 strings, buffers, etc.), and keeping track of which type was required by each API.
2. Debugging unexpected behavior can be particularly tricky when a canvas is involved.

#### Triumphs
1. _Finally_ got past my initial learning curve!
2. Implemented bounding boxes for most of the APIs
3. Cleaned up a lot of the code

------------------------------
## **March 2, 2017**
#### Learned
1. A better understanding of why cross-origin resource sharing (CORS) exists, helping me better understand why some of my cross-origin requests succeed while others failed.
2. Much more confidence in interpreting HTTP requests and responses

#### Ideas for Next Iteration
1. Before I jump back into the actual coding, I'd like to set aside time to write out a step-by-step plan I'll need follow in order to accomplish my tasks.
2. Implement image upload to Google, Microsoft, and IBM.
3. Implement bounding boxes view for Google, Microsoft, and IBM.

#### Challenges
1. The facial coordinates returned by Betaface aren't as straightforward to use for drawing bounding boxes as those returned by other APIs.
2. Microsoft's API only accepts photos in the form of web URLs or data streams, making it more complicated to send photos that were represented as strings of base64 data.
3. I often tried to implement code that involved concepts that were relatively new to me, when I should have first made sure I had at least a high level understanding of those concepts. 

#### Triumphs
1. Finally gave this repository a proper name!  
2. Made progress on my UAP proposal 
3. Felt more confident in my understanding of the code I was working with, and much less overwhelmed (even at the points when I found things confusing.)
4. Being more confident in my understanding of the code made it easier for me to come up with specific questions instead of just feeling too confused to even know what to ask. 

------------------------------
## **February 24, 2017**
#### Learned
1. How to start a basic python server from the command line
2. That when sending a request, it's really only the content, not the sender/method of sending, that matters to the server receiving it.
3. That an image's onload function reruns each time the image is assigned a new src

#### Ideas for Next Iteration
1. Clean up the code. Be more consistant and DRY.
2. Add face bounding boxes for the different APIs.
3. Connect to additional APIs.
4. Read up on HTTP and other relevant topics.

#### Challenges
1. Converting images to base64 data without getting CORS related errors.
2. Overcomplicating the process of starting a server.
2. Trying to understand the APIs without first fully understanding how requests work.

#### Triumphs
1. Adding sample images that respond as intended when clicked.
2. Succesfully running a server (fixing the CORS related image errors!)
3. Aquiring authentication keys for all the relevant APIs (aside from Amazon, because it asked for my credit card info).

------------------------------
## **February 2, 2017**
#### Learned
1. I became more comfortable working with HTTP requests.
2. I gained more familiarity with some of jargon that tripped me up a bit at first.
3. I realized that when I'm stuck on something for too long, talking my ideas out with a friend can really help me figure out where I'm getting tripped up.

#### Ideas for Next Iteration
1. Allow for uploading images by webcam and from web URLs
2. Clean up the code by moving the Betaface specific code into a seperate file
3. Add JSON information from additional APIs.

#### Challenges
1. It took me some time to get my head around the HTTP requests so that I could figure out how to convert the Betaface XML code into JSON.
2. I was confused for a bit about why the faces in some photos weren't being recognized, but it seems like that is dependent on the file size. I later realized that the Kairos demo has this issue as well. (I'm curious why this is the case, but I didn't have a chance to look more into it yet.)
3. A canvas can be tricky to size properly when its parent's size isn't absolute.
4. The two APIs return the facial attributes in different formats from each other. I ended up using only the age and gender estimates of each API, but even then I had to reformat the information so the two JSON outputs were more simlar to each other.

#### Triumphs
1. Finally get the Betaface HTTP requests working
2. Succesfully outputting JSON from both Kairos and Betaface! 

