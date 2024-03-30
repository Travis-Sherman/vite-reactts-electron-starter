/* eslint-disable react/function-component-definition */
import React, { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginSlider from '../components/LoginSlider';
import LoginForm from '../components/LoginForm';

interface RegisterProps {}

const Register: FC<RegisterProps> = () => {
  const navigate = useNavigate(); // Navigate hook from react-router-dom
  const [email, setEmail] = useState<string>(''); // State for email input
  const [password, setPassword] = useState<string>(''); // State for password input
  const [emailError, setEmailError] = useState<string>(''); // State for email error message
  const [passwordError, setPasswordError] = useState<string>(''); // State for password error message
  const nameList: string[] = ['John Doe', 'John Lark']; // List of names for demo
  const [name, setName] = useState<string>('Name Here'); // State for name input

  // Function to validate email
  const validateEmail = (): boolean => {
    // Regular expression for email validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Function to validate password
  const validatePassword = (): boolean => {
    if (password.length < 8 || password.length > 20) {
      setPasswordError('Password must be between 8 and 20 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const isEmailValid: boolean = validateEmail();
    const isPasswordValid: boolean = validatePassword();

    if (isEmailValid && isPasswordValid) {
      navigate('/home'); // Redirect to login page on successful registration
    }
  };

  return (
    // Register section layout
    <section className="max-w-[1340px] xl:max-w-full container min-h-screen mx-auto flex flex-col lg:flex-row xl:gap-14">
      {/* Login slider component */}
      <LoginSlider />

      {/* Login form component with link to login page */}
      <LoginForm
        linkTo="/login" // Link to login page
        handleSubmit={handleSubmit} // Submission handler function
        email={email} // Email state
        setEmail={setEmail} // Email state setter function
        password={password} // Password state
        setPassword={setPassword} // Password state setter function
        validateEmail={validateEmail} // Email validation function
        validatePassword={validatePassword} // Password validation function
        emailError={emailError} // Email error message
        passwordError={passwordError} // Password error message
        name={name} // Name state
        setName={setName} // Name state setter function
        nameList={nameList} // List of names
        text="Login" // Text for link to login page
      />
    </section>
  );
};

export default Register; // Exporting Register component
