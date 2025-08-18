import React, { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

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
              href="https://wa.me/917070830015?text=Hi%20I%20want%20to%20connect%20with%20you"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-full"
            >
              Hii Buddy,want help please message here
            </a>
          </div>
        </aside>
      )}
    </>
  );
};

export default WhatsAppWidget; 