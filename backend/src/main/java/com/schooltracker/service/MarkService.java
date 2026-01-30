package com.schooltracker.service;

import com.schooltracker.model.Assessment;
import com.schooltracker.model.Mark;
import com.schooltracker.model.Subject;
import com.schooltracker.model.User;
import com.schooltracker.repository.MarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class MarkService {

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private com.schooltracker.repository.AssessmentRepository assessmentRepository;

    @Autowired
    private com.schooltracker.repository.UserRepository userRepository;

    @Autowired
    private com.schooltracker.repository.SubjectRepository subjectRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SMSService smsService;

    /**
     * Business Logic for Grading (Requirement):
     * ≥75 → Grade A
     * 60–74 → Grade B
     * 50–59 → Grade C
     * <40 → Fail
     */
    public String calculateGrade(Double obtained, Double total) {
        if (total == null || total == 0)
            return "-";
        double percentage = (obtained / total) * 100;

        if (percentage >= 75)
            return "A";
        if (percentage >= 60)
            return "B";
        if (percentage >= 50)
            return "C";
        if (percentage < 40)
            return "Fail";

        return "D"; // Default case for 40-49 if not specified
    }

    /**
     * Business Logic for Performance Status (Requirement):
     * Fetches previous assessment marks (same subject)
     * Compares current vs previous performance
     */
    public String calculateStatus(User student, Subject subject, Double currentObtained, Double currentTotal,
            Long currentMarkId) {
        List<Mark> previousMarks = markRepository.findByStudentAndSubject(student, subject);

        if (previousMarks.isEmpty()) {
            return "New";
        }

        // Filter out the current mark (if it exists) to prevent self-comparison
        // Sort by Assessment Date DESC, then by Assessment ID DESC to handle same-day
        // assessments
        Mark lastMark = previousMarks.stream()
                .filter(m -> currentMarkId == null || !m.getId().equals(currentMarkId))
                .sorted(Comparator.comparing((Mark m) -> m.getAssessment().getDate()).reversed()
                        .thenComparing(Comparator.comparing((Mark m) -> m.getAssessment().getId()).reversed()))
                .findFirst()
                .orElse(null);

        if (lastMark == null)
            return "New";

        double currentPercentage = (currentObtained / currentTotal) * 100;
        double lastPercentage = (lastMark.getObtainedMarks() / lastMark.getAssessment().getTotalMarks()) * 100;

        if (currentPercentage > lastPercentage)
            return "Improved";
        if (currentPercentage < lastPercentage)
            return "Declined";
        return "Same";
    }

    public Mark saveMark(Mark mark) {
        // Fetch full entities to ensure we have all data (totalMarks, etc.)
        Assessment assessment = assessmentRepository.findById(mark.getAssessment().getId()).orElse(null);
        User student = userRepository.findById(mark.getStudent().getId()).orElse(null);
        Subject subject = subjectRepository.findById(mark.getSubject().getId()).orElse(null);

        if (assessment == null || student == null || subject == null) {
            throw new RuntimeException("Invalid Assessment, Student, or Subject ID");
        }

        mark.setAssessment(assessment);
        mark.setStudent(student);
        mark.setSubject(subject);

        // 1. Calculate Grade automatically
        mark.setGrade(calculateGrade(mark.getObtainedMarks(), assessment.getTotalMarks()));

        // 2. Calculate Performance Status automatically (using percentages)
        mark.setStatus(
                calculateStatus(student, subject, mark.getObtainedMarks(), assessment.getTotalMarks(), mark.getId()));

        Mark savedMark = markRepository.save(mark);

        // 3. Send Email Notification
        sendPerformanceEmail(savedMark);

        return savedMark;
    }

    private void sendPerformanceEmail(Mark mark) {
        try {
            User student = mark.getStudent();
            String subjectName = mark.getSubject().getName();
            String assessmentName = mark.getAssessment().getName();
            String grade = mark.getGrade();
            String trend = mark.getStatus();
            double obtained = mark.getObtainedMarks();
            double total = mark.getAssessment().getTotalMarks();

            String subject = "Performance Update: " + subjectName + " - " + assessmentName;

            String messageBody = String.format(
                    "Dear %s,\n\n" +
                            "You have scored %.1f / %.1f in %s (%s).\n" +
                            "Grade: %s\n" +
                            "Performance Trend: %s\n\n",
                    student.getName(), obtained, total, assessmentName, subjectName, grade, trend);

            if ("Improved".equalsIgnoreCase(trend)) {
                messageBody += "Great job! Your performance has improved compared to the last assessment. Keep it up!\n";
            } else if ("Declined".equalsIgnoreCase(trend)) {
                messageBody += "Your performance has slightly declined. We encourage you to focus more on this subject.\n";
            } else {
                messageBody += "Your performance is consistent. Try to push for an improvement in the next assessment!\n";
            }

            messageBody += "\nBest Regards,\nStudent Performance Tracker System";

            // Send to Student
            if (student.getEmail() != null && !student.getEmail().isEmpty()) {
                System.out.println("Sending student email to: " + student.getEmail());
                emailService.sendEmail(student.getEmail(), subject, messageBody);
            }

            // Send to Parent (if available and different from student email)
            if (student.getParentsEmail() != null && !student.getParentsEmail().isEmpty()
                    && !student.getParentsEmail().equalsIgnoreCase(student.getEmail())) {
                System.out.println("Sending parent email to: " + student.getParentsEmail());
                String parentBody = String.format(
                        "Dear Parent,\n\n" +
                                "This is an update regarding your child %s's performance.\n\n" +
                                "Assessment: %s (%s)\n" +
                                "Score: %.1f / %.1f\n" +
                                "Grade: %s\n" +
                                "Performance Trend: %s\n\n",
                        student.getName(), assessmentName, subjectName, obtained, total, grade, trend);

                if ("Improved".equalsIgnoreCase(trend)) {
                    parentBody += "Your child's performance has improved. Keep encouraging them!\n";
                } else if ("Declined".equalsIgnoreCase(trend)) {
                    parentBody += "There has been a slight decline in performance. A little extra focus might help.\n";
                }

                parentBody += "\nBest Regards,\nStudent Performance Tracker System";
                emailService.sendEmail(student.getParentsEmail(), subject, parentBody);
            }

            // Send SMS to Parent (if available)
            String parentMobile = student.getParentsMobile();
            System.out.println("Processing SMS check for student: " + student.getName() + ", Parent Mobile: ["
                    + parentMobile + "]");

            if (parentMobile != null && !parentMobile.trim().isEmpty()) {
                System.out.println("Triggering SMSService for: " + parentMobile);
                String smsContent = String.format(
                        "Tracker Alert: %s scored %.1f/%.1f in %s. Grade: %s. Trend: %s.",
                        student.getName(), obtained, total, assessmentName, grade, trend);
                smsService.sendSMS(parentMobile, smsContent);
            } else {
                System.out.println("No parent mobile found for student: " + student.getName());
            }

        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace(); // Added stack trace for better debugging
        }
    }

    public List<Mark> getMarksByStudent(User student) {
        return markRepository.findByStudent(student);
    }

    public List<Mark> getMarksByFaculty(User faculty) {
        return markRepository.findBySubjectFaculty(faculty);
    }
}
