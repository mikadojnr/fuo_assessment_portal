import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; 
import ParticlesBackground from "../components/ParticlesBackground"
import UniversityLogo from "../components/UniversityLogo"

const Home = () => {
  const { currentUser } = useAuth();

  // Determine role-based dashboard path
  const getDashboardPath = () => {
    if (currentUser?.role === "student") return "/student-dashboard";
    if (currentUser?.role === "lecturer") return "/lecturer-dashboard";
    return "/";
  };

  return (
    <div className="min-h-screen w-full md:flex relative bg-gradient-to-br from-[#2A5C82] to-[#00BFA5] items-center justify-center">
      <ParticlesBackground />
      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
        <UniversityLogo className="w-32 h-32 mb-6" />
        <h1 className="text-5xl font-extrabold mb-4 text-gray-900 text-white leading-tight">
          Welcome to University LMS
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl text-white">
          Your comprehensive platform for managing assessments, tracking student progress, and enhancing learning
          experiences.
        </p>

        {/* Conditional Buttons */}
        {currentUser ? (
          <Link
            to={getDashboardPath()}
            className="px-8 py-3 bg-[#2A5C82] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1e4460] transition-all duration-300 transform hover:scale-105"
          >
            Access Your Dashboard
          </Link>
        ) : (
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="px-8 py-3 bg-[#2A5C82] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1e4460] transition-all duration-300 transform hover:scale-105"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 bg-[#00BFA5] text-white font-semibold rounded-lg shadow-lg hover:bg-[#009e8f] transition-all duration-300 transform hover:scale-105"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
