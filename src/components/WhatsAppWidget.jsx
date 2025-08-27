import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const WhatsAppWidget = forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Hi I want to connect with you");

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    openWithMessage: (customMessage) => {
      setMessage(customMessage);
      setIsOpen(true);
    },
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }));

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      {/* Floating WhatsApp Button */}
      <button
        aria-label="Open WhatsApp contact"
        className="whatsapp-fab"
        onClick={openDrawer}
      >
        <FaWhatsapp />
      </button>

      {/* Overlay */}
      {isOpen && <div className="wa-overlay" onClick={closeDrawer} />}

      {/* Right Drawer */}
      {isOpen && (
        <aside className="wa-drawer">
          <div className="wa-drawer-header">
            <span>Contact</span>
            <button className="wa-close" onClick={closeDrawer}>×</button>
          </div>
          <div className="wa-drawer-body">
            <a
              href={`https://wa.me/917070830015?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-full"
            >
              {message.includes("movie") ? "Request Movie via WhatsApp" : "Hii Buddy,want help please message here"}
            </a>
          </div>
        </aside>
      )}
    </>
  );
});

export default WhatsAppWidget; 