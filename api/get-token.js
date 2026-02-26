// /api/get-token.js
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // Load your private key (keep it secure, do NOT commit to GitHub)
    const privateKeyPath = path.resolve('./server.key');
    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

    // JWT payload
    const payload = {
      iss: process.env.3MVG9wt4IL4O5wvLPJcSaG1g61Qfiz47yTTk84_R7B4K8dgarc4NmUS_pq2wqug45aH4eBWc0hAWQwRpm8XrV, // Connected App Consumer Key
      sub: process.env.vikky62066kumar@gmail.com,     // Salesforce username to impersonate
      aud: 'https://login.salesforce.com',  // Or 'https://test.salesforce.com' for sandbox
      exp: Math.floor(Date.now() / 1000) + 180 // 3 minutes from now
    };

    // Sign JWT using RS256
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

    // Exchange JWT for access token
    const response = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
      })
    });

    const data = await response.json();

    if (!data.access_token) {
      console.error('Error fetching Salesforce token:', data);
      return res.status(500).json({ error: 'Failed to obtain access token' });
    }

    // Return token and instance URL to frontend
    res.status(200).json({
      access_token: data.access_token,
      instance_url: data.instance_url
    });
  } catch (err) {
    console.error('JWT token function error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
