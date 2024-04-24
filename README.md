# EduConcept || An EdTech Platform

## Overview
EduConcept is an advanced ed-tech platform designed to facilitate an immersive learning experience by connecting students and instructors globally. Built using the MERN stack (MongoDB, ExpressJS, ReactJS, NodeJS), this platform enables users to create, consume, and rate educational content.

## Features
- **Interactive Learning Portal:** Offers a dynamic environment for students with tools for engaging with courses and tracking progress.
- **Instructor Dashboard:** Provides instructors with the ability to create, manage, and analyze the performance of their courses.
- **Comprehensive Course Management:** Enables course creation, updating, deletion, and browsing.
- **User Authentication:** Supports secure login, signup, and password management features, including OTP verification.
- **Payment Integration:** Integrates Razorpay for secure financial transactions allowing course purchase and enrollment.
- **Cloud-Based Media Management:** Utilizes Cloudinary for efficient storage and retrieval of multimedia content.

## Technologies Used
- **Frontend:** ReactJS, Redux, CSS, Tailwind CSS
- **Backend:** NodeJS, ExpressJS
- **Database:** MongoDB
- **Others:** JWT, Bcrypt, Mongoose, Cloudinary, Razorpay

## System Architecture
EduConcept follows a monolithic architecture with the backend built using Node.js and Express.js, and MongoDB as the primary database. This design ensures tight integration and robust performance across various features.

### Architecture Diagram
![EduConcept Architecture Diagram](https://res.cloudinary.com/dpnvacdqr/image/upload/v1713969928/eduConcept-backendImages/971c3568-cb15-4b89-a0b1-77595e4ad092.png)


## Installation

1. Clone the repository:

    ```
    git clone https://github.com/kashiiitech/EduConcept.git
    ```

2. Navigate into the project directory:

    ```
    cd EduConcept
    ```

3. Install dependencies:

    ```
    npm install
    ```

4. Run the app:

    ```
    npm start
    ```

---
**NOTE**

## Configuration

Before running the application, you need to set up the environment variables required for the system to function correctly. Create a `.env` file in the root directory of the project and provide the necessary configurations as shown below:

```plaintext
# Server Configuration
PORT = # write port number here
MONGODB_URL = # enter your MongoDB database URL here

# Cloudinary Configuration for media storage
CLOUD_NAME = # Cloudinary cloud name here
API_KEY = # Cloudinary API key here
API_SECRET = # Cloudinary API secret here

# Email Configuration for sending mails
MAIL_HOST = smtp.gmail.com
MAIL_USER = # Your email user here
MAIL_PASS = # Your email password here

# JWT Configuration for authentication
JWT_SECRET = # Your JWT secret here, e.g., "Kashif"

# Cloudinary Folder Configuration
FOLDER_NAME = # Name of the folder that you create in Cloudinary, e.g., "EduConcept"
```

---

## Contact Information

If you have any questions, suggestions, or issues, feel free to reach out to me. We value your feedback and are here to help.

- Project Maintainer: **Kashif Ali**
- Email: kashiiitech@gmail.com
---

**You can also open an issue in this repository if you encounter any problems or want to request a new feature.**

---
