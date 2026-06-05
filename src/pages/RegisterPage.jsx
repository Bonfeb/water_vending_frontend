import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => (
  <AuthLayout title="Create Account" subtitle="Start ordering fresh water today">
    <RegisterForm />
  </AuthLayout>
);

export default RegisterPage;