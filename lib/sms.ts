
export async function sendSMS(to: string, message: string) {
  // Only import twilio when function is called (avoids build-time initialization)
  const twilio = await import('twilio');
  const client = twilio.default(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    let phoneNumber = to.replace(/\D/g, '');
    if (!phoneNumber.startsWith('91') && phoneNumber.length === 10) {
      phoneNumber = `+91${phoneNumber}`;
    } else if (!phoneNumber.startsWith('+')) {
      phoneNumber = `+${phoneNumber}`;
    }
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    console.log(`SMS sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('SMS error:', error);
    return false;
  }
}