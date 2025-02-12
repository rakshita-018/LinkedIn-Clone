package com.linkedIn.features.authentication.service;

import com.linkedIn.features.authentication.dto.AuthenticationRequestBody;
import com.linkedIn.features.authentication.dto.AuthenticationResponseBody;
import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.authentication.repository.AuthenticationUserRepository;
import com.linkedIn.features.authentication.utils.Encoder;
import com.linkedIn.features.authentication.utils.JsonWebToken;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final AuthenticationUserRepository authenticationUserRepository;
    private final Encoder encoder;
    private final JsonWebToken jsonWebToken;

    public AuthenticationService(AuthenticationUserRepository authenticationUserRepository, Encoder encoder, JsonWebToken jsonWebToken) {
        this.authenticationUserRepository = authenticationUserRepository;
        this.encoder = encoder;
        this.jsonWebToken = jsonWebToken;
    }

    public AuthenticationUser getUser(String email){
        return authenticationUserRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("user not found"));
    }

    public AuthenticationResponseBody register(AuthenticationRequestBody registerRequestBody) {
        authenticationUserRepository.save(new AuthenticationUser(registerRequestBody.getEmail(), encoder.encode(registerRequestBody.getPassword())));
        return new AuthenticationResponseBody("token", "User registered successfully");
    }

    public AuthenticationResponseBody login(AuthenticationRequestBody loginRequestBody) {
        AuthenticationUser user = authenticationUserRepository.findByEmail(loginRequestBody.getEmail()).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if(!encoder.matches(loginRequestBody.getPassword(), user.getPassword())){
            throw new IllegalArgumentException("Password is incorrect");
        }
        String token = jsonWebToken.generateToken(loginRequestBody.getEmail());
        return  new AuthenticationResponseBody(token, "Authentication Succeeded.");
    }
}
