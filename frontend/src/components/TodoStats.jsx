const TodoStats = ({ todos }) => {
  if (todos.length === 0) return null;

  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const incompleteCount = todos.filter(t => !t.completed).length;

  return (
    <div className="mt-4 text-center text-sm text-orange-600">
      전체 {totalCount}개 | 완료 {completedCount}개 | 미완료 {incompleteCount}개
    </div>
  );
};

export default TodoStats;
