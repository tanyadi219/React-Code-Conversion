'use client'
import { useFormik } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DotWaves from '../components/DotWaves'; // the animated dotted background

// Backend URL: uses the env variable if set, otherwise your local server
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

          // Redirect to the Convertor page after a successful login.
          // replace() removes the login page from history, so Back won't return here.
          router.replace("/Convertor");
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
      // "relative" + "overflow-hidden" keep the animated dots inside this box
      <div className="relative overflow-hidden bg-black min-h-screen flex items-center justify-center px-4 pt-24 pb-10">

        {/* Animated dotted waves fill the whole background */}
        <DotWaves />

        {/* Card: "relative z-10" keeps it above the dots.
            bg-black/50 + backdrop-blur gives a dark frosted-glass look.
            w-full on phones, but never wider than max-w-lg (32rem) */}
          <div className="relative z-10 w-full max-w-lg bg-black/25 backdrop-blur-[3px] border border-white/15 rounded-xl shadow-2xl motion-reduce:animate-none animate-[form-fade-up_0.6s_ease-out_both]">
          <div className="p-4 sm:p-7">
            {/* Heading */}
            <div className="text-center">
              <h3 className="block text-2xl font-bold text-white">Login</h3>
              <p className="mt-2 text-sm text-gray-300">
                Don't have an account yet?{" "}
                {/* {" "} adds a space, because JSX ignores spaces at line breaks */}
                <a
                  className="text-white underline decoration-2 hover:text-gray-300 focus:outline-hidden font-medium"
                  href="/signup"
                >
                  Sign up here
                </a>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={loginForm.handleSubmit} className="mt-5">
              <div className="grid gap-y-4">
                {/* Error message from the server (only shows when authError has a value) */}
                {authError && (
                  <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/40 rounded-lg p-2 text-center">
                    {authError}
                  </p>
                )}

                {/* Email field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm mb-2 text-gray-200"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    onChange={loginForm.handleChange}
                    onBlur={loginForm.handleBlur}
                    value={loginForm.values.email}
                    className="py-2.5 sm:py-3 px-4 block w-full bg-white/10 border border-white/20 rounded-lg sm:text-sm text-white placeholder:text-gray-400 focus:border-white focus:ring-white disabled:opacity-50 disabled:pointer-events-none"
                    required
                  />
                  {/* Validation error (shows only after the user has touched the field) */}
                  {loginForm.errors.email && loginForm.touched.email && (
                    <p className="text-xs text-red-300 mt-2">
                      {loginForm.errors.email}
                    </p>
                  )}
                </div>

                {/* Password field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm mb-2 text-gray-200"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    onChange={loginForm.handleChange}
                    onBlur={loginForm.handleBlur}
                    value={loginForm.values.password}
                    className="py-2.5 sm:py-3 px-4 block w-full bg-white/10 border border-white/20 rounded-lg sm:text-sm text-white placeholder:text-gray-400 focus:border-white focus:ring-white disabled:opacity-50 disabled:pointer-events-none"
                    required
                  />
                  {loginForm.errors.password && loginForm.touched.password && (
                    <p className="text-xs text-red-300 mt-2">
                      {loginForm.errors.password}
                    </p>
                  )}
                </div>

                {/* Submit button (disabled while the form is submitting).
                    The hover/press classes give it a small lift and squeeze effect. */}
                <button
                  type="submit"
                  disabled={loginForm.isSubmitting}
                  className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg bg-white border border-transparent text-black hover:bg-gray-200 focus:outline-hidden focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none motion-reduce:transition-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                >
                  {loginForm.isSubmitting ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
            {/* End Form */}
          </div>
        </div>
      </div>
    )
}

export default Login;