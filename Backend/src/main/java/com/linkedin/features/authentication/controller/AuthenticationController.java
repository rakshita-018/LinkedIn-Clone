package com.linkedIn.features.authentication.controller;

import com.linkedIn.features.authentication.dto.AuthenticationRequestBody;
import com.linkedIn.features.authentication.dto.AuthenticationResponseBody;
import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.authentication.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/authentication")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @GetMapping("/user")
    public AuthenticationUser getUser(){
        return authenticationService.getUser("Rakshita@example.com");
    }

    @PostMapping("/login")
    public AuthenticationResponseBody loginPage(@Valid @RequestBody AuthenticationRequestBody loginRequestBody ){
        return authenticationService.login(loginRequestBody);
    }

    @PostMapping("/register")
    public AuthenticationResponseBody registerPage(@Valid @RequestBody AuthenticationRequestBody registerRequestBody){
        return authenticationService.register(registerRequestBody);
    }
}
