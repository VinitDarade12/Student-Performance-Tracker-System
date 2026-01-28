import React, { useState, useEffect } from 'react';
import {
    GraduationCap,
    LayoutDashboard,
    Users,
    Building2,
    Settings,
    LogOut,
    CheckCircle2,
    AlertTriangle,
    Pencil,
    Trash2,
    Plus,
    Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjectStudents, setSubjectStudents] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    // User Modal state
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userFormData, setUserFormData] = useState({
        name: '',
        role: 'Student',
        department: '-',
        email: '',
        parentsEmail: '',
        username: '',
        password: ''
    });

    // Subject Modal state
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [subjectFormData, setSubjectFormData] = useState({
        name: '',
        code: '',
        year: '2024',
        semester: '1st',
        facultyId: ''
    });

    // Settings state
    const [settingsFormData, setSettingsFormData] = useState(() => {
        const saved = localStorage.getItem('adminSettings');
        return saved ? JSON.parse(saved) : {
            schoolName: 'CDAC Infoway',
            website: 'www.cdacinfoway.com',
            academicYear: '2025-26',
            currentSemester: '1st',
            adminEmail: 'admin@school.com',
            securityLevel: 'High'
        };
    });

    // Dynamic Activities state
    const [systemActivities, setSystemActivities] = useState(() => {
        const saved = localStorage.getItem('systemActivities');
        return saved ? JSON.parse(saved) : [
            { title: 'Database Backup', desc: 'Successfully completed at 02:00 AM', status: 'success', timestamp: new Date().getTime() },
            { title: 'Server Load', desc: '99.9% Uptime Maintained', status: 'success', timestamp: new Date().getTime() },
            { title: 'System Initialization', desc: 'Admin Dashboard linked to database', status: 'success', timestamp: new Date().getTime() }
        ];
    });

    const addActivity = (title, desc, status) => {
        const newActivity = { title, desc, status, timestamp: new Date().getTime() };
        const updatedActivities = [newActivity, ...systemActivities.slice(0, 4)]; // Keep last 5
        setSystemActivities(updatedActivities);
        localStorage.setItem('systemActivities', JSON.stringify(updatedActivities));
    };

    const API_URL = 'http://localhost:8085/api/users';
    const SUBJECT_API_URL = 'http://localhost:8085/api/subjects';

    useEffect(() => {
        fetchUsers();
        fetchSubjects();
    }, []);

    useEffect(() => {
        const filteredFaculties = users.filter(user => user.role && user.role.toLowerCase() === 'faculty');
        setFaculties(filteredFaculties);

        const filteredStudents = users.filter(user => user.role && user.role.toLowerCase() === 'student');
        setStudents(filteredStudents);
    }, [users]);

    useEffect(() => {
        if (selectedSubjectId) {
            fetchSubjectStudents(selectedSubjectId);
        } else {
            setSubjectStudents([]);
        }
    }, [selectedSubjectId]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await fetch(SUBJECT_API_URL);
            if (response.ok) {
                const data = await response.json();
                setSubjects(data);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchSubjectStudents = async (subjectId) => {
        try {
            const response = await fetch(`${SUBJECT_API_URL}/${subjectId}/students`);
            if (response.ok) {
                const data = await response.json();
                setSubjectStudents(data);
            }
        } catch (error) {
            console.error('Error fetching subject students:', error);
        }
    };

    const handleLogout = () => {
        navigate('/');
    };

    const handleUserInputChange = (e) => {
        setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        const method = editingUser ? 'PUT' : 'POST';
        const url = editingUser ? `${API_URL}/${editingUser.id}` : API_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userFormData)
            });

            if (response.ok) {
                alert('User saved successfully!');
                setShowUserModal(false);
                setEditingUser(null);
                setUserFormData({ name: '', role: 'Student', department: '-', email: '', parentsEmail: '', username: '', password: '' });
                fetchUsers();
                addActivity(
                    editingUser ? 'User Updated' : 'New User Created',
                    `${userFormData.name} (${userFormData.role}) has been ${editingUser ? 'modified' : 'added'}`,
                    'success'
                );
            } else {
                const errorText = await response.text();
                alert('Failed to save user: ' + errorText);
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error saving user: ' + error.message);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    const deletedUser = users.find(u => u.id === id);
                    fetchUsers();
                    addActivity(
                        'User Deleted',
                        `${deletedUser?.name || 'A user'} has been removed from the system`,
                        'warning'
                    );
                }
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleSubjectInputChange = (e) => {
        setSubjectFormData({ ...subjectFormData, [e.target.name]: e.target.value });
    };

    const handleSubjectSubmit = async (e) => {
        e.preventDefault();
        const method = editingSubject ? 'PUT' : 'POST';
        const url = editingSubject ? `${SUBJECT_API_URL}/${editingSubject.id}` : SUBJECT_API_URL;

        const payload = {
            name: subjectFormData.name,
            code: subjectFormData.code,
            year: subjectFormData.year,
            semester: subjectFormData.semester,
            faculty: subjectFormData.facultyId ? { id: parseInt(subjectFormData.facultyId) } : null
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Subject saved successfully!');
                setShowSubjectModal(false);
                setEditingSubject(null);
                setSubjectFormData({ name: '', code: '', year: '2024', semester: '1st', facultyId: '' });
                fetchSubjects();
                addActivity(
                    editingSubject ? 'Subject Updated' : 'New Subject Added',
                    `${subjectFormData.name} (${subjectFormData.code}) has been ${editingSubject ? 'modified' : 'added'}`,
                    'success'
                );
            } else {
                const errorText = await response.text();
                alert('Failed to save subject: ' + errorText);
            }
        } catch (error) {
            console.error('Error saving subject:', error);
            alert('Error saving subject: ' + error.message);
        }
    };

    const handleEnrollStudent = async (studentId) => {
        if (!selectedSubjectId) return;
        try {
            const response = await fetch(`${SUBJECT_API_URL}/${selectedSubjectId}/students/${studentId}`, {
                method: 'POST'
            });
            if (response.ok) {
                fetchSubjectStudents(selectedSubjectId);
            }
        } catch (error) {
            console.error('Error enrolling student:', error);
        }
    };

    const handleUnenrollStudent = async (studentId) => {
        if (!selectedSubjectId) return;
        try {
            const response = await fetch(`${SUBJECT_API_URL}/${selectedSubjectId}/students/${studentId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchSubjectStudents(selectedSubjectId);
            }
        } catch (error) {
            console.error('Error unenrolling student:', error);
        }
    };

    const handleDeleteSubject = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                const response = await fetch(`${SUBJECT_API_URL}/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchSubjects();
                }
            } catch (error) {
                console.error('Error deleting subject:', error);
            }
        }
    };

    const openAddUserModal = () => {
        setEditingUser(null);
        setUserFormData({ name: '', role: 'Student', department: '-', email: '', parentsEmail: '', username: '', password: '' });
        setShowUserModal(true);
    };

    const openEditUserModal = (user) => {
        setEditingUser(user);
        setUserFormData({
            name: user.name,
            role: user.role,
            department: user.department,
            email: user.email,
            parentsEmail: user.parentsEmail || '',
            username: user.username,
            password: ''
        });
        setShowUserModal(true);
    };

    const openAddSubjectModal = () => {
        setEditingSubject(null);
        setSubjectFormData({ name: '', code: '', year: '2024', semester: '1st', facultyId: '' });
        setShowSubjectModal(true);
    };

    const openEditSubjectModal = (subject) => {
        setEditingSubject(subject);
        setSubjectFormData({
            name: subject.name,
            code: subject.code,
            year: subject.year,
            semester: subject.semester,
            facultyId: subject.faculty ? subject.faculty.id.toString() : ''
        });
        setShowSubjectModal(true);
    };

    const departmentsCount = [...new Set(users.map(u => u.department).filter(d => d && d !== '-'))].length;

    const stats = [
        { label: 'Total Users', value: users.length },
        { label: 'Departments', value: departmentsCount || 4 },
        { label: 'Total Subjects', value: subjects.length },
        { label: 'Uptime', value: '99.9%' },
    ];

    const activities = systemActivities;

    const handleSettingsChange = (e) => {
        setSettingsFormData({ ...settingsFormData, [e.target.name]: e.target.value });
    };

    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('adminSettings', JSON.stringify(settingsFormData));
        alert('Settings saved successfully!');
        addActivity('Settings Updated', 'Institution configuration has been modified', 'success');
    };

    const renderSettings = () => (
        <>
            <header className="content-header">
                <h1>System Settings</h1>
                <p>Configure institution-wide parameters and security.</p>
            </header>

            <div className="settings-container fade-in">
                <form onSubmit={handleSettingsSubmit}>
                    <div className="settings-grid">
                        <section className="settings-card card-glass">
                            <div className="settings-card-header">
                                <Building2 size={24} color="#2563eb" />
                                <h3>Institution Identity</h3>
                            </div>
                            <div className="settings-form-content">
                                <div className="form-group">
                                    <label>School/College Name</label>
                                    <input
                                        type="text"
                                        name="schoolName"
                                        value={settingsFormData.schoolName}
                                        onChange={handleSettingsChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Official Website</label>
                                    <input
                                        type="text"
                                        name="website"
                                        value={settingsFormData.website}
                                        onChange={handleSettingsChange}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="settings-card card-glass">
                            <div className="settings-card-header">
                                <Calendar size={24} color="#10b981" />
                                <h3>Academic Roadmap</h3>
                            </div>
                            <div className="settings-form-content">
                                <div className="form-group">
                                    <label>Academic Year</label>
                                    <input
                                        type="text"
                                        name="academicYear"
                                        value={settingsFormData.academicYear}
                                        onChange={handleSettingsChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Current Semester</label>
                                    <select
                                        name="currentSemester"
                                        value={settingsFormData.currentSemester}
                                        onChange={handleSettingsChange}
                                    >
                                        <option value="1st">1st Semester</option>
                                        <option value="2nd">2nd Semester</option>
                                        <option value="3rd">3rd Semester</option>
                                        <option value="4th">4th Semester</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="settings-card card-glass">
                            <div className="settings-card-header">
                                <Settings size={24} color="#f59e0b" />
                                <h3>Admin Preferences</h3>
                            </div>
                            <div className="settings-form-content">
                                <div className="form-group">
                                    <label>Root Admin Email</label>
                                    <input
                                        type="email"
                                        name="adminEmail"
                                        value={settingsFormData.adminEmail}
                                        onChange={handleSettingsChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Security Protocol</label>
                                    <select
                                        name="securityLevel"
                                        value={settingsFormData.securityLevel}
                                        onChange={handleSettingsChange}
                                    >
                                        <option value="Standard">Standard</option>
                                        <option value="High">High (Recommended)</option>
                                        <option value="Strict">Strict (MFA Required)</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="settings-actions">
                        <button type="submit" className="btn-save btn-wide">
                            Apply Configuration
                        </button>
                    </div>
                </form>
            </div>
        </>
    );

    const renderDashboard = () => (
        <>
            <header className="content-header">
                <h1>System Overview</h1>
                <p>Quick snapshot of all system operations.</p>
            </header>

            <section className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                    </div>
                ))}
            </section>

            <section className="activity-section">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                    {activities.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-info">
                                <h4>{activity.title}</h4>
                                <p className={activity.status}>{activity.desc}</p>
                            </div>
                            <div className="activity-status">
                                {activity.status === 'success' ? (
                                    <CheckCircle2 size={20} color="#10b981" />
                                ) : (
                                    <AlertTriangle size={20} color="#f59e0b" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );

    const renderUsers = () => (
        <>
            <header className="content-header">
                <h1>User Management</h1>
                <p>View and manage all system users.</p>
            </header>

            <section className="table-section card-glass">
                <div className="table-header">
                    <h2>User List</h2>
                    <button className="btn-add" onClick={openAddUserModal}>
                        <Plus size={18} />
                        Add New User
                    </button>
                </div>

                <div className="table-container">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>Email</th>
                                <th>Username</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={index}>
                                    <td>#{user.id}</td>
                                    <td>{user.name}</td>
                                    <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                                    <td>{user.department || '-'}</td>
                                    <td>{user.email}</td>
                                    <td>{user.username}</td>
                                    <td className="actions">
                                        <button className="edit-btn" onClick={() => openEditUserModal(user)}>
                                            <Pencil size={18} />
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );

    const renderSubjects = () => (
        <>
            <header className="content-header">
                <h1>Subject Management</h1>
                <p>Create and assign faculties to institutional subjects.</p>
            </header>

            <section className="table-section card-glass">
                <div className="table-header">
                    <h2>Subject List</h2>
                    <button className="btn-add" onClick={openAddSubjectModal}>
                        <Plus size={18} />
                        Add New Subject
                    </button>
                </div>

                <div className="table-container">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Subject Name</th>
                                <th>Code</th>
                                <th>Year/Sem</th>
                                <th>Assigned Faculty</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((subject, index) => (
                                <tr key={index}>
                                    <td>#{subject.id}</td>
                                    <td>{subject.name}</td>
                                    <td>{subject.code}</td>
                                    <td>{subject.year} / {subject.semester}</td>
                                    <td>{subject.faculty ? subject.faculty.name : <span className="unassigned">Unassigned</span>}</td>
                                    <td className="actions">
                                        <button className="edit-btn" onClick={() => openEditSubjectModal(subject)}>
                                            <Pencil size={18} />
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDeleteSubject(subject.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );

    const renderStudentAssignment = () => (
        <>
            <header className="content-header">
                <h1>Student Management</h1>
                <p>Assign students to subjects and track their enrollment status.</p>
            </header>

            <div className="enrollment-management card-glass">
                <div className="selector-section">
                    <label>Select Subject to Manage:</label>
                    <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="subject-selector"
                    >
                        <option value="">-- Select a Subject --</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code}) - {subject.faculty ? subject.faculty.name : 'No Faculty'}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedSubjectId && (
                    <div className="enrollment-grid">
                        <div className="enrollment-column">
                            <h3>Enrolled Students ({subjectStudents.length})</h3>
                            <div className="student-scroll-list">
                                {subjectStudents.length === 0 ? (
                                    <p className="empty-msg">No students enrolled yet.</p>
                                ) : (
                                    <table className="user-table mini">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjectStudents.map(student => (
                                                <tr key={student.id}>
                                                    <td>{student.name}</td>
                                                    <td>
                                                        <button
                                                            className="delete-btn mini"
                                                            onClick={() => handleUnenrollStudent(student.id)}
                                                            title="Unenroll"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <div className="enrollment-column">
                            <h3>Available Students</h3>
                            <div className="student-scroll-list">
                                <table className="user-table mini">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students
                                            .filter(s => !subjectStudents.some(es => es.id === s.id))
                                            .map(student => (
                                                <tr key={student.id}>
                                                    <td>{student.name}</td>
                                                    <td>
                                                        <button
                                                            className="edit-btn mini"
                                                            onClick={() => handleEnrollStudent(student.id)}
                                                            title="Enroll"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div
                    className="sidebar-logo"
                    onClick={() => navigate('/login')}
                    style={{ cursor: 'pointer' }}
                >
                    <GraduationCap size={32} color="white" />
                    <span>TRACKER</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="section-title">MAIN MENU</span>
                        <button
                            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <Users size={20} />
                            Users
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'subjects' ? 'active' : ''}`}
                            onClick={() => setActiveTab('subjects')}
                        >
                            <Building2 size={20} />
                            Subjects
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
                            onClick={() => setActiveTab('students')}
                        >
                            <GraduationCap size={20} />
                            Student Magmt
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={20} />
                            Settings
                        </button>
                    </div>
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="main-content fade-in">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'subjects' && renderSubjects()}
                {activeTab === 'students' && renderStudentAssignment()}
                {activeTab === 'settings' && renderSettings()}
            </main>

            {/* User Modal */}
            {showUserModal && (
                <div className="modal-overlay">
                    <div className="modal-content card-glass">
                        <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        <form onSubmit={handleUserSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={userFormData.name}
                                        onChange={handleUserInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select name="role" value={userFormData.role} onChange={handleUserInputChange}>
                                        <option value="Student">Student</option>
                                        <option value="Faculty">Faculty</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={userFormData.department}
                                        onChange={handleUserInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={userFormData.email}
                                        onChange={handleUserInputChange}
                                        required
                                    />
                                </div>
                                {userFormData.role === 'Student' && (
                                    <div className="form-group">
                                        <label>Parents Email</label>
                                        <input
                                            type="email"
                                            name="parentsEmail"
                                            value={userFormData.parentsEmail}
                                            onChange={handleUserInputChange}
                                            placeholder="Enter parent's email"
                                        />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={userFormData.username}
                                        onChange={handleUserInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={userFormData.password}
                                        onChange={handleUserInputChange}
                                        placeholder={editingUser ? 'Leave blank to keep same' : 'Enter password'}
                                        required={!editingUser}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowUserModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Save User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Subject Modal */}
            {showSubjectModal && (
                <div className="modal-overlay">
                    <div className="modal-content card-glass">
                        <h2>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
                        <form onSubmit={handleSubjectSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Subject Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={subjectFormData.name}
                                        onChange={handleSubjectInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Subject Code</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={subjectFormData.code}
                                        onChange={handleSubjectInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Year</label>
                                    <input
                                        type="text"
                                        name="year"
                                        value={subjectFormData.year}
                                        onChange={handleSubjectInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Semester</label>
                                    <select name="semester" value={subjectFormData.semester} onChange={handleSubjectInputChange}>
                                        <option value="1st">1st Semester</option>
                                        <option value="2nd">2nd Semester</option>
                                        <option value="3rd">3rd Semester</option>
                                        <option value="4th">4th Semester</option>
                                        <option value="5th">5th Semester</option>
                                        <option value="6th">6th Semester</option>
                                        <option value="7th">7th Semester</option>
                                        <option value="8th">8th Semester</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Assign Faculty</label>
                                    <select name="facultyId" value={subjectFormData.facultyId} onChange={handleSubjectInputChange}>
                                        <option value="">Select Faculty</option>
                                        {faculties.map(faculty => (
                                            <option key={faculty.id} value={faculty.id}>{faculty.name} ({faculty.username})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Save Subject</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
