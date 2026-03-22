// ============================================
// Student Registration System - JavaScript
// ============================================

// Key for localStorage
const STORAGE_KEY = 'students_data';
const FEES_KEY = 'fees_data';
const ADMIN_EMAIL = 'adminkiriritest@edu.com';
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

// Fees DOM elements
const feesForm = document.getElementById('feesForm');
const feeStudent = document.getElementById('feeStudent');
const tuitionInput = document.getElementById('tuition');
const hostelInput = document.getElementById('hostel');
const libraryInput = document.getElementById('library');
const discountInput = document.getElementById('discount');
const totalPayable = document.getElementById('totalPayable');
const feesTableBody = document.getElementById('feesTableBody');
const feesMessage = document.getElementById('feesMessage');
// Invoice preview elements
const invoiceModal = document.getElementById('invoiceModal');
const invoicePreviewContent = document.getElementById('invoicePreviewContent');
const downloadInvoiceBtn = document.getElementById('downloadInvoiceBtn');
const printInvoiceBtn = document.getElementById('printInvoiceBtn');
const closeInvoicePreviewBtn = document.getElementById('closeInvoicePreviewBtn');
const closeInvoiceBtn = document.getElementById('closeInvoiceBtn');

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

    // Fees form listeners
    if (feesForm) {
        feesForm.addEventListener('submit', handleFeesSubmit);
        [tuitionInput, hostelInput, libraryInput, discountInput].forEach(inp => {
            if (inp) inp.addEventListener('input', calculateTotalPayable);
        });
    }

    // Invoice preview listeners
    if (downloadInvoiceBtn) downloadInvoiceBtn.addEventListener('click', downloadInvoiceFromPreview);
    if (printInvoiceBtn) printInvoiceBtn.addEventListener('click', printInvoicePreview);
    if (closeInvoicePreviewBtn) closeInvoicePreviewBtn.addEventListener('click', closeInvoiceModal);
    if (closeInvoiceBtn) closeInvoiceBtn.addEventListener('click', closeInvoiceModal);

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
    const feesSection = document.getElementById('fees');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all known sections
            registrationSection.style.display = 'none';
            dashboardSection.style.display = 'none';
            if (feesSection) feesSection.style.display = 'none';

            // Show selected section
            const section = this.getAttribute('data-section');
            if (section === 'registration') {
                registrationSection.style.display = 'block';
            } else if (section === 'dashboard') {
                dashboardSection.style.display = 'block';
            } else if (section === 'fees' && feesSection) {
                feesSection.style.display = 'block';
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
        populateFeeStudentSelect();
        loadFees();
        return;
    }

    tableBody.innerHTML = '';
    students.forEach((student, index) => {
        const row = createTableRow(student, index);
        tableBody.appendChild(row);
    });
    populateFeeStudentSelect();
    loadFees();
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

// ============================================
// Fees Management
// ============================================

function getFees() {
    const data = localStorage.getItem(FEES_KEY);
    return data ? JSON.parse(data) : [];
}

function saveFees(fees) {
    localStorage.setItem(FEES_KEY, JSON.stringify(fees));
}

function formatKES(amount) {
    const n = Number(amount || 0);
    return `KES ${n.toFixed(2)}`;
}

function populateFeeStudentSelect() {
    if (!feeStudent) return;
    const students = getStudents();
    feeStudent.innerHTML = '<option value="">-- Select Student --</option>';
    students.forEach((s, idx) => {
        const opt = document.createElement('option');
        opt.value = s.registrationNumber;
        opt.textContent = `${s.fullName} (${s.registrationNumber})`;
        feeStudent.appendChild(opt);
    });
}

function calculateTotalPayable() {
    const tuition = parseFloat(tuitionInput?.value || 0);
    const hostel = parseFloat(hostelInput?.value || 0);
    const library = parseFloat(libraryInput?.value || 0);
    const discount = parseFloat(discountInput?.value || 0);

    let subtotal = tuition + hostel + library;
    let discountAmount = (discount / 100) * subtotal;
    let total = Math.max(0, subtotal - discountAmount);
    if (totalPayable) totalPayable.textContent = formatKES(total);
    return total;
}

function handleFeesSubmit(e) {
    e.preventDefault();
    const reg = feeStudent?.value || '';
    if (!reg) {
        if (document.getElementById('feeStudentError')) document.getElementById('feeStudentError').textContent = 'Please select a student';
        return;
    }
    if (document.getElementById('feeStudentError')) document.getElementById('feeStudentError').textContent = '';

    const students = getStudents();
    const student = students.find(s => s.registrationNumber === reg);
    if (!student) {
        showFeesMessage('Selected student not found', 'error');
        return;
    }

    const tuition = parseFloat(tuitionInput?.value || 0);
    const hostel = parseFloat(hostelInput?.value || 0);
    const library = parseFloat(libraryInput?.value || 0);
    const discount = parseFloat(discountInput?.value || 0);
    const total = calculateTotalPayable();

    const fees = getFees();
    const record = {
        id: Date.now(),
        studentReg: student.registrationNumber,
        studentName: student.fullName,
        tuition, hostel, library,
        discountPercent: discount,
        total,
        paid: false,
        date: new Date().toLocaleString()
    };

    fees.push(record);
    saveFees(fees);

    showFeesMessage('Fee recorded successfully', 'success');
    feesForm.reset();
    if (totalPayable) totalPayable.textContent = 'KES 0.00';
    loadFees();
}

function loadFees() {
    const fees = getFees();
    if (!feesTableBody) return;
    if (fees.length === 0) {
        feesTableBody.innerHTML = '<tr class="empty-row"><td colspan="6">No fee records yet.</td></tr>';
        return;
    }

    feesTableBody.innerHTML = '';
    fees.forEach((f, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${f.studentName}</td>
            <td>${f.studentReg}</td>
            <td>${formatKES(f.total)}</td>
            <td>${f.paid ? 'Yes' : 'No'}</td>
            <td>${f.date}</td>
            <td class="action-buttons">
                <button class="btn-small btn-info" onclick="viewFeeInvoice(${f.id})">Invoice</button>
                ${f.paid ? `<button class="btn-small btn-secondary" disabled>Paid</button>` : `<button class="btn-small btn-primary" onclick="markFeePaid(${f.id})">Mark Paid</button>`}
                <button class="btn-small btn-delete" onclick="deleteFee(${f.id})">Delete</button>
            </td>
        `;
        feesTableBody.appendChild(tr);
    });
}

function markFeePaid(id) {
    const fees = getFees();
    const idx = fees.findIndex(f => f.id === id);
    if (idx === -1) return;
    fees[idx].paid = true;
    saveFees(fees);
    showFeesMessage('Marked fee as paid', 'success');
    loadFees();
}

function viewFeeInvoice(id) {
    const fees = getFees();
    const rec = fees.find(f => f.id === id);
    if (!rec) return;
    openInvoicePreview(rec);
}

function openInvoicePreview(rec) {
    if (!invoicePreviewContent || !invoiceModal) return;

    // Build a structured, professional invoice
    const invoiceHTML = `
        <div class="invoice-header">
            <div class="invoice-logo">
                <img src="images/school logo.png" alt="Logo">
                <div>
                    <div style="font-weight:700;">Test Kiriri University</div>
                    <div class="invoice-meta">123 Campus Road, Nairobi, Kenya</div>
                    <div class="invoice-meta">Phone: +254 700 000000 | billing@wcu.ac.ke</div>
                </div>
            </div>
            <div class="invoice-title">
                <h2>Invoice</h2>
                <div class="invoice-meta">Invoice #: ${rec.id}</div>
                <div class="invoice-meta">Date: ${rec.date}</div>
                <div class="invoice-meta">Student Reg: ${rec.studentReg}</div>
            </div>
        </div>

        <div class="invoice-body">
            <div><strong>Billed To:</strong></div>
            <div>${rec.studentName}</div>
            <div class="invoice-meta">Course / Program: ${getStudentCourse(rec.studentReg) || 'N/A'}</div>

            <table class="invoice-table">
                <thead>
                    <tr><th>Description</th><th>Amount (KES)</th></tr>
                </thead>
                <tbody>
                    <tr><td>Tuition</td><td style="text-align:right">${formatKES(rec.tuition)}</td></tr>
                    <tr><td>Hostel</td><td style="text-align:right">${formatKES(rec.hostel)}</td></tr>
                    <tr><td>Library / Misc</td><td style="text-align:right">${formatKES(rec.library)}</td></tr>
                    <tr><td>Discount (${rec.discountPercent}%)</td><td style="text-align:right">-${formatKES(((rec.discountPercent/100)*(rec.tuition+rec.hostel+rec.library)))}</td></tr>
                </tbody>
            </table>

            <div class="invoice-summary">
                <div class="summary-box">
                    <div class="summary-row"><div>Subtotal:</div><div>${formatKES(rec.tuition+rec.hostel+rec.library)}</div></div>
                    <div class="summary-row"><div>Discount:</div><div>-${formatKES(((rec.discountPercent/100)*(rec.tuition+rec.hostel+rec.library)))}</div></div>
                    <div style="border-top:1px dashed #e6e6e6;margin-top:8px"></div>
                    <div class="summary-row" style="font-weight:700;font-size:1.1rem;"><div>Total Payable:</div><div>${formatKES(rec.total)}</div></div>
                    <div class="summary-row"><div>Status:</div><div>${rec.paid ? 'Paid' : 'Unpaid'}</div></div>
                </div>
            </div>

            <div class="invoice-footer">
                <div>Notes:</div>
                <div>Please settle fees within 30 days. For questions contact billing@wcu.ac.ke.</div>
            </div>
        </div>
    `;

    invoicePreviewContent.innerHTML = invoiceHTML;
    invoiceModal.classList.add('show');
}

function closeInvoiceModal() {
    if (!invoiceModal) return;
    invoiceModal.classList.remove('show');
    if (invoicePreviewContent) invoicePreviewContent.innerHTML = '';
}

function downloadInvoiceFromPreview() {
    if (!invoicePreviewContent) return;
    // generate PDF from the preview content
    html2canvas(invoicePreviewContent, {scale:2}).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
        const now = Date.now();
        pdf.save(`invoice-${now}.pdf`);
    }).catch(err => {
        console.error('PDF generation error', err);
        showFeesMessage('Could not generate PDF from preview.', 'error');
    });
}

function printInvoicePreview() {
    if (!invoicePreviewContent) return;
    const printWindow = window.open('', '_blank');
    const html = `<!doctype html><html><head><title>Print Invoice</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial, sans-serif;padding:20px;color:#222}</style></head><body>${invoicePreviewContent.innerHTML}</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
}

function getStudentCourse(reg) {
    const students = getStudents();
    const s = students.find(x => x.registrationNumber === reg);
    return s ? s.course : '';
}

function deleteFee(id) {
    let fees = getFees();
    fees = fees.filter(f => f.id !== id);
    saveFees(fees);
    showFeesMessage('Fee record deleted', 'warning');
    loadFees();
}

function showFeesMessage(message, type) {
    if (!feesMessage) return;
    feesMessage.innerHTML = `<div class="message ${type}">${message}<span class="close-message" onclick="this.parentElement.remove()">&times;</span></div>`;
    setTimeout(() => {
        const el = feesMessage.querySelector('.message');
        if (el) el.remove();
    }, 5000);
}
