package com.linkedIn.features.authentication.service;

import com.linkedIn.features.authentication.dto.AuthenticationRequestBody;
import com.linkedIn.features.authentication.dto.AuthenticationResponseBody;
import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.authentication.repository.AuthenticationUserRepository;
import com.linkedIn.features.authentication.utils.EmailService;
import com.linkedIn.features.authentication.utils.Encoder;
import com.linkedIn.features.authentication.utils.JsonWebToken;
import com.linkedIn.features.storage.service.StorageService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import io.jsonwebtoken.Claims;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthenticationService {
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);
    private static AuthenticationUserRepository authenticationUserRepository;
    private final int durationInMinutes = 5;

    private final Encoder encoder;
    private final JsonWebToken jsonWebToken;
    private final EmailService emailService;
    private final RestTemplate restTemplate;
    private final StorageService storageService;

    @PersistenceContext
    private EntityManager entityManager;
    @Value("${oauth.google.client.id}")
    private String googleClientId;
    @Value("${oauth.google.client.secret}")
    private String googleClientSecret;


    public AuthenticationService(AuthenticationUserRepository authenticationUserRepository, Encoder encoder, JsonWebToken jsonWebToken, EmailService emailService, RestTemplate restTemplate, StorageService storageService) {
        this.authenticationUserRepository = authenticationUserRepository;
        this.encoder = encoder;
        this.jsonWebToken = jsonWebToken;
        this.emailService = emailService;
        this.restTemplate = restTemplate;
        this.storageService = storageService;
    }

    public static String generateEmailVerificationToken() {
        SecureRandom random = new SecureRandom();
        StringBuilder token = new StringBuilder(5);
        for (int i = 0; i < 5; i++) {
            token.append(random.nextInt(10));
        }
        return token.toString();
    }

    public void sendEmailVerificationToken(String email) {
        Optional<AuthenticationUser> user = authenticationUserRepository.findByEmail(email);
        if (user.isPresent() && !user.get().getEmailVerified()) {
            String emailVerificationToken = generateEmailVerificationToken();
            String hashedToken = encoder.encode(emailVerificationToken);
            user.get().setEmailVerificationToken(hashedToken);
            user.get().setEmailVerificationTokenExpiryDate(LocalDateTime.now().plusMinutes(durationInMinutes));
            authenticationUserRepository.save(user.get());
            String subject = "Email Verification";
            String body = String.format("Only one step to take full advantage of LinkedIn.\n\n"
                            + "Enter this code to verify your email: " + "%s\n\n" + "The code will expire in " + "%s"
                            + " minutes.",
                    emailVerificationToken, durationInMinutes);
            try {
                emailService.sendEmail(email, subject, body);
                System.out.println("Email verification token is sent service");
            } catch (Exception e) {
                logger.info("Error while sending email: {}", e.getMessage());
            }
        } else {
            throw new IllegalArgumentException("Email verification token failed, or email is already verified.");
        }
    }

    public void validateEmailVerificationToken(String token, String email) {
        Optional<AuthenticationUser> user = authenticationUserRepository.findByEmail(email);
        if (user.isPresent() && encoder.matches(token, user.get().getEmailVerificationToken())
                && !user.get().getEmailVerificationTokenExpiryDate().isBefore(LocalDateTime.now())) {
            user.get().setEmailVerified(true);
            user.get().setEmailVerificationToken(null);
            user.get().setEmailVerificationTokenExpiryDate(null);
            authenticationUserRepository.save(user.get());
        } else if (user.isPresent() && encoder.matches(token, user.get().getEmailVerificationToken())
                && user.get().getEmailVerificationTokenExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Email verification token expired.");
        } else {
            throw new IllegalArgumentException("Email verification token failed.");
        }
    }

    public AuthenticationResponseBody login(AuthenticationRequestBody loginRequestBody) {
        AuthenticationUser user = authenticationUserRepository.findByEmail(loginRequestBody.getEmail()).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if(!encoder.matches(loginRequestBody.getPassword(), user.getPassword())){
            throw new IllegalArgumentException("Password is incorrect");
        }
        String token = jsonWebToken.generateToken(loginRequestBody.getEmail());
        return  new AuthenticationResponseBody(token, "Authentication Succeeded.");
    }

    public AuthenticationResponseBody googleLoginOrSignup(String code, String page) {
        String tokenEndpoint = "https://oauth2.googleapis.com/token";
        String redirectUri = "http://localhost:5173/authentication/" + page;
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();

        body.add("code", code);
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("redirect_uri", redirectUri);
        body.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(tokenEndpoint, HttpMethod.POST, request,
                new ParameterizedTypeReference<>() {
                });

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map<String, Object> responseBody = response.getBody();
            String idToken = (String) responseBody.get("id_token");

            Claims claims = jsonWebToken.getClaimsFromGoogleOauthIdToken(idToken);
            String email = claims.get("email", String.class);
            AuthenticationUser user = authenticationUserRepository.findByEmail(email).orElse(null);

            if (user == null) {
                Boolean emailVerified = claims.get("email_verified", Boolean.class);
                String firstName = claims.get("given_name", String.class);
                String lastName = claims.get("family_name", String.class);
                AuthenticationUser newUser = new AuthenticationUser(email, null);
                newUser.setEmailVerified(emailVerified);
                newUser.setFirstName(firstName);
                newUser.setLastName(lastName);
                authenticationUserRepository.save(newUser);
            }

            String token = jsonWebToken.generateToken(email);
            return new AuthenticationResponseBody(token, "Google authentication succeeded.");
        } else {
            throw new IllegalArgumentException("Failed to exchange code for ID token.");
        }
    }


    public AuthenticationResponseBody register(AuthenticationRequestBody registerRequestBody)  {
        AuthenticationUser user = authenticationUserRepository.save(new AuthenticationUser(
                registerRequestBody.getEmail(), encoder.encode(registerRequestBody.getPassword())));

        String emailVerificationToken = generateEmailVerificationToken();
        String hashedToken = encoder.encode(emailVerificationToken);
        user.setEmailVerificationToken(hashedToken);
        user.setEmailVerificationTokenExpiryDate(LocalDateTime.now().plusMinutes(durationInMinutes));

        authenticationUserRepository.save(user);

        String subject = "Email Verification";
        String body = String.format("""
                        Only one step to take full advantage of LinkedIn.
                        
                        Enter this code to verify your email: %s. The code will expire in %s minutes.""",
                emailVerificationToken, durationInMinutes);
        try {
            emailService.sendEmail(registerRequestBody.getEmail(), subject, body);
        } catch (Exception e) {
            logger.info("Error while sending email: {}", e.getMessage());
        }
        String authToken = jsonWebToken.generateToken(registerRequestBody.getEmail());
        return new AuthenticationResponseBody(authToken, "User registered successfully.");
    }

    public AuthenticationUser getUser(String email){
        return authenticationUserRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("user not found"));
    }

    @Transactional
    public void deleteUser(Long userId) {
        AuthenticationUser user = entityManager.find(AuthenticationUser.class, userId);
        if (user != null) {
            entityManager.createNativeQuery("DELETE FROM posts_likes WHERE user_id = :userId")
                    .setParameter("userId", userId)
                    .executeUpdate();
            entityManager.remove(user);
//            authenticationUserRepository.deleteById(userId);
        }
    }

//    password reset token
    public void sendPasswordResetToken(String email) {
        Optional<AuthenticationUser> user = authenticationUserRepository.findByEmail(email);
        if (user.isPresent()) {
            String passwordResetToken = generateEmailVerificationToken();
            String hashedToken = encoder.encode(passwordResetToken);
            user.get().setPasswordResetToken(hashedToken);
            user.get().setPasswordResetTokenExpiryDate(LocalDateTime.now().plusMinutes(durationInMinutes));
            authenticationUserRepository.save(user.get());
            String subject = "Password Reset";
            String body = String.format("""
                            You requested a password reset.
                            
                            Enter this code to reset your password: %s. The code will expire in %s minutes.""",
                    passwordResetToken, durationInMinutes);
            try {
                emailService.sendEmail(email, subject, body);
            } catch (Exception e) {
                logger.info("Error while sending email: {}", e.getMessage());
            }
        } else {
            throw new IllegalArgumentException("User not found.");
        }
    }

    public void resetPassword(String email, String newPassword, String token) {
        Optional<AuthenticationUser> user = authenticationUserRepository.findByEmail(email);
        if (user.isPresent() && encoder.matches(token, user.get().getPasswordResetToken())
                && !user.get().getPasswordResetTokenExpiryDate().isBefore(LocalDateTime.now())) {
            user.get().setPasswordResetToken(null);
            user.get().setPasswordResetTokenExpiryDate(null);
            user.get().setPassword(encoder.encode(newPassword));
            authenticationUserRepository.save(user.get());
        } else if (user.isPresent() && encoder.matches(token, user.get().getPasswordResetToken())
                && user.get().getPasswordResetTokenExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token expired.");
        } else {
            throw new IllegalArgumentException("Password reset token failed.");
        }
    }

    public AuthenticationUser updateUserProfile(Long userId, String firstName, String lastName, String company, String position, String location, String about){
        AuthenticationUser user = authenticationUserRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (firstName != null)
            user.setFirstName(firstName);
        if (lastName != null)
            user.setLastName(lastName);
        if (company != null)
            user.setCompany(company);
        if (position != null)
            user.setPosition(position);
        if (location != null)
            user.setLocation(location);
        if(about != null)
            user.setAbout(about);

        return authenticationUserRepository.save(user);
    }

    public AuthenticationUser updateUserProfile(AuthenticationUser user, String firstName, String lastName, String company,
                                  String position, String location, String about) {
        if (firstName != null)
            user.setFirstName(firstName);
        if (lastName != null)
            user.setLastName(lastName);
        if (company != null)
            user.setCompany(company);
        if (position != null)
            user.setPosition(position);
        if (location != null)
            user.setLocation(location);
        if (about != null)
            user.setAbout(about);

        return authenticationUserRepository.save(user);
    }

    public AuthenticationUser updateProfilePicture(AuthenticationUser user, MultipartFile profilePicture) throws IOException, IOException {
        if (profilePicture != null) {
            String profilePictureUrl = storageService.saveImage(profilePicture);
            user.setProfilePicture(profilePictureUrl);
        } else {
            if (user.getProfilePicture() != null)
                storageService.deleteFile(user.getProfilePicture());

            user.setProfilePicture(null);
        }
        return authenticationUserRepository.save(user);
    }

    public AuthenticationUser updateCoverPicture(AuthenticationUser user, MultipartFile coverPicture) throws IOException {
        if (coverPicture != null) {
            String coverPictureUrl = storageService.saveImage(coverPicture);
            user.setCoverPicture(coverPictureUrl);
        } else {
            if (user.getCoverPicture() != null)
                storageService.deleteFile(user.getCoverPicture());

            user.setCoverPicture(null);
        }

        return authenticationUserRepository.save(user);
    }


    public List<AuthenticationUser> getUsersWithoutAuthenticated(AuthenticationUser user) {
        return authenticationUserRepository.findAllByIdNot(user.getId());
    }

//    public AuthenticationUser getUserById(Long receiverId) {
//        return authenticationUserRepository.findById(receiverId).orElseThrow(() -> new IllegalArgumentException("user not found"));
//    }


    public AuthenticationUser getUserById(Long receiverId) {
        return authenticationUserRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }
}
