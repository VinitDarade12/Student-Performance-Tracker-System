package com.schooltracker.controller;

import com.schooltracker.model.Assessment;
import com.schooltracker.model.User;
import com.schooltracker.repository.AssessmentRepository;
import com.schooltracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@CrossOrigin(origins = "*")
public class AssessmentController {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.schooltracker.repository.SubjectRepository subjectRepository;

    @GetMapping
    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    @PostMapping
    public Assessment createAssessment(@RequestBody Assessment assessment) {
        return assessmentRepository.save(assessment);
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<Assessment>> getAssessmentsByFaculty(@PathVariable Long facultyId) {
        User faculty = userRepository.findById(facultyId).orElse(null);
        if (faculty == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(assessmentRepository.findByFaculty(faculty));
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Assessment>> getAssessmentsBySubject(@PathVariable Long subjectId) {
        com.schooltracker.model.Subject subject = subjectRepository.findById(subjectId).orElse(null);
        if (subject == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(assessmentRepository.findBySubject(subject));
    }
}
