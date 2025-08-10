import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./styles.css";

const WaitingPage = () => {
  const { mobile } = useParams();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "movieRequests"), where("mobile", "==", mobile));

    // Real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        setRequest(querySnapshot.docs[0].data());
      }
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, [mobile]);

  return (
    <div className="waiting-container">
      <h1>MovieMix - Waiting</h1>
      <p>Mobile: {mobile}</p>

      {request ? (
        <>
          <p>Movie: {request.movieName}</p>
          <p>Status: {request.status}</p>
          <p>Payment: {request.paymentStatus || "pending"}</p>
          {request.downloadLink ? (
            <p>
              Download Link:{" "}
              <a href={request.downloadLink} target="_blank" rel="noreferrer">
                Click Here
              </a>
            </p>
          ) : (
            <p>
              {request.paymentStatus !== "success"
                ? "Awaiting payment confirmation..."
                : "Waiting for admin to upload the download link..."}
            </p>
          )}
        </>
      ) : (
        <p>Loading request details...</p>
      )}
    </div>
  );
};

export default WaitingPage;
