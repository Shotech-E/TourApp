const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transport
  newTransport();
    if (process.env.NODE_ENV !== 'production') {
      console.log('Sending email in development mode...');
      return nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: process.env.BREVO_PORT,
        auth: {
          user: process.env.BREVO_LOGIN,
          pass: process.env.BREVO_PASSWORD
        }
      });
    }
  

  // 2) Define the email options
  const mailOptions = {
    from: 'Shotech <showars1990@gmail.com>',
    to: this.to,
    subject: subject,
    html,
    text: htmlToText.convert(html)
  };


  // 3) Actually send the email
  await this.newTransport().sendMail(mailOptions);
};

module.exports = sendEmail;
