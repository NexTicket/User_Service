# User Service

A Node.js user authentication service using Firebase Admin SDK.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase Admin SDK credentials:
     ```
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key content here\n-----END PRIVATE KEY-----"
     PORT=4001
     ```

3. **Firebase Admin SDK Setup:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings → Service Accounts
   - Generate a new private key
   - Use the downloaded JSON file to fill in your environment variables

## Running the Service

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## API Endpoints

### Public Endpoints
- `GET /` - Service status
- `GET /health` - Health check

### Protected Endpoints (require Bearer token)
- `GET /profile` - Get user profile data

## Authentication

This service uses Firebase ID tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-firebase-id-token>
```

## Error Handling

The service handles various Firebase authentication errors:
- Invalid or missing token
- Expired tokens
- Invalid token signatures
- Missing user metadata

## Project Structure

```
src/
├── index.mts          # Main server file
├── firebase.mts       # Firebase Admin SDK configuration
├── middlewares/
│   └── auth.mts       # Authentication middleware
└── types/
    └── express.d.ts   # TypeScript type declarations
```
