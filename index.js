
const jsdom = require("jsdom");
const axios = require("axios");
const dotenv = require('dotenv');

dotenv.config();

const PUSHOVER_USER_KEY = process.env.PUSHOVER_USER_KEY
const PUSHOVER_API_TOKEN = process.env.PUSHOVER_API_TOKEN

const PUSHOVER_MSG_URL = process.env.PUSHOVER_MSG_URL;
const REGISTRATION_WEBSITE_URL = process.env.REGISTRATION_WEBSITE_URL;

function availabilityCheck(raceId) { 
  let formData = new FormData();
  formData.append('action', 'afficher_form_inscription');
  formData.append('id_evenement', '2652');
  formData.append('id_epreuve', raceId);
  formData.append('pa', '0');

  fetch(REGISTRATION_WEBSITE_URL, {
    method: "POST",
    body: formData
  })
    .then(response => response.text())  // Get the response body as text
    .then(html => {
      // Parse the HTML string into a document
	  const dom = new jsdom.JSDOM(html);      
	  
	  const elementId = "btn_valider_inscription_" + raceId;
	  	  
      // Get the element with the specific ID
      const element = dom.window.document.getElementById(elementId);
	        
      // Print the element in the console if it exists
      if (element) {
        console.log('Available spot for race ' + raceId);
		sendPushOverNotification('Available spot for race ' + raceId);
      } else {
	    console.log('No available spot for race ' + raceId);
      }
    })
    .catch(error => {
      console.error('Error fetching the page:', error);
    });
}

async function sendPushOverNotification(message) {
	
  const data = {
	user: PUSHOVER_USER_KEY,
	token: PUSHOVER_API_TOKEN,
	message: message
  };
  
  try {
    const res = await axios.default.post(PUSHOVER_MSG_URL, data);
	console.log("Push notification sent");
  } catch (error) {
      // Ensure confidential information are not printed in public build logs
      if (error && error.config && error.config.data) {
        delete error.config.data;
      }

      if (error.response.status === 400) {
        console.log(
		  'Failed to send Pushover.net message possibly due to invalid token/user or your application is over its quota.'
        );
      }

      if (error.response.data) {
        console.log(error.response.data);
      }
	  console.log(error);
    };
};

function loopThroughRaces() {
	console.log(new Date() + ":");
	availabilityCheck("8930");
	availabilityCheck("8931");
	availabilityCheck("8932");
}

// Call the function once initially 
loopThroughRaces();

// Set an interval to call the function every 15 mins
setInterval(loopThroughRaces, 900000);
