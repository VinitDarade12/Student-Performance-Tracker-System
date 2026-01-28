package com.schooltracker.controller;

import com.schooltracker.model.Subject;
import com.schooltracker.model.User;
import com.schooltracker.repository.SubjectRepository;
import com.schooltracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Long id) {
        return subjectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject subjectDetails) {
        Subject subject = subjectRepository.findById(id).orElse(null);
        if (subject == null)
            return ResponseEntity.notFound().build();

        subject.setName(subjectDetails.getName());
        subject.setCode(subjectDetails.getCode());
        subject.setYear(subjectDetails.getYear());
        subject.setSemester(subjectDetails.getSemester());
        subject.setFaculty(subjectDetails.getFaculty());

        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        Subject subject = subjectRepository.findById(id).orElse(null);
        if (subject == null)
            return ResponseEntity.notFound().build();

        subjectRepository.delete(subject);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<Subject>> getSubjectsByFaculty(@PathVariable Long facultyId) {
        User faculty = userRepository.findById(facultyId).orElse(null);
        if (faculty == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(subjectRepository.findByFaculty(faculty));
    }

    @PostMapping("/{id}/students/{studentId}")
    public ResponseEntity<Subject> enrollStudent(@PathVariable Long id, @PathVariable Long studentId) {
        Subject subject = subjectRepository.findById(id).orElse(null);
        User student = userRepository.findById(studentId).orElse(null);

        if (subject == null || student == null) {
            return ResponseEntity.notFound().build();
        }

        subject.getStudents().add(student);
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @DeleteMapping("/{id}/students/{studentId}")
    public ResponseEntity<Subject> unenrollStudent(@PathVariable Long id, @PathVariable Long studentId) {
        Subject subject = subjectRepository.findById(id).orElse(null);
        User student = userRepository.findById(studentId).orElse(null);

        if (subject == null || student == null) {
            return ResponseEntity.notFound().build();
        }

        subject.getStudents().remove(student);
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<java.util.Set<User>> getSubjectStudents(@PathVariable Long id) {
        Subject subject = subjectRepository.findById(id).orElse(null);
        if (subject == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subject.getStudents());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Subject>> getSubjectsByStudent(@PathVariable Long studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(subjectRepository.findByStudentsContains(student));
    }
}
