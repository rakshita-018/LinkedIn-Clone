package com.linkedIn.features.authentication.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.linkedIn.features.feed.model.Post;
import com.linkedIn.features.messaging.model.Conversation;
import com.linkedIn.features.networking.model.Connection;
import com.linkedIn.features.notifications.model.Notification;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.FullTextField;
import org.hibernate.search.mapper.pojo.mapping.definition.annotation.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Entity(name = "users")
@Indexed(index = "users")
public class AuthenticationUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotNull
    @Email
    @Column(unique = true)
    private String email;
    private Boolean emailVerified = false;
    private String emailVerificationToken = null;
    private LocalDateTime emailVerificationTokenExpiryDate = null;
    @JsonIgnore
    private String password;
    private String passwordResetToken = null;
    private LocalDateTime passwordResetTokenExpiryDate = null;

    @FullTextField(analyzer = "standard")
    private String firstName = null;
    @FullTextField(analyzer = "standard")
    private String lastName = null;
    @FullTextField(analyzer = "standard")
    private String company = null;
    @FullTextField(analyzer = "standard")
    private String position = null;
    private String location = null;
    private Boolean profileComplete = false;
    private String profilePicture = null;
    private String coverPicture = null;
    private String about = null;
    @JsonIgnore
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts;

    @JsonIgnore
    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> receivedNotifications;

    @JsonIgnore
    @OneToMany(mappedBy = "actor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> actedNotifications;

    @JsonIgnore
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> conversationsAsAuthor;

    @JsonIgnore
    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Conversation> conversationsAsRecipient;

    @JsonIgnore
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Connection> initiatedConnections;

    @JsonIgnore
    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Connection> receivedConnections;

    public AuthenticationUser(String email, String password) {
        this.email = email;
        this.password = password;
    }

//    empty constructor
    public AuthenticationUser() {
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Boolean getEmailVerified() { return emailVerified; }

    public String getEmailVerificationToken() { return emailVerificationToken; }

    public LocalDateTime getEmailVerificationTokenExpiryDate() { return emailVerificationTokenExpiryDate; }

    public String getPasswordResetToken() { return passwordResetToken; }

    public LocalDateTime getPasswordResetTokenExpiryDate() { return passwordResetTokenExpiryDate; }

    public void setId(Long id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public void setEmailVerificationToken(String emailVerificationToken) {
        this.emailVerificationToken = emailVerificationToken; }

    public void setEmailVerificationTokenExpiryDate(LocalDateTime emailVerificationTokenExpiryDate) {
        this.emailVerificationTokenExpiryDate = emailVerificationTokenExpiryDate; }

    public void setPasswordResetToken(String passwordResetToken) { this.passwordResetToken = passwordResetToken; }

    public void setPasswordResetTokenExpiryDate(LocalDateTime passwordResetTokenExpiryDate) {
        this.passwordResetTokenExpiryDate = passwordResetTokenExpiryDate; }

    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
        updateProfileCompletionStatus();
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
        updateProfileCompletionStatus();
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
        updateProfileCompletionStatus();
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
        updateProfileCompletionStatus();
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
        updateProfileCompletionStatus();
    }

    public void updateProfileCompletionStatus() {
        this.profileComplete = (this.firstName != null && this.lastName != null && this.company != null
                && this.position != null && this.location != null);
    }

    public String getCoverPicture() {
        return coverPicture;
    }

    public void setCoverPicture(String coverPicture) {
        this.coverPicture = coverPicture;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }

    public Boolean getProfileComplete() {
        return profileComplete;
    }

    public void setProfileComplete(Boolean profileComplete) {
        this.profileComplete = profileComplete;
    }

    public List<Post> getPosts() {
        return posts;
    }

    public void setPosts(List<Post> posts) {
        this.posts = posts;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public List<Notification> getReceivedNotifications() {
        return receivedNotifications;
    }

    public void setReceivedNotifications(List<Notification> receivedNotifications) {
        this.receivedNotifications = receivedNotifications;
    }

    public List<Notification> getActedNotifications() {
        return actedNotifications;
    }

    public void setActedNotifications(List<Notification> actedNotifications) {
        this.actedNotifications = actedNotifications;
    }

    public List<Conversation> getConversationsAsAuthor() {
        return conversationsAsAuthor;
    }

    public void setConversationsAsAuthor(List<Conversation> conversationsAsAuthor) {
        this.conversationsAsAuthor = conversationsAsAuthor;
    }

    public List<Conversation> getConversationsAsRecipient() {
        return conversationsAsRecipient;
    }

    public void setConversationsAsRecipient(List<Conversation> conversationsAsRecipient) {
        this.conversationsAsRecipient = conversationsAsRecipient;
    }

    public List<Connection> getInitiatedConnections() {
        return initiatedConnections;
    }

    public void setInitiatedConnections(List<Connection> initiatedConnections) {
        this.initiatedConnections = initiatedConnections;
    }

    public List<Connection> getReceivedConnections() {
        return receivedConnections;
    }

    public void setReceivedConnections(List<Connection> receivedConnections) {
        this.receivedConnections = receivedConnections;
    }
}
