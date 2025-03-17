package com.linkedIn.configuration;

import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.authentication.repository.AuthenticationUserRepository;
import com.linkedIn.features.authentication.utils.Encoder;
import com.linkedIn.features.feed.model.Post;
import com.linkedIn.features.feed.repository.PostRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashSet;
import java.util.List;
import java.util.Random;

@Configuration
public class LoadDatabaseConfiguration {

    private final Encoder encoder;

    public LoadDatabaseConfiguration(Encoder encoder) {
        this.encoder = encoder;
    }

    @Bean
    public CommandLineRunner initDatabase(AuthenticationUserRepository authenticationUserRepository, PostRepository postRepository){
        return  args -> {
            List<AuthenticationUser> users = createUsers(authenticationUserRepository);
            createPosts(postRepository, users);
        };
    }

    private List<AuthenticationUser> createUsers(AuthenticationUserRepository authenticationUserRepository){
        List<AuthenticationUser> users = List.of(
            createUser("rakshita@example.com", "asdf", "Rakshita", "gidd", "Google", "SDE", "Benglore", "https://images.unsplash.com/photo-1494790108377-be9c29b29330"),
            createUser("krishna@example.com", "asdf", "Vasudev", "Shastri", "Google", "SDE", "Benglore", "https://images.unsplash.com/photo-1494790108377-be9c29b29330"),
            createUser("radha@example.com", "asdf", "radha", "vrishbhan", "Google", "SDE", "Benglore", "https://images.unsplash.com/photo-1494790108377-be9c29b29330")
                );
        authenticationUserRepository.saveAll(users);
        return users;
    }

    private AuthenticationUser createUser(String email, String password, String firstName, String lastName,
                            String position, String company, String location, String profilePicture) {
        AuthenticationUser user = new AuthenticationUser(email, encoder.encode(password));
        user.setEmailVerified(true);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPosition(position);
        user.setCompany(company);
        user.setLocation(location);
        user.setProfilePicture(profilePicture);
        return user;
    }

    private void createPosts(PostRepository postRepository, List<AuthenticationUser> users){
        Random random = new Random();
        for (int i = 1; i <=10; i++) {
            Post post = new Post("this is to celebrate my complition of course",
                    users.get(random.nextInt(users.size())));
            post.setLikes(generateLikes(users, i, random));
            if(i==1){
                post.setPicture("https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pexels.com%2Fsearch%2Fbeautiful%2F&psig=AOvVaw3BMXV7RyuPcPhCFKFldCfJ&ust=1742182228045000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNCg1tnUjYwDFQAAAAAdAAAAABAE");
            }
            postRepository.save(post);
        }
    }
    private HashSet<AuthenticationUser> generateLikes(List<AuthenticationUser> users, int postNumber, Random random){
        HashSet<AuthenticationUser> likes = new HashSet<>();

        if(postNumber == 1){
            while(likes.size()<3){
                likes.add(users.get(random.nextInt(users.size())));
            }
        }else{
            int likesCount = switch (postNumber % 5){
                case 0 -> 3;
                case 2, 3 -> 2;
                default -> 1;
            };
            for (int i=0; i<likesCount; i++){
                likes.add(users.get(random.nextInt(users.size())));
            }
        }
        return likes;
    }
}
