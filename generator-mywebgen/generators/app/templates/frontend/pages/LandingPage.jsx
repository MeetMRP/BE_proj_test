import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <main>
        <h1>Welcome to the Landing Page</h1>
        <p>This is a simple landing page.</p>
        <Link to="/contact">Go to Contact Page</Link>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
