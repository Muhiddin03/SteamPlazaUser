import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiLoader } from 'react-icons/fi';

// Komponentlarni to'g'ri joylashuvdan import qilamiz
import Header from './Components/Header/Header';
import Home from './Components/Home/Home';
import ClassList from './Components/ClassList/ClassList';
import StudentList from './Components/StudentList/StudentList';
import PickupStatus from './Components/PickupStatus/PickupStatus';
import KindergartenGroupList from './Components/KindergartenGroupList/KindergartenGroupList';
import ChildrenList from './Components/ChildrenList/ChildrenList';

// ✅ Yangi component: Rolga qarab marshrut himoyasi uchun
const ProtectedRoute = ({ children, user, userRole, allowedRoles }) => {
  if (!user) {
    // Agar foydalanuvchi tizimga kirmagan bo'lsa, avtorizatsiya sahifasiga yo'naltiramiz
    return <Navigate to="/login" replace />; 
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Agar roli ruxsat etilmagan bo'lsa, kirish taqiqlangan sahifasiga yo'naltiramiz
    toast.error("Sizda ushbu sahifaga kirish huquqi yo'q.");
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [activeSection, setActiveSection] = useState('school'); // ✅ activeSection holatini App.jsx da boshqarish

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoadingAuth(true);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserRole(userDocSnap.data().role);
            setUser(currentUser);
          } else {
            // Agar foydalanuvchi ma'lumotlari bazada topilmasa, tizimdan chiqaramiz
            await auth.signOut();
            setUser(null);
            setUserRole(null);
          }
        } catch (err) {
          console.error("Foydalanuvchi ma'lumotlarini yuklashda xato:", err);
          setUser(null);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FiLoader className="animate-spin h-12 w-12 text-indigo-600 mx-auto" />
          <p className="mt-4 text-lg text-gray-700">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans antialiased">
        {/* ✅ Header komponentiga prop'larni uzatamiz */}
        <Header activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <Routes>
          {/* ✅ Home komponentiga ham prop'larni uzatamiz */}
          <Route path="/" element={<Home activeSection={activeSection} onSectionChange={setActiveSection} />} />

          {/* Maktab sinflari ro'yxati */}
          <Route path="/school/:grade" element={<ClassList />} />

          {/* O'quvchilar ro'yxati */}
          <Route path="/school/:classId/students" element={<StudentList />} />

          {/* Bog'cha guruhlari ro'yxati */}
          <Route path="/kindergarten" element={<KindergartenGroupList />} />

          {/* Bolalar ro'yxati */}
          <Route path="/kindergarten/:groupId/children" element={<ChildrenList />} />

          {/* ✅ Yagona PickupStatus komponenti, Childstatus o'rniga */}
          <Route path="/pickup-status/:requestId" element={<PickupStatus />} />

          {/* ✅ Tizimga kirish talab qiladigan sahifa, masalan */}

          {/* Boshqa barcha sahifalar uchun yo'naltirish */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;