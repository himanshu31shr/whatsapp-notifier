const fs = require('fs');
const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const csv = require('csv-parser')
const results = [];
const { format } = require('date-fns');

const SESSION_FILE_PATH = './session.json';
let sessionData = false;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
	session: sessionData
});

// Change this for matches.
const MATCH_TYPE = 'SOLO'								// SOLO | DUO | SQUAD

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
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

	  		waitTime += Math.random()*10000;

	  		let messages = {
				SOLO: `Hello ${data['Name'] || data['In game Name']},\n\nMatch registration is confirmed with us! Please use the details below to join the match.\n\nSlot: #${data['Slot']}\nDate: ${data['Match Date'] ? data['Match Date'] : format(new Date(), 'do MMM, y')}\nTime: 9:00 PM IST\nRoom ID: \nPassword: \n\nPlease have a look at the seating arrangment See ya on the grounds!
			  	`,
			  	SQUAD: `Hello ${data['Name'] || data['In game Name']},\n\nMatch registration for your team (${data['Team Name']}) is confirmed with us! Please use the details below to join the match.\n\nSlot: #${data['Slot']}\nDate: ${data['Match Date'] ? data['Match Date'] : format(new Date(), 'do MMM, y')}\nTime: 9:00 PM IST\nRoom ID: \nPassword: \n\nPlease have a look at the seating arrangment See ya on the grounds!
			  	`,
			  	DUO: `Hello ${data['Name'] || data['In game Name']},\n\nMatch registration for your team (${data['Team Name']}) is confirmed with us! Please use the details below to join the match.\n\nSlot: #${data['Slot']}\nDate: ${data['Match Date'] ? data['Match Date'] : format(new Date(), 'do MMM, y')}\nTime: 9:00 PM IST\nRoom ID: \nPassword: \n\nPlease have a look at the seating arrangment See ya on the grounds!
			  	`
			}

	  		setTimeout(function() {

			  	if(data['Contact']) {
		  			// let recipient = '919981809668@c.us';

			  		let recipient = '91'+data['Contact']+'@c.us';
		  			client.sendMessage(recipient, messages[MATCH_TYPE]);
			  		
			  		let data = fs.readFileSync('arrangement.png');
		  			if(data) {
		  				let buff = new Buffer.from(data);

		  				client.sendMessage(recipient, new MessageMedia('image/png', buff.toString('base64'), 'Slot arrangement'));
		  			}

			  	} else {
		  			let recipient = '917389283733@c.us';
		  			client.sendMessage(recipient, `Bruh, cannot send message to ${data['Name'] || data['In game Name']}, contact details not present!`);
		  			client.sendMessage(recipient, `Send the below message manually!`);
		  			client.sendMessage(recipient, messages[MATCH_TYPE]);
		  			
		  			let data = fs.readFileSync('arrangement.png');
		  			if(data) {
		  				let buff = new Buffer.from(data);

		  				client.sendMessage(recipient, new MessageMedia('image/png', buff.toString('base64'), 'Slot arrangement'));
		  			}

			  	}

	  		}, Math.ceil(waitTime))

		i++;
	  })
});

client.initialize();
