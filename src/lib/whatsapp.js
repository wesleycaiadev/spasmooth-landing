export async function sendWhatsAppMessage(phone, text) {
  const accountPhone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;

  if (!accountPhone || !apikey) {
    console.error('CallMeBot credentials are not configured in environment variables.');
    return false;
  }

  // Format the text by URL encoding it
  const encodedText = encodeURIComponent(text);

  // Endpoint structure for CallMeBot
  const url = `https://api.callmebot.com/whatsapp.php?phone=${accountPhone}&text=${encodedText}&apikey=${apikey}`;

  try {
    const response = await fetch(url, { method: 'GET' });
    if (response.ok) {
      console.log('WhatsApp message sent successfully via CallMeBot.');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Failed to send WhatsApp message via CallMeBot:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Network error when sending WhatsApp message:', error);
    return false;
  }
}
