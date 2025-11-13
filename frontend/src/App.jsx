import { useState, useEffect, useOptimistic, useTransition } from "react";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import TodoStats from "./components/TodoStats";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, action) => {
      if (action.type === "delete") {
        return state.filter((t) => t.id !== action.id);
      }
      if (action.type === "toggle") {
        return state.map((t) =>
          t.id === action.id ? { ...t, completed: !t.completed } : t
        );
      }
      return state;
    }
  );

  // 백엔드 API URL
  const API_URL = "/api/todos";

  // Todo 목록 조회
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch todos");
      const result = await response.json();
      setTodos(result.data || []);
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  // Todo 추가
  const handleAddTodo = (newTodo) => {
    setTodos((prev) => [...prev, newTodo]);
  };

  // Todo 토글 (완료/미완료)
  const handleToggleTodo = async (id) => {
    const todo = todos.find((t) => t.id === id);

    // 낙관적 업데이트 - 즉시 UI 반영 (startTransition으로 감싸기)
    startTransition(() => {
      addOptimisticTodo({ type: "toggle", id });
    });

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });

      if (!response.ok) throw new Error("Failed to update todo");

      const result = await response.json();
      setTodos(todos.map((t) => (t.id === id ? result.data : t)));
    } catch (err) {
      console.error("Error updating todo:", err);
      // 실패 시 자동으로 이전 상태로 복원됨
    }
  };

  // Todo 삭제
  const handleDeleteTodo = async (id) => {
    // 낙관적 업데이트
    startTransition(() => {
      addOptimisticTodo({ type: "delete", id });
    });

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete todo");

      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting todo:", err);
      // 실패 시 자동으로 이전 상태로 복원됨
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 to-orange-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600 mb-2">Todo List</h1>
          <p className="text-orange-500">React 19 + Spring Boot</p>
        </div>

        {/* Todo 입력 폼 - useActionState 사용 */}
        <TodoForm onAdd={handleAddTodo} apiUrl={API_URL} />

        {/* Todo 목록 - useOptimistic 사용 */}
        <TodoList
          todos={optimisticTodos}
          onToggle={handleToggleTodo}
          onDelete={handleDeleteTodo}
        />

        {/* 통계 */}
        <TodoStats todos={optimisticTodos} />
      </div>
    </div>
  );
};

export default App;
