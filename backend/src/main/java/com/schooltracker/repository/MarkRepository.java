package com.schooltracker.repository;

import com.schooltracker.model.Mark;
import com.schooltracker.model.User;
import com.schooltracker.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudent(User student);

    List<Mark> findBySubject(Subject subject);

    List<Mark> findByStudentAndSubject(User student, Subject subject);

    List<Mark> findBySubjectFaculty(User faculty);
}
