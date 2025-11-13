package com.example.backend.config;

import com.example.backend.entity.Todo;
import com.example.backend.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final TodoRepository todoRepository;

    @Override
    public void run(String... args) throws Exception {
        // 초기 샘플 데이터 생성
        todoRepository.save(Todo.builder()
                .title("샘플 할일 1")
                .completed(false)
                .build());

        todoRepository.save(Todo.builder()
                .title("샘플 할일 2")
                .completed(true)
                .build());
    }
}
