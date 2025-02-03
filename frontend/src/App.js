import { Routes, Route, useLocation } from "react-router-dom";
import Homepage from "./pages/Homepage.js";
import UserRegistration from "./pages/User/UserRegistration.js";
import ProviderRegistration from "./pages/Provider/ProviderRegistration.js";
import AdminRegistration from "./pages/Admin/AdminRegistration.js";
import UserLogin from "./pages/User/UserLogin.js";
import ProviderLogin from "./pages/Provider/ProviderLogin.js";
import AdminLogin from "./pages/Admin/AdminLogin.js";
import UserProfile from "./pages/User/UserProfile.js";
import AdminProfile from "./pages/Admin/AdminProfile.js";
import ProviderProfile from "./pages/Provider/ProviderProfile.js";
import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";
import UserPrivateComp from "./components/PrivateComp/UserPrivateComp.js";
import ProviderPrivateComp from "./components/PrivateComp/ProviderPrivateComp.js";
import AdminPrivateComp from "./components/PrivateComp/AdminPrivateComp.js";
import UserOrders from "./pages/User/UserOrders.js";
import UserCart from "./pages/User/UserCart.js";
import ProviderOrders from "./pages/Provider/ProviderOrders.js";
import AdminOrders from "./pages/Admin/AdminOrders.js";
import ProviderDetails from "./pages/Provider/ProviderDetails.js";
import FeedbackForm from "./pages/User/FeedbackForm.js";
import Help from "./pages/Help.js";
import ContactUs from "./pages/ContactUs.js";
import AboutUs from "./pages/AboutUs.js";
import ProviderCart from "./pages/Provider/ProviderCart.js";
import PaymentPage from "./pages/Provider/PaymentPage.js";
import PrivacyPolicy from "./pages/PrivacyPolicy.js";
import TermsOfService from "./pages/TermsOfServices.js";
import PaymentSuccessPage from "./pages/Provider/PaymentSuccessPage.js";

function App() {
  const location = useLocation();
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow pt-0">
          {/* <Navbar className="fixed top-0 left-0 w-full z-50" /> */}
          {location.pathname !== "/" && (
            <Navbar className="fixed top-0 left-0 w-full z-50" />
          )}
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/help" element={<Help />} />
            <Route path="/contactUs" element={<ContactUs />} />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* ************************* User Routes ************************* */}
            <Route path="/user/register" element={<UserRegistration />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/order/confirmPayment" element={<PaymentPage />} />
            <Route
              path="order/paymentSuccess"
              element={<PaymentSuccessPage />}
            />

            {/* --------------------- User Routes (Private) --------------------- */}
            <Route element={<UserPrivateComp />}>
              <Route path="/user/profile/:id" element={<UserProfile />} />
              <Route path="/provider/:id" element={<ProviderDetails />} />
              <Route path="/cart/getCartItems" element={<UserCart />} />
              <Route path="/user/order/getOrder" element={<UserOrders />} />
              <Route
                path="/user/order/feedbackForm"
                element={<FeedbackForm />}
              />
            </Route>

            {/* ************************* Provider Routes ************************* */}
            <Route
              path="/provider/register"
              element={<ProviderRegistration />}
            />
            <Route path="/provider/login" element={<ProviderLogin />} />

            {/* -------------------- Provider Routes (Private) -------------------- */}
            <Route element={<ProviderPrivateComp />}>
              <Route
                path="/provider/profile/:id"
                element={<ProviderProfile />}
              />
              <Route path="/cart/getCartItems" element={<ProviderCart />} />
              <Route
                path="/provider/order/getOrder"
                element={<ProviderOrders />}
              />
            </Route>

            {/* ************************* Admin Routes ************************* */}
            <Route path="/admin/register" element={<AdminRegistration />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* --------------------- Admin Routes (Private) ------------------- */}
            <Route element={<AdminPrivateComp />}>
              <Route path="/admin/profile/:id" element={<AdminProfile />} />
              <Route path="/admin/order/getOrder" element={<AdminOrders />} />
            </Route>
          </Routes>
        </main>
        <Footer className="fixed bottom-0 left-0 w-full" />
      </div>
    </>
  );
}

export default App;
