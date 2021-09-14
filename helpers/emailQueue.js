const Queue = require('bull');
const nodemailer = require('nodemailer');
const config = require('config');

// 1. Initiating the Queue
const sendMailQueue = new Queue('sendMail', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
});
const data = {
    email: 'bharathi.kannan@surveysparrow.com'
};
const url = 'http://localhost:3010/';
const options = {
    delay: 3000, // 1 min in ms
    attempts: 2
};

// 2. Adding a Job to the Queue
// sendMailQueue.add(data, options);

// 3. Consumer
sendMailQueue.process(async job => { 
    return await sendMail(job.data.email, url); 
});

function sendMail(email, shortUrl) {
    console.log('To mail address', email, shortUrl);
    return new Promise((resolve, reject) => {
        let mailOptions = {
            from: 'fromuser@domain.com',
            to: email,
            subject: 'Bull - npm',
            text: "URL shortener request completed: URL details: " + shortUrl,
        };
        let mailConfig = {
            service: 'gmail',
            auth: {
                user: 'rbharathikannan@gmail.com',
                pass: 'Subha@2415'
            }
        };
        nodemailer.createTransport(mailConfig).sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Reaching here err', err);
                reject(err);
            } else {
                console.log('Reaching here success');
                resolve(info);
            }
        });
    });
}

module.exports = {
    sendMail
}
