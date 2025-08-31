

// lib/api.ts
import axios from 'axios';

const API_URL = 'https://api.daydream.live/v1';
const PROMPT_API_URL = 'https://api.daydream.live/beta';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_DAYDREAM_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function createStream() {
  try {
    const PIPELINE_ID = 'pip_qpUgXycjWF6YMeSL';
    const res = await api.post('/streams', {
      pipeline_id: PIPELINE_ID,
    });
    return res.data;
  } catch (error: any) {
    console.error('Error creating stream:', error);
    throw error?.response?.data || error;
  }
}

export async function updatePrompt(streamId: string, payload: any) {
    console.log('Updating prompt with payload:', payload,streamId);
  try {
    const res = await axios.post(
      `${PROMPT_API_URL}/streams/${streamId}/prompts`,
      {params:payload},
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DAYDREAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data;
  } catch (error: any) {
    console.error('Error updating prompt:', error);
    throw error?.response?.data || error;
  }
}

export async function getStreamStatus(streamId: string) {
  try {
    const res = await api.get(`/streams/${streamId}/status`);
    return res.data;
  } catch (error: any) {
    console.error('Error getting stream status:', error);
    throw error?.response?.data || error;
  }
}


export async function getStreamStatusV2(streamId: string) {
  try {
    const res = await axios.get(`/api/stream?streamId=${encodeURIComponent(streamId)}`);
    return res.data;
  } catch (error: any) {
    console.error('Error getting stream status (v2):', error);
    throw error?.response?.data || error;
  }
}