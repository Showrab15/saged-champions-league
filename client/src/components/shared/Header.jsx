/* eslint-disable no-unused-vars */
// client/src/components/shared/Header.jsx
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { auth } from "../../firebase/config";

const Header = ({ user }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-secondary border-b-4 border-primary"
    >
      <div className="container mx-auto px-4 py-5">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              🏆
            </motion.span>
            <div>
              <h1 className="text-3xl font-bold text-primary uppercase tracking-wider">
                SAGED Champions League
              </h1>
              <p className="text-sm text-gray-400">
                The Ultimate Cricket Championship
              </p>
            </div>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-primary transition-colors duration-300 font-semibold"
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  to="/admin"
                  className="text-gray-300 hover:text-primary transition-colors duration-300 font-semibold"
                >
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-primary bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                Admin Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
