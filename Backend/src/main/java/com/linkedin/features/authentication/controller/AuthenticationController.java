package com.linkedIn.features.authentication.controller;

import com.linkedIn.features.authentication.dto.AuthenticationRequestBody;
import com.linkedIn.features.authentication.dto.AuthenticationResponseBody;
import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.authentication.service.AuthenticationService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/authentication")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public AuthenticationResponseBody loginPage(@Valid @RequestBody AuthenticationRequestBody loginRequestBody ){
        return authenticationService.login(loginRequestBody);
    }

    @PostMapping("/register")
    public AuthenticationResponseBody registerPage(@Valid @RequestBody AuthenticationRequestBody registerRequestBody) {
        return authenticationService.register(registerRequestBody);
    }

    @DeleteMapping("/delete")
    public String deleteUser(@RequestAttribute("authenticatedUser") AuthenticationUser user){
        authenticationService.deleteUser(user.getId());
        return "User deleted successfully";
    }

    @GetMapping("/user")
    public AuthenticationUser getUser(@RequestAttribute("authenticatedUser") AuthenticationUser user){
        return user;
    }
    @PutMapping("/validate-email-verification-token")
    public String verifyEmail(@RequestParam String token, @RequestAttribute("authenticatedUser") AuthenticationUser user) {
        authenticationService.validateEmailVerificationToken(token, user.getEmail());
        return "Email verified successfully.";
    }

    @GetMapping("/send-email-verification-token")
    public String sendEmailVerificationToken(@RequestAttribute("authenticatedUser") AuthenticationUser user) {
        authenticationService.sendEmailVerificationToken(user.getEmail());
        return "Email verification token sent successfully.";
    }

    @PutMapping("/send-password-reset-token")
    public String sendPasswordResetToken(@RequestParam String email) {
        authenticationService.sendPasswordResetToken(email);
        return "Password reset token sent successfully.";
    }

    @PutMapping("/reset-password")
    public String resetPassword(@RequestParam String newPassword, @RequestParam String token,
                                  @RequestParam String email) {
        authenticationService.resetPassword(email, newPassword, token);
        return "Password reset successfully.";
    }

    @PutMapping("/profile/{id}")
    public AuthenticationUser updateProfile( @RequestAttribute("authenticatedUser") AuthenticationUser user,
                                             @PathVariable Long id,
                                             @RequestParam(required = false) String firstName,
                                             @RequestParam(required = false) String lastName,
                                             @RequestParam(required = false) String company,
                                             @RequestParam(required = false) String position,
                                             @RequestParam(required = false) String location,
                                             @RequestParam(required = false) String about){

        if(!user.getId().equals(id)){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "user does not have permission to update profile");
        }

        return authenticationService.updateUserProfile(id, firstName, lastName, company, position, location,about);

    }

    @GetMapping("/users")
    public List<AuthenticationUser> getUsersWithoutAuthenticated(@RequestAttribute("authenticatedUser") AuthenticationUser user){
        return authenticationService.getUsersWithoutAuthenticated(user);
    }
//
//    @PutMapping("/profile/{id}/info")
//    public AuthenticationUser updateUserProfile(
//            @RequestAttribute("authenticatedUser") AuthenticationUser user,
//            @PathVariable Long id,
//            @RequestParam(required = false) String firstName,
//            @RequestParam(required = false) String lastName,
//            @RequestParam(required = false) String company,
//            @RequestParam(required = false) String position,
//            @RequestParam(required = false) String location,
//            @RequestParam(required = false) String about) {
//
//        if (!user.getId().equals(id)) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
//                    "User does not have permission to update this profile.");
//        }
//
//        return authenticationService.updateUserProfile(
//                user,
//                firstName, lastName, company, position, location, about);
//    }
//
//    @PutMapping("/profile/{id}/profile-picture")
//    public AuthenticationUser updateProfilePicture(
//            @RequestAttribute("authenticatedUser") AuthenticationUser user,
//            @PathVariable Long id,
//            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) throws IOException {
//
//        if (!user.getId().equals(id)) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
//                    "User does not have permission to update this profile picture.");
//        }
//
//        return authenticationService.updateProfilePicture(user, profilePicture);
//    }
//
//    @PutMapping("/profile/{id}/cover-picture")
//    public AuthenticationUser updateCoverPicture(
//            @RequestAttribute("authenticatedUser") AuthenticationUser user,
//            @PathVariable Long id,
//            @RequestParam(required = false) MultipartFile coverPicture) throws IOException {
//
//        if (!user.getId().equals(id)) {
//            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
//                    "User does not have permission to update this cover picture.");
//        }
//
//        return authenticationService.updateCoverPicture(user, coverPicture);
//    }
//
////    @GetMapping("/users/me")
////    public AuthenticationUser getUser(@RequestAttribute("authenticatedUser") AuthenticationUser user) {
////        return user;
////    }
//
    @GetMapping("/users/{id}")
    public AuthenticationUser getUserById(@PathVariable Long id) {
        return authenticationService.getUserById(id);
    }
}
