package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.TodoRequest;
import com.example.backend.dto.TodoResponse;
import com.example.backend.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    // GET /api/todos - 전체 투두 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<TodoResponse>>> getAllTodos() {
        List<TodoResponse> todos = todoService.getAllTodos();
        return ResponseEntity.ok(ApiResponse.success(todos));
    }

    // GET /api/todos/:id - 특정 투두 조회
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TodoResponse>> getTodoById(@PathVariable Long id) {
        try {
            TodoResponse todo = todoService.getTodoById(id);
            return ResponseEntity.ok(ApiResponse.success(todo));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // POST /api/todos - 새로운 투두 생성
    @PostMapping
    public ResponseEntity<ApiResponse<TodoResponse>> createTodo(@Valid @RequestBody TodoRequest request) {
        TodoResponse todo = todoService.createTodo(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(todo, "투두가 생성되었습니다."));
    }

    // PUT /api/todos/:id - 투두 수정
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TodoResponse>> updateTodo(
            @PathVariable Long id,
            @RequestBody TodoRequest request) {
        try {
            TodoResponse todo = todoService.updateTodo(id, request);
            return ResponseEntity.ok(ApiResponse.success(todo, "투두가 수정되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // DELETE /api/todos/:id - 투두 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<TodoResponse>> deleteTodo(@PathVariable Long id) {
        try {
            TodoResponse todo = todoService.deleteTodo(id);
            return ResponseEntity.ok(ApiResponse.success(todo, "투두가 삭제되었습니다."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
