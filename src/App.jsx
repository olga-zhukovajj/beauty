import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ServicesPage from "./pages/ServicesPage";
import SchedulePage from "./pages/SchedulePage";
import BookingPage from "./pages/BookingPage";
import MasterProfilePage from "./pages/MasterProfilePage";
import MastersListPage from "./pages/MastersListPage";


function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/masters" element={<MastersListPage />} />
      <Route path="/master/:id" element={<MasterProfilePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/booking/:masterId" element={<BookingPage />} />
    </Routes>
  );
}

export default App;
