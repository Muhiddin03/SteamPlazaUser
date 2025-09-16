import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast, ToastContainer } from 'react-toastify';
import {
  FiArrowLeft,
  FiLoader,
  FiAlertTriangle,
  FiUser,
  FiSearch
} from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';

const StudentList = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [className, setClassName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStudentsAndClassInfo = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const classDocRef = doc(db, 'classes', classId);
      const classDocSnap = await getDoc(classDocRef);
      if (classDocSnap.exists()) {
        const classData = classDocSnap.data();
        setClassName(`${classData.number}-${classData.name}`);
      } else {
        setClassName('Sinf topilmadi');
      }

      const q = query(collection(db, 'students'), where('classId', '==', classId));
      const querySnapshot = await getDocs(q);
      const fetchedStudents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(fetchedStudents);
    } catch (err) {
      console.error("O'quvchilar ro'yxatini yuklashda xatolik:", err);
      setError("O'quvchilar ro'yxatini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchStudentsAndClassInfo();
  }, [fetchStudentsAndClassInfo]);

  const handlePickup = async (student) => {
    try {
      const classDocRef = doc(db, 'classes', classId);
      const classDocSnap = await getDoc(classDocRef);
      const teacherId = classDocSnap.data()?.teacherId;

      if (!teacherId) {
        toast.error("O'qituvchi topilmadi. Ma'muriyat bilan bog'laning.");
        return;
      }

      const newPickupRequestRef = doc(collection(db, 'pickupRequests'));

      const messageData = {
        studentId: student.id,
        studentName: student.name,
        classId: classId,
        className: className,
        timestamp: serverTimestamp(),
        status: 'pending',
        teacherId: teacherId,
        parentNotification: 'waiting',
        type: 'school' // Yangi field: "type"
      };

      await setDoc(newPickupRequestRef, messageData);

      navigate(`/pickup-status/${newPickupRequestRef.id}`);

    } catch (err) {
      console.error("Olib ketish so'rovini yuborishda xatolik:", err);
      toast.error("So'rovni yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  const filteredStudents = students.filter(student => {
    const studentName = student.name || '';
    const query = searchQuery || '';
    return studentName.toLowerCase().includes(query.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <FiLoader className="animate-spin h-12 w-12 text-indigo-600" />
        <p className="ml-3 text-lg font-medium text-gray-700">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-600">
        <FiAlertTriangle className="h-16 w-16 mb-4" />
        <p className="text-xl mb-4 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 mr-4">
          <FiArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{className}</h1>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="O'quvchini ismi bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiAlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>
            {students.length > 0 && searchQuery ? "Qidiruv bo'yicha o'quvchilar topilmadi." : "Bu sinfda hali o'quvchilar mavjud emas."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <ul className="divide-y divide-gray-200">
            {filteredStudents.map(student => (
              <li
                key={student.id}
                className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center space-x-3">
                  <FiUser className="text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-800 text-lg">{student.name}</span>
                    <p className="text-sm text-gray-500 mt-1">ID: {student.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePickup(student)}
                  className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  Olib ketish
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default StudentList;