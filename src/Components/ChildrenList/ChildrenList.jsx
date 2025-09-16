import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast, ToastContainer } from 'react-toastify';
import { FiLoader, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';

const ChildrenList = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupName, setGroupName] = useState('');

  const fetchChildrenAndGroupInfo = useCallback(() => {
    if (!groupId) return;
    setLoading(true);

    const groupDocRef = doc(db, 'groups', groupId);
    getDoc(groupDocRef)
      .then(docSnap => {
        if (docSnap.exists()) {
          setGroupName(docSnap.data().name);
        } else {
          setGroupName("Guruh topilmadi");
        }
      })
      .catch(err => {
        console.error("Guruh ma'lumotlarini yuklashda xatolik:", err);
        setGroupName("Guruh topilmadi");
      });

    const childrenColRef = collection(db, "children");

    const unsubscribe = onSnapshot(childrenColRef,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const filteredChildren = data.filter(child => child.groupId === groupId);
        setChildren(filteredChildren);
        setLoading(false);
      },
      (err) => {
        console.error("Bolalar ro'yxatini yuklashda xatolik:", err);
        setError("Bolalar ro'yxatini yuklashda xatolik yuz berdi.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    fetchChildrenAndGroupInfo();
  }, [fetchChildrenAndGroupInfo]);

  const handlePickup = async (child) => {
    try {
      const groupDocRef = doc(db, 'groups', groupId);
      const groupDocSnap = await getDoc(groupDocRef);
      const teacherId = groupDocSnap.data()?.teacherId;

      if (!teacherId) {
        toast.error("Tarbiyachi topilmadi. Ma'muriyat bilan bog'laning.");
        return;
      }

      const newPickupRequestRef = doc(collection(db, 'pickupRequests'));

      const messageData = {
        studentId: child.id,
        studentName: `${child.name} ${child.lastName}`,
        timestamp: serverTimestamp(),
        status: 'pending',
        teacherId: teacherId,
        parentNotification: 'waiting',
        groupId: groupId,
        groupName: groupName,
        type: 'kindergarten' // Yangi field: "type"
      };

      await setDoc(newPickupRequestRef, messageData);
      navigate(`/pickup-status/${newPickupRequestRef.id}`);
    } catch (err) {
      console.error("Olib ketish so'rovini yuborishda xatolik:", err);
      toast.error("So'rovni yuborishda xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

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
    <div className="p-6 max-w-2xl mx-auto min-h-screen">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 mr-4">
          <FiArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{groupName} guruh</h1>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiAlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>Bu guruhda hali bolalar mavjud emas.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {children.map((child) => (
            <li
              key={child.id}
              className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
            >
              <span className="text-lg font-medium text-gray-800">
                {child.name} {child.lastName}
              </span>
              <button
                onClick={() => handlePickup(child)}
                className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors duration-200"
              >
                Olib ketish
              </button>
            </li>
          ))}
        </ul>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default ChildrenList;