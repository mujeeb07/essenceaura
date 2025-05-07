## 💎 Essenceaura – E-commerce Platform for Perfumes

Essenceaura is a full-featured e-commerce web application focused on the sale of perfumes. 
It supports end-to-end user shopping experience and admin management with advanced features 
like wallet integration, referral system, and offer management.

---

### 🥅 Project Goals

- Build a responsive and user-friendly e-commerce platform specialized in perfumes.
- Implement key e-commerce workflows including cart, checkout, product management, and returns.
- Add business features like wallet system, referral system, and soft delete for safer product handling.
- Ensure scalability and maintainability using clean MVC architecture.

---

### ⚙️ Development Process

1. **Planning & Structuring**  
   - Identified core features and designed user/admin flows.  
   - Created database models and backend routes based on modular design.

2. **Frontend Development**  
   - Developed dynamic pages using **EJS (Embedded JavaScript)** templating.  
   - Used CSS and Bootstrap for responsive and consistent UI components.

3. **Backend Development**  
   - Built RESTful APIs using **Node.js** and **Express.js**.  
   - Managed data using **MongoDB** with Mongoose ODM.  
   - Applied session-based authentication and route protection.

4. **Feature Integration**  
   - Implemented product management, cart, wallet, offers, and referral flow in stages.  
   - Integrated Razorpay and Cash on Delivery for order payments.  

5. **Testing & Deployment**  
   - Manually tested all major user/admin flows (cart, return, payment).  
   - Deployed on **AWS Cloud** with a custom domain purchased from **GoDaddy**.

---

### 🧩 Features

#### 🛍️ User-Side Features:
- User registration, login, and session management.
- Product browsing, filtering, and wishlist.
- Cart management with quantity and price calculation.
- Apply coupon codes at checkout.
- Wallet integration to use cashback or referral credit.
- Referral system to invite friends and earn wallet credits.
- Order history and return request functionality.

#### 🧑‍💼 Admin-Side Features:
- Admin login and dashboard.
- Add/edit/soft-delete products (without permanent deletion).
- Manage offers, coupon codes, and discounts.
- Handle user orders, returns.

#### 💡 Other Functionalities:
- Secure authentication and route protection.
- Razorpay integration for online payments.
- Dynamic EJS-based views and modular routing.
- Flash messages and error handling using middleware.
- Clean folder structure and reusable components.

---

### 🚀 Tech Stack

- **Frontend**: EJS, CSS, Bootstrap  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **Payment Gateway**: Razorpay  
- **Authentication**: Session-based auth  
- **Hosting**: AWS (with custom domain from GoDaddy)
