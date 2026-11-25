'use client';
import axios from 'axios';
import { useFormik } from 'formik';
import React from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { DotSpinner } from 'ldrs/react';
import 'ldrs/react/DotSpinner.css';
import DotWaves from '../components/DotWaves'; // the animated dotted background

const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string()
    .required('Password is required')
    .matches(/[a-z]/, 'lowercase letter is required')
    .matches(/[A-Z]/, 'uppercase letter is required')
    .matches(/[0-9]/, 'number is required')
    .matches(/[@#$%&*/]/, 'special character is required')
    .min(8, 'must contain atleast 8 characters'),
  confirmPassword: Yup.string()
    .required('confirmed password is required')
    .oneOf([Yup.ref('password')], 'Password must match'),
});

// Dark, see-through input style so the fields match the dark card
const inputClass =
  'border border-white/20 py-2 px-4 block w-full bg-white/10 rounded-lg text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-white focus:ring-1 focus:ring-white disabled:opacity-50 disabled:pointer-events-none';

const Signup = () => {
  const router = useRouter();

  const signupForm = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: (values, { resetForm, setSubmitting }) => {
      console.log(values);
      axios
        .post('http://localhost:5500/user/add', values)
        .then((result) => {
          resetForm();
          toast.success('User registered successfully');
          // After signup, send the user to the login page (no token is saved here)
          setTimeout(() => router.push('/login'), 1000);
        })
        .catch((err) => {
          console.log(err);
          toast.error('Something went wrong');
          setSubmitting(false);
        });
    },
    validationSchema: SignupSchema,
  });

  return (
    // "relative" + "overflow-hidden" keep the animated dots inside this box
    <div className="relative overflow-hidden bg-black min-h-screen flex items-center justify-center px-4 pt-20 pb-6">

      {/* Animated dotted waves fill the whole background */}
      <DotWaves />

      {/* Card: "relative z-10" keeps it above the dots.
          bg-black/50 + backdrop-blur gives a dark frosted-glass look,
          and the card slides up when the page loads. */}
        <div className="relative z-10 w-full max-w-lg bg-black/25 backdrop-blur-[3px] border border-white/15 rounded-xl shadow-2xl motion-reduce:animate-none animate-[form-fade-up_0.6s_ease-out_both]">
        <div className="p-5 sm:p-6">
          <div className="text-center">
            <h3 className="block text-2xl font-bold text-white">Sign up</h3>
            <p className="mt-2 text-sm text-gray-300">
              Already have an account?{' '}
              <a
                className="text-white underline decoration-2 hover:text-gray-300 focus:outline-none font-medium"
                href="/login"
              >
                Login here
              </a>
            </p>
          </div>

          <div className="mt-4">
            <a
              className="w-full py-2.5 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg bg-white/10 border border-white/20 text-white shadow-sm hover:bg-white/20 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-white/20"
              href="#"
            >
              <svg className="w-4 h-auto" width="46" height="47" viewBox="0 0 46 47" fill="none">
                <path d="M46 24.0287C46 22.09 45.8533 20.68 45.5013 19.2112H23.4694V27.9356H36.4069C36.1429 30.1094 34.7347 33.37 31.5957 35.5731L31.5663 35.8669L38.5191 41.2719L38.9885 41.3306C43.4477 37.2181 46 31.1669 46 24.0287Z" fill="#4285F4" />
                <path d="M23.4694 47C29.8061 47 35.1161 44.9144 39.0179 41.3012L31.625 35.5437C29.6301 36.9244 26.9898 37.8937 23.4987 37.8937C17.2793 37.8937 12.0281 33.7812 10.1505 28.1412L9.88649 28.1706L2.61097 33.7812L2.52296 34.0456C6.36608 41.7125 14.287 47 23.4694 47Z" fill="#34A853" />
                <path d="M10.1212 28.1413C9.62245 26.6725 9.32908 25.1156 9.32908 23.5C9.32908 21.8844 9.62245 20.3275 10.0918 18.8588V18.5356L2.75765 12.8369L2.52296 12.9544C0.909439 16.1269 0 19.7106 0 23.5C0 27.2894 0.909439 30.8731 2.49362 34.0456L10.1212 28.1413Z" fill="#FBBC05" />
                <path d="M23.4694 9.07688C27.8699 9.07688 30.8622 10.9863 32.5344 12.5725L39.1645 6.11C35.0867 2.32063 29.8061 0 23.4694 0C14.287 0 6.36607 5.2875 2.49362 12.9544L10.0918 18.8588C11.9987 13.1894 17.25 9.07688 23.4694 9.07688Z" fill="#EB4335" />
              </svg>
              Sign up with Google
            </a>

            <div className="py-2 flex items-center text-xs text-gray-400 uppercase before:flex-1 before:border-t before:border-white/20 before:me-6 after:flex-1 after:border-t after:border-white/20 after:ms-6">
              Or
            </div>
          </div>

          <form onSubmit={signupForm.handleSubmit}>
            <div className="grid gap-y-3">
              <div>
                <label htmlFor="name" className="block text-sm mb-1 text-gray-200">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  onChange={signupForm.handleChange}
                  onBlur={signupForm.handleBlur}
                  value={signupForm.values.name}
                  className={inputClass}
                  aria-describedby="name-error"
                />
                {signupForm.errors.name && signupForm.touched.name && (
                  <p className="text-xs text-red-300 mt-1" id="name-error">
                    {signupForm.errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm mb-1 text-gray-200">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  onChange={signupForm.handleChange}
                  onBlur={signupForm.handleBlur}
                  value={signupForm.values.email}
                  className={inputClass}
                  aria-describedby="email-error"
                />
                {signupForm.errors.email && signupForm.touched.email && (
                  <p className="text-xs text-red-300 mt-1" id="email-error">
                    {signupForm.errors.email}
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="password" className="block text-sm mb-1 text-gray-200">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    onChange={signupForm.handleChange}
                    onBlur={signupForm.handleBlur}
                    value={signupForm.values.password}
                    className={inputClass}
                    aria-describedby="password-error"
                  />
                  {signupForm.errors.password && signupForm.touched.password && (
                    <p className="text-xs text-red-300 mt-1" id="password-error">
                      {signupForm.errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm mb-1 text-gray-200">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    onChange={signupForm.handleChange}
                    onBlur={signupForm.handleBlur}
                    value={signupForm.values.confirmPassword}
                    className={inputClass}
                    aria-describedby="confirmPassword-error"
                  />
                  {signupForm.errors.confirmPassword && signupForm.touched.confirmPassword && (
                    <p className="text-xs text-red-300 mt-1" id="confirmPassword-error">
                      {signupForm.errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="checkbox"
                  name="checkbox"
                  type="checkbox"
                  className="shrink-0 size-4 border border-white/30 bg-white/10 rounded-sm text-white focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="checkbox" className="ms-3 text-sm text-gray-200">
                  I accept the{' '}
                  <a
                    className="text-white underline decoration-2 hover:text-gray-300 focus:outline-none font-medium"
                    href="#"
                  >
                    Terms and Conditions
                  </a>
                </label>
              </div>

              {/* White button with a small lift on hover and a squeeze when pressed.
                  The spinner color is black because the button is white. */}
              <button
                disabled={signupForm.isSubmitting}
                type="submit"
                className="w-full py-2.5 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg bg-white border border-transparent text-black hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none motion-reduce:transition-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              >
                {signupForm.isSubmitting ? (
                  <DotSpinner size="30" speed="0.9" color="black" />
                ) : (
                  'Sign Up'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;