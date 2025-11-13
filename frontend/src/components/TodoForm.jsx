import { useActionState } from "react";

const TodoForm = ({ onAdd, apiUrl }) => {
  const [state, formAction, isPending] = useActionState(
    async (_prevState, formData) => {
      const title = formData.get("title");

      if (!title || !title.trim()) {
        return { error: "할 일을 입력해주세요" };
      }

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, completed: false }),
        });

        if (!response.ok) {
          return { error: "Todo 추가에 실패했습니다" };
        }

        const result = await response.json();
        onAdd(result.data);
        return { success: true };
      } catch (err) {
        return { error: err.message };
      }
    },
    { success: false }
  );

  return (
    <form action={formAction} className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          name="title"
          placeholder="새로운 할 일을 입력하세요..."
          className="flex-1 px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          disabled={isPending}
          key={state.success ? Date.now() : undefined}
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "추가 중..." : "추가"}
        </button>
      </div>
      {state.error && (
        <p className="text-red-500 text-sm mt-2">{state.error}</p>
      )}
    </form>
  );
};

export default TodoForm;
