# OAuth 2.0 Implementation: Upfirst

This project demonstrates a simple OAuth 2.0 implementation using TypeScript. It includes two main API endpoints for OAuth 2.0 authorization and token exchange. The project uses `express` for the server and `jose` for handling JWT tokens.

## Prerequisites

- Node.js installed (preferably the latest LTS version)
- A terminal or command line interface

## Setup

Follow these steps to set up and run the project locally.

### 1. Clone the repository


Clone the repository to your local machine:

```code
git clone https://github.com/your-repo-name/upfirst.git](https://github.com/ndyarborough/upfirst-oauth2.git
cd upfirst
```

### 2. Install Dependencies


```bash
npm install
```

### 3. Running the application


```bash
npm run start;
npm run start:process;
```

### 4. Access the API


#### Authorization Endpoint
- URL: http://localhost:8080/api/oauth/authorize
- Method: GET
- Description: This endpoint handles the OAuth 2.0 authorization request with response_type=code. Upon successful authorization, the user is redirected to the specified redirect_uri with an appended code parameter.

```bash
GET http://localhost:8080/api/oauth/authorize?response_type=code&client_id=upfirst&redirect_uri=http://localhost:8081/process&state=SOME_STATE
```

#### Example Response:

- Status: 302 found
- Headers: Location: http://localhost:8081/process?code=SOME_CODE&state=SOME_STATE

#### Token Endpoint:

- URL: http://localhost:8080/api/oauth/token
- Method: POST
- Description: This endpoint exchanges the authorization code for an access token

#### Example Request:

```bash
POST http://localhost:8080/api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=SOME_CODE&client_id=upfirst&redirect_uri=http://localhost:8081/process
```

#### Example Response:

```json
{
  "access_token": "SOME_JWT_ACCESS_TOKEN",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "SOME_REFRESH_TOKEN"
}
```
