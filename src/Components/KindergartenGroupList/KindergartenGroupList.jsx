import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import { FiLoader, FiAlertTriangle, FiUsers, FiUser } from 'react-icons/fi';

const KindergartenGroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroupsWithTeachers = async () => {
      setLoading(true);
      setError('');
      try {
        const groupsQuerySnapshot = await getDocs(collection(db, "groups"));
        const groupsData = groupsQuerySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const usersQuerySnapshot = await getDocs(collection(db, "users"));
        const usersMap = new Map();
        usersQuerySnapshot.docs.forEach(doc => {
          usersMap.set(doc.id, doc.data());
        });

        const groupsWithTeachers = groupsData.map(group => {
          const teacher = usersMap.get(group.teacherId);
          return {
            ...group,
            teacherName: teacher ? teacher.name : "Noma'lum"
          };
        });

        setGroups(groupsWithTeachers);
      } catch (err) {
        console.error("Guruhlar ro'yxatini yuklashda xatolik:", err);
        setError("Guruhlar ro'yxatini yuklashda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupsWithTeachers();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-6">
        <div className="flex items-center">
          <FiLoader className="animate-spin h-12 w-12 text-green-700" />
          <p className="ml-3 text-lg font-medium text-green-900">Yuklanmoqda...</p>
        </div>
        <p className="mt-4 text-green-800 text-center">Guruhlar ma'lumotlari yuklanmoqda, iltimos kuting.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96  p-6">
        <FiAlertTriangle className="h-16 w-16 mb-4 text-green-700" />
        <p className="text-xl mb-4 text-center text-green-900 font-medium">{error}</p>
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
    <div className="min-h-96  py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-900 mb-3">Bog'cha Guruhlari</h1>
        </div>
        
        {groups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-green-200">
            <FiAlertTriangle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-2xl font-semibold text-green-900 mb-2">Guruhlar topilmadi</h3>
            <p className="text-green-800 max-w-md mx-auto">Hali hech qanday guruh qo'shilmagan. Iltimos, keyinroq qayta urinib ko'ring yoki administrator bilan bog'laning.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <li
                key={group.id}
                className="p-6 bg-white rounded-2xl shadow-sm border border-green-200 hover:shadow-md transition-all duration-300 hover:border-green-400"
              >
                <div className="flex items-start space-x-4 mb-5">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-14 w-14 rounded-full text-green-700">
                      <FiUsers className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-green-900 mb-1">{group.name}</h2>
                    <p className="text-sm text-green-800 mt-1 flex items-center">
                      <FiUser className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">O'qituvchi: {group.teacherName}</span>
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-green-100">
                  <Link
                    to={`/kindergarten/${group.id}/children`}
                    className="w-full inline-flex justify-center items-center px-4 py-3 text-base font-medium rounded-lg text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 shadow-sm hover:shadow-md"
                  >
                    Bolalarni ko'rish
                    <span className="ml-2">→</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default KindergartenGroupList;