# connection REST API Documentation

This document outlines the API endpoints, methods, payloads, and response patterns for the dating application.

All API routes are prefixed by `/api`.

---

## 1. Authentication Domain (`/api/auth`)

### 1.1 User Registration
* **Endpoint**: `/api/auth/register`
* **Method**: `POST`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "jane@gmail.com",
  "password": "securepassword123",
  "name": "Jane Doe",
  "age": 22,
  "gender": "female",
  "preference": "male",
  "bio": "Dancer and traveler.",
  "location": "Paris"
}
```
* **Success Response (201 Created)**:
```json
{
  "success": true,
  "user": {
    "_id": "603f7e5d8e785b3b7c89d2d1",
    "email": "jane@gmail.com",
    "name": "Jane Doe",
    "age": 22,
    "gender": "female",
    "preference": "male",
    "bio": "Dancer and traveler.",
    "location": "Paris",
    "interests": [],
    "photos": [],
    "matches": []
  },
  "accessToken": "eyJhbGciOi..."
}
```
* **Sets Cookie**: `refreshToken=eyJhbGciOi...; HttpOnly; Secure; SameSite=Lax`

### 1.2 User Login
* **Endpoint**: `/api/auth/login`
* **Method**: `POST`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "jane@gmail.com",
  "password": "securepassword123"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "user": { ... },
  "accessToken": "eyJhbGciOi..."
}
```

### 1.3 User Logout
* **Endpoint**: `/api/auth/logout`
* **Method**: `POST`
* **Access**: Private (requires Access Token)
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```
* **Clears Cookie**: Overwrites `refreshToken` with expiration date in the past.

### 1.4 Token Rotation
* **Endpoint**: `/api/auth/refresh`
* **Method**: `POST`
* **Access**: Public (requires HttpOnly `refreshToken` cookie)
* **Response (200 OK)**:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOi..."
}
```

### 1.5 Get Profile Context
* **Endpoint**: `/api/auth/me`
* **Method**: `GET`
* **Access**: Private (requires Access Token)
* **Response (200 OK)**:
```json
{
  "success": true,
  "user": { ... }
}
```

---

## 2. User Profiles Domain (`/api/users`)

### 2.1 Update Profile Metadata
* **Endpoint**: `/api/users/profile`
* **Method**: `PUT`
* **Access**: Private
* **Request Body**:
```json
{
  "bio": "Updated biography details.",
  "preference": "both",
  "interests": ["cooking", "hiking", "fitness"]
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### 2.2 Upload Profile Photo
* **Endpoint**: `/api/users/profile/photos`
* **Method**: `POST`
* **Access**: Private
* **Content-Type**: `multipart/form-data`
* **Payload**: `photo` (file, max 5MB)
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "user": {
    "photos": [
      {
        "_id": "603f7e5d8e785b3b7c89d2d9",
        "url": "/uploads/photo-161603562-421715.jpg",
        "publicId": null
      }
    ],
    ...
  }
}
```

### 2.3 Delete Profile Photo
* **Endpoint**: `/api/users/profile/photos/:photoId`
* **Method**: `DELETE`
* **Access**: Private
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Photo removed successfully",
  "user": { ... }
}
```

### 2.4 Discovery Feed Generator
* **Endpoint**: `/api/users/discovery`
* **Method**: `GET`
* **Access**: Private
* **Response (200 OK)**:
```json
{
  "success": true,
  "results": 2,
  "feed": [
    {
      "_id": "603f7e5d8e785b3b7c89d3e4",
      "name": "Sarah Connor",
      "age": 28,
      "gender": "female",
      "preference": "male",
      "bio": "Fighting for the future.",
      "photos": [{ "url": "/uploads/sarah.jpg" }]
    }
  ]
}
```

---

## 3. Swiping Domain (`/api/swipes`)

### 3.1 Register Swipe
* **Endpoint**: `/api/swipes`
* **Method**: `POST`
* **Access**: Private
* **Request Body**:
```json
{
  "swipedUserId": "603f7e5d8e785b3b7c89d3e4",
  "type": "like"
}
```
* **Response (200 OK - No Match)**:
```json
{
  "success": true,
  "match": false
}
```
* **Response (200 OK - Mutual Match Triggered)**:
```json
{
  "success": true,
  "match": true,
  "matchDetails": {
    "matchId": "603f7e5d8e785b3b7c89d4d8",
    "partner": {
      "_id": "603f7e5d8e785b3b7c89d3e4",
      "name": "Sarah Connor",
      "photos": [{ "url": "/uploads/sarah.jpg" }]
    }
  }
}
```

---

## 4. Matches Domain (`/api/matches`)

### 4.1 Fetch Active Matches
* **Endpoint**: `/api/matches`
* **Method**: `GET`
* **Access**: Private
* **Response (200 OK)**:
```json
{
  "success": true,
  "matches": [
    {
      "_id": "603f7e5d8e785b3b7c89d4d8",
      "partner": {
        "_id": "603f7e5d8e785b3b7c89d3e4",
        "name": "Sarah Connor",
        "photos": [{ "url": "/uploads/sarah.jpg" }]
      },
      "lastMessage": {
        "text": "Hey! Nice to meet you.",
        "sender": "603f7e5d8e785b3b7c89d3e4",
        "seen": true
      }
    }
  ]
}
```

### 4.2 Unmatch User
* **Endpoint**: `/api/matches/:matchId`
* **Method**: `DELETE`
* **Access**: Private
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Unmatched profile successfully"
}
```

---

## 5. Messages Domain (`/api/messages`)

### 5.1 Fetch Chat Logs
* **Endpoint**: `/api/messages/:matchId`
* **Method**: `GET`
* **Access**: Private
* **Response (200 OK)**:
```json
{
  "success": true,
  "messages": [
    {
      "_id": "603f7e5d8e785b3b7c89d6a3",
      "matchId": "603f7e5d8e785b3b7c89d4d8",
      "sender": "603f7e5d8e785b3b7c89d3e4",
      "text": "Hey! Nice to meet you.",
      "image": "",
      "seen": true,
      "createdAt": "2026-05-20T13:50:56Z"
    }
  ]
}
```
