import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiArrowLeft,
  FiLoader,
  FiAlertTriangle,
  FiUser,
  FiSearch,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';

const ChildrenList = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [className, setClassName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePickupRequests, setActivePickupRequests] = useState({});

  const fetchStudentsAndClassInfo = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const classDocRef = doc(db, 'groups', groupId);
      const classDocSnap = await getDoc(classDocRef);
      if (classDocSnap.exists()) {
        const classData = classDocSnap.data();
        setClassName(`${classData.number || ''}-${classData.name}`);
      } else {
        setClassName('Sinf topilmadi');
      }

      const q = query(collection(db, 'children'), where('groupId', '==', groupId));
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
  }, [groupId]);

  useEffect(() => {
    fetchStudentsAndClassInfo();

    const q = query(
      collection(db, 'pickupRequests'),
      where('classId', '==', groupId),
      where('status', '==', 'pending')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingRequests = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        pendingRequests[data.studentId] = {
          requestId: doc.id,
          status: data.status
        };
      });
      setActivePickupRequests(pendingRequests);
    });

    return () => unsubscribe();
  }, [fetchStudentsAndClassInfo, groupId]);

  const handlePickup = async (student) => {
    if (activePickupRequests[student.id]) {
      toast.info("Bu o'quvchi uchun so'rov allaqachon yuborilgan. O'qituvchining javobini kuting.");
      return;
    }

    try {
      const classDocRef = doc(db, 'groups', groupId);
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
        classId: groupId,
        className: className,
        timestamp: serverTimestamp(),
        status: 'pending',
        teacherId: teacherId,
        parentNotification: 'waiting',
        type: 'school'
      };
      
      await setDoc(newPickupRequestRef, messageData);
      
      toast.success(
        <div>
          <div className="flex items-center">
            <FiCheckCircle className="h-5 w-5 mr-2 text-green-600" />
            <span>So'rov yuborildi!</span>
          </div>
          <p className="mt-1 text-sm">{student.name} uchun so'rov yuborildi. O'qituvchining javobini kuting.</p>
        </div>,
        {
          position: "top-center",
          autoClose: 4000,
          icon: false
        }
      );
      
      const unsubscribeApproval = onSnapshot(doc(db, 'pickupRequests', newPickupRequestRef.id), async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data.status === 'approved') {
            toast.success(
              <div>
                <div className="flex items-center">
                  <FiCheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  <span>Olib ketish tasdiqlandi!</span>
                </div>
                <p className="mt-1 text-sm">{student.name}ni o'qituvchi tasdiqladi. Endi olib ketishingiz mumkin.</p>
              </div>,
              {
                position: "top-center",
                autoClose: 6000,
                icon: false
              }
            );
            // deleteDoc buyrug'i o'chirildi. So'rov endi o'chmaydi.
            unsubscribeApproval();
          } else if (data.status === 'rejected') {
             toast.error(
              <div>
                <div className="flex items-center">
                  <FiAlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  <span>Olib ketish rad etildi!</span>
                </div>
                <p className="mt-1 text-sm">{student.name} uchun so'rov rad etildi. Iltimos, o'qituvchi bilan bog'laning.</p>
              </div>,
              {
                position: "top-center",
                autoClose: 6000,
                icon: false
              }
            );
            unsubscribeApproval();
          }
        }
      });
      
    } catch (err) {
      console.error("So'rovni yuborishda xatolik:", err);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
        <div className="flex items-center">
          <FiLoader className="animate-spin h-12 w-12 text-green-700" />
          <p className="ml-3 text-lg font-medium text-green-900">Yuklanmoqda...</p>
        </div>
        <p className="mt-4 text-green-800 text-center">O'quvchilar ro'yxati yuklanmoqda, iltimos kuting.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6 text-green-900">
        <FiAlertTriangle className="h-16 w-16 mb-4 text-green-700" />
        <p className="text-xl mb-4 text-center font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors duration-200"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-green-800 hover:text-green-900 transition-colors duration-200 mr-4 p-2 rounded-lg hover:bg-green-100"
          >
            <FiArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-green-900">{className} Guruhi</h1>
            <p className="text-green-700 mt-1">O'quvchilar ro'yxati</p>
          </div>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="O'quvchi ismi bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-green-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-green-900 placeholder-green-500"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400" />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-green-200">
            <FiAlertTriangle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-2xl font-semibold text-green-900 mb-2">O'quvchilar topilmadi</h3>
            <p className="text-green-800">
              {students.length > 0 && searchQuery ? "Qidiruv bo'yicha o'quvchilar topilmadi." : "Bu sinfda hali o'quvchilar mavjud emas."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map(student => (
              <div
                key={student.id}
                className="p-5 bg-white rounded-xl shadow-sm border border-green-200 hover:shadow-md transition-all duration-300 flex justify-between items-center"
              >
                <div className="flex items-center space-x-3">
                  <FiUser className="text-green-500" />
                  <div>
                    <span className="font-semibold text-green-900 text-lg">{student.name} {student.lastName} </span>
                  </div>
                </div>
                <button
                  onClick={() => handlePickup(student)}
                  disabled={!!activePickupRequests[student.id]}
                  className="px-5 py-2.5 bg-green-700 text-white rounded-xl text-base font-medium hover:bg-green-800 transition-colors duration-200 shadow-sm hover:shadow-md whitespace-nowrap disabled:bg-green-600"
                >
                  {activePickupRequests[student.id] ? (
                    <span className="flex items-center">
                      <FiClock className="animate-spin mr-2" />
                      Kutilmoqda...
                    </span>
                  ) : "Olib ketish"}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-5 bg-green-100 rounded-xl border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Ma'lumot:</h3>
          <p className="text-green-800 text-sm">
            "Olib ketish" tugmasini bosganingizda, o'qituvchiga bolani olib ketish haqida bildirishnoma yuboriladi.
            So'rov tasdiqlangandan so'ng, sizga tasdiqlash haqida xabar keladi. Agar biror o'quvchi uchun so'rov yuborilgan bo'lsa, uning tugmasi "Kutilmoqda..." holatiga o'tadi.
          </p>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
        toastClassName="bg-white text-green-900 border border-green-200 shadow-md"
        progressClassName="bg-gradient-to-r from-green-400 to-green-600"
      />
    </div>
  );
};

export default ChildrenList;