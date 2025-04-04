import PropTypes from "prop-types";
import { createContext, useContext, useState, useEffect } from "react";
import "animate.css";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState("fadeIn");

  let hideTimeout;

  const showToast = (msg, duration = 2500) => {
    setMessage(msg);
    setIsToastVisible(true);
    setAnimationClass("fadeIn");

    clearTimeout(hideTimeout);

    hideTimeout = setTimeout(() => {
      setAnimationClass("fadeOut");
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {isToastVisible && (
        <Toast
          message={message}
          animationClass={animationClass}
          setIsToastVisible={setIsToastVisible}
          setMessage={setMessage}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const Toast = ({ message, animationClass, setIsToastVisible, setMessage }) => {
  useEffect(() => {
    const handleAnimationEnd = () => {
      if (animationClass === "fadeOut") {
        setIsToastVisible(false);
        setMessage(""); 
      }
    };

    const toastElement = document.querySelector(".toast-styles");
    if (toastElement) {
      toastElement.addEventListener("animationend", handleAnimationEnd);
    }

    return () => {
      if (toastElement) {
        toastElement.removeEventListener("animationend", handleAnimationEnd);
      }
    };
  }, [animationClass, setIsToastVisible, setMessage]);

  return (
    <div className={`toast-styles animate__animated animate__${animationClass}`}>
      {message}
    </div>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node,
};

Toast.propTypes = {
  message: PropTypes.string,
  animationClass: PropTypes.string,
  setIsToastVisible: PropTypes.func,
  setMessage: PropTypes.func,
};
