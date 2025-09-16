import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore"; // onSnapshot o'rniga getDocs
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import { FiLoader, FiAlertTriangle } from 'react-icons/fi';

const KindergartenGroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError('');
      try {
        const querySnapshot = await getDocs(collection(db, "groups"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(data);
      } catch (err) {
        console.error("Guruhlar ro'yxatini yuklashda xatolik:", err);
        setError("Guruhlar ro'yxatini yuklashda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

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
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bog‘cha guruhlari</h1>
      
      {groups.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FiAlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>Hali guruhlar qo‘shilmagan.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li
              key={group.id}
              className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
            >
              <span className="text-lg font-medium text-gray-800">{group.name}</span>
              <Link
                to={`/kindergarten/${group.id}/children`}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
              >
                Bolalarni ko‘rish →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default KindergartenGroupList;