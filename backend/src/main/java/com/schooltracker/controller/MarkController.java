package com.schooltracker.controller;

import com.schooltracker.model.Mark;
import com.schooltracker.model.User;
import com.schooltracker.repository.UserRepository;
import com.schooltracker.service.MarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(origins = "*")
public class MarkController {

    @Autowired
    private MarkService markService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public Mark enterMark(@RequestBody Mark mark) {
        return markService.saveMark(mark);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Mark>> getMarksByStudent(@PathVariable Long studentId) {
        User student = userRepository.findById(studentId).orElse(null);
        if (student == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(markService.getMarksByStudent(student));
    }

    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<List<Mark>> getMarksByFaculty(@PathVariable Long facultyId) {
        User faculty = userRepository.findById(facultyId).orElse(null);
        if (faculty == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(markService.getMarksByFaculty(faculty));
    }
}
