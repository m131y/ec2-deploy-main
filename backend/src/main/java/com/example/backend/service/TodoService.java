package com.example.backend.service;

import com.example.backend.dto.TodoRequest;
import com.example.backend.dto.TodoResponse;
import com.example.backend.entity.Todo;
import com.example.backend.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {

    private final TodoRepository todoRepository;

    public List<TodoResponse> getAllTodos() {
        return todoRepository.findAll().stream()
                .map(TodoResponse::from)
                .collect(Collectors.toList());
    }

    public TodoResponse getTodoById(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("투두를 찾을 수 없습니다."));
        return TodoResponse.from(todo);
    }

    @Transactional
    public TodoResponse createTodo(TodoRequest request) {
        Todo todo = Todo.builder()
                .title(request.getTitle())
                .completed(request.getCompleted() != null ? request.getCompleted() : false)
                .build();

        Todo savedTodo = todoRepository.save(todo);
        return TodoResponse.from(savedTodo);
    }

    @Transactional
    public TodoResponse updateTodo(Long id, TodoRequest request) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("투두를 찾을 수 없습니다."));

        if (request.getTitle() != null) {
            todo.setTitle(request.getTitle());
        }
        if (request.getCompleted() != null) {
            todo.setCompleted(request.getCompleted());
        }

        Todo updatedTodo = todoRepository.save(todo);
        return TodoResponse.from(updatedTodo);
    }

    @Transactional
    public TodoResponse deleteTodo(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("투두를 찾을 수 없습니다."));

        todoRepository.delete(todo);
        return TodoResponse.from(todo);
    }
}
