import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import backgroundImage from "../assets/bgimg.jpg"; // Import your background image here

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // Check username and password
    if (username === "admin" && password === "admin") {
      // Navigate to the admin dashboard
      navigate("/admindashboard");
    } else if (username === "student" && password === "student") {
      // Navigate to the student dashboard
      navigate("/studentdashboard");
    } else if (username === "staff" && password === "staff") {
      // Navigate to the staff dashboard
      navigate("/staffdashboard");
    } else {
      // Handle incorrect credentials (you can show an error message or take other actions)
      console.log("Incorrect username or password");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="bg-white bg-opacity-50 max-w-screen-md px-4 py-8 sm:px-6 lg:px-8 rounded-lg w-full sm:w-[50rem]"
        // Set the opacity of the inner container here
        style={{ backdropFilter: "blur(10px)" }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">STIST</h1>
          <p className="mt-4 text-gray-500">
            Login as Staff, Student, or Admin
          </p>
          <form
            className="mt-8 space-y-4 text-center"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="text-center">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative inline-block">
                <input
                  type="text"
                  className="border w-[20rem] md:w-[25rem] rounded-lg border-blue-500 p-3 text-sm shadow-sm"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="text-center">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative inline-block">
                <input
                  type="password"
                  className="border w-[20rem] md:w-[25rem] rounded-lg border-blue-500 p-3 text-sm shadow-sm"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="mx-4">
              <Link to="/forgot-password" className="underline text-sm">
                Forgot Password?
              </Link>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-[20rem] bg-blue-400 text-center py-2 font-bold text-lg rounded-lg"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
