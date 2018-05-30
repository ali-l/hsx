// noinspection ES6CheckImport
import SES from 'aws-sdk/clients/ses'

const ses = new SES();
const emailAddress = process.env.EMAIL_ADDRESS;

function sendEmail({ to, subject, body }) {
  // noinspection JSUnusedLocalSymbols
  ses.sendEmail({
    Source: to,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: {
        Data: subject
      },
      Body: {
        Text: {
          Data: body
        }
      }
    }
  }, (err, _data) => {
    if (err) throw err
  })
}

export default (message) => sendEmail(
  {
    to: emailAddress,
    subject: 'HSX Report',
    body: JSON.stringify(message)
  }
)