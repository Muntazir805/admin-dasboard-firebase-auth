# UserHub — Firebase Admin Panel

A beginner-friendly responsive admin panel built with HTML, CSS, JavaScript, Font Awesome, Firebase Authentication and Cloud Firestore.

## Features

- Admin email/password sign-in and Google sign-in
- User signup with email verification
- Password reset
- User list loaded from Firestore
- User search by name, email or contact
- Dashboard counts for users and categories
- Category create, read, update and delete
- Responsive dark layout with mobile navigation
- Firestore security rules

## Folder structure

```text
firebase-admin-panel/
├── admin/
│   ├── index.html
│   ├── dashboard.js
│   ├── users.html
│   ├── users.js
│   ├── categories.html
│   └── categories.js
├── shared/
│   ├── firebase.js
│   ├── admin-config.js
│   └── admin-guard.js
├── firebase_config.js
├── index.html
├── login.js
├── signup.html
├── signup.js
├── forgotPassword.html
├── forgotPassword.js
├── styles.css
└── firestore.rules
```

## Setup

1. Create a Firebase project and register a Web App.
2. Copy your Firebase web configuration into `firebase_config.js`.
3. In `shared/admin-config.js`, replace `admin@example.com` with your administrator email.
4. In `firestore.rules`, replace `admin@example.com` with the same administrator email, then publish the rules.
5. In Firebase Authentication, enable Email/Password and Google providers.
6. Add your local development domain (for example `localhost`) to Authentication > Settings > Authorized domains.
7. Create the administrator account using Firebase Authentication. Verify the administrator email. If using Google, sign in with the same administrator email.
8. Open the project with VS Code Live Server, then visit `index.html`.

## Optional Cloudinary profile photo upload

The signup page supports an optional profile photo. In `signup.js`, set `CLOUDINARY_UPLOAD_PRESET` to the name of an unsigned upload preset in your Cloudinary account. The cloud name is currently set to `ppiny588`; change it if that is not your cloud.

Do not place a Cloudinary API secret in browser JavaScript. For a quick test without setting Cloudinary, sign up without selecting a photo.

## Firestore data

User profiles are stored in `users/{uid}`:

- `uid`
- `name`
- `email`
- `contactNo`
- `imageUrl`
- `createdAt`

Categories are stored in `categories/{documentId}`:

- `categoryName`
- `createdAt`
- `updatedAt` (after editing)

Passwords are never written to Firestore. Firebase Authentication handles password storage.

## Important security note

The email allow-list in the front-end is only used for page navigation and display. Firestore Security Rules enforce access to user lists and categories. For a production application, use Firebase custom claims for admin roles instead of relying on an email allow-list.
