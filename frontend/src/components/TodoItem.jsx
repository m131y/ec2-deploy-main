const TodoItem = ({ todo, onToggle, onDelete }) => {
  return (
    <li className="p-4 hover:bg-orange-50 transition-colors">
      <div className="flex items-center gap-3">
        {/* 완료 체크박스 */}
        <button
          onClick={() => onToggle(todo.id)}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            todo.completed
              ? "bg-orange-500 border-orange-500"
              : "border-orange-300 hover:border-orange-400"
          }`}
        >
          {todo.completed && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Todo 텍스트 */}
        <span
          className={`flex-1 ${
            todo.completed ? "line-through text-gray-400" : "text-gray-700"
          }`}
        >
          {todo.title}
        </span>

        {/* 삭제 버튼 */}
        <button
          onClick={() => onDelete(todo.id)}
          className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded transition-colors"
        >
          삭제
        </button>
      </div>
    </li>
  );
};

export default TodoItem;
