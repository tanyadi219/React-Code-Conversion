'use client'
import { useFormik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5500";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Password is required')
      .matches(/[a-z]/, 'lowercase letter is required')
      .matches(/[A-Z]/, 'uppercase letter is required')
      .matches(/[0-9]/, 'number is required')
      .matches(/[@#$%&*/]/, 'special character is required')
      .min(8, 'must contain atleast 8 characters'),
});

const Login = () => {
    const router = useRouter();
    const [authError, setAuthError] = useState("");

    const loginForm = useFormik({
      initialValues: {
        email: "",
        password: "",
      },
      onSubmit: async (values, { setSubmitting }) => {
        setAuthError("");
        try {
          const res = await axios.post(`${API_URL}/user/authenticate`, values);
          const { token, user } = res.data;

          // save token for future authenticated requests
          localStorage.setItem("token", token);
          if (user) localStorage.setItem("user", JSON.stringify(user));

          router.push("/"); // change to wherever you want to land after login
        } catch (err) {
          console.log(err);
          if (err.response?.status === 403) {
            setAuthError("Invalid email or password");
          } else {
            setAuthError("Something went wrong. Please try again.");
          }
        } finally {
          setSubmitting(false);
        }
      },
      validationSchema: LoginSchema
    });

    return (
    <div className='bg-gray-100 min-h-screen py-10'>
    <div className="max-w-lg mx-auto bg-white border border-gray-200 rounded-xl shadow-2xs">
      <div className="p-4 sm:p-7">
        <div className="text-center">
          <h3 id="hs-modal-signin-label" className="block text-2xl font-bold text-gray-800">Login</h3>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account yet?
            <a className="text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium" href="/signup">
              Sign up here
            </a>
          </p>
        </div>

        <form onSubmit={loginForm.handleSubmit} className="mt-5">
          <div className="grid gap-y-4">

            {authError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                {authError}
              </p>
            )}

            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-gray-800">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={loginForm.handleChange}
                onBlur={loginForm.handleBlur}
                value={loginForm.values.email}
                className="py-2.5 sm:py-3 px-4 block w-full bg-white border-gray-200 rounded-lg sm:text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-700 focus:ring-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                required
              />
              {(loginForm.errors.email && loginForm.touched.email) && (
                <p className="text-xs text-red-600 mt-2">{loginForm.errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-gray-800">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                onChange={loginForm.handleChange}
                onBlur={loginForm.handleBlur}
                value={loginForm.values.password}
                className="py-2.5 sm:py-3 px-4 block w-full bg-white border-gray-200 rounded-lg sm:text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-700 focus:ring-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                required
              />
              {(loginForm.errors.password && loginForm.touched.password) && (
                <p className="text-xs text-red-600 mt-2">{loginForm.errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginForm.isSubmitting}
              className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg bg-blue-600 border border-transparent text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loginForm.isSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}

export default Login;