🌍 Wanderlust
🌐 **Live Demo:** [Visit Wanderlust on Render](https://wanderlust-xc8i.onrender.com)

**Wanderlust** is a full-stack web application for browsing, creating, and reviewing travel listings with interactive map integration and secure user authentication.

---

## 📚 Table of Contents

- [Project Overview](#project-overview)  
- [Features](#features)  
- [Technologies Used](#technologies-used)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Deployment](#deployment)  
- [Project Structure](#project-structure)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

---

## 🌐 Project Overview

**Wanderlust** is a full-stack web application inspired by Airbnb, designed to allow users to browse, create, edit, and review travel listings like hotels and vacation rentals.  
It features:

- Secure user authentication
- Cloud-based image storage
- Interactive maps with location data
- Joi-based data validation
- Production-ready deployment on Render

This project demonstrates end-to-end skills in full-stack development, RESTful APIs, and modern frontend design.

---

## ✨ Features

- 🔐 **User Authentication**: Secure signup/login/logout using Passport.js with hashed passwords.
- 🏡 **Listing Management**: Full CRUD operations on listings (title, location, price, images).
- 📝 **Review System**: Authenticated users can add/delete ratings and reviews.
- 🗺️ **Map Integration**: Interactive Mapbox & Leaflet-based map showing listing locations.
- ☁️ **Image Uploads**: Integrated with Cloudinary using Multer for file upload.
- ✅ **Data Validation**: Joi schema validation to protect backend integrity.
- ⚠️ **Error Handling**: ExpressError and `wrapAsync` for user-friendly error responses.
- 📱 **Responsive Design**: Built with Bootstrap 5 for mobile and desktop users.

---

## 🛠 Technologies Used

| Category       | Technologies |
|----------------|--------------|
| **Backend**    | Node.js, Express.js |
| **Database**   | MongoDB with Mongoose |
| **Frontend**   | EJS, Bootstrap 5, Vanilla JS |
| **Authentication** | Passport.js, passport-local-mongoose |
| **Image Storage**  | Cloudinary, Multer |
| **Mapping**    | Mapbox GL JS, Leaflet |
| **Validation** | Joi |
| **Deployment** | Render |
| **Session Mgmt** | Express-session, Connect-flash |

---

### 🏠 Homepage
![Screenshot 2025-07-05 114238](https://github.com/user-attachments/assets/abefd69d-c478-42f7-b348-09d3932dfb14)

### 📝  Listing 
![Screenshot 2025-07-05 114306](https://github.com/user-attachments/assets/30c01214-ff34-4b20-9a7d-b27b38f45613)

### 📍 Map View
![Screenshot 2025-07-05 114326](https://github.com/user-attachments/assets/0d5f8b17-eb1e-47ac-ab67-2b8b92c73007)

---

## 🧰 Installation

To run Wanderlust locally:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/wanderlust.git
cd wanderlust
