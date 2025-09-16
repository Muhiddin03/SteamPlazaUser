import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiLoader, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';

const PickupStatus = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [requestStatus, setRequestStatus] = useState('pending');
  const [subjectName, setSubjectName] = useState(''); // studentName yoki childName uchun umumiy nom
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;

    const pickupDocRef = doc(db, 'pickupRequests', requestId);

    const unsubscribe = onSnapshot(pickupDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setRequestStatus(data.status || 'pending');
        setSubjectName(data.studentName || '');
      } else {
        setRequestStatus('not-found');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [requestId]);

  const getStatusContent = () => {
    switch (requestStatus) {
      case 'pending':
        return (
          <>
            <FiLoader className="animate-spin text-4xl text-yellow-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">So'rov yuborildi</h2>
            <p className="text-gray-600 mt-2">O'qituvchi/tarbiyachining javobini kuting...</p>
            <p className="text-lg font-medium mt-4">{subjectName} ni olib ketish so'rovi</p>
          </>
        );
      case 'accepted':
        return (
          <>
            <FiCheckCircle className="text-4xl text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">So'rov tasdiqlandi</h2>
            <p className="text-gray-600 mt-2">Farzandingizni olib ketishingiz mumkin.</p>
            <p className="text-lg font-medium mt-4">{subjectName} ni olib ketish so'rovi</p>
          </>
        );
      case 'rejected':
        return (
          <>
            <FiXCircle className="text-4xl text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">So'rov rad etildi</h2>
            <p className="text-gray-600 mt-2">Iltimos, o'qituvchi/tarbiyachi bilan bog'laning yoki qayta urinib ko'ring.</p>
            <p className="text-lg font-medium mt-4">{subjectName} ni olib ketish so'rovi</p>
          </>
        );
      case 'not-found':
        return (
          <>
            <FiXCircle className="text-4xl text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">So'rov topilmadi</h2>
            <p className="text-gray-600 mt-2">So'rov muddati tugagan yoki o'chirilgan.</p>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700">
        <FiLoader className="animate-spin h-12 w-12 text-indigo-600" />
        <p className="ml-3 text-lg font-medium mt-4">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {getStatusContent()}
      </div>
      <button
        onClick={() => navigate('/')} // Bosh sahifaga qaytish
        className="mt-8 flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-200"
      >
        <FiArrowLeft className="mr-2" /> Bosh sahifaga qaytish
      </button>
    </div>
  );
};

export default PickupStatus;