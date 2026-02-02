// ============================================
// Student Registration System - JavaScript
// ============================================

// Key for localStorage
const STORAGE_KEY = 'students_data';
const ADMIN_EMAIL = 'eshitemiyvonne@gmail.com';
const ADMIN_PASSWORD = 'Admin@2026';
const AUTH_KEY = 'admin_authenticated';

// Get DOM Elements
const loginContainer = document.getElementById('loginContainer');
const adminContainer = document.getElementById('adminContainer');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const registrationForm = document.getElementById('registrationForm');
const messageContainer = document.getElementById('messageContainer');
const tableBody = document.getElementById('tableBody');
const emptyRow = document.getElementById('emptyRow');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const closeBtn = document.querySelector('.close');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const editForm = document.getElementById('editForm');

// Global variable to store the index of student being edited/deleted
let currentEditIndex = null;
let currentDeleteIndex = null;

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    setupEventListeners();
    setupNavigation();
    loadStudents();
});

// ============================================
// Authentication Check
// ============================================
function checkAuthentication() {
    const isAuthenticated = sessionStorage.getItem(AUTH_KEY);
    
    if (isAuthenticated) {
        showAdminDashboard();
    } else {
        showLoginPage();
    }
}

// ============================================
// Show Login Page
// ============================================
function showLoginPage() {
    loginContainer.style.display = 'flex';
    adminContainer.style.display = 'none';
    loginForm.addEventListener('submit', handleLogin);
}

// ============================================
// Show Admin Dashboard
// ============================================
function showAdminDashboard() {
    loginContainer.style.display = 'none';
    adminContainer.style.display = 'flex';
    logoutBtn.addEventListener('click', handleLogout);
}

// ============================================
// Handle Login
// ============================================
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');
    
    // Clear previous errors
    document.getElementById('usernameError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    loginMessage.innerHTML = '';
    
    // Validate credentials
    if (email !== ADMIN_EMAIL) {
        document.getElementById('usernameError').textContent = 'Invalid email';
        return;
    }
    
    if (password !== ADMIN_PASSWORD) {
        document.getElementById('passwordError').textContent = 'Invalid password';
        return;
    }
    
    // Authenticate user
    sessionStorage.setItem(AUTH_KEY, 'true');
    showAdminDashboard();
    loginForm.reset();
}

// ============================================
// Handle Logout
// ============================================
function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY);
    loginContainer.style.display = 'flex';
    adminContainer.style.display = 'none';
    loginForm.reset();
    document.getElementById('usernameError').textContent = '';
    document.getElementById('passwordError').textContent = '';
}

// ============================================
// Event Listeners Setup
// ============================================
function setupEventListeners() {
    // Form submission
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleFormSubmit);
    }

    // Modal close buttons
    if (closeBtn) closeBtn.addEventListener('click', closeEditModal);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);

    // Edit form submission
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }

    // Delete confirmation
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === editModal) {
            closeEditModal();
        }
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });

}

// ============================================
// Navigation Setup
// ============================================
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const registrationSection = document.getElementById('registration');
    const dashboardSection = document.getElementById('dashboard');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all sections
            registrationSection.style.display = 'none';
            dashboardSection.style.display = 'none';
            
            // Show selected section
            const section = this.getAttribute('data-section');
            if (section === 'registration') {
                registrationSection.style.display = 'block';
            } else if (section === 'dashboard') {
                dashboardSection.style.display = 'block';
            }
        });
    });
    
    // Show registration section by default
    registrationSection.style.display = 'block';
    dashboardSection.style.display = 'none';
}

// ============================================
// Form Submission Handler
// ============================================
function handleFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const student = {
        fullName: document.getElementById('fullName').value.trim(),
        registrationNumber: document.getElementById('registrationNumber').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        gender: document.querySelector('input[name="gender"]:checked').value,
        course: document.getElementById('course').value,
        yearOfStudy: document.getElementById('yearOfStudy').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        registrationDate: new Date().toLocaleDateString()
    };

    // Validate form
    if (!validateStudent(student)) {
        return;
    }

    // Check for duplicate registration number
    const students = getStudents();
    if (students.some(s => s.registrationNumber.toLowerCase() === student.registrationNumber.toLowerCase())) {
        showMessage('Registration number already exists!', 'error');
        document.getElementById('registrationNumberError').textContent = 'This registration number is already in use.';
        return;
    }

    // Check for duplicate email
    if (students.some(s => s.email.toLowerCase() === student.email.toLowerCase())) {
        showMessage('Email already registered!', 'error');
        document.getElementById('emailError').textContent = 'This email is already registered.';
        return;
    }

    // Add student
    students.push(student);
    saveStudents(students);

    // Show success message
    showMessage('Student registered successfully!', 'success');

    // Reset form
    registrationForm.reset();

    // Reload table
    loadStudents();
}

// ============================================
// Validation
// ============================================
function validateStudent(student) {
    let isValid = true;
    const errors = {
        fullName: '',
        registrationNumber: '',
        email: '',
        phone: '',
        gender: '',
        course: '',
        yearOfStudy: '',
        dateOfBirth: ''
    };

    // Full Name validation
    if (!student.fullName || student.fullName.length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
        isValid = false;
    }

    // Registration Number validation
    if (!student.registrationNumber || student.registrationNumber.length < 2) {
        errors.registrationNumber = 'Registration number is required';
        isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(student.phone)) {
        errors.phone = 'Please enter a valid 10-digit phone number';
        isValid = false;
    }

    // Gender validation
    if (!student.gender) {
        errors.gender = 'Please select a gender';
        isValid = false;
    }

    // Course validation
    if (!student.course) {
        errors.course = 'Please select a course';
        isValid = false;
    }

    // Year of Study validation
    if (!student.yearOfStudy) {
        errors.yearOfStudy = 'Please select year of study';
        isValid = false;
    }

    // Date of Birth validation
    if (!student.dateOfBirth) {
        errors.dateOfBirth = 'Please select date of birth';
        isValid = false;
    }

    // Display errors
    displayErrors(errors);

    return isValid;
}

// ============================================
// Display Validation Errors
// ============================================
function displayErrors(errors) {
    // Clear all errors
    Object.keys(errors).forEach(key => {
        const errorElement = document.getElementById(`${key}Error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    });

    // Display new errors
    Object.keys(errors).forEach(key => {
        if (errors[key]) {
            const errorElement = document.getElementById(`${key}Error`);
            if (errorElement) {
                errorElement.textContent = errors[key];
            }
        }
    });
}

// ============================================
// Load Students
// ============================================
function loadStudents() {
    const students = getStudents();

    if (students.length === 0) {
        tableBody.innerHTML = '<tr id="emptyRow" class="empty-row"><td colspan="9">No students registered yet. Fill the form above to add a student.</td></tr>';
        return;
    }

    tableBody.innerHTML = '';
    students.forEach((student, index) => {
        const row = createTableRow(student, index);
        tableBody.appendChild(row);
    });
}

// ============================================
// Create Table Row
// ============================================
function createTableRow(student, index) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${student.fullName}</td>
        <td>${student.registrationNumber}</td>
        <td>${student.email}</td>
        <td>${student.phone}</td>
        <td>${student.gender}</td>
        <td>${student.course}</td>
        <td>${student.yearOfStudy}</td>
        <td>${student.dateOfBirth}</td>
        <td>
            <button class="btn btn-sm btn-info" onclick="editStudent(${index})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteStudent(${index})">Delete</button>
        </td>
    `;
    return row;
}

// ============================================
// Edit Student
// ============================================
function editStudent(index) {
    const students = getStudents();
    const student = students[index];
    currentEditIndex = index;

    // Populate edit form
    document.getElementById('editFullName').value = student.fullName;
    document.getElementById('editRegistrationNumber').value = student.registrationNumber;
    document.getElementById('editEmail').value = student.email;
    document.getElementById('editPhone').value = student.phone;
    document.querySelector(`input[name="gender"][value="${student.gender}"]`).checked = true;
    document.getElementById('editCourse').value = student.course;
    document.getElementById('editYearOfStudy').value = student.yearOfStudy;
    document.getElementById('editDateOfBirth').value = student.dateOfBirth;

    // Show modal
    editModal.style.display = 'block';
}

// ============================================
// Handle Edit Form Submit
// ============================================
function handleEditSubmit(e) {
    e.preventDefault();

    const students = getStudents();
    const updatedStudent = {
        fullName: document.getElementById('editFullName').value.trim(),
        registrationNumber: document.getElementById('editRegistrationNumber').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        gender: document.querySelector('input[name="gender"]:checked').value,
        course: document.getElementById('editCourse').value,
        yearOfStudy: document.getElementById('editYearOfStudy').value,
        dateOfBirth: document.getElementById('editDateOfBirth').value,
        registrationDate: students[currentEditIndex].registrationDate
    };

    // Validate
    const errors = {
        fullName: '',
        registrationNumber: '',
        email: '',
        phone: '',
        gender: '',
        course: '',
        yearOfStudy: '',
        dateOfBirth: ''
    };

    if (!updatedStudent.fullName || updatedStudent.fullName.length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updatedStudent.email)) {
        errors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(updatedStudent.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }

    // Display edit errors
    Object.keys(errors).forEach(key => {
        const errorElement = document.getElementById(`edit${key.charAt(0).toUpperCase() + key.slice(1)}Error`);
        if (errorElement) {
            errorElement.textContent = errors[key];
        }
    });

    if (Object.values(errors).some(error => error !== '')) {
        return;
    }

    // Update student
    students[currentEditIndex] = updatedStudent;
    saveStudents(students);

    showMessage('Student information updated successfully!', 'success');
    closeEditModal();
    loadStudents();
}

// ============================================
// Delete Student
// ============================================
function deleteStudent(index) {
    currentDeleteIndex = index;
    const students = getStudents();
    document.getElementById('deleteMessage').textContent = `Are you sure you want to delete ${students[index].fullName}'s record?`;
    deleteModal.style.display = 'block';
}

// ============================================
// Confirm Delete
// ============================================
function confirmDelete() {
    const students = getStudents();
    const deletedName = students[currentDeleteIndex].fullName;
    students.splice(currentDeleteIndex, 1);
    saveStudents(students);

    showMessage(`${deletedName}'s record has been deleted successfully!`, 'success');
    closeDeleteModal();
    loadStudents();
}

// ============================================
// Modal Functions
// ============================================
function closeEditModal() {
    editModal.style.display = 'none';
    editForm.reset();
    currentEditIndex = null;
}

function closeDeleteModal() {
    deleteModal.style.display = 'none';
    currentDeleteIndex = null;
}

// ============================================
// Show Message
// ============================================
function showMessage(message, type) {
    messageContainer.innerHTML = `
        <div class="message message-${type}">
            ${message}
            <span class="close-message" onclick="this.parentElement.remove()">&times;</span>
        </div>
    `;

    // Auto remove message after 5 seconds
    setTimeout(() => {
        const msgElement = messageContainer.querySelector('.message');
        if (msgElement) {
            msgElement.remove();
        }
    }, 5000);
}

// ============================================
// LocalStorage Functions
// ============================================
function getStudents() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveStudents(students) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}
