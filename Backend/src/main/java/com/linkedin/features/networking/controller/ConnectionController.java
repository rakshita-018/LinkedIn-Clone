package com.linkedIn.features.networking.controller;


import com.linkedIn.features.authentication.model.AuthenticationUser;
import com.linkedIn.features.networking.model.Connection;
import com.linkedIn.features.networking.model.Status;
import com.linkedIn.features.networking.service.ConnectionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/networking")
public class ConnectionController {
    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @GetMapping("/connections")
    public List<Connection> getUserConnections(@RequestAttribute("authenticatedUser") AuthenticationUser user, @RequestParam(required = false) Status status, @RequestParam(required = false) Long userId) {
        if (userId != null) {
            return connectionService.getUserConnections(userId, status);
        }
        return connectionService.getUserConnections(user, status);
    }

    @PostMapping("/connections")
    public Connection sendConnectionRequest(@RequestAttribute("authenticatedUser") AuthenticationUser sender, @RequestParam Long recipientId) {
        return connectionService.sendConnectionRequest(sender, recipientId);
    }

    @PutMapping("/connections/{id}")
    public Connection acceptConnectionRequest(@RequestAttribute("authenticatedUser") AuthenticationUser recipient, @PathVariable Long id) {
        return connectionService.acceptConnectionRequest(recipient, id);
    }

    @DeleteMapping("/connections/{id}")
    public Connection rejectOrCancelConnection(@RequestAttribute("authenticatedUser") AuthenticationUser recipient, @PathVariable Long id) {
        return connectionService.rejectOrCancelConnection(recipient, id);
    }

    @PutMapping("/connections/{id}/seen")
    public Connection markConnectionAsSeen(@RequestAttribute("authenticatedUser") AuthenticationUser user, @PathVariable Long id) {
        return connectionService.markConnectionAsSeen(user, id);
    }

    @GetMapping("/suggestions")
    public List<AuthenticationUser> getConnectionSuggestions(@RequestAttribute("authenticatedUser") AuthenticationUser user, @RequestParam(required = false, defaultValue = "6") Integer limit) {
        return connectionService.getConnectionSuggestions(user);
//        return connectionService.getRecommendations(user.getId(), limit);
    }
}
