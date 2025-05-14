const startButton = document.getElementById('start'); // Get the start button element by its ID
const stopButton = document.getElementById('stop'); // Get the stop button element by its ID
const videoElement = document.getElementById('preview'); // Get the video element by its ID
let mediaRecorder; // Declare a variable for the MediaRecorder
let recordedChunks = []; // Declare an array to store recorded video chunks

startButton.onclick = async () => { // Define the onclick event handler for the start button
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); // Request access to the camera and microphone
        videoElement.srcObject = stream; // Set the video element's source to the media stream
        setupRecorder(stream); // Call the function to set up the MediaRecorder
    } catch (err) {
        console.error("Error accessing camera and microphone", err); // Log an error if access to the camera and microphone fails
    }
};

function setupRecorder(stream) { // Define the function to set up the MediaRecorder
    mediaRecorder = new MediaRecorder(stream); // Create a new MediaRecorder instance with the media stream
    mediaRecorder.ondataavailable = event => { // Define the ondataavailable event handler
        if (event.data.size > 0) recordedChunks.push(event.data); // Push recorded data chunks to the array if they are not empty
    };
    mediaRecorder.onstop = uploadVideo; // Define the onstop event handler to call the uploadVideo function
    mediaRecorder.start(10); // Start recording, collecting data every 10 milliseconds
    startButton.disabled = true; // Disable the start button
    stopButton.disabled = false; // Enable the stop button
}

stopButton.onclick = () => { // Define the onclick event handler for the stop button
    mediaRecorder.stop(); // Stop recording
    videoElement.srcObject.getTracks().forEach(track => track.stop()); // Stop all tracks of the media stream
    startButton.disabled = false; // Enable the start button
    stopButton.disabled = true; // Disable the stop button
};

async function uploadVideo() { // Define the function to upload the video
    console.log("Attempting to upload video..."); // Log the upload attempt
    const blob = new Blob(recordedChunks, { type: 'video/mp4' }); // Create a Blob from the recorded video chunks
    let formData = new FormData(); // Create a new FormData instance
    formData.append('video', blob, 'video.mp4'); // Append the video blob to the FormData

    try {
        const serverUrl = 'http://localhost:3000/upload'; // Define the server URL
        const response = await fetch(serverUrl, { // Send a POST request to the server
            method: 'POST', // Use the POST method
            body: formData, // Set the request body to the FormData
        });
        if (response.ok) { // Check if the response is OK
            console.log("Video uploaded successfully."); // Log a success message
            // Inside your upload success block
            document.getElementById('status').textContent = "✅ Video uploaded successfully!";
        } else {
            console.error("Upload failed", await response.text()); // Log an error message with the response text
        }
    } catch (error) {
        console.error("Error uploading video", error); // Log an error message if the upload fails
    }
}
