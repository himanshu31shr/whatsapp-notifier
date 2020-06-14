const fs = require('fs');
const { Client, Chat } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const csv = require('csv-parser')
const results = [];
const { format } = require('date-fns');


// Path where the session data will be stored
const SESSION_FILE_PATH = './session.json';

// Load the session data if it has been previously saved
let sessionData = false;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
	session: sessionData
});

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
	console.log("session", session);
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('qr', (qr) => {

    // Generate and scan this code with your phone
   	qrcode.generate(qr, {small: true});
});


client.on('auth_failure', (qr) => {
	console.log("qr", qr);

});

let waitTime = Math.random()*10000;

client.on('ready', () => {
	let i = 0;
	fs.createReadStream('infor.csv')
	  .pipe(csv())
	  .on('data', (data) => {

	  	let message = `Hello ${data['Name'] || data['In game Name']},\n\nMatch registration for your team (${data['Team Name']}) is confirmed with us! Please use the details below to join the match.\nSlot: #${data['Slot']}\nDate: ${data['Match Date'] ? data['Match Date'] : format(new Date(), 'do MMM, y')}\nTime: 9:00 PM IST\n\nSee ya on the grounds!
	  	`
	  	results.push(message);

	  	if(i < 3) {
	  		waitTime += Math.random()*10000;

	  		setTimeout(function() {
		  		// client.sendMessage('917389283733@c.us', message)
		  		client.sendMessage('919981809668@c.us', message)
					// .then((response)=>{
				 //    	console.log("response", response);
					// });
	  		}, Math.ceil(waitTime))
	  	}

		i++;
	  })
	// for(let i = 0 ; i < 9 ; i++) {
	// 	client.sendMessage('919981809668@c.us', 'Hi '+i)
	// 		.then((response)=>{
	// 	    // if(response.id.fromMe){
	// 	    	console.log("response", response);

	// 	    // }
	// 	});
	// }
});

client.on('message', msg => {
	// console.log("msg", msg);
});

client.initialize();