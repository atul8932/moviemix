import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [linkInput, setLinkInput] = useState({});

  const fetchRequests = async () => {
    const querySnapshot = await getDocs(collection(db, 'movieRequests'));
    const data = querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    setRequests(data);
  };

  const updateRequest = async (id, link) => {
    const requestRef = doc(db, 'movieRequests', id);
    await updateDoc(requestRef, {
      status: 'completed',
      downloadLink: link
    });
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Panel</h2>
      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Mobile</th>
            <th>Movie Name</th>
            <th>Status</th>
            <th>Download Link</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.mobile}</td>
              <td>{req.movieName}</td>
              <td>{req.status}</td>
              <td>{req.downloadLink || '—'}</td>
              <td>{req.createdAt?.toDate().toLocaleString() || '—'}</td>
              <td>
                {req.status === 'pending' ? (
                  <>
                    <input
                      type="text"
                      placeholder="Enter Link"
                      value={linkInput[req.id] || ''}
                      onChange={(e) =>
                        setLinkInput({ ...linkInput, [req.id]: e.target.value })
                      }
                    />
                    <button onClick={() => updateRequest(req.id, linkInput[req.id])}>
                      Complete
                    </button>
                  </>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPanel;
