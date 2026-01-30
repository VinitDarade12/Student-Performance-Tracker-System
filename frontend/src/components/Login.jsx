import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [role, setRole] = useState('Student');

    useEffect(() => {
        if (location.state && location.state.role) {
            setRole(location.state.role);
        }
    }, [location.state]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role }),
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('user', JSON.stringify(user));
                // Store user info if needed, for now just navigate
                if (user.role.toLowerCase() === 'admin') {
                    navigate('/admin/dashboard');
                } else if (user.role.toLowerCase() === 'faculty') {
                    navigate('/faculty/dashboard');
                } else if (user.role.toLowerCase() === 'student') {
                    navigate('/student/dashboard');
                } else {
                    alert(`Logged in as ${user.role}! Dashboard coming soon.`);
                }
            } else {
                const message = await response.text();
                setError(message);
            }
        } catch (err) {
            setError('Server connection failed. Please ensure the backend is running.');
        }
    };

    const roles = ['Student', 'Faculty', 'Admin'];

    return (
        <div className="login-page">
            <div className="login-overlay"></div>
            <div className="login-container fade-in">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <GraduationCap size={40} color="#1e40af" />
                            <span className="logo-text">TRACKER</span>
                        </div>
                        <h1 className="login-title">Welcome Back</h1>
                        <p className="login-subtitle">Please select your role and sign in</p>
                    </div>

                    {error && <div className="login-error-msg">{error}</div>}

                    <div className="role-selector">
                        {roles.map((r) => (
                            <button
                                key={r}
                                className={`role-btn ${role === r ? 'active' : ''}`}
                                onClick={() => setRole(r)}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Username / ID</label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="login-submit">
                            Sign In as {role}
                        </button>
                    </form>

                    <Link to="/" className="back-home">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
