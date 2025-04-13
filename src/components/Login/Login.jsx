// import React, { useState } from 'react';
// import logo from "../../assets/SSS_Logo.png";
// import './Login.css';

// function Login() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });

//   const [errors, setErrors] = useState({
//     email: '',
//     password: '',
//     submitted: false
//   });

//   const handleChange = (e) => {
//     const { id, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [id]: value
//     }));
//   };

//   const validateForm = () => {
//     const newErrors = {
//       email: formData.email ? '' : 'Email is required',
//       password: formData.password ? '' : 'Password is required',
//       submitted: true
//     };

//     setErrors(newErrors);
    
//     return Object.values(newErrors).every(error => error === '');
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (validateForm()) {
//       console.log('Login submitted:', formData);
//       // Add your login logic here (API call, etc.)
//     }
//   };

//   return (
//     <>
//     <div className="Login-container">
//       <div className="Login-wrapper">
//         <div className="Login-formContainer">
//           <h1 className="Login-title">Welcome</h1>
//           <p className="Login-subtitle">Login to continue</p>

//           <form onSubmit={handleSubmit} className="Login-form">
//             <div className="Login-inputGroup">
//               <input
//                 type="email"
//                 id="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className={`Login-input ${errors.submitted && errors.email ? 'error' : ''}`}
//               />
//               <label htmlFor="email" className="Login-label">Email</label>
//               {errors.submitted && errors.email && (
//                 <span className="Login-error">{errors.email}</span>
//               )}
//             </div>

//             <div className="Login-inputGroup">
//               <input
//                 type="password"
//                 id="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className={`Login-input ${errors.submitted && errors.password ? 'error' : ''}`}
//               />
//               <label htmlFor="password" className="Login-label">Password</label>
//               {errors.submitted && errors.password && (
//                 <span className="Login-error">{errors.password}</span>
//               )}
//             </div>

//             <div className="Login-options">
//               <div className="Login-remember">
//                 <input type="checkbox" id="remember" />
//                 <label htmlFor="remember">Remember me</label>
//               </div>
//               <a href="/forgot-password" className="Login-forgot">Forgot password?</a>
//             </div>

//             <button type="submit" className="Login-submitButton">
//               Log In
//             </button>

//             <div className="Login-footer">
//               Don't have an account? <a href="/signup" className="Login-footerLink">Sign up</a>
//             </div>
//           </form>
//         </div>
        
//         <div className="Login-logoContainer">
//           <img src={logo} alt="Company Logo" className="Login-logo"/>
//         </div>
//       </div>
//     </div>
//     </>
//   );
// }

// export default Login;


import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    login(role);
    if (role === "admin") navigate("/admin");
    else if (role === "secretary") navigate("/secretary");
    else navigate("/dashboard");
  };

  return (
    <>
    <div>
      <h2>Select Role to Login (for testing)</h2>
      <button onClick={() => handleLogin("admin")}>Login as Admin</button>
      <button onClick={() => handleLogin("secretary")}>Login as Secretary</button>
      <button onClick={() => handleLogin("user")}>Login as User</button>
    </div>
    </>
  );
};

export default Login;
