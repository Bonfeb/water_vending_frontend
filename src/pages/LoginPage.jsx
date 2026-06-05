import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => (
  <AuthLayout title="Welcome Back" subtitle="Sign in to your AquaDrop account">
    <LoginForm />
  </AuthLayout>
);

export default LoginPage;