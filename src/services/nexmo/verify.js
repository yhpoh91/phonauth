import axios from 'axios';

const apiKey = process.env.NEXMO_API_KEY;
const apiSecret = process.env.NEXMO_API_SECRET;
const brand = process.env.NEXMO_BRAND || 'KopiSio';
const senderId = process.env.NEXMO_SENDER_ID || 'KopiSio';
const codeLength = parseInt(process.env.NEXMO_CODE_LENGTH || '6', 10);
const workflowId = parseInt(process.env.NEXMO_WORKFLOW_ID || '1', 10);

const nexmoHost = 'https://api.nexmo.com';

const request = async (number) => {
  try {
    const url = `${nexmoHost}/verify/json`;
    const body = {
      api_key: apiKey,
      api_secret: apiSecret,
      number,
      brand,
      code_length: codeLength,
      sender_id: senderId,
      workflow_id: workflowId,
    };

    const response = await axios.post(url, body);
    const { data } = response;

    const mappedData = {
      ok: `${data.status}` === '0',
      requestId: data.request_id,
      status: data.status,
      errorText: data.error_text,
    }

    return Promise.resolve(mappedData);
  } catch (error) {
    return Promise.reject(error);
  }
};

const check = async (requestId, code) => {
  try {
    const url = `${nexmoHost}/verify/check/json`;
    const body = {
      api_key: apiKey,
      api_secret: apiSecret,
      request_id: requestId,
      code,
    };

    const response = await axios.post(url, body);
    const { data } = response;
    
    const mappedData = {
      ok: `${data.status}` === '0',
      requestId: data.request_id,
      eventId: data.event_id,
      status: data.status,
      price: data.price,
      currency: data.currency,
      estimatedPriceMessagesSent: data.estimated_price_messages_sent,
      errorText: data.error_text,
    };

    return Promise.resolve(mappedData);
  } catch (error) {
    return Promise.reject(error);
  }
};

const control = async (requestId, command) => {
  try {
    const url = `${nexmoHost}/verify/control/json`;
    const body = {
      api_key: apiKey,
      api_secret: apiSecret,
      request_id: requestId,
      cmd: command,
    };

    const response = await axios.post(url, body);
    const { data } = response;

    const mappedData = {
      status: data.status,
      command: data.command,
      errorText: data.error_text,
    }
    return Promise.resolve(mappedData);
  } catch (error) {
    return Promise.reject(error);
  }
};

const cancel = (requestId) => control(requestId, 'cancel');
const next = (requestId) => control(requestId, 'trigger_next_event');

export default {
  request,
  check,
  cancel,
  next,
};
