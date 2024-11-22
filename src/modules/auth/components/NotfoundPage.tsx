import Footer from "./Footer";
import logoJ5Pharmacy from '../assets/icon.png';

const NotFound = () => {
    return (
        <div
            className=" flex flex-col min-h-screen bg-[#FCFCFC] bg-cover bg-center bg-no-repeat"
            style={{
                // backgroundImage: `url(${})`, 
            }}
        >
            <div className="my-auto text-center">
                <div className="relative w-[50px] h-[50px] mx-auto mb-4">
                    <img
                        src={logoJ5Pharmacy}
                        alt="Logo"
                        className="w-full h-full object-contain absolute top-0 left-0"
                    />
                </div>
                <h2 className="text-4xl font-bold text-[#1D242E]">404</h2>
                <h1 className="text-5xl font-bold text-[#1D242E] mt-[-4px]">Oops, page not found</h1>
                <p className="mx-auto mt-3 text-[#6c757d] text-sm leading-6 max-w-[455px]">
                    The page you're looking for doesn't exist or has been moved. Please check the URL or return to the homepage.
                </p>
                <button
                    type="button"
                    className="mt-9 px-6 py-3 text-white font-semibold bg-[#0F8420] rounded-[28px] hover:bg-green-700 transition-colors w-[182px] max-w-full"
                >
                    Go Back
                </button>
            </div>
            <Footer />
        </div>
    );
};

export default NotFound;
