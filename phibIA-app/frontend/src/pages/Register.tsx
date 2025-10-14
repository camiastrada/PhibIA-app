import React from "react";
import "../App.css"; 
import RegisterForm from "../components/RegisterForm.tsx";

function Register() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <RegisterForm />
    </div>
  );
}

export default Register;
