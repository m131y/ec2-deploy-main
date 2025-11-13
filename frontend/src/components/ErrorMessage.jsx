const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
      오류: {error}
    </div>
  );
};

export default ErrorMessage;
