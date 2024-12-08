import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoJ5Pharmacy from "../assets/icon.png";

const LoadingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/admin/dashboard");
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#FCFCFC] -mt-6">
            <div className="text-center">
                <div className="flex justify-center items-end">
                    <img src={logoJ5Pharmacy} className="w-[65px] h-[100px]" alt="Pharmacy Logo" />
                    <h1 className="titleNameLoading">Pharmacy</h1>
                </div>
                <span className="loader"></span> {/* Add loading bar */}
            </div>
        </div>
    );
};

export default LoadingPage;
