package com.schooltracker.controller;

import com.schooltracker.model.User;
import com.schooltracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Adjust port if Vite is running elsewhere
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.schooltracker.repository.SubjectRepository subjectRepository;

    @Autowired
    private com.schooltracker.repository.MarkRepository markRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/role/{role}")
    public List<User> getUsersByRole(@PathVariable String role) {
        return userRepository.findByRole(role);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        user.setName(userDetails.getName());
        user.setRole(userDetails.getRole());
        user.setDepartment(userDetails.getDepartment());
        user.setEmail(userDetails.getEmail());
        user.setUsername(userDetails.getUsername());

        // Only update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(userDetails.getPassword());
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // 1. Unassign as Faculty from Subjects
        List<com.schooltracker.model.Subject> facultySubjects = subjectRepository.findByFaculty(user);
        for (com.schooltracker.model.Subject sub : facultySubjects) {
            sub.setFaculty(null);
            subjectRepository.save(sub);
        }

        // 2. Remove as Student from Subjects
        List<com.schooltracker.model.Subject> studentSubjects = subjectRepository.findByStudentsContains(user);
        for (com.schooltracker.model.Subject sub : studentSubjects) {
            sub.getStudents().remove(user);
            subjectRepository.save(sub);
        }

        // 3. Delete Marks
        List<com.schooltracker.model.Mark> studentMarks = markRepository.findByStudent(user);
        markRepository.deleteAll(studentMarks);

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
}
