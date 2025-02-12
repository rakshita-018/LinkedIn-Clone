package com.linkedIn.configuration;

import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.authentication.repository.AuthenticationUserRepository;
import com.linkedIn.features.authentication.utils.Encoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LoadDatabaseConfiguration {

    private final Encoder encoder;

    public LoadDatabaseConfiguration(Encoder encoder) {
        this.encoder = encoder;
    }

    @Bean
    public CommandLineRunner initDatabase(AuthenticationUserRepository authenticationUserRepository){
        return  args -> {
            AuthenticationUser authenticationUser = new AuthenticationUser("Rakshita@example.com",encoder.encode("asdf"));
            authenticationUserRepository.save(authenticationUser);
        };
    }
}
