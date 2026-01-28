package com.schooltracker.repository;

import com.schooltracker.model.Assessment;
import com.schooltracker.model.Subject;
import com.schooltracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findBySubject(Subject subject);

    List<Assessment> findByFaculty(User faculty);
}
