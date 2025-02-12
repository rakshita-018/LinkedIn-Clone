package com.linkedIn.controller;

import org.aspectj.bridge.MessageUtil;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Map;

@ControllerAdvice
public class BackendController {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String,String>> handelHttpMessageNotReadableException(HttpMessageNotReadableException e){
        return  ResponseEntity.badRequest().body(Map.of("message", "required request body is missing"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> handelMethodArgumentNotValidException(MethodArgumentNotValidException e){
        StringBuilder errorMessage = new StringBuilder();
        e.getBindingResult().getFieldErrors().forEach(error ->
                errorMessage.append(error.getField()).append(error.getDefaultMessage()).append(";"));
        return  ResponseEntity.badRequest().body(Map.of("message", errorMessage.toString()));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String,String>> handelNoResourceFoundException(NoResourceFoundException e){
        return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String,String>> handelDataIntegrityViolationException(DataIntegrityViolationException e){
        if(e.getMessage().contains("Duplicate entry")){
            return ResponseEntity.badRequest().body(Map.of("Message", "Emain already exists, please use another email or login"));
        }
        return  ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> handelException(Exception e){
        return  ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
    }
}
