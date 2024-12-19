import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logoJ5Pharmacy from "../assets/icon.png";

const LoadingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            // Check user type and redirect accordingly
            if (!user) {
                navigate("/login");
                return;
            }

            // Check if it's a POS user (pharmacist)
            if (user.staffId || user.isPOS) {
                navigate("/pos");
                return;
            }

            // For PMS users (Admin/Manager)
            if (user.role === 'ADMIN') {
                navigate("/admin/dashboard");
            } else if (user.role === 'MANAGER') {
                navigate("/manager/dashboard");
            } else {
                navigate("/login");
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate, user]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#FCFCFC] -mt-6">
            <div className="text-center">
                <div className="flex justify-center items-end">
                    <img src={logoJ5Pharmacy} className="w-[65px] h-[100px]" alt="Pharmacy Logo" />
                    <h1 className="titleNameLoading">Pharmacy</h1>
                </div>
                <span className="loader"></span>
            </div>
        </div>
    );
};

export default LoadingPage;
