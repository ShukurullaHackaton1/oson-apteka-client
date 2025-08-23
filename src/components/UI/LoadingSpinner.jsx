import { motion } from "framer-motion";

const LoadingSpinner = ({ size = "md", fullScreen = false }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`${sizes.xl} border-4 border-gray-200 border-t-primary-600 rounded-full`}
        />
      </div>
    );
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizes[size]} border-2 border-gray-200 border-t-primary-600 rounded-full`}
    />
  );
};

export default LoadingSpinner;
