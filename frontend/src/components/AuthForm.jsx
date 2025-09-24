export default function AuthForm({ children, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto p-4 border rounded">
      {children}
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Submit
      </button>
    </form>
  );
}
