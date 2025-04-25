package com.linkedIn.features.search.service;

import com.linkedIn.features.authentication.model.AuthenticationUser;
import jakarta.persistence.EntityManager;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.massindexing.MassIndexer;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SearchService {
    private final EntityManager entityManager;

    public SearchService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public List<AuthenticationUser> searchUsers(String query) {
        SearchSession searchSession = Search.session(entityManager);

        return searchSession.search(AuthenticationUser.class)
                .where(f -> f.match()
                        .fields("firstName", "lastName", "position", "company")
                        .matching(query)
                        .fuzzy(2)
                )
                .fetchAllHits();
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void buildIndex() {
        try {
            SearchSession searchSession = Search.session(entityManager);
            MassIndexer indexer = searchSession.massIndexer(AuthenticationUser.class)
                    .threadsToLoadObjects(4);
            indexer.startAndWait();
            System.out.println("Lucene index built successfully.");
        } catch (InterruptedException e) {
            System.err.println("Indexing failed: " + e.getMessage());
        }
    }
}

