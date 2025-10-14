import React from "react";
import "../App.css"; 
import LoginForm from "../components/LoginForm.tsx";

function Login() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <LoginForm />
    </div>
  );
}

export default Login;
