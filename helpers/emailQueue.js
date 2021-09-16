const Queue = require('bull');
const nodemailer = require('nodemailer');
const config = require('config');
const redirectUrl = 'http://localhost:3000/redirect/';

// 1. Initiating the Queue
const sendMailQueue = new Queue('sendMail', {
    redis: {
        host: config.get('redis.host'),
        port: config.get('redis.port')
    }
});

const options = {
    delay: 3000, // 1 min in ms
    attempts: 2
};

// 2. Adding a Job to the Queue
function add(data) {
    sendMailQueue.add(data, options);
    
    // 3. Consumer
    sendMailQueue.process(async job => { 
        console.log('job.data', job.data);
        return await sendMail(job.data.email, job.data.shortUrl);
    });
}

function sendMail(email, shortUrl) {
    console.log('To mail address', email, redirectUrl+shortUrl);
    return new Promise((resolve, reject) => {
        let mailOptions = {
            from: 'fromuser@domain.com',
            to: email,
            subject: 'Bull - npm',
            text: "URL shortener request completed: URL details: " + redirectUrl+shortUrl,
        };
        let mailConfig = {
            service: 'gmail',
            auth: {
                user: config.get('email.user'),
                pass: config.get('email.pass')
            }
        };
        nodemailer.createTransport(mailConfig).sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Error in sending email', err);
                reject(err);
            } else {
                console.log('Email sent successfully');
                resolve(info);
            }
        });
    });
}

module.exports = {
    add
}
