# Circle Wallet Integration Setup

This application now uses Circle's User-Controlled Wallets instead of MetaMask.

## Prerequisites

1. **Circle Account**: Sign up at [Circle Developer Portal](https://developers.circle.com/)
2. **API Key**: Get your API key from the Circle dashboard
3. **Backend Server**: You'll need a backend to generate user tokens (JWT)

## Environment Variables

Add these to your `.env` file:

```env
REACT_APP_CIRCLE_API_KEY=your_circle_api_key_here
REACT_APP_BACKEND_URL=http://localhost:3001
```

## Backend Setup Required

Circle wallets require a backend server to generate user tokens (JWT). You need to create an endpoint:

### Example Backend Endpoint (Node.js/Express)

```javascript
// POST /api/user/token
app.post('/api/user/token', async (req, res) => {
  const { userId } = req.body;
  
  // Generate JWT token using Circle's SDK or API
  // This is a simplified example - you'll need to use Circle's backend SDK
  const userToken = await generateCircleUserToken(userId);
  
  res.json({ userToken });
});
```

## Installation

1. Install dependencies:
```bash
cd arccredit-frontend
npm install
```

2. Set up your `.env` file with Circle API key

3. Start your backend server (if you have one)

4. Start the frontend:
```bash
npm start
```

## Important Notes

- **Local Development**: Circle wallets work best with testnets (Sepolia, etc.). For local Hardhat networks, you may need to use Circle's testnet or configure accordingly.
- **Transaction Signing**: Circle wallets use MPC (Multi-Party Computation) signing, which requires challenge flows for transactions. Smart contract interactions will need to be adapted to use Circle's transaction methods.
- **User Tokens**: User tokens must be generated server-side for security. Never generate them in the frontend.

## Troubleshooting

- **"Circle API key not configured"**: Make sure `REACT_APP_CIRCLE_API_KEY` is set in your `.env` file
- **"Backend not available"**: The app will use a mock token for development, but this won't work for real transactions
- **Transaction failures**: Circle wallets require challenge flows for transactions - make sure you implement the challenge UI

## Resources

- [Circle Developer Documentation](https://developers.circle.com/)
- [User-Controlled Wallets SDK](https://developers.circle.com/wallets/user-controlled/web-sdk)
- [Circle API Reference](https://developers.circle.com/api-reference)


