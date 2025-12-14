# BedRock – Password Manager (Android)

**BedRock** is a secure and user-friendly **Android password manager** built using **Expo (React Native)**.
It helps users safely store, generate, analyze, and share passwords while maintaining a strong focus on **security, usability, and modern app design**.

---

## Features

### Secure Vault

* Store all your credentials in an encrypted digital vault
* Organize passwords using categories (Social, Work, Email, Card, etc.)
* Search and filter passwords easily

### Password Health & Risks

* Overall **Password Health Score (0–100)**
* Categorizes passwords into:
  * Strong
  * Weak
  * Duplicate
  * Leaked (checked against public breach databases)
* Helps users identify and fix vulnerable passwords

### Password Generator
* Industry-standard strong password generation
* Customizable filters:
  * Length
  * Uppercase / lowercase
  * Numbers
  * Special characters
* One-click copy or directly use while adding a password

### Secure Password Sharing
* Share passwords **securely between BedRock users**
* Encrypted sharing with optional notes
* Manage shared access (add/remove recipients, revoke sharing)

### Authentication & Security
* Email-based registration with **OTP verification**
* Master Password for vault access
* Optional **biometric authentication** (fingerprint)
* Secure login and logout flows

### Clean & Intuitive UI
* Guided in-app tutorial on first launch
* Quick actions for common tasks
* Well-structured navigation for smooth user experience

---
## Tech Stack

* **Frontend:** Expo, React Native
* **Language:** JavaScript / TypeScript
* **Platform:** Android
* **Authentication:** Email + OTP, Biometric Login
* **Security:** Encrypted storage & secure sharing logic

---

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/bedrock-password-manager.git

# Navigate to project directory
cd bedrock-password-manager

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

> 📌 Make sure you have **Node.js**, **npm**, and **Expo CLI** installed.

---
