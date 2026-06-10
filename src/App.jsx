import { Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import ServicesPage from "./pages/ServicesPage";
import SchedulePage from "./pages/SchedulePage";
import BookingPage from "./pages/BookingPage";
import MasterProfilePage from "./pages/MasterProfilePage";
import MastersListPage from "./pages/MastersListPage";
import MasterAppointmentsPage from "./pages/MasterAppointmentsPage";
import MasterDiaryPage from "./pages/MasterDiaryPage";
import "./styles/global/reset.css";
import "./styles/global/variables.css";
import "./styles/global/global.css";



function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/masters" element={<MastersListPage />} />
      <Route path="/master/:id" element={<MasterProfilePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/booking/:masterId" element={<BookingPage />} />
      <Route path="/master-appointments" element={<MasterAppointmentsPage />}/>
      <Route path="/master/diary" element={<MasterDiaryPage />}/>
    </Routes>
  );
}

export default App;
